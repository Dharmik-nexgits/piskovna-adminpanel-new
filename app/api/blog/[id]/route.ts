import { NextResponse } from "next/server";
import { getPool, sql } from "@/lib/db";

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

    const formattedBlog = {
      ...blog,
      descriptionhtml1: blog.descriptionhtml1,
      descriptionhtml2: blog.descriptionhtml2,
      tags: blog.tags ? JSON.parse(blog.tags) : [],
      featured_image: blog.featured_image,
      gallery_images: (blog.gallery_images
        ? JSON.parse(blog.gallery_images)
        : []
      ).map((img: string) => img),
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

async function saveImage(
  base64Data: string | null,
  folder: string,
  viewId: string,
): Promise<string | null> {
  if (!base64Data || !base64Data.startsWith("data:image")) return base64Data;

  try {
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;

    const type = matches[1];
    const buffer = Buffer.from(matches[2], "base64");
    const extension = type.split("/")[1];
    const filename = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${extension}`;

    const uploadDir = path.join(process.cwd(), "uploads", folder, viewId);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    return `uploads/${folder}/${viewId}/${filename}`;
  } catch (error) {
    console.error("Error saving image:", error);
    return null;
  }
}

const deleteFile = (fileUrl: string) => {
  if (!fileUrl) return;

  try {
    let relativePath = fileUrl;
    // Normalize path
    if (fileUrl.startsWith("/api/")) {
      relativePath = fileUrl.substring(5); // Remove "/api/"
    } else if (fileUrl.startsWith("/")) {
      relativePath = fileUrl.substring(1);
    }

    if (!relativePath.startsWith("uploads/")) return;

    const parts = relativePath.split("/");
    // parts: [0]: uploads, [1]: folder, [2]: viewid, [3]: filename
    if (parts.length < 4) return;

    const folder = parts[1];
    const viewId = parts[2];
    const filename = parts[3];

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

    const stripDomain = (url: string | null) => {
      if (!url) return null;
      try {
        let cleanUrl = url;
        if (url.startsWith("http")) {
          const urlObj = new URL(url);
          cleanUrl = urlObj.pathname;
        }

        // Remove /api/ prefix if present
        if (cleanUrl.startsWith("/api/")) {
          cleanUrl = cleanUrl.substring(5); // Remove "/api/"
        } else if (cleanUrl.startsWith("/uploads/")) {
          cleanUrl = cleanUrl.substring(1);
        }

        return cleanUrl;
      } catch (e) {
        return url;
      }
    };

    let savedFeaturedImage = await saveImage(
      featured_image,
      "mainimage",
      viewId,
    );
    savedFeaturedImage = stripDomain(savedFeaturedImage);

    const savedGalleryImages = [];
    if (gallery_images && Array.isArray(gallery_images)) {
      for (const img of gallery_images) {
        let saved = await saveImage(img, "photogallery", viewId);
        saved = stripDomain(saved);
        if (saved) savedGalleryImages.push(saved);
      }
    }

    if (existingBlog) {
      if (
        existingBlog.featured_image &&
        savedFeaturedImage !== existingBlog.featured_image
      ) {
        deleteFile(existingBlog.featured_image);
      }

      const oldGallery = existingBlog.gallery_images
        ? JSON.parse(existingBlog.gallery_images)
        : [];
      if (Array.isArray(oldGallery)) {
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
