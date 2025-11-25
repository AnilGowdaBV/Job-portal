import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { query } from "@/lib/db";
import { getTokenCookieName, signAuthToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const userRows = await query({
      sql: "SELECT id, name, email, password, role FROM users WHERE email = ? LIMIT 1",
      values: [email.toLowerCase().trim()]
    });

    const user = Array.isArray(userRows) ? userRows[0] : null;
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const token = await signAuthToken({ userId: user.id, role: user.role });

    const response = NextResponse.json(
      {
        message: "Login successful.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      },
      { status: 200 }
    );

    response.cookies.set({
      name: getTokenCookieName(),
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    console.error("Login error", error);
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
