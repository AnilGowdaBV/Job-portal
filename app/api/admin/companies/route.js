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
      console.error("Admin companies token error", error);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const companies = await query({
      sql: `SELECT c.id, c.name, c.email, c.created_at, COUNT(j.id) AS job_count
            FROM companies c
            LEFT JOIN jobs j ON j.company_id = c.id
            GROUP BY c.id, c.name, c.email, c.created_at
            ORDER BY c.created_at DESC
            LIMIT 500`,
      values: []
    });

    return NextResponse.json({ companies }, { status: 200 });
  } catch (error) {
    console.error("Admin companies list error", error);
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
