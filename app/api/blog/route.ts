import { NextResponse } from "next/server";
import { getPool, sql } from "@/lib/db";
import { slugify } from "@/lib/utils";
import fs from "fs";
import path from "path";
import { headers } from "next/headers";

async function ensureTableExists() {
  const pool = await getPool();
  // Check if table exists
  const tableCheck = await pool
    .request()
    .query("SELECT * FROM sysobjects WHERE name='piskovnablog' AND xtype='U'");

  if (tableCheck.recordset.length === 0) {
    // Create table (Keep existing schema creation)
    const createTableQuery = `
      CREATE TABLE piskovnablog (
        id INT IDENTITY(1,1) PRIMARY KEY,
        title NVARCHAR(MAX),
        slug NVARCHAR(MAX),
        description NVARCHAR(MAX),
        descriptionhtml1 NVARCHAR(MAX),
        descriptionhtml2 NVARCHAR(MAX),
        tags NVARCHAR(MAX),
        featured_image NVARCHAR(MAX),
        gallery_images NVARCHAR(MAX),
        date DATETIME,
        author NVARCHAR(255),
        category NVARCHAR(255),
        status NVARCHAR(50),
        show_newsletter BIT,
        meta_title NVARCHAR(MAX),
        meta_keywords NVARCHAR(MAX),
        aos_duration NVARCHAR(50),
        view_id NVARCHAR(50), -- Added view_id column
        created_at DATETIME DEFAULT GETDATE()
      )
    `;
    await pool.request().query(createTableQuery);
  } else {
    // Add view_id column if missing
    try {
      await pool
        .request()
        .query("ALTER TABLE piskovnablog ADD view_id NVARCHAR(50)");
    } catch (e) {
      /* ignore */
    }
    try {
      await pool
        .request()
        .query("ALTER TABLE piskovnablog ADD author NVARCHAR(255)");
    } catch (e) {
      /* ignore if exists */
    }

    try {
      await pool
        .request()
        .query("ALTER TABLE piskovnablog ADD aos_duration NVARCHAR(50)");
    } catch (e) {
      /* ignore if exists */
    }
  }
}

export const dynamic = "force-dynamic";

async function saveImage(
  base64Data: string | null,
  folder: string,
  viewId: string,
): Promise<string | null> {
  if (!base64Data || !base64Data.startsWith("data:image")) {
    if (typeof base64Data === "string") {
      let cleanUrl = base64Data;
      try {
        if (cleanUrl.startsWith("http")) {
          cleanUrl = new URL(cleanUrl).pathname;
        }
        if (cleanUrl.startsWith("/api/")) {
          cleanUrl = cleanUrl.substring(5);
        }
        if (cleanUrl.startsWith("/")) {
          cleanUrl = cleanUrl.substring(1);
        }
        return cleanUrl;
      } catch (e) {
        return base64Data;
      }
    }
    return base64Data; // Return as is if url or null
  }

  try {
    console.log(
      `[saveImage] Processing base64 image for folder: ${folder}, viewId: ${viewId}`,
    );
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;

    const type = matches[1];
    const buffer = Buffer.from(matches[2], "base64");
    const extension = type.split("/")[1];
    const filename = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${extension}`;

    // Define upload directories
    // User requested: "uploads ma main image folder" and "upload folder ma photogallry folder"
    // AND "not in public". So we use root/uploads.
    const uploadDir = path.join(process.cwd(), "uploads", folder, viewId);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    // Return relative path for DB storage
    const publicUrl = `uploads/${folder}/${viewId}/${filename}`;
    console.log(`[saveImage] Saved file to: ${filePath}`);
    console.log(`[saveImage] Returning URL: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error("[saveImage] Error saving image:", error);
    return null;
  }
}

export async function GET() {
  try {
    const pool = await getPool();

    try {
      const result = await pool
        .request()
        .query("SELECT * FROM piskovnablog ORDER BY id DESC");
      // Parse JSON fields
      const blogs = result.recordset.map((blog: any) => {
        let gallery = [];
        try {
          gallery = blog.gallery_images ? JSON.parse(blog.gallery_images) : [];
        } catch {
          gallery = [];
        }

        return {
          ...blog,
          descriptionhtml1: blog.descriptionhtml1,
          descriptionhtml2: blog.descriptionhtml2,
          tags: blog.tags ? JSON.parse(blog.tags) : [],
          featured_image: blog.featured_image,
          gallery_images: gallery.map((img: string) => img),
          show_newsletter: blog.show_newsletter,
          date: blog.date
            ? new Date(blog.date).toISOString().split("T")[0]
            : null,
        };
      });
      return NextResponse.json({ data: blogs });
    } catch (err: any) {
      if (err.message && err.message.includes("Invalid object name")) {
        return NextResponse.json({ data: [] });
      }
      throw err;
    }
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { message: "Error fetching blogs" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureTableExists();

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

    let finalSlug = slug;
    if (!finalSlug || finalSlug.trim() === "") {
      finalSlug = slugify(title || "");
    }
    if (!finalSlug || finalSlug.trim() === "") {
      finalSlug = `post-${Date.now()}`;
    }

    // Generate View ID
    const viewId =
      Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

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

    const pool = await getPool();
    const result = await pool
      .request()
      .input("title", sql.NVarChar(sql.MAX), title || null)
      .input("slug", sql.NVarChar(sql.MAX), finalSlug)
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
        INSERT INTO piskovnablog (
          title, slug, description, descriptionhtml1, descriptionhtml2, tags, 
          featured_image, gallery_images, date, author, category, status, 
          show_newsletter, meta_title, meta_keywords, aos_duration, view_id
        )
        OUTPUT INSERTED.id
        VALUES (
          @title, @slug, @description, @descriptionhtml1, @descriptionhtml2, @tags, 
          @featured_image, @gallery_images, @date, @author, @category, @status, 
          @show_newsletter, @meta_title, @meta_keywords, @aos_duration, @view_id
        )
      `);

    return NextResponse.json({
      message: "Blog created successfully",
      id: result.recordset[0].id,
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      { message: "Error creating blog", error: String(error) },
      { status: 500 },
    );
  }
}
