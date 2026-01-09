import { NextResponse } from "next/server";
import { getPool, sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 },
      );
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .input("password", sql.NVarChar, password)
      .query(
        "SELECT * FROM users WHERE username = @username AND password = @password",
      );

    if (result.recordset.length > 0) {
      const user = result.recordset[0];

      const { password: _, ...userWithoutPassword } = user;

      const token = btoa(JSON.stringify({ id: user.id, username: user.username }));

      return NextResponse.json({
        message: "Login successful",
        token,
        user: userWithoutPassword,
      });
    } else {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 },
      );
    }
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
