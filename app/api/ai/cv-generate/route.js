import { NextResponse } from "next/server";
import { openai, OPENAI_MODEL } from "@/lib/openai";
import { getAiPrompt } from "@/lib/cvAiPrompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_TYPES = new Set([
  "summary",
  "responsibilities",
  "achievement",
  "skills",
  "project",
  "education",
]);

function cleanHtml(html = "") {
  return String(html)
    .replace(/```html/gi, "")
    .replace(/```/g, "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .trim();
}

export async function POST(req) {
  try {
    const body = await req.json();

    const type = typeof body.type === "string" ? body.type.trim() : "";
    const cv = body.cv && typeof body.cv === "object" ? body.cv : {};

    if (!ALLOWED_TYPES.has(type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid AI generation type.",
        },
        { status: 400 }
      );
    }

    const prompt = getAiPrompt({ type, cv });

    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          error: "AI prompt could not be created.",
        },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.6,
      messages: [
        {
          role: "system",
          content:
            "You are a professional CV writing assistant. Return clean HTML only. Do not include markdown fences.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const html = cleanHtml(completion?.choices?.[0]?.message?.content || "");

    if (!html) {
      return NextResponse.json(
        {
          success: false,
          error: "AI returned empty content.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      html,
    });
  } catch (error) {
    console.error("CV AI Generate API Error:", error);

    const status = error?.status || 500;
    const code = error?.code || error?.error?.code || "";

    if (status === 429 || code === "insufficient_quota") {
      return NextResponse.json(
        {
          success: false,
          error:
            "OpenAI API quota is finished or billing is not active. Please add API credits/payment method in OpenAI Platform billing.",
        },
        { status: 429 }
      );
    }

    if (status === 401) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid OpenAI API key. Please check OPENAI_API_KEY in .env.local.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message || "Server error while generating AI content.",
      },
      { status }
    );
  }
}