import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CV from "@/models/CV";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const cv = await CV.create({
      template: body.template || "ats-professional",

      fullName: body.fullName || "",
      jobTitle: body.jobTitle || "",
      email: body.email || "",
      phone: body.phone || "",
      location: body.location || "",

      linkedIn: body.linkedIn || "",
      github: body.github || "",
      portfolio: body.portfolio || "",
      website: body.website || "",

      photo: body.photo || "",

      summary: body.summary || "",

      // Old/simple text fields for preview/pdf compatibility
      experience: body.experience || "",
      projects: body.projects || "",
      education: body.education || "",

      // Simple array fields
      skills: Array.isArray(body.skills) ? body.skills : [],
      languages: Array.isArray(body.languages) ? body.languages : [],
      certifications: Array.isArray(body.certifications)
        ? body.certifications
        : [],
      strengths: Array.isArray(body.strengths) ? body.strengths : [],

      // New structured fields from create page
      experiences: Array.isArray(body.experiences) ? body.experiences : [],
      educations: Array.isArray(body.educations) ? body.educations : [],
      projectsList: Array.isArray(body.projectsList) ? body.projectsList : [],
      certificationsList: Array.isArray(body.certificationsList)
        ? body.certificationsList
        : [],
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