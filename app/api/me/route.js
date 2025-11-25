import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { query } from "@/lib/db";
import { getTokenCookieName, verifyAuthToken } from "@/lib/auth";

export async function GET() {
  try {
    const token = cookies().get(getTokenCookieName())?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload;
    try {
      payload = await verifyAuthToken(token);
    } catch (error) {
      console.error("Profile token error", error);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = Number(payload.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "Invalid token payload" }, { status: 401 });
    }

    const users = await query({
      sql: "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
      values: [userId]
    });

    const user = Array.isArray(users) ? users[0] : null;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let companyProfile = null;
    if (user.role === "company") {
      try {
        const companies = await query({
          sql: `SELECT id, name, email, logo_url, banner_url, website, linkedin_url, twitter_url, github_url,
                       employees_count, founded_year, industry, mission, description, location, hiring_focus
                FROM companies WHERE email = ? LIMIT 1`,
          values: [user.email]
        });
        companyProfile = Array.isArray(companies) ? companies[0] : null;
      } catch (err) {
        // If migration not applied yet, fallback to minimal columns to avoid 500 error.
        if (err && err.code === "ER_BAD_FIELD_ERROR") {
          const companies = await query({
            sql: "SELECT id, name, email FROM companies WHERE email = ? LIMIT 1",
            values: [user.email]
          });
          companyProfile = Array.isArray(companies) ? companies[0] : null;
        } else {
          throw err;
        }
      }
    }

    return NextResponse.json(
      {
        user,
        company: companyProfile
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile fetch error", error);
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
