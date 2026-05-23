import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { createRequire } from "module";
import { writeFile, unlink } from "fs/promises";
import os from "os";
import path from "path";
import { recognize } from "tesseract.js";



export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const require = createRequire(import.meta.url);
const PDFParser = require("pdf2json");
const WordExtractor = require("word-extractor");

function esc(text) {
  return String(text || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanSpaces(text = "") {
  return String(text)
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n[ ]+/g, "\n")
    .replace(/[ ]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanSingleLine(text = "") {
  return cleanSpaces(text).replace(/\n+/g, " ").trim();
}

function removeContactNoise(text = "") {
  const lines = cleanSpaces(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines
    .filter((line) => {
      const lower = line.toLowerCase();

      if (/@/.test(line)) return false;
      if (/contact\s*no/i.test(line)) return false;
      if (/email\s*:/i.test(line)) return false;
      if (/address\s*,?\s*city/i.test(lower)) return false;
      if (/^\+?\d[\d\s().-]{8,}\d$/.test(line)) return false;

      return true;
    })
    .join("\n")
    .trim();
}

function getSection(text, names, stopNames = []) {
  const clean = cleanSpaces(text);

  const startPattern = names.map(esc).join("|");
  const stopPattern = stopNames.map(esc).join("|");

  const regex = stopPattern
    ? new RegExp(
        `(?:^|\\n)\\s*(?:${startPattern})\\s*[:\\-]?\\s*\\n?([\\s\\S]*?)(?=\\n\\s*(?:${stopPattern})\\s*[:\\-]?\\s*\\n|$)`,
        "i"
      )
    : new RegExp(
        `(?:^|\\n)\\s*(?:${startPattern})\\s*[:\\-]?\\s*\\n?([\\s\\S]*)`,
        "i"
      );

  const match = clean.match(regex);
  return match ? cleanSpaces(match[1]).slice(0, 3000) : "";
}

function splitList(text = "", limit = 20) {
  return Array.from(
    new Set(
      cleanSpaces(text)
        .split(/,|\n|•|\||;/)
        .map((item) => cleanSingleLine(item))
        .filter((item) => item.length >= 2 && item.length <= 60)
    )
  ).slice(0, limit);
}

function extractBasicCVData(text) {
  const cleanText = cleanSpaces(text);

  const emailMatch = cleanText.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
  );

  const phoneMatch = cleanText.match(/(\+?\d[\d\s().-]{8,}\d)/);

  const lines = cleanText
    .split("\n")
    .map((line) => cleanSingleLine(line))
    .filter(Boolean);

  const badNameWords = [
    "curriculum",
    "resume",
    "cv",
    "profile",
    "summary",
    "experience",
    "education",
    "skills",
    "contact",
    "email",
    "phone",
    "address",
    "objective",
  ];

  const possibleName =
    lines.find((line) => {
      const lower = line.toLowerCase();

      return (
        line.length >= 3 &&
        line.length <= 45 &&
        !line.includes("@") &&
        !/\d/.test(line) &&
        !badNameWords.some((word) => lower.includes(word))
      );
    }) || "";

  const locationLine =
    lines.find((line) => /address\s*,?\s*city/i.test(line)) ||
    lines.find((line) => /village|district|tehsil|city/i.test(line)) ||
    "";

  const location = locationLine
    .replace(/^address\s*,?\s*city\s*:\s*/i, "")
    .replace(/^address\s*:\s*/i, "")
    .trim();

  const possibleJobTitle =
    lines.find((line) => {
      const lower = line.toLowerCase();

      return (
        line !== possibleName &&
        line !== locationLine &&
        line.length >= 3 &&
        line.length <= 70 &&
        !line.includes("@") &&
        !/^\+?\d/.test(line) &&
        !badNameWords.some((word) => lower.includes(word))
      );
    }) || "";

  const sectionHeadings = [
    "professional summary",
    "profile",
    "summary",
    "personal profile",
    "career profile",
    "objective",
    "career objective",
    "work experience",
    "employment history",
    "professional experience",
    "experience",
    "education",
    "academic history",
    "qualifications",
    "skills",
    "key skills",
    "technical skills",
    "languages",
    "certifications",
    "certificates",
    "achievements",
    "projects",
    "references",
  ];

  const objective = getSection(
    cleanText,
    ["objective", "career objective"],
    sectionHeadings
  );

  let summary =
    objective ||
    getSection(
      cleanText,
      ["professional summary", "profile", "summary", "personal profile"],
      sectionHeadings
    );

  summary = removeContactNoise(summary);

  if (!summary || summary.length < 20) {
    summary =
      "I am seeking a challenging position in an organization where I can learn new skills, expand my knowledge, and contribute to organizational goals.";
  }

  const experience = removeContactNoise(
    getSection(
      cleanText,
      [
        "work experience",
        "employment history",
        "professional experience",
        "experience",
      ],
      sectionHeadings
    )
  );

  const education = removeContactNoise(
    getSection(
      cleanText,
      ["education", "academic history", "qualifications"],
      sectionHeadings
    )
  );

  const projects = removeContactNoise(
    getSection(cleanText, ["projects"], sectionHeadings)
  );

  const skillsText =
    getSection(cleanText, ["skills", "key skills", "technical skills"], sectionHeadings) ||
    "";

  const languagesText =
    getSection(cleanText, ["languages", "language"], sectionHeadings) || "";

  const certificationsText =
    getSection(cleanText, ["certifications", "certificates"], sectionHeadings) ||
    "";

  const skillsKeywords = [
    "MS Office",
    "Word",
    "Excel",
    "PowerPoint",
    "Internet Browsing",
    "Web Designing",
    "CCNA",
    "Team Management",
    "Time Management",
    "Data Entry",
    "Troubleshooting",
    "Transmission",
  ];

  const lowerText = cleanText.toLowerCase();

  const keywordSkills = skillsKeywords.filter((skill) =>
    lowerText.includes(skill.toLowerCase())
  );

  const skills = Array.from(
    new Set([...splitList(skillsText, 20), ...keywordSkills])
  ).slice(0, 20);

  return {
    fullName: cleanSingleLine(possibleName),
    jobTitle: cleanSingleLine(possibleJobTitle),
    email: emailMatch ? emailMatch[0] : "",
    phone: phoneMatch ? cleanSingleLine(phoneMatch[0]) : "",
    location: cleanSingleLine(location),

    summary: cleanSpaces(summary),
    experience: cleanSpaces(experience),
    projects: cleanSpaces(projects),
    education: cleanSpaces(education),

    skills,
    languages: splitList(languagesText, 10),
    certifications: splitList(certificationsText, 10),

    rawText: cleanText,
  };
}

async function extractDocText(buffer, fileName) {
  const extractor = new WordExtractor();

  const tempPath = path.join(
    os.tmpdir(),
    `${Date.now()}-${Math.random().toString(36).slice(2)}-${fileName}`
  );

  await writeFile(tempPath, buffer);

  try {
    const document = await extractor.extract(tempPath);
    return document.getBody() || "";
  } finally {
    await unlink(tempPath).catch(() => {});
  }
}

function extractPdfText(buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1);

    pdfParser.on("pdfParser_dataError", (errData) => {
      reject(errData.parserError || errData);
    });

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      try {
        const pages = pdfData?.Pages || [];

        const text = pages
          .map((page) =>
            (page.Texts || [])
              .map((textItem) =>
                (textItem.R || [])
                  .map((run) => decodeURIComponent(run.T || ""))
                  .join("")
              )
              .join(" ")
          )
          .join("\n");

        resolve(cleanSpaces(text));
      } catch (error) {
        reject(error);
      }
    });

    pdfParser.parseBuffer(buffer);
  });
}

async function extractImageText(buffer, fileName = "image.png") {
  const ext = path.extname(fileName) || ".png";

  const tempPath = path.join(
    os.tmpdir(),
    `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
  );

  await writeFile(tempPath, buffer);

  try {
    const result = await recognize(tempPath, "eng", {
      logger: () => {},
    });

    return cleanSpaces(result?.data?.text || "");
  } finally {
    await unlink(tempPath).catch(() => {});
  }
}

function isImageFile(fileName) {
  return (
    fileName.endsWith(".jpg") ||
    fileName.endsWith(".jpeg") ||
    fileName.endsWith(".png") ||
    fileName.endsWith(".webp")
  );
}


export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No file uploaded.",
        },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    let extractedText = "";

    if (fileName.endsWith(".txt")) {
      extractedText = buffer.toString("utf-8");
    } else if (fileName.endsWith(".pdf")) {
      extractedText = await extractPdfText(buffer);

      if (!cleanSpaces(extractedText)) {
        return NextResponse.json(
          {
            success: false,
            error:
              "No readable text found in this PDF. This looks like a scanned PDF. Please upload the CV as JPG, PNG or WEBP image for OCR reading.",
          },
          { status: 400 }
        );
      }
    } else if (fileName.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value || "";
    } else if (fileName.endsWith(".doc")) {
      extractedText = await extractDocText(buffer, fileName);
    } else if (isImageFile(fileName)) {
      extractedText = await extractImageText(buffer, fileName);
    } else {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unsupported file type. Upload PDF, DOC, DOCX, TXT, JPG, JPEG, PNG or WEBP.",
        },
        { status: 400 }
      );
    }

    extractedText = cleanSpaces(extractedText);

    if (!extractedText) {
      const message = fileName.endsWith(".pdf")
        ? "No readable text found in this PDF. This looks like a scanned PDF. Please upload the CV as JPG, PNG or WEBP image for OCR reading."
        : "No readable text found in this CV. Please upload a clear JPG, PNG or WEBP image, or a readable DOC/DOCX/PDF file.";

      return NextResponse.json(
        {
          success: false,
          error: message,
        },
        { status: 400 }
      );
    }

    const extractedData = extractBasicCVData(extractedText);

    return NextResponse.json({
      success: true,
      data: extractedData,
    });
  } catch (error) {
    console.error("CV extract error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to extract CV data from this file.",
      },
      { status: 500 }
    );
  }
}
