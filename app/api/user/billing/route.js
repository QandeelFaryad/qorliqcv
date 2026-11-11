import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const runtime = "nodejs";

function reply(message, status) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

export async function PUT(request) {
  try {
    // Protect cookie-authenticated mutations.
    const origin = request.headers.get("origin");
    const allowedOrigin = new URL(
      process.env.NEXTAUTH_URL || request.url
    ).origin;

    if (origin && origin !== allowedOrigin) {
      return reply("Invalid request origin.", 403);
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId || !/^[a-fA-F0-9]{24}$/.test(userId)) {
      return reply("Please login first.", 401);
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return reply("Invalid JSON body.", 400);
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return reply("Billing details must be an object.", 400);
    }

    // Accept either { billingDetails: {...} } or {...}.
    const input = body.billingDetails ?? body;

    if (
      !input ||
      typeof input !== "object" ||
      Array.isArray(input)
    ) {
      return reply("Invalid billing details.", 400);
    }

    const details = { ...input };

    // Map your existing frontend's field names.
    if (Object.hasOwn(details, "name")) {
      if (typeof details.name !== "string") {
        return reply("Full name must be text.", 400);
      }

      const parts = details.name.trim().split(/\s+/);

      if (!Object.hasOwn(details, "firstName")) {
        details.firstName = parts.shift() || "";
      }

      if (!Object.hasOwn(details, "lastName")) {
        details.lastName = parts.join(" ");
      }
    }

    if (
      Object.hasOwn(details, "line1") &&
      !Object.hasOwn(details, "addressLine1")
    ) {
      details.addressLine1 = details.line1;
    }

    if (
      Object.hasOwn(details, "line2") &&
      !Object.hasOwn(details, "addressLine2")
    ) {
      details.addressLine2 = details.line2;
    }

    // Only these schema fields can be updated.
    const limits = {
      firstName: 100,
      lastName: 150,
      email: 254,
      mobileCountryCode: 10,
      mobileCountryFlag: 20,
      mobileNumber: 40,
      phone: 50,
      country: 2,
      countryName: 100,
      countryFlag: 20,
      postalCode: 30,
      addressLine1: 254,
      addressLine2: 254,
      city: 100,
    };

    const updates = {};

    for (const [field, limit] of Object.entries(limits)) {
      if (!Object.hasOwn(details, field)) continue;

      if (typeof details[field] !== "string") {
        return reply(`${field} must be text.`, 400);
      }

      let value = details[field].trim();

      if (value.length > limit) {
        return reply(
          `${field} must not exceed ${limit} characters.`,
          400
        );
      }

      if (field === "email") {
        value = value.toLowerCase();

        if (
          value &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ) {
          return reply("Enter a valid billing email.", 400);
        }
      }

      if (field === "country") {
        value = value.toUpperCase();

        if (value && !/^[A-Z]{2}$/.test(value)) {
          return reply(
            "Use a two-letter country code, such as GB, PK or SA.",
            400
          );
        }
      }

      updates[`billingDetails.${field}`] = value;
    }

    if (!Object.keys(updates).length) {
      return reply("No billing fields were provided.", 400);
    }

    await connectDB();

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    )
      .select("billingDetails")
      .lean();

    if (!user) {
      return reply("User not found.", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Billing details updated successfully.",
      billingDetails: user.billingDetails,
    });
  } catch (error) {
    console.error("Billing update failed:", error.name);

    return reply("Unable to update billing details.", 500);
  }
}