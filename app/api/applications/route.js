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
      console.error("Applications token error", error);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = Number(payload.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "Invalid token payload" }, { status: 401 });
    }

    if (payload.role !== "user") {
      return NextResponse.json({ error: "Only job seekers can view this." }, { status: 403 });
    }

    const applications = await query({
      sql: `SELECT a.id, a.job_id, a.resume_path, a.created_at,
                   j.title, j.location, j.salary, j.category,
                   c.name AS company_name
            FROM applications a
            INNER JOIN jobs j ON j.id = a.job_id
            LEFT JOIN companies c ON c.id = j.company_id
            WHERE a.user_id = ?
            ORDER BY a.created_at DESC`,
          values: [userId]
    });

    return NextResponse.json({ applications }, { status: 200 });
  } catch (error) {
    console.error("Applications fetch error", error);
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
