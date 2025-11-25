import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getTokenCookieName, verifyAuthToken } from "@/lib/auth";

const ALLOWED_FIELDS = new Set([
  "name",
  "logo_url",
  "banner_url",
  "website",
  "linkedin_url",
  "twitter_url",
  "github_url",
  "employees_count",
  "founded_year",
  "industry",
  "mission",
  "description",
  "location",
  "hiring_focus"
]);

async function getAuthedCompany() {
  const token = cookies().get(getTokenCookieName())?.value;
  if (!token) throw new Error("Unauthorized");

  let payload;
  try {
    payload = await verifyAuthToken(token);
  } catch (e) {
    throw new Error("Invalid token");
  }
  const userId = Number(payload.userId);
  if (!Number.isInteger(userId) || userId <= 0) throw new Error("Invalid token payload");

  const users = await query({
    sql: "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
    values: [userId]
  });
  const user = Array.isArray(users) ? users[0] : null;
  if (!user) throw new Error("User not found");
  if (user.role !== "company") throw new Error("Forbidden");

  const companies = await query({
    sql: `SELECT id, name, email, logo_url, banner_url, website, linkedin_url, twitter_url, github_url,
                 employees_count, founded_year, industry, mission, description, location, hiring_focus
          FROM companies WHERE email = ? LIMIT 1`,
    values: [user.email]
  });
  const company = Array.isArray(companies) ? companies[0] : null;
  if (!company) throw new Error("Company profile missing");
  return { user, company };
}

export async function GET() {
  try {
    const { company } = await getAuthedCompany();
    return NextResponse.json({ company }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status = ["Unauthorized", "Invalid token", "Invalid token payload"].includes(message)
      ? 401
      : message === "Forbidden"
      ? 403
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request) {
  try {
    const { company } = await getAuthedCompany();
    const body = await request.json();

    const updates = [];
    const values = [];

    for (const [key, rawValue] of Object.entries(body)) {
      if (!ALLOWED_FIELDS.has(key)) continue;
      let value = rawValue;
      if (typeof value === "string") value = value.trim();
      if (value === "") value = null; // treat empty string as null
      // basic validations
      if (key === "founded_year" && value) {
        const yr = Number(value);
        if (!Number.isInteger(yr) || yr < 1800 || yr > new Date().getFullYear()) {
          return NextResponse.json({ error: "Invalid founded_year" }, { status: 400 });
        }
        value = yr;
      }
      if (key === "employees_count" && value) {
        const cnt = Number(value);
        if (!Number.isInteger(cnt) || cnt < 0 || cnt > 1000000) {
          return NextResponse.json({ error: "Invalid employees_count" }, { status: 400 });
        }
        value = cnt;
      }
      updates.push(`${key} = ?`);
      values.push(value);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No valid fields provided." }, { status: 400 });
    }

    values.push(company.id);
    await query({
      sql: `UPDATE companies SET ${updates.join(", ")} WHERE id = ? LIMIT 1`,
      values
    });

    const refreshed = await query({
      sql: `SELECT id, name, email, logo_url, banner_url, website, linkedin_url, twitter_url, github_url,
                   employees_count, founded_year, industry, mission, description, location, hiring_focus
            FROM companies WHERE id = ? LIMIT 1`,
      values: [company.id]
    });

    return NextResponse.json({ company: refreshed[0] }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status = ["Unauthorized", "Invalid token", "Invalid token payload"].includes(message)
      ? 401
      : message === "Forbidden"
      ? 403
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
