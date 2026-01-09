import { NextResponse } from "next/server";
import { getPool, sql } from "@/lib/db";
import { headers } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const pool = await getPool();

    let query = "SELECT * FROM piskovnablog WHERE id = @id";
    let inputType = sql.Int;
    let inputVal: string | number = id;

    // Check if id is numeric
    if (isNaN(Number(id))) {
      query = "SELECT * FROM piskovnablog WHERE slug = @id";
      inputType = sql.NVarChar;
      inputVal = id;
    }

    const result = await pool
      .request()
      .input("id", inputType, inputVal)
      .query(query);

    if (result.recordset.length === 0) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    const blog = result.recordset[0];

    // Get host for absolute URLs
    const headersList = await headers();
    const host = headersList.get("host") || "";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    // Prepend domain to images if they are relative paths
    const processUrl = (url: string | null) => {
      if (!url) return null;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return url;
    };

    const formattedBlog = {
      ...blog,
      descriptionhtml1: blog.descriptionhtml1,
      descriptionhtml2: blog.descriptionhtml2,
      tags: blog.tags ? JSON.parse(blog.tags) : [],
      featured_image: processUrl(blog.featured_image),
      gallery_images: (blog.gallery_images
        ? JSON.parse(blog.gallery_images)
        : []
      ).map((img: string) => processUrl(img)),
      show_newsletter: blog.show_newsletter,
      date: blog.date ? new Date(blog.date).toISOString().split("T")[0] : null,
    };

    return NextResponse.json({ data: formattedBlog });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { message: "Error fetching blog" },
      { status: 500 },
    );
  }
}

import fs from "fs";
import path from "path";

// Helper to save base64 image
async function saveImage(
  base64Data: string | null,
  folder: string,
  viewId: string,
): Promise<string | null> {
  if (!base64Data || !base64Data.startsWith("data:image")) return base64Data; // Return as is if url or null

  try {
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;

    const type = matches[1];
    const buffer = Buffer.from(matches[2], "base64");
    const extension = type.split("/")[1];
    const filename = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${extension}`;

    // Define upload directories: root/uploads
    const uploadDir = path.join(process.cwd(), "uploads", folder, viewId);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    // Return URL accessible via our new API route
    return `/api/uploads/${folder}/${viewId}/${filename}`;
  } catch (error) {
    console.error("Error saving image:", error);
    return null;
  }
}

// Helper to delete file from filesystem
const deleteFile = (fileUrl: string) => {
  if (!fileUrl || !fileUrl.startsWith("/api/uploads")) return;

  try {
    // URL: /api/uploads/folder/viewId/filename
    const parts = fileUrl.split("/");
    // parts: ['', 'api', 'uploads', 'folder', 'viewId', 'filename']
    if (parts.length < 6) return;

    const folder = parts[3];
    const viewId = parts[4];
    const filename = parts[5];

    const filePath = path.join(
      process.cwd(),
      "uploads",
      folder,
      viewId,
      filename,
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error deleting file ${fileUrl}:`, error);
  }
};

// Helper to delete entire view_id folder
const deleteFolder = (folder: string, viewId: string) => {
  try {
    const dirPath = path.join(process.cwd(), "uploads", folder, viewId);
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`Deleted folder: ${dirPath}`);
    }
  } catch (error) {
    console.error(`Error deleting folder ${folder}/${viewId}:`, error);
  }
};

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      slug,
      description,
      descriptionhtml1,
      descriptionhtml2,
      tags,
      featured_image,
      gallery_images,
      date,
      author,
      category,
      status,
      show_newsletter,
      meta_title,
      meta_keywords,
      aos_duration,
    } = body;

    const pool = await getPool();

    let queryCondition = "WHERE id = @id";
    let inputType: any = sql.Int;
    let inputVal: string | number = id;

    if (isNaN(Number(id))) {
      queryCondition = "WHERE slug = @id";
      inputType = sql.NVarChar(sql.MAX);
      inputVal = id;
    }

    // Retrieve existing view_id and data for cleanup (also need featured_image etc)
    const existingRes = await pool
      .request()
      .input("id_lookup", inputType, inputVal)
      .query(
        `SELECT view_id, featured_image, gallery_images FROM piskovnablog ${queryCondition.replace(
          "@id",
          "@id_lookup",
        )}`,
      );

    let viewId = existingRes.recordset[0]?.view_id;
    const existingBlog = existingRes.recordset[0]; // Needed for comparison

    if (!viewId) {
      viewId =
        Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    }

    // Process Images
    const savedFeaturedImage = await saveImage(
      featured_image,
      "mainimage",
      viewId,
    );

    const savedGalleryImages = [];
    if (gallery_images && Array.isArray(gallery_images)) {
      for (const img of gallery_images) {
        const saved = await saveImage(img, "photogallery", viewId);
        if (saved) savedGalleryImages.push(saved);
      }
    }

    // Cleanup Logic [PUT]
    if (existingBlog) {
      // 1. Featured Image Replaced?
      if (
        existingBlog.featured_image &&
        savedFeaturedImage &&
        existingBlog.featured_image !== savedFeaturedImage
      ) {
        // Check if user is not just re-sending the same URL (which saveImage returns as is)
        // saveImage returns new URL if base64, or same URL if not.
        // If they are different, it means the old one is replaced by a new one (base64 -> new url)
        // or explicitly changed to null (though savedFeaturedImage might be null).
        deleteFile(existingBlog.featured_image);
      }

      // 2. Gallery Images Removed?
      const oldGallery = existingBlog.gallery_images
        ? JSON.parse(existingBlog.gallery_images)
        : [];
      if (Array.isArray(oldGallery)) {
        // Find images in oldGallery that are NOT in savedGalleryImages
        for (const oldImg of oldGallery) {
          if (!savedGalleryImages.includes(oldImg)) {
            deleteFile(oldImg);
          }
        }
      }
    }

    console.log("PUT Body:", body);
    console.log("AOS Duration:", aos_duration, typeof aos_duration);

    await pool
      .request()
      .input("id", inputType, inputVal)
      .input("title", sql.NVarChar(sql.MAX), title || null)
      .input("slug", sql.NVarChar(sql.MAX), slug || null)
      .input("description", sql.NVarChar(sql.MAX), description || null)
      .input(
        "descriptionhtml1",
        sql.NVarChar(sql.MAX),
        descriptionhtml1 || null,
      )
      .input(
        "descriptionhtml2",
        sql.NVarChar(sql.MAX),
        descriptionhtml2 || null,
      )
      .input("tags", sql.NVarChar(sql.MAX), JSON.stringify(tags || []))
      .input(
        "featured_image",
        sql.NVarChar(sql.MAX),
        savedFeaturedImage || null,
      )
      .input(
        "gallery_images",
        sql.NVarChar(sql.MAX),
        JSON.stringify(savedGalleryImages || []),
      )
      .input("date", sql.DateTime, date ? new Date(date) : new Date())
      .input("author", sql.NVarChar(sql.MAX), author || null)
      .input("category", sql.NVarChar(sql.MAX), category || null)
      .input("status", sql.NVarChar(sql.MAX), status || null)
      .input(
        "show_newsletter",
        sql.Bit,
        show_newsletter === undefined ? true : show_newsletter,
      )
      .input("meta_title", sql.NVarChar(sql.MAX), meta_title || null)
      .input("meta_keywords", sql.NVarChar(sql.MAX), meta_keywords || null)
      .input(
        "aos_duration",
        sql.NVarChar(50),
        aos_duration && aos_duration !== "" ? String(aos_duration) : null,
      )
      .input("view_id", sql.NVarChar(50), viewId).query(`
        UPDATE piskovnablog SET
          title = @title,
          slug = @slug,
          description = @description,
          descriptionhtml1 = @descriptionhtml1,
          descriptionhtml2 = @descriptionhtml2,
          tags = @tags,
          featured_image = @featured_image,
          gallery_images = @gallery_images,
          date = @date,
          author = @author,
          category = @category,
          status = @status,
          show_newsletter = @show_newsletter,
          meta_title = @meta_title,
          meta_keywords = @meta_keywords,
          aos_duration = @aos_duration,
          view_id = @view_id
        ${queryCondition}
      `);

    return NextResponse.json({ message: "Blog updated successfully" });
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { message: "Error updating blog", error: String(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const pool = await getPool();

    let query = "DELETE FROM piskovnablog WHERE id = @id";
    let inputType = sql.Int;
    let inputVal: string | number = id;

    if (isNaN(Number(id))) {
      query =
        "SELECT view_id, featured_image, gallery_images FROM piskovnablog WHERE slug = @id";
      inputType = sql.NVarChar;
      inputVal = id;
    } else {
      query =
        "SELECT view_id, featured_image, gallery_images FROM piskovnablog WHERE id = @id";
    }

    const res = await pool
      .request()
      .input("id", inputType, inputVal)
      .query(query);
    const blogToDelete = res.recordset[0];

    // Delete Record
    let deleteQuery = "DELETE FROM piskovnablog WHERE id = @id";
    if (isNaN(Number(id))) {
      deleteQuery = "DELETE FROM piskovnablog WHERE slug = @id";
    }
    await pool.request().input("id", inputType, inputVal).query(deleteQuery);

    // Cleanup Logic [DELETE]
    if (blogToDelete && blogToDelete.view_id) {
      // Best way: Delete the specific folders for this blog using view_id
      deleteFolder("mainimage", blogToDelete.view_id);
      deleteFolder("photogallery", blogToDelete.view_id);
    } else if (blogToDelete) {
      // Fallback if no view_id (legacy?), delete individual files
      if (blogToDelete.featured_image) deleteFile(blogToDelete.featured_image);
      if (blogToDelete.gallery_images) {
        try {
          const gallery = JSON.parse(blogToDelete.gallery_images);
          if (Array.isArray(gallery)) {
            gallery.forEach((img) => deleteFile(img));
          }
        } catch (e) {}
      }
    }

    return NextResponse.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { message: "Error deleting blog" },
      { status: 500 },
    );
  }
}
