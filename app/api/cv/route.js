import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CV from "@/models/CV";

function cleanText(value = "") {
  return String(value || "")
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n[ ]+/g, "\n")
    .replace(/[ ]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanArray(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => cleanText(item))
    .filter(Boolean);
}

function cleanObjectTextFields(obj = {}) {
  if (!obj || typeof obj !== "object") return obj;

  const cleaned = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      cleaned[key] = cleanText(value);
    } else if (Array.isArray(value)) {
      cleaned[key] = value
        .map((item) => {
          if (typeof item === "string") return cleanText(item);
          if (item && typeof item === "object") return cleanObjectTextFields(item);
          return item;
        })
        .filter(Boolean);
    } else if (value && typeof value === "object") {
      cleaned[key] = cleanObjectTextFields(value);
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

function cleanObjectArray(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => cleanObjectTextFields(item))
    .filter((item) => item && Object.keys(item).length > 0);
}

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const cv = await CV.create({
      template: cleanText(body.template || "ats-professional"),

      fullName: cleanText(body.fullName || ""),
      jobTitle: cleanText(body.jobTitle || ""),
      email: cleanText(body.email || ""),
      phone: cleanText(body.phone || ""),
      location: cleanText(body.location || ""),

      linkedIn: cleanText(body.linkedIn || ""),
      github: cleanText(body.github || ""),
      portfolio: cleanText(body.portfolio || ""),
      website: cleanText(body.website || ""),

      photo: body.photo || "",

      summary: cleanText(body.summary || ""),

      // Old/simple text fields for preview/pdf compatibility
      experience: cleanText(body.experience || ""),
      projects: cleanText(body.projects || ""),
      education: cleanText(body.education || ""),

      // Simple array fields
      skills: cleanArray(body.skills),
      languages: cleanArray(body.languages),
      certifications: cleanArray(body.certifications),
      strengths: cleanArray(body.strengths),

      // New structured fields from create page
      experiences: cleanObjectArray(body.experiences),
      educations: cleanObjectArray(body.educations),
      projectsList: cleanObjectArray(body.projectsList),
      certificationsList: cleanObjectArray(body.certificationsList),
    });

    return NextResponse.json({
      success: true,
      cvId: cv._id.toString(),
      data: cv,
    });
  } catch (error) {
    console.error("Create CV error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to save CV",
      },
      { status: 500 }
    );
  }
}