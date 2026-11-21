import { NextResponse } from "next/server";
import { Resend } from "resend";
import crypto from "node:crypto";

import { connectDB } from "@/lib/mongodb";
import Contact from "@/models/contact";

export const runtime = "nodejs";

const MAX_REQUESTS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function POST(request) {
  try {
    const { name, email, message } = await request.json();

    // Validate fields
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof message !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      email.trim().length > 254 ||
      message.trim().length < 10 ||
      message.trim().length > 3000
    ) {
      return NextResponse.json(
        { message: "Please enter valid contact details." },
        { status: 400 }
      );
    }

    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    const adminEmail = process.env.CONTACT_ADMIN_EMAIL;
    const rateLimitSecret = process.env.CONTACT_RATE_LIMIT_SECRET;

    if (!resendKey || !fromEmail || !adminEmail || !rateLimitSecret) {
      return NextResponse.json(
        { message: "Contact service is not configured." },
        { status: 503 }
      );
    }

    // Rate limit: maximum 5 messages per IP per hour
    // Trust forwarded IP headers only behind a trusted hosting proxy.
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const ipHash = crypto
      .createHmac("sha256", rateLimitSecret)
      .update(ip)
      .digest("hex");

    await connectDB();

    const since = new Date(Date.now() - WINDOW_MS);

    const count = await Contact.countDocuments({
      ipHash,
      createdAt: { $gte: since },
    });

    if (count >= MAX_REQUESTS) {
      return NextResponse.json(
        {
          message:
            "You have reached the 5-message limit. Please try again after one hour.",
        },
        { status: 429 }
      );
    }

    // Save message in MongoDB
    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      ipHash,
      notificationStatus: "pending",
    });

  const resend = new Resend(
  process.env.RESEND_API_KEY?.trim()
);

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [adminEmail],
      replyTo: contact.email,
      subject: `New Contact Message - ${contact.name}`,
      text: `
New contact message from QORLIQ CV

Name: ${contact.name}
Email: ${contact.email}

Message:
${contact.message}
      `.trim(),
    });

    if (error || !data?.id) {
      await Contact.findByIdAndUpdate(contact._id, {
        notificationStatus: "failed",
      });

      console.error("Resend error:", error);

      return NextResponse.json(
        { message: "Message saved, but email could not be sent." },
        { status: 502 }
      );
    }

    await Contact.findByIdAndUpdate(contact._id, {
      notificationStatus: "sent",
      notificationSentAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been sent successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact API error:", error);

    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}