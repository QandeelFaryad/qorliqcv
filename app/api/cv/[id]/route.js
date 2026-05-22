import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import CV from "@/models/CV";

// GET single CV by ID
export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid CV ID",
        },
        { status: 400 }
      );
    }

    const cv = await CV.findById(id).lean();

    if (!cv) {
      return NextResponse.json(
        {
          success: false,
          error: "CV not found",
        },
        { status: 404 }
      );
    }

    const formattedCV = {
      ...cv,
      _id: cv._id.toString(),
    };

    return NextResponse.json({
      success: true,
      cv: formattedCV,
      data: formattedCV,
    });
  } catch (error) {
    console.error("Get CV error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to get CV",
      },
      { status: 500 }
    );
  }
}

// UPDATE CV by ID
export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid CV ID",
        },
        { status: 400 }
      );
    }

    const body = await req.json();

    const updateData = {
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
    };

    const updatedCV = await CV.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!updatedCV) {
      return NextResponse.json(
        {
          success: false,
          error: "CV not found",
        },
        { status: 404 }
      );
    }

    const formattedCV = {
      ...updatedCV,
      _id: updatedCV._id.toString(),
    };

    return NextResponse.json({
      success: true,
      message: "CV updated successfully",
      cvId: formattedCV._id,
      cv: formattedCV,
      data: formattedCV,
    });
  } catch (error) {
    console.error("Update CV error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unable to update CV",
      },
      { status: 500 }
    );
  }
}

// DELETE CV by ID - optional
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid CV ID",
        },
        { status: 400 }
      );
    }

    const deletedCV = await CV.findByIdAndDelete(id);

    if (!deletedCV) {
      return NextResponse.json(
        {
          success: false,
          error: "CV not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "CV deleted successfully",
    });
  } catch (error) {
    console.error("Delete CV error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to delete CV",
      },
      { status: 500 }
    );
  }
}