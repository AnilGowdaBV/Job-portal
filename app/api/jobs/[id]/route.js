import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { query } from "@/lib/db";
import { getTokenCookieName, verifyAuthToken } from "@/lib/auth";

function parseJobId(params) {
  const jobId = Number(params.id);
  if (!Number.isInteger(jobId) || jobId <= 0) {
    return null;
  }
  return jobId;
}

export async function GET(_request, { params }) {
  try {
    const jobId = parseJobId(params);
    if (!jobId) {
      return NextResponse.json({ error: "Invalid job id." }, { status: 400 });
    }

    const jobs = await query({
      sql: `SELECT j.id, j.company_id, j.title, j.location, j.salary, j.category, j.description, j.created_at,
                   c.name AS company_name
            FROM jobs j
            LEFT JOIN companies c ON c.id = j.company_id
            WHERE j.id = ?
            LIMIT 1`,
      values: [jobId]
    });

    const job = Array.isArray(jobs) ? jobs[0] : null;
    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    return NextResponse.json({ job }, { status: 200 });
  } catch (error) {
    console.error("Job fetch error", error);
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function mapUserToCompanyId(userId) {
  const companyRows = await query({
    sql: `SELECT c.id FROM companies c
          INNER JOIN users u ON u.email = c.email
          WHERE u.id = ?
          LIMIT 1`,
    values: [userId]
  });
  if (Array.isArray(companyRows) && companyRows.length > 0) {
    return Number(companyRows[0].id);
  }
  return null;
}

async function ensureAuthorizedCompany(jobId) {
  const token = cookies().get(getTokenCookieName())?.value;
  if (!token) {
    return { error: "Unauthorized", status: 401 };
  }

  let decoded;
  try {
    decoded = await verifyAuthToken(token);
  } catch (error) {
    console.error("Job delete token error", error);
    return { error: "Invalid token", status: 401 };
  }

  if (decoded.role === "admin") {
    return { decoded };
  }

  if (decoded.role !== "company") {
    return { error: "Forbidden", status: 403 };
  }

  const userId = Number(decoded.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    return { error: "Invalid token payload", status: 401 };
  }

  const companyId = await mapUserToCompanyId(userId);
  if (!companyId) {
    return { error: "Company profile missing", status: 403 };
  }

  const jobRows = await query({
    sql: "SELECT company_id FROM jobs WHERE id = ? LIMIT 1",
    values: [jobId]
  });

  const job = Array.isArray(jobRows) ? jobRows[0] : null;
  if (!job) {
    return { error: "Job not found", status: 404 };
  }

  if (job.company_id !== companyId) {
    return { error: "Forbidden", status: 403 };
  }

  return { decoded };
}

export async function DELETE(_request, { params }) {
  try {
    const jobId = parseJobId(params);
    if (!jobId) {
      return NextResponse.json({ error: "Invalid job id." }, { status: 400 });
    }

    const auth = await ensureAuthorizedCompany(jobId);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await query({
      sql: "DELETE FROM jobs WHERE id = ?",
      values: [jobId]
    });

    return NextResponse.json({ message: "Job removed." }, { status: 200 });
  } catch (error) {
    console.error("Job deletion error", error);
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
