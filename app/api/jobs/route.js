import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { query } from "@/lib/db";
import { getTokenCookieName, verifyAuthToken } from "@/lib/auth";

function validateJobPayload({ title, location, salary, category, description }) {
  if (!title || !location || !category || !description) {
    return "Title, location, category, and description are required.";
  }
  if (salary && typeof salary !== "string") {
    return "Salary must be provided as a string.";
  }
  return null;
}

function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const location = searchParams.get("location")?.trim() ?? "";
    const category = searchParams.get("category")?.trim() ?? "";
    const companyIdParam = searchParams.get("companyId");
    const minSalary = searchParams.get("minSalary")?.trim();
    const maxSalary = searchParams.get("maxSalary")?.trim();
    const limitParam = Number(searchParams.get("limit"));
    const limit = Number.isInteger(limitParam) && limitParam > 0 && limitParam <= 200 ? limitParam : 100;

    const conditions = [];
    const values = [];

    if (companyIdParam) {
      const companyId = Number(companyIdParam);
      if (!Number.isInteger(companyId) || companyId <= 0) {
        return NextResponse.json({ error: "Invalid companyId parameter." }, { status: 400 });
      }
      conditions.push("j.company_id = ?");
      values.push(companyId);
    }

    if (q) {
      conditions.push("(j.title LIKE ? OR j.description LIKE ?)");
      const likeTerm = `%${q}%`;
      values.push(likeTerm, likeTerm);
    }

    if (location) {
      conditions.push("j.location LIKE ?");
      values.push(`%${location}%`);
    }

    if (category) {
      conditions.push("j.category = ?");
      values.push(category);
    }

    if (minSalary) {
      conditions.push("CAST(REGEXP_REPLACE(IFNULL(j.salary, ''), '[^0-9]', '') AS UNSIGNED) >= ?");
      values.push(Number(minSalary));
    }

    if (maxSalary) {
      conditions.push("CAST(REGEXP_REPLACE(IFNULL(j.salary, ''), '[^0-9]', '') AS UNSIGNED) <= ?");
      values.push(Number(maxSalary));
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const jobs = await query({
      sql: `SELECT j.id, j.company_id, j.title, j.location, j.salary, j.category, j.description, j.created_at,
                   c.name AS company_name
            FROM jobs j
            LEFT JOIN companies c ON c.id = j.company_id
            ${whereClause}
            ORDER BY j.created_at DESC
            LIMIT ${limit}`,
      values
    });

    return NextResponse.json({ jobs }, { status: 200 });
  } catch (error) {
    console.error("Jobs fetch error", error);
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = cookies().get(getTokenCookieName())?.value;
    if (!token) {
      return unauthorizedResponse();
    }

    let decoded;
    try {
      decoded = await verifyAuthToken(token);
    } catch (error) {
      console.error("Token verification failed", error);
      return unauthorizedResponse("Invalid session token.");
    }

    if (!decoded || !["company", "admin"].includes(decoded.role)) {
      return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
    }

    const body = await request.json();
    const title = body.title?.trim();
    const location = body.location?.trim();
    const salary = body.salary?.trim() ?? null;
    const category = body.category?.trim();
    const description = body.description?.trim();

    const validationError = validateJobPayload({ title, location, salary, category, description });
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const actorId = Number(decoded.userId);
    if (!Number.isInteger(actorId) || actorId <= 0) {
      return NextResponse.json({ error: "Invalid session payload." }, { status: 401 });
    }

    let companyId = body.companyId ? Number(body.companyId) : null;
    if (decoded.role === "company" && !companyId) {
      const companyRows = await query({
        sql: `SELECT c.id FROM companies c
              INNER JOIN users u ON u.email = c.email
              WHERE u.id = ?
              LIMIT 1`,
        values: [actorId]
      });
      const company = Array.isArray(companyRows) ? companyRows[0] : null;
      if (company) {
        companyId = Number(company.id);
      }
    }

    if (!Number.isInteger(companyId) || companyId <= 0) {
      return NextResponse.json({ error: "Unable to resolve company profile." }, { status: 400 });
    }

    const result = await query({
      sql: `INSERT INTO jobs (company_id, title, location, salary, category, description)
            VALUES (?, ?, ?, ?, ?, ?)`,
      values: [companyId, title, location, salary, category, description]
    });

    return NextResponse.json(
      {
        message: "Job created successfully.",
        job: {
          id: result.insertId,
          company_id: companyId,
          title,
          location,
          salary,
          category,
          description
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Job creation error", error);
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
