import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { query } from "@/lib/db";
import { getTokenCookieName, verifyAuthToken } from "@/lib/auth";

function parseCompanyId(params) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

async function requireAdmin() {
  const token = cookies().get(getTokenCookieName())?.value;
  if (!token) return { error: "Unauthorized", status: 401 };
  try {
    const payload = await verifyAuthToken(token);
    if (payload.role !== "admin") return { error: "Forbidden", status: 403 };
    return { payload };
  } catch (err) {
    console.error("Admin company detail token error", err);
    return { error: "Invalid token", status: 401 };
  }
}

export async function GET(_request, { params }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const companyId = parseCompanyId(params);
    if (!companyId) return NextResponse.json({ error: "Invalid company id" }, { status: 400 });

    const rows = await query({
      sql: `SELECT c.id, c.name, c.email, c.created_at, COUNT(j.id) AS job_count
            FROM companies c
            LEFT JOIN jobs j ON j.company_id = c.id
            WHERE c.id = ?
            GROUP BY c.id, c.name, c.email, c.created_at
            LIMIT 1`,
      values: [companyId]
    });

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({ company: rows[0] }, { status: 200 });
  } catch (error) {
    console.error("Admin company GET error", error);
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const companyId = parseCompanyId(params);
    if (!companyId) return NextResponse.json({ error: "Invalid company id" }, { status: 400 });

    const body = await request.json();
    const name = body.name?.trim();
    const email = body.email?.toLowerCase().trim();

    if (!name && !email) {
      return NextResponse.json({ error: "No update fields provided." }, { status: 400 });
    }

    const existingRows = await query({
      sql: "SELECT id, name, email FROM companies WHERE id = ? LIMIT 1",
      values: [companyId]
    });
    if (!Array.isArray(existingRows) || existingRows.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
    const existing = existingRows[0];

    if (email && email !== existing.email) {
      const emailCheck = await query({
        sql: "SELECT id FROM companies WHERE email = ? LIMIT 1",
        values: [email]
      });
      if (Array.isArray(emailCheck) && emailCheck.length > 0) {
        return NextResponse.json({ error: "Email already in use by another company." }, { status: 409 });
      }
    }

    const newName = name ?? existing.name;
    const newEmail = email ?? existing.email;

    await query({
      sql: "UPDATE companies SET name = ?, email = ? WHERE id = ? LIMIT 1",
      values: [newName, newEmail, companyId]
    });

    // Keep user table in sync (company user has same email).
    if (email || name) {
      await query({
        sql: "UPDATE users SET name = ?, email = ? WHERE email = ? AND role = 'company' LIMIT 1",
        values: [newName, newEmail, existing.email]
      });
    }

    return NextResponse.json(
      { company: { id: companyId, name: newName, email: newEmail } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin company PUT error", error);
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const companyId = parseCompanyId(params);
    if (!companyId) return NextResponse.json({ error: "Invalid company id" }, { status: 400 });

    const rows = await query({
      sql: "SELECT id, email FROM companies WHERE id = ? LIMIT 1",
      values: [companyId]
    });
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
    const company = rows[0];

    // Delete company (jobs cascade). Then delete matching user account.
    await query({ sql: "DELETE FROM companies WHERE id = ? LIMIT 1", values: [companyId] });
    await query({
      sql: "DELETE FROM users WHERE email = ? AND role = 'company' LIMIT 1",
      values: [company.email]
    });

    return NextResponse.json({ message: "Company removed." }, { status: 200 });
  } catch (error) {
    console.error("Admin company DELETE error", error);
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
