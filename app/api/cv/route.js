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

  return value.map((item) => cleanText(item)).filter(Boolean);
}

function cleanNumber(value, fallback = 0, min = null, max = null) {
  const number = Number(value);

  if (!Number.isFinite(number)) return fallback;

  if (min !== null && number < min) return min;
  if (max !== null && number > max) return max;

  return number;
}

function cleanBoolean(value) {
  return value === true || value === "true";
}

function cleanObjectTextFields(obj = {}) {
  if (!obj || typeof obj !== "object") return {};

  const cleaned = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      cleaned[key] = cleanText(value);
    } else if (typeof value === "boolean") {
      cleaned[key] = cleanBoolean(value);
    } else if (typeof value === "number") {
      cleaned[key] = value;
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
    .filter((item) => {
      if (!item || typeof item !== "object") return false;

      return Object.values(item).some((value) => {
        if (typeof value === "string") return value.trim();
        if (typeof value === "boolean") return value === true;
        if (typeof value === "number") return Number.isFinite(value);
        if (Array.isArray(value)) return value.length > 0;
        return Boolean(value);
      });
    });
}

function buildCVPayload(body = {}) {
  return {
    template: cleanText(body.template || "clean-ats"),
    selectedColor: cleanText(body.selectedColor || ""),

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
    photoZoom: cleanNumber(body.photoZoom, 1, 1, 3),
    photoPositionX: cleanNumber(body.photoPositionX, 50, 0, 100),
    photoPositionY: cleanNumber(body.photoPositionY, 50, 0, 100),

    summary: cleanText(body.summary || ""),

    experience: cleanText(body.experience || ""),
    projects: cleanText(body.projects || ""),
    education: cleanText(body.education || ""),

    skills: cleanArray(body.skills),
    skillLevels: cleanArray(body.skillLevels),

    languages: cleanArray(body.languages),
    languageLevels: cleanArray(body.languageLevels),

    certifications: cleanArray(body.certifications),
    strengths: cleanArray(body.strengths),
    achievements: cleanArray(body.achievements),
    hobbies: cleanArray(body.hobbies),

    references: cleanText(body.references || ""),

    experiences: cleanObjectArray(body.experiences),
    educations: cleanObjectArray(body.educations),
    projectsList: cleanObjectArray(body.projectsList),
    certificationsList: cleanObjectArray(body.certificationsList),
    additionalSections: cleanObjectArray(body.additionalSections),

    atsScore: cleanNumber(body.atsScore, 0, 0, 100),

    status: cleanText(body.status || "draft"),
  };
}

function validateCVPayload(payload) {
  if (!payload.fullName) {
    return "Full name is required.";
  }

  if (!payload.jobTitle) {
    return "Job title is required.";
  }

  if (!payload.email) {
    return "Email address is required.";
  }

  return null;
}

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const payload = buildCVPayload(body);

    const validationError = validateCVPayload(payload);

    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          error: validationError,
        },
        { status: 400 }
      );
    }

    const cv = await CV.create(payload);

    return NextResponse.json(
      {
        success: true,
        cvId: cv._id.toString(),
        data: cv,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create CV error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to save CV.",
      },
      { status: 500 }
    );
  }
}