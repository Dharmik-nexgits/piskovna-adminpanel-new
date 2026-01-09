import { NextResponse } from "next/server";
import { getPool, sql } from "@/lib/db";

async function ensureTableExists() {
  const pool = await getPool();
  // Check if table exists
  const tableCheck = await pool
    .request()
    .query("SELECT * FROM sysobjects WHERE name='piskovnablog' AND xtype='U'");

  if (tableCheck.recordset.length === 0) {
    // Create table
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
        created_at DATETIME DEFAULT GETDATE()
      )
    `;
    await pool.request().query(createTableQuery);
  } else {
    // Table exists, check/add missing columns
    // We can just try adding columns and catch if they exist or check specifically
    // Simple way: check for column 'author', 'aos_duration' etc

    // Attempt to add author if missing
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

export async function GET() {
  try {
    const pool = await getPool();

    // Attempt to select. If table doesn't exist, it might throw,
    // but good practice to ensure it exists or handle error.
    // For simplicity, we'll try to query. If it fails due to missing table, we returns empty or error.
    // However, since we want to be robust, let's just run ensureTableExists() on POST or lazy load here.
    // Let's rely on the POST to create it, OR trigger it once.
    // To be safe and avoid "Invalid object name" error on first load:
    try {
      const result = await pool
        .request()
        .query("SELECT * FROM piskovnablog ORDER BY date DESC");
      // Parse JSON fields
      const blogs = result.recordset.map((blog: any) => ({
        ...blog,
        // Map DB columns back to frontend expected keys
        descriptionhtml1: blog.descriptionhtml1,
        descriptionhtml2: blog.descriptionhtml2,
        tags: blog.tags ? JSON.parse(blog.tags) : [],
        gallery_images: blog.gallery_images
          ? JSON.parse(blog.gallery_images)
          : [],
        // Convert bit to boolean if needed, though mssql driver usually handles it or returns boolean
        show_newsletter: blog.show_newsletter,
        date: blog.date
          ? new Date(blog.date).toISOString().split("T")[0]
          : null,
      }));
      return NextResponse.json({ data: blogs });
    } catch (err: any) {
      if (err.message && err.message.includes("Invalid object name")) {
        // Table doesn't exist, return empty array
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
      descriptionhtml1, // Frontend sends this
      descriptionhtml2, // Frontend sends this
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
    const result = await pool
      .request()
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
      .input("featured_image", sql.NVarChar(sql.MAX), featured_image || null)
      .input(
        "gallery_images",
        sql.NVarChar(sql.MAX),
        JSON.stringify(gallery_images || []),
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
      ).query(`
        INSERT INTO piskovnablog (
          title, slug, description, descriptionhtml1, descriptionhtml2, tags, 
          featured_image, gallery_images, date, author, category, status, 
          show_newsletter, meta_title, meta_keywords, aos_duration
        )
        OUTPUT INSERTED.id
        VALUES (
          @title, @slug, @description, @descriptionhtml1, @descriptionhtml2, @tags, 
          @featured_image, @gallery_images, @date, @author, @category, @status, 
          @show_newsletter, @meta_title, @meta_keywords, @aos_duration
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
