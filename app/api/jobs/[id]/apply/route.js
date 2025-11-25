import crypto from "crypto";
import path from "path";
import { promises as fs } from "fs";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { query } from "@/lib/db";
import { getTokenCookieName, verifyAuthToken } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function parseJobId(params) {
  const jobId = Number(params.id);
  if (!Number.isInteger(jobId) || jobId <= 0) {
    return null;
  }
  return jobId;
}

async function ensureUploadDir() {
  const uploadDir = path.join(process.cwd(), "public", "uploads", "resumes");
  await fs.mkdir(uploadDir, { recursive: true });
  return uploadDir;
}

export async function POST(request, { params }) {
  try {
    const jobId = parseJobId(params);
    if (!jobId) {
      return NextResponse.json({ error: "Invalid job id." }, { status: 400 });
    }

    const token = cookies().get(getTokenCookieName())?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload;
    try {
      payload = await verifyAuthToken(token);
    } catch (error) {
      console.error("Apply token error", error);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = Number(payload.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "Invalid token payload" }, { status: 401 });
    }

    if (payload.role !== "user") {
      return NextResponse.json({ error: "Only job seekers can apply." }, { status: 403 });
    }

    const formData = await request.formData();
    const resume = formData.get("resume");

    if (!resume || typeof resume === "string") {
      return NextResponse.json({ error: "Resume file is required." }, { status: 400 });
    }

    if (resume.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF resumes are accepted." }, { status: 400 });
    }

    if (resume.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Resume exceeds the 5MB limit." }, { status: 400 });
    }

    const jobRows = await query({
      sql: "SELECT id FROM jobs WHERE id = ? LIMIT 1",
      values: [jobId]
    });

    if (!Array.isArray(jobRows) || jobRows.length === 0) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    const existingApplications = await query({
      sql: "SELECT id FROM applications WHERE job_id = ? AND user_id = ? LIMIT 1",
      values: [jobId, userId]
    });

    if (Array.isArray(existingApplications) && existingApplications.length > 0) {
      return NextResponse.json({ error: "You already applied to this job." }, { status: 409 });
    }

    const uploadDir = await ensureUploadDir();
    const arrayBuffer = await resume.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const originalName = path.basename(resume.name);
    const uniqueName = `${crypto.randomUUID()}-${originalName.replace(/\s+/g, "-")}`;
    const filePath = path.join(uploadDir, uniqueName);
    const publicPath = `/uploads/resumes/${uniqueName}`;

    await fs.writeFile(filePath, buffer);

    await query({
      sql: "INSERT INTO applications (job_id, user_id, resume_path) VALUES (?, ?, ?)",
      values: [jobId, userId, publicPath]
    });

    return NextResponse.json({ message: "Application submitted.", resume: publicPath }, { status: 201 });
  } catch (error) {
    console.error("Job application error", error);
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
