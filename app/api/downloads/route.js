import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import CV from "@/models/CV";
import Download from "@/models/Download";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request data.",
        },
        { status: 400 }
      );
    }

    const cvId =
      typeof body.cvId === "string" ? body.cvId.trim() : "";

    const format =
      typeof body.format === "string"
        ? body.format.trim().toUpperCase()
        : "PDF";

    const fileSize =
      typeof body.fileSize === "string"
        ? body.fileSize.trim()
        : "";

    if (!/^[a-fA-F0-9]{24}$/.test(cvId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid CV ID is required.",
        },
        { status: 400 }
      );
    }

    if (!["PDF", "DOCX", "JPEG"].includes(format)) {
      return NextResponse.json(
        {
          success: false,
          message: "Format must be PDF, DOCX or JPEG.",
        },
        { status: 400 }
      );
    }

    if (
      fileSize &&
      !/^\d+(?:\.\d+)?\s?(B|KB|MB|GB)$/i.test(fileSize)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid file size. Example: 684 KB.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // CV model mein ownership field "user" hai.
    const cv = await CV.findOne({
      _id: cvId,
      user: session.user.id,
    })
      .select("jobTitle fullName template")
      .lean();

    if (!cv) {
      return NextResponse.json(
        {
          success: false,
          message: "CV not found.",
        },
        { status: 404 }
      );
    }

    const download = await Download.create({
      // Download model mein ownership field "userId" hai.
      userId: session.user.id,
      cvId: cv._id,
      cvTitle: cv.jobTitle || cv.fullName || "Untitled CV",
      template: cv.template || "clean-ats",
      format,
      fileSize,

      // Abhi sirf download click/request record ho raha hai.
      status: "completed",
      downloadedAt: null,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Download record saved successfully.",
        downloadId: download._id.toString(),
        data: download,
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error("Create download record error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save download record.",
      },
      { status: 500 }
    );
  }
}
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to view your downloads.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    // Sirf logged-in user ki download history.
    const records = await Download.find({
      userId,
    })
      .select(
        "_id cvId cvTitle template format fileSize status downloadedAt createdAt"
      )
      .sort({ createdAt: -1, _id: -1 })
      .lean();

    const downloads = records.map((item) => ({
      id: item._id.toString(),
      cvId: item.cvId?.toString() || null,
      cvTitle: item.cvTitle,
      template: item.template,
      format: item.format,
      fileSize: item.fileSize || "—",
      status: item.status,
      downloadedAt: item.downloadedAt,
      createdAt: item.createdAt,
    }));

    return NextResponse.json(
      {
        success: true,
        count: downloads.length,
        downloads,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error("Get user downloads error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch your downloads.",
      },
      { status: 500 }
    );
  }
}



export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please login first." },
        { status: 401 }
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const cvId = body?.cvId;

    if (
      typeof cvId !== "string" ||
      !mongoose.isValidObjectId(cvId)
    ) {
      return NextResponse.json(
        { success: false, message: "A valid CV ID is required." },
        { status: 400 }
      );
    }

    await connectDB();

    const cv = await CV.findOneAndUpdate(
      {
        _id: cvId,
        user: userId,
      },
      {
        $set: {
          isdownload: true,
          status: "completed",
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("_id isdownload status");

    if (!cv) {
      return NextResponse.json(
        { success: false, message: "CV not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "CV download status updated successfully.",
      cv,
    });
  } catch (error) {
    console.error("CV download update error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update CV status." },
      { status: 500 }
    );
  }
}




export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in first.",
        },
        { status: 401 }
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON body.",
        },
        { status: 400 }
      );
    }

    const downloadId = body?.downloadId;

    if (
      typeof downloadId !== "string" ||
      !/^[a-fA-F0-9]{24}$/.test(downloadId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid download ID is required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const deletedDownload = await Download.findOneAndDelete({
      _id: downloadId,
      userId: userId,
    });

    if (!deletedDownload) {
      return NextResponse.json(
        {
          success: false,
          message: "Download record not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Download record deleted successfully.",
      downloadId,
    });
  } catch (error) {
    console.error("Delete download error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete download record.",
      },
      { status: 500 }
    );
  }
}


