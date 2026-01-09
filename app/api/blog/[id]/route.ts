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

    // Parse JSON fields
    const formattedBlog = {
      ...blog,
      descriptionhtml1: blog.descriptionhtml1,
      descriptionhtml2: blog.descriptionhtml2,
      tags: blog.tags ? JSON.parse(blog.tags) : [],
      gallery_images: blog.gallery_images
        ? JSON.parse(blog.gallery_images)
        : [],
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
          aos_duration = @aos_duration
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
      query = "DELETE FROM piskovnablog WHERE slug = @id";
      inputType = sql.NVarChar;
      inputVal = id;
    }

    await pool.request().input("id", inputType, inputVal).query(query);

    return NextResponse.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { message: "Error deleting blog" },
      { status: 500 },
    );
  }
}
