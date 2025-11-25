import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { query } from "@/lib/db";
import { getTokenCookieName, signAuthToken } from "@/lib/auth";

const ALLOWED_ROLES = new Set(["user", "company", "admin"]);

function validatePayload({ name, email, password, role }) {
  if (!name || !email || !password) {
    return "Name, email, and password are required.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (role && !ALLOWED_ROLES.has(role)) {
    return "Invalid role provided.";
  }
  return null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = body.name?.trim();
    const email = body.email?.toLowerCase().trim();
    const password = body.password;
    const role = body.role?.toLowerCase() ?? "user";

    const validationError = validatePayload({ name, email, password, role });
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const existingUsers = await query({
      sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
      values: [email]
    });
    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json({ error: "Email already registered." }, { status: 409 });
    }

    // Prevent arbitrary admin account creation: require secret invite token.
    if (role === "admin") {
      const providedSecret = body.adminInviteSecret?.trim();
      const expectedSecret = process.env.ADMIN_INVITE_SECRET;
      if (!expectedSecret || providedSecret !== expectedSecret) {
        return NextResponse.json(
          { error: "Admin invite secret invalid or missing." },
          { status: 403 }
        );
      }
    }

    if (role === "company") {
      const existingCompany = await query({
        sql: "SELECT id FROM companies WHERE email = ? LIMIT 1",
        values: [email]
      });
      if (Array.isArray(existingCompany) && existingCompany.length > 0) {
        return NextResponse.json({ error: "Company email already registered." }, { status: 409 });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const insertResult = await query({
      sql: "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      values: [name, email, passwordHash, role]
    });

    const userId = insertResult.insertId;

    if (role === "company") {
      await query({
        sql: "INSERT INTO companies (name, email, password) VALUES (?, ?, ?)",
        values: [name, email, passwordHash]
      });
    }

    const token = await signAuthToken({ userId, role });

    const response = NextResponse.json(
      {
        message: "Signup successful.",
        user: {
          id: userId,
          name,
          email,
          role
        }
      },
      { status: 201 }
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
    console.error("Signup error", error);
    const message = error instanceof Error ? error.message : "Unexpected error.";
    const statusCode = message.includes("JWT_SECRET") ? 500 : 500;
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
