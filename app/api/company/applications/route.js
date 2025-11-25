import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { query } from "@/lib/db";
import { getTokenCookieName, verifyAuthToken } from "@/lib/auth";

async function mapUserToCompanyId(userId) {
  const companyRows = await query({
    sql: `SELECT c.id
          FROM companies c
          INNER JOIN users u ON u.email = c.email
          WHERE u.id = ?
          LIMIT 1`,
    values: [userId]
  });
  return Array.isArray(companyRows) && companyRows.length > 0 ? companyRows[0].id : null;
}

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
      console.error("Company applications token error", error);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!["company", "admin"].includes(payload.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let companyId = null;
    if (payload.role === "company") {
      const userId = Number(payload.userId);
      if (!Number.isInteger(userId) || userId <= 0) {
        return NextResponse.json({ error: "Invalid token payload." }, { status: 401 });
      }
      companyId = await mapUserToCompanyId(userId);
      if (!companyId) {
        return NextResponse.json({ error: "Company profile missing." }, { status: 403 });
      }
    }

    const conditions = [];
    const values = [];

    if (companyId) {
      conditions.push("j.company_id = ?");
      values.push(companyId);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const applications = await query({
      sql: `SELECT a.id, a.job_id, a.user_id, a.resume_path, a.created_at,
                   j.title, j.location, j.salary, j.category,
                   u.name AS applicant_name, u.email AS applicant_email
            FROM applications a
            INNER JOIN jobs j ON j.id = a.job_id
            INNER JOIN users u ON u.id = a.user_id
            ${whereClause}
            ORDER BY a.created_at DESC
            LIMIT 200`,
      values
    });

    return NextResponse.json({ applications }, { status: 200 });
  } catch (error) {
    console.error("Company applications fetch error", error);
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
