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
      console.error("Admin overview token error", error);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [userStats, companyStats, jobStats, latestApplications] = await Promise.all([
      query({ sql: "SELECT COUNT(*) AS total_users FROM users", values: [] }),
      query({ sql: "SELECT COUNT(*) AS total_companies FROM companies", values: [] }),
      query({ sql: "SELECT COUNT(*) AS total_jobs FROM jobs", values: [] }),
      query({
        sql: `SELECT a.id, a.created_at, u.name AS applicant_name, j.title
              FROM applications a
              INNER JOIN users u ON u.id = a.user_id
              INNER JOIN jobs j ON j.id = a.job_id
              ORDER BY a.created_at DESC
              LIMIT 10`,
        values: []
      })
    ]);

    const topCompanies = await query({
      sql: `SELECT c.id, c.name, COUNT(j.id) AS job_count
            FROM companies c
            LEFT JOIN jobs j ON j.company_id = c.id
            GROUP BY c.id, c.name
            ORDER BY job_count DESC
            LIMIT 5`,
      values: []
    });

    return NextResponse.json(
      {
        metrics: {
          totalUsers: userStats[0]?.total_users ?? 0,
          totalCompanies: companyStats[0]?.total_companies ?? 0,
          totalJobs: jobStats[0]?.total_jobs ?? 0
        },
        latestApplications,
        topCompanies
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin overview error", error);
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
