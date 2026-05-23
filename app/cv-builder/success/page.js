"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

// ---------- TEMPLATE CONFIG ----------
const templateConfig = {
  "ats-professional": {
    layout: "ats",
    name: "ATS Professional",
    accent: "#111827",
    photo: false,
  },
  "modern-corporate": {
    layout: "modern",
    name: "Modern Corporate",
    accent: "#2563EB",
    photo: true,
  },
  "executive-leadership": {
    layout: "executive",
    name: "Executive Leadership",
    accent: "#B88A2C",
    photo: false,
  },
  "creative-portfolio": {
    layout: "creative",
    name: "Creative Portfolio",
    accent: "#7C3AED",
    photo: true,
  },
  "graduate-entry": {
    layout: "student",
    name: "Graduate Entry",
    accent: "#059669",
    photo: true,
  },
  "technical-it": {
    layout: "technical",
    name: "Technical IT",
    accent: "#0891B2",
    photo: false,
  },
  "academic-research": {
    layout: "academic",
    name: "Academic Research",
    accent: "#4338CA",
    photo: false,
  },
  "healthcare-clinical": {
    layout: "healthcare",
    name: "Healthcare Clinical",
    accent: "#0F766E",
    photo: true,
  },
  "skilled-trade": {
    layout: "trade",
    name: "Skilled Trade",
    accent: "#EA580C",
    photo: true,
  },
  "international-europass": {
    layout: "europass",
    name: "International Europass",
    accent: "#1D4ED8",
    photo: true,
  },

  executive: {
    layout: "executive",
    name: "Executive Leadership",
    accent: "#B88A2C",
    photo: false,
  },
  modern: {
    layout: "modern",
    name: "Modern Corporate",
    accent: "#2563EB",
    photo: true,
  },
  creative: {
    layout: "creative",
    name: "Creative Portfolio",
    accent: "#7C3AED",
    photo: true,
  },
  minimal: {
    layout: "ats",
    name: "ATS Professional",
    accent: "#111827",
    photo: false,
  },
};

const emptyCV = {
  template: "ats-professional",
  fullName: "",
  jobTitle: "",
  email: "",
  phone: "",
  location: "",
  linkedIn: "",
  github: "",
  portfolio: "",
  website: "",
  photo: "",
  summary: "",
  experience: "",
  projects: "",
  education: "",
  skills: [],
  languages: [],
  certifications: [],
  strengths: [],
  experiences: [],
  educations: [],
  projectsList: [],
  certificationsList: [],
};

// ---------- HELPERS ----------
function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((i) => String(i || "").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/,|\n|·/)
      .map((i) => i.trim())
      .filter(Boolean);
  }

  return [];
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasList(value) {
  return normalizeList(value).length > 0;
}

function hasContact(cv) {
  return (
    hasText(cv.email) ||
    hasText(cv.phone) ||
    hasText(cv.location) ||
    hasText(cv.linkedIn) ||
    hasText(cv.github) ||
    hasText(cv.portfolio) ||
    hasText(cv.website)
  );
}

function hasValidExperience(cv) {
  if (Array.isArray(cv.experiences)) {
    const valid = cv.experiences.filter(
      (e) =>
        hasText(e.jobTitle) ||
        hasText(e.company) ||
        hasText(e.location) ||
        hasText(e.startDate) ||
        hasText(e.endDate) ||
        hasText(e.description)
    );

    if (valid.length > 0) return true;
  }

  return hasText(cv.experience);
}

function hasValidEducation(cv) {
  if (Array.isArray(cv.educations)) {
    const valid = cv.educations.filter(
      (e) =>
        hasText(e.degree) ||
        hasText(e.institution) ||
        hasText(e.location) ||
        hasText(e.startDate) ||
        hasText(e.endDate) ||
        hasText(e.description)
    );

    if (valid.length > 0) return true;
  }

  return hasText(cv.education);
}

function hasValidProjects(cv) {
  if (Array.isArray(cv.projectsList)) {
    const valid = cv.projectsList.filter(
      (p) =>
        hasText(p.title) ||
        hasText(p.role) ||
        hasText(p.technologies) ||
        hasText(p.date) ||
        hasText(p.description)
    );

    if (valid.length > 0) return true;
  }

  return hasText(cv.projects);
}

function hasValidCertifications(cv) {
  if (Array.isArray(cv.certificationsList)) {
    const valid = cv.certificationsList.filter(
      (c) => hasText(c.name) || hasText(c.issuer) || hasText(c.date)
    );

    if (valid.length > 0) return true;
  }

  return hasList(cv.certifications);
}

function formatDateRange(startDate, endDate, current) {
  const start = hasText(startDate) ? startDate : "";
  const end = current ? "Present" : hasText(endDate) ? endDate : "";

  if (!start && !end) return "";
  if (start && end) return `${start} — ${end}`;
  return start || end;
}

function safeFileName(name) {
  const clean = String(name || "qorliq-cv")
    .trim()
    .replace(/[^a-z0-9-_ ]/gi, "")
    .replace(/\s+/g, "-")
    .toLowerCase();

  return clean || "qorliq-cv";
}

function normalizeUrl(value) {
  if (!value) return "";
  const clean = String(value).trim();
  if (!clean) return "";
  if (clean.startsWith("http://") || clean.startsWith("https://")) return clean;
  return `https://${clean}`;
}

function waitForImages(container) {
  const images = Array.from(container.querySelectorAll("img"));

  return Promise.all(
    images.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }

          img.onload = () => resolve();
          img.onerror = () => resolve();
          setTimeout(resolve, 10000);
        })
    )
  );
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(blob);
  });
}

async function imageSrcToDataUrl(src) {
  if (!src) return "";

  if (src.startsWith("data:image/")) {
    return src;
  }

  try {
    const response = await fetch(src, {
      mode: "cors",
      cache: "no-store",
    });

    if (!response.ok) return "";

    const blob = await response.blob();

    if (!blob.type.startsWith("image/")) return "";

    return await blobToDataUrl(blob);
  } catch (error) {
    console.error("Image conversion failed:", error);
    return "";
  }
}

async function prepareImagesForPDF(container) {
  const images = Array.from(container.querySelectorAll("img"));
  const originals = [];

  for (const img of images) {
    originals.push({
      img,
      src: img.getAttribute("src"),
    });

    const currentSrc = img.currentSrc || img.src || img.getAttribute("src");
    const dataUrl = await imageSrcToDataUrl(currentSrc);

    img.removeAttribute("crossorigin");

    if (dataUrl) {
      img.src = dataUrl;
    }

    await new Promise((resolve) => {
      if (img.complete && img.naturalWidth > 0) {
        resolve();
        return;
      }

      img.onload = () => resolve();
      img.onerror = () => resolve();
      setTimeout(resolve, 8000);
    });
  }

  return function restoreImages() {
    originals.forEach(({ img, src }) => {
      if (src) img.setAttribute("src", src);
    });
  };
}

function getWordHtml(innerHtml) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @page {
      size: A4;
      margin: 0;
    }

    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      font-family: Arial, Helvetica, sans-serif;
    }

    * {
      box-sizing: border-box;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    img {
      max-width: 100%;
    }

    .word-page {
      width: 794px;
      min-height: 1123px;
      margin: 0 auto;
      background: #ffffff;
    }
  </style>
</head>
<body>
  <div class="word-page">
    ${innerHtml}
  </div>
</body>
</html>
`;
}

// ---------- PAGE ----------
export default function SuccessPage() {
  const cvRef = useRef(null);
  const previewShellRef = useRef(null);

  const [cv, setCv] = useState(emptyCV);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingWord, setDownloadingWord] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [previewHeight, setPreviewHeight] = useState(1123);

  useEffect(() => {
    async function loadCV() {
      try {
        const params = new URLSearchParams(window.location.search);
        const cvId = params.get("cvId");

        if (!cvId) {
          setError("CV ID missing. Please create your CV again.");
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/cv/${cvId}`, {
          method: "GET",
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Unable to load CV.");
        }

        const loadedCV = data.cv || data.data;

        if (!loadedCV) {
          throw new Error("CV data not found.");
        }

        setCv({
          ...emptyCV,
          ...loadedCV,
        });
      } catch (error) {
        console.error("Load CV error:", error);
        setError(error.message || "Unable to load CV.");
      } finally {
        setLoading(false);
      }
    }

    loadCV();
  }, []);

  const config = templateConfig[cv.template] || templateConfig["ats-professional"];

  const updatePreviewSize = () => {
    const shell = previewShellRef.current;
    const element = cvRef.current;

    if (!shell || !element) return;

    const shellWidth = shell.clientWidth;
    const a4Width = 794;
    const a4MinHeight = 1123;

    const nextScale = Math.min(1, shellWidth / a4Width);
    const realHeight = Math.max(a4MinHeight, element.scrollHeight || a4MinHeight);

    setPreviewScale(nextScale);
    setPreviewHeight(realHeight * nextScale);
  };

  useEffect(() => {
    if (loading) return;

    updatePreviewSize();

    let resizeObserver;

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(updatePreviewSize);

      if (previewShellRef.current) {
        resizeObserver.observe(previewShellRef.current);
      }

      if (cvRef.current) {
        resizeObserver.observe(cvRef.current);
      }
    }

    window.addEventListener("resize", updatePreviewSize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(updatePreviewSize).catch(() => {});
    }

    const timer = setTimeout(updatePreviewSize, 300);

    return () => {
      window.removeEventListener("resize", updatePreviewSize);
      clearTimeout(timer);

      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [loading, cv, config.layout]);
  function createExportClone(element) {
  if (!element) return null;

  const clone = element.cloneNode(true);

  clone.id = "qorliq-cv-export-clone";

  clone.style.width = "794px";
  clone.style.minWidth = "794px";
  clone.style.maxWidth = "794px";
  clone.style.background = "#ffffff";
  clone.style.margin = "0";
  clone.style.padding = "0";
  clone.style.position = "fixed";
  clone.style.top = "0";
  clone.style.left = "-10000px";
  clone.style.right = "auto";
  clone.style.bottom = "auto";
  clone.style.transform = "none";
  clone.style.transformOrigin = "top left";
  clone.style.scale = "none";
  clone.style.opacity = "1";
  clone.style.visibility = "visible";
  clone.style.pointerEvents = "none";
  clone.style.zIndex = "-1";
  clone.style.overflow = "visible";

  document.body.appendChild(clone);

  return clone;
}

function removeExportClone(clone) {
  if (clone && clone.parentNode) {
    clone.parentNode.removeChild(clone);
  }
}

const downloadPDF = async () => {
  if (downloadingPDF) return;

  const previewElement = cvRef.current;

  if (!previewElement) {
    alert("CV preview not found. Please refresh and try again.");
    return;
  }

  let exportElement = null;
  let restoreImages = null;

  try {
    setDownloadingPDF(true);

    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    exportElement = createExportClone(previewElement);

    if (!exportElement) {
      throw new Error("Unable to prepare CV for PDF.");
    }

    restoreImages = await prepareImagesForPDF(exportElement);
    await waitForImages(exportElement);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const exportWidth = 794;
    const exportHeight = Math.max(1123, exportElement.scrollHeight);

    const dataUrl = await toPng(exportElement, {
      cacheBust: true,
      pixelRatio: 2.5,
      backgroundColor: "#ffffff",
      width: exportWidth,
      height: exportHeight,
      canvasWidth: exportWidth * 2.5,
      canvasHeight: exportHeight * 2.5,
      style: {
        width: `${exportWidth}px`,
        minWidth: `${exportWidth}px`,
        maxWidth: `${exportWidth}px`,
        height: `${exportHeight}px`,
        background: "#ffffff",
        margin: "0",
        padding: "0",
        position: "static",
        transform: "none",
        transformOrigin: "top left",
        boxShadow: "none",
        overflow: "visible",
      },
    });

    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = 210;
    const pdfHeight = 297;

    const imgProps = pdf.getImageProperties(dataUrl);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`${safeFileName(cv.fullName || "qorliq-cv")}.pdf`);
  } catch (error) {
    console.error("PDF download real error:", error);
    alert(error?.message || "PDF download failed.");
  } finally {
    if (restoreImages) restoreImages();
    removeExportClone(exportElement);
    setDownloadingPDF(false);
  }
};

const downloadWord = async () => {
  if (downloadingWord) return;

  const previewElement = cvRef.current;

  if (!previewElement) {
    alert("CV preview not found. Please refresh and try again.");
    return;
  }

  let exportElement = null;
  let restoreImages = null;

  try {
    setDownloadingWord(true);

    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    exportElement = createExportClone(previewElement);

    if (!exportElement) {
      throw new Error("Unable to prepare CV for Word.");
    }

    restoreImages = await prepareImagesForPDF(exportElement);
    await waitForImages(exportElement);

    await new Promise((resolve) => setTimeout(resolve, 300));

    const htmlDocx = await import("html-docx-js/dist/html-docx");
    const { saveAs } = await import("file-saver");

    const html = getWordHtml(exportElement.innerHTML);
    const blob = htmlDocx.default.asBlob(html);

    saveAs(blob, `${safeFileName(cv.fullName || "qorliq-cv")}.docx`);
  } catch (error) {
    console.error("Word download error:", error);
    alert(error?.message || "Word download failed.");
  } finally {
    if (restoreImages) restoreImages();
    removeExportClone(exportElement);
    setDownloadingWord(false);
  }
};

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-qorliqGold">
          Loading your CV...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">
        <div className="max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 text-center">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-red-300">
            CV Not Found
          </p>

          <h1 className="mt-4 text-3xl font-black">Unable to Load CV</h1>

          <p className="mt-4 text-sm leading-7 text-white/55">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] px-3 py-8 text-white sm:px-4 md:px-6 md:py-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-qorliqGold">
              Payment Successful
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">
              Download your CV
            </h1>

            <p className="mt-2 text-sm text-white/50">
              Selected template: {config.name}. Your CV is ready for export.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button
              onClick={downloadPDF}
              disabled={downloadingPDF || downloadingWord}
              className="w-full rounded-full bg-qorliqGold px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {downloadingPDF ? "Preparing PDF..." : "Download PDF"}
            </button>

            <button
              onClick={downloadWord}
              disabled={downloadingPDF || downloadingWord}
              className="w-full rounded-full border border-white/15 px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:border-qorliqGold hover:text-qorliqGold disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {downloadingWord ? "Preparing Word..." : "Download Word"}
            </button>
          </div>
        </div>

        <div
          ref={previewShellRef}
          className="mx-auto w-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-2 sm:p-4"
        >
          <div
            className="relative mx-auto"
            style={{
              height: `${previewHeight}px`,
              maxWidth: "100%",
            }}
          >
            <div
              ref={cvRef}
              id="qorliq-cv-pdf"
              style={{
                width: "794px",
                minWidth: "794px",
                maxWidth: "794px",
                background: "#ffffff",
                margin: "0",
                flexShrink: 0,
                position: "absolute",
                top: 0,
                left: "50%",
                transform: `translateX(-50%) scale(${previewScale})`,
                transformOrigin: "top center",
              }}
            >
              <TemplateRenderer cv={cv} config={config} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// ---------- TEMPLATE RENDERER ----------
function TemplateRenderer({ cv, config }) {
  if (config.layout === "modern" || config.layout === "healthcare") {
    return <ModernTemplate cv={cv} config={config} />;
  }

  if (config.layout === "executive") {
    return <ExecutiveTemplate cv={cv} config={config} />;
  }

  if (config.layout === "creative") {
    return <CreativeTemplate cv={cv} config={config} />;
  }

  if (
    config.layout === "student" ||
    config.layout === "trade" ||
    config.layout === "europass"
  ) {
    return <PhotoHeaderTemplate cv={cv} config={config} />;
  }

  return <ATSTemplate cv={cv} config={config} />;
}

// ---------- TEMPLATE DESIGNS ----------
function ATSTemplate({ cv, config }) {
  const accent = config.accent;

  return (
    <div className="min-h-[1120px] bg-white px-12 py-12 text-black shadow-2xl">
      <header
        className="border-b pb-6"
        style={{ borderColor: `${accent}55` }}
      >
        {hasText(cv.fullName) ? (
          <h1 className="text-5xl font-black tracking-[-0.05em]">
            {cv.fullName}
          </h1>
        ) : null}

        {hasText(cv.jobTitle) ? (
          <p className="mt-2 text-xl font-bold" style={{ color: accent }}>
            {cv.jobTitle}
          </p>
        ) : null}

        {hasContact(cv) ? <ContactLine cv={cv} /> : null}
      </header>

      <main className="mt-8 space-y-8">
        {hasText(cv.summary) ? (
          <CVSection title="Professional Summary" accent={accent}>
            <CvParagraph text={cv.summary} />
          </CVSection>
        ) : null}

        {hasValidExperience(cv) ? (
          <CVSection title="Work Experience" accent={accent}>
            <ExperienceContent cv={cv} />
          </CVSection>
        ) : null}

        <div
          className="grid gap-8"
          style={{
            gridTemplateColumns: "0.58fr 0.42fr",
          }}
        >
          <div className="space-y-8">
            {hasValidEducation(cv) ? (
              <CVSection title="Education" accent={accent}>
                <EducationContent cv={cv} />
              </CVSection>
            ) : null}

            {hasValidProjects(cv) ? (
              <CVSection title="Projects" accent={accent}>
                <ProjectsContent cv={cv} />
              </CVSection>
            ) : null}
          </div>

          <aside className="space-y-8">
            {hasList(cv.skills) ? (
              <CVSection title="Skills" accent={accent}>
                <TagList items={cv.skills} accent={accent} />
              </CVSection>
            ) : null}

            {hasList(cv.languages) ? (
              <CVSection title="Languages" accent={accent}>
                <BulletList items={cv.languages} />
              </CVSection>
            ) : null}

            {hasValidCertifications(cv) ? (
              <CVSection title="Certifications" accent={accent}>
                <CertificationContent cv={cv} />
              </CVSection>
            ) : null}

            {hasList(cv.strengths) ? (
              <CVSection title="Key Strengths" accent={accent}>
                <BulletList items={cv.strengths} />
              </CVSection>
            ) : null}
          </aside>
        </div>
      </main>
    </div>
  );
}

function ModernTemplate({ cv, config }) {
  const accent = config.accent || "#0f7f70";

  return (
    <div
      className="grid shrink-0 bg-white text-black shadow-2xl"
      style={{
        width: "794px",
        height: "1123px",
        minHeight: "1123px",
        gridTemplateColumns: "270px 524px",
        alignItems: "stretch",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <aside
        className="flex flex-col px-8 py-10 text-white"
        style={{
          backgroundColor: accent,
          width: "270px",
          height: "1123px",
          minHeight: "1123px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {hasText(cv.photo) || hasText(cv.fullName) ? (
          <ProfilePhoto cv={cv} accent={accent} dark />
        ) : null}

        {hasText(cv.fullName) ? (
          <h1 className="mt-6 text-3xl font-black leading-tight">
            {cv.fullName}
          </h1>
        ) : null}

        {hasText(cv.jobTitle) ? (
          <p className="mt-2 text-sm font-semibold text-white/75">
            {cv.jobTitle}
          </p>
        ) : null}

        {hasContact(cv) ? (
          <div className="mt-8">
            <SmallTitle title="Contact" dark />
            <ContactStack cv={cv} dark />
          </div>
        ) : null}

        {hasList(cv.skills) ? (
          <div className="mt-8">
            <SmallTitle title="Skills" dark />
            <SkillPills items={cv.skills} dark />
          </div>
        ) : null}

        {hasList(cv.languages) ? (
          <div className="mt-8">
            <SmallTitle title="Languages" dark />
            <BulletList items={cv.languages} dark />
          </div>
        ) : null}

        {hasList(cv.strengths) ? (
          <div className="mt-8">
            <SmallTitle title="Strengths" dark />
            <BulletList items={cv.strengths} dark />
          </div>
        ) : null}
      </aside>

      <main
        className="space-y-8 px-10 py-10"
        style={{
          width: "524px",
          height: "1123px",
          minHeight: "1123px",
          boxSizing: "border-box",
          backgroundColor: "#ffffff",
          overflow: "hidden",
        }}
      >
        {hasText(cv.summary) ? (
          <CVSection title="Professional Summary" accent={accent}>
            <CvParagraph text={cv.summary} />
          </CVSection>
        ) : null}

        {hasValidExperience(cv) ? (
          <CVSection title="Employment History" accent={accent}>
            <ExperienceContent cv={cv} />
          </CVSection>
        ) : null}

        {hasValidEducation(cv) ? (
          <CVSection title="Education" accent={accent}>
            <EducationContent cv={cv} />
          </CVSection>
        ) : null}

        {hasValidProjects(cv) ? (
          <CVSection title="Projects" accent={accent}>
            <ProjectsContent cv={cv} />
          </CVSection>
        ) : null}

        {hasValidCertifications(cv) ? (
          <CVSection title="Certifications" accent={accent}>
            <CertificationContent cv={cv} />
          </CVSection>
        ) : null}
      </main>
    </div>
  );
}

function ExecutiveTemplate({ cv, config }) {
  const accent = config.accent;

  return (
    <div className="min-h-[1120px] overflow-hidden bg-white text-black shadow-2xl">
      <div className="bg-neutral-950 px-10 py-12 text-white">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-white/45">
          Executive CV
        </p>

        {hasText(cv.fullName) ? (
          <h1 className="mt-3 text-5xl font-black tracking-[-0.055em]">
            {cv.fullName}
          </h1>
        ) : null}

        {hasText(cv.jobTitle) ? (
          <p className="mt-3 text-xl font-semibold text-white/70">
            {cv.jobTitle}
          </p>
        ) : null}

        {hasContact(cv) ? <ContactLine cv={cv} dark /> : null}

        <div
          className="mt-6 h-1.5 w-24 rounded-full"
          style={{ backgroundColor: accent }}
        />
      </div>

      <div
        className="grid gap-10 px-10 py-10"
        style={{
          gridTemplateColumns: "0.36fr 0.64fr",
        }}
      >
        <aside className="space-y-8">
          {hasList(cv.skills) ? (
            <CVSection title="Core Skills" accent={accent}>
              <SkillPills items={cv.skills} accent={accent} />
            </CVSection>
          ) : null}

          {hasValidEducation(cv) ? (
            <CVSection title="Education" accent={accent}>
              <EducationContent cv={cv} compact />
            </CVSection>
          ) : null}

          {hasList(cv.languages) ? (
            <CVSection title="Languages" accent={accent}>
              <BulletList items={cv.languages} />
            </CVSection>
          ) : null}

          {hasValidCertifications(cv) ? (
            <CVSection title="Certifications" accent={accent}>
              <CertificationContent cv={cv} compact />
            </CVSection>
          ) : null}

          {hasList(cv.strengths) ? (
            <CVSection title="Key Strengths" accent={accent}>
              <BulletList items={cv.strengths} />
            </CVSection>
          ) : null}
        </aside>

        <main className="space-y-8">
          {hasText(cv.summary) ? (
            <CVSection title="Professional Profile" accent={accent}>
              <CvParagraph text={cv.summary} />
            </CVSection>
          ) : null}

          {hasValidExperience(cv) ? (
            <CVSection title="Leadership Experience" accent={accent}>
              <ExperienceContent cv={cv} />
            </CVSection>
          ) : null}

          {hasValidProjects(cv) ? (
            <CVSection title="Projects" accent={accent}>
              <ProjectsContent cv={cv} />
            </CVSection>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function CreativeTemplate({ cv, config }) {
  const accent = config.accent;

  return (
    <div className="min-h-[1120px] bg-white px-10 py-10 text-black shadow-2xl">
      <header
        className="flex flex-row items-center gap-6 rounded-[2rem] p-7"
        style={{ backgroundColor: `${accent}15` }}
      >
        {hasText(cv.photo) || hasText(cv.fullName) ? (
          <ProfilePhoto cv={cv} accent={accent} rounded />
        ) : null}

        <div>
          <p
            className="text-xs font-black uppercase tracking-[0.25em]"
            style={{ color: accent }}
          >
            Creative Portfolio CV
          </p>

          {hasText(cv.fullName) ? (
            <h1 className="mt-2 text-5xl font-black tracking-[-0.055em]">
              {cv.fullName}
            </h1>
          ) : null}

          {hasText(cv.jobTitle) ? (
            <p className="mt-2 text-xl font-bold" style={{ color: accent }}>
              {cv.jobTitle}
            </p>
          ) : null}

          {hasContact(cv) ? <ContactLine cv={cv} /> : null}
        </div>
      </header>

      <main
        className="mt-10 grid gap-9"
        style={{
          gridTemplateColumns: "0.62fr 0.38fr",
        }}
      >
        <div className="space-y-8">
          {hasText(cv.summary) ? (
            <CVSection title="Creative Profile" accent={accent}>
              <CvParagraph text={cv.summary} />
            </CVSection>
          ) : null}

          {hasValidExperience(cv) ? (
            <CVSection title="Experience" accent={accent}>
              <ExperienceContent cv={cv} />
            </CVSection>
          ) : null}

          {hasValidProjects(cv) ? (
            <CVSection title="Projects" accent={accent}>
              <ProjectsContent cv={cv} />
            </CVSection>
          ) : null}
        </div>

        <aside className="space-y-8 rounded-[1.8rem] border border-black/5 bg-black/[0.025] p-6">
          {hasList(cv.skills) ? (
            <CVSection title="Skills" accent={accent}>
              <SkillPills items={cv.skills} accent={accent} />
            </CVSection>
          ) : null}

          {hasValidEducation(cv) ? (
            <CVSection title="Education" accent={accent}>
              <EducationContent cv={cv} compact />
            </CVSection>
          ) : null}

          {hasList(cv.languages) ? (
            <CVSection title="Languages" accent={accent}>
              <BulletList items={cv.languages} />
            </CVSection>
          ) : null}

          {hasValidCertifications(cv) ? (
            <CVSection title="Certifications" accent={accent}>
              <CertificationContent cv={cv} compact />
            </CVSection>
          ) : null}

          {hasList(cv.strengths) ? (
            <CVSection title="Strengths" accent={accent}>
              <BulletList items={cv.strengths} />
            </CVSection>
          ) : null}
        </aside>
      </main>
    </div>
  );
}

function PhotoHeaderTemplate({ cv, config }) {
  const accent = config.accent;

  const label =
    config.layout === "europass"
      ? "European / International CV Format"
      : config.layout === "student"
      ? "Graduate CV"
      : config.layout === "trade"
      ? "Skilled Trade CV"
      : "Professional CV";

  return (
    <div className="min-h-[1120px] bg-white px-10 py-10 text-black shadow-2xl">
      <header
        className="flex flex-row items-center gap-6 border-b pb-8"
        style={{ borderColor: `${accent}40` }}
      >
        {hasText(cv.photo) || hasText(cv.fullName) ? (
          <ProfilePhoto cv={cv} accent={accent} />
        ) : null}

        <div>
          <p
            className="text-xs font-black uppercase tracking-[0.25em]"
            style={{ color: accent }}
          >
            {label}
          </p>

          {hasText(cv.fullName) ? (
            <h1 className="mt-2 text-5xl font-black tracking-[-0.055em]">
              {cv.fullName}
            </h1>
          ) : null}

          {hasText(cv.jobTitle) ? (
            <p className="mt-2 text-xl font-bold" style={{ color: accent }}>
              {cv.jobTitle}
            </p>
          ) : null}

          {hasContact(cv) ? <ContactLine cv={cv} /> : null}
        </div>
      </header>

      <main className="mt-9 space-y-8">
        {hasText(cv.summary) ? (
          <CVSection title="Profile" accent={accent}>
            <CvParagraph text={cv.summary} />
          </CVSection>
        ) : null}

        {hasValidExperience(cv) ? (
          <CVSection title="Employment History" accent={accent}>
            <ExperienceContent cv={cv} />
          </CVSection>
        ) : null}

        <div
          className="grid gap-9"
          style={{
            gridTemplateColumns: "1fr 1fr",
          }}
        >
          {hasValidEducation(cv) ? (
            <CVSection title="Education" accent={accent}>
              <EducationContent cv={cv} />
            </CVSection>
          ) : null}

          {hasList(cv.skills) ? (
            <CVSection title="Skills" accent={accent}>
              <SkillPills items={cv.skills} accent={accent} />
            </CVSection>
          ) : null}
        </div>

        <div className="grid gap-9 md:grid-cols-2">
          {hasValidProjects(cv) ? (
            <CVSection title="Projects" accent={accent}>
              <ProjectsContent cv={cv} />
            </CVSection>
          ) : null}

          <div className="space-y-8">
            {hasList(cv.languages) ? (
              <CVSection title="Languages" accent={accent}>
                <BulletList items={cv.languages} />
              </CVSection>
            ) : null}

            {hasValidCertifications(cv) ? (
              <CVSection title="Certifications" accent={accent}>
                <CertificationContent cv={cv} />
              </CVSection>
            ) : null}

            {hasList(cv.strengths) ? (
              <CVSection title="Strengths" accent={accent}>
                <BulletList items={cv.strengths} />
              </CVSection>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}

// ---------- REUSABLE COMPONENTS ----------
function CVSection({ title, children, accent }) {
  if (!children) return null;

  return (
    <section>
      <h2
        className="text-sm font-black uppercase tracking-[0.22em]"
        style={{ color: accent }}
      >
        {title}
      </h2>

      <div
        className="mt-3 h-px w-full"
        style={{ backgroundColor: `${accent}35` }}
      />

      <div className="mt-4">{children}</div>
    </section>
  );
}

function CvParagraph({ text, dark = false, className = "" }) {
  if (!hasText(text)) return null;

  return (
    <p
      className={`whitespace-pre-line text-sm leading-8 ${
        dark ? "text-white/75" : "text-black/70"
      } ${className}`}
    >
      {text}
    </p>
  );
}

function BulletList({ items, dark = false }) {
  const list = normalizeList(items);

  if (!list.length) return null;

  return (
    <ul
      className={`space-y-2 text-sm leading-7 ${
        dark ? "text-white/78" : "text-black/70"
      }`}
    >
      {list.map((item, idx) => (
        <li key={`${item}-${idx}`} className="flex gap-3">
          <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function TagList({ items, accent }) {
  const list = normalizeList(items);

  if (!list.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {list.map((item, idx) => (
        <span
          key={`${item}-${idx}`}
          className="rounded-full px-3 py-1.5 text-xs font-bold text-white"
          style={{ backgroundColor: accent }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function SkillPills({ items, accent = "#111827", dark = false }) {
  const list = normalizeList(items);

  if (!list.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {list.map((item, idx) => (
        <span
          key={`${item}-${idx}`}
          className={`rounded-full px-3 py-1.5 text-xs font-bold ${
            dark ? "bg-white/15 text-white" : "text-white"
          }`}
          style={dark ? undefined : { backgroundColor: accent }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function SmallTitle({ title, dark = false }) {
  return (
    <p
      className={`mb-3 text-xs font-black uppercase tracking-[0.22em] ${
        dark ? "text-white" : "text-black"
      }`}
    >
      {title}
    </p>
  );
}

function ClickableUrl({ value, className = "" }) {
  if (!hasText(value)) return null;

  const clean = String(value).trim();
  const href = normalizeUrl(clean);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`underline-offset-4 hover:underline ${className}`}
    >
      {clean}
    </a>
  );
}

function ContactLine({ cv, dark = false }) {
  const baseClass = dark
    ? "text-white/65 hover:text-white"
    : "text-black/55 hover:text-black";

  return (
    <div
      className={`mt-5 flex flex-wrap gap-x-3 gap-y-2 text-sm ${
        dark ? "text-white/65" : "text-black/55"
      }`}
    >
      {hasText(cv.email) ? (
        <a className={baseClass} href={`mailto:${cv.email}`}>
          {cv.email}
        </a>
      ) : null}

      {hasText(cv.phone) ? <span>{cv.phone}</span> : null}
      {hasText(cv.location) ? <span>{cv.location}</span> : null}

      <ClickableUrl value={cv.linkedIn} className={baseClass} />
      <ClickableUrl value={cv.github} className={baseClass} />
      <ClickableUrl value={cv.portfolio} className={baseClass} />
      <ClickableUrl value={cv.website} className={baseClass} />
    </div>
  );
}

function ContactStack({ cv, dark = false }) {
  const baseClass = dark
    ? "text-white/75 hover:text-white"
    : "text-black/60 hover:text-black";

  return (
    <div className="space-y-2 text-sm leading-6">
      {hasText(cv.email) ? (
        <a className={`block break-all ${baseClass}`} href={`mailto:${cv.email}`}>
          {cv.email}
        </a>
      ) : null}

      {hasText(cv.phone) ? (
        <p className={dark ? "text-white/75" : "text-black/60"}>{cv.phone}</p>
      ) : null}

      {hasText(cv.location) ? (
        <p className={dark ? "text-white/75" : "text-black/60"}>
          {cv.location}
        </p>
      ) : null}

      <ClickableUrl value={cv.linkedIn} className={`block break-all ${baseClass}`} />
      <ClickableUrl value={cv.github} className={`block break-all ${baseClass}`} />
      <ClickableUrl value={cv.portfolio} className={`block break-all ${baseClass}`} />
      <ClickableUrl value={cv.website} className={`block break-all ${baseClass}`} />
    </div>
  );
}

function ProfilePhoto({ cv, accent, dark = false, rounded = false }) {
  return (
    <div
      className={`flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden border ${
        rounded ? "rounded-[1.8rem]" : "rounded-full"
      } ${dark ? "border-white/25 bg-white/10" : "border-black/5 bg-black/5"}`}
      style={{ boxShadow: `0 18px 45px ${accent}25` }}
    >
      {hasText(cv.photo) ? (
        <img
          src={cv.photo}
          alt={cv.fullName || "Profile"}
          className="h-full w-full object-cover"
        />
      ) : (
        <DefaultAvatar name={cv.fullName} accent={accent} />
      )}
    </div>
  );
}

function DefaultAvatar({ name = "Candidate", accent = "#111827" }) {
  const initials = String(name || "Candidate")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center text-white"
      style={{ background: `linear-gradient(135deg, ${accent}, #111827)` }}
    >
      <div className="h-12 w-12 rounded-full bg-white/90" />
      <div className="mt-2 h-10 w-20 rounded-t-full bg-white/90" />
      <p className="mt-1 text-xs font-black opacity-50">{initials}</p>
    </div>
  );
}

// ---------- CV CONTENT ----------
function ExperienceContent({ cv }) {
  if (Array.isArray(cv.experiences) && cv.experiences.length) {
    const valid = cv.experiences.filter(
      (e) =>
        hasText(e.jobTitle) ||
        hasText(e.company) ||
        hasText(e.location) ||
        hasText(e.startDate) ||
        hasText(e.endDate) ||
        hasText(e.description)
    );

    if (valid.length) {
      return (
        <div className="space-y-6">
          {valid.map((item, idx) => (
            <div key={idx}>
              <div className="flex flex-row items-start justify-between gap-1">
                <div>
                  {hasText(item.jobTitle) ? (
                    <h3 className="text-lg font-black text-black">
                      {item.jobTitle}
                    </h3>
                  ) : null}

                  {[item.company, item.location].filter(Boolean).length > 0 ? (
                    <p className="text-sm font-semibold text-black/55">
                      {[item.company, item.location].filter(Boolean).join(", ")}
                    </p>
                  ) : null}
                </div>

                {formatDateRange(item.startDate, item.endDate, item.current) ? (
                  <p className="whitespace-nowrap text-sm font-bold text-black/45">
                    {formatDateRange(item.startDate, item.endDate, item.current)}
                  </p>
                ) : null}
              </div>

              {hasText(item.description) ? (
                <CvParagraph text={item.description} className="mt-3" />
              ) : null}
            </div>
          ))}
        </div>
      );
    }
  }

  return hasText(cv.experience) ? <CvParagraph text={cv.experience} /> : null;
}

function EducationContent({ cv, compact = false }) {
  if (Array.isArray(cv.educations) && cv.educations.length) {
    const valid = cv.educations.filter(
      (e) =>
        hasText(e.degree) ||
        hasText(e.institution) ||
        hasText(e.location) ||
        hasText(e.startDate) ||
        hasText(e.endDate) ||
        hasText(e.description)
    );

    if (valid.length) {
      return (
        <div className={compact ? "space-y-4" : "space-y-5"}>
          {valid.map((item, idx) => (
            <div key={idx}>
              <div className="flex flex-row items-start justify-between gap-1">
                <div>
                  {hasText(item.degree) ? (
                    <h3 className="text-base font-black text-black">
                      {item.degree}
                    </h3>
                  ) : null}

                  {[item.institution, item.location].filter(Boolean).length > 0 ? (
                    <p className="text-sm font-semibold text-black/55">
                      {[item.institution, item.location]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  ) : null}
                </div>

                {[item.startDate, item.endDate].filter(Boolean).length > 0 ? (
                  <p className="whitespace-nowrap text-sm font-bold text-black/45">
                    {[item.startDate, item.endDate].filter(Boolean).join(" — ")}
                  </p>
                ) : null}
              </div>

              {hasText(item.description) ? (
                <CvParagraph text={item.description} className="mt-2" />
              ) : null}
            </div>
          ))}
        </div>
      );
    }
  }

  return hasText(cv.education) ? <CvParagraph text={cv.education} /> : null;
}

function ProjectsContent({ cv }) {
  if (Array.isArray(cv.projectsList) && cv.projectsList.length) {
    const valid = cv.projectsList.filter(
      (p) =>
        hasText(p.title) ||
        hasText(p.role) ||
        hasText(p.technologies) ||
        hasText(p.date) ||
        hasText(p.description)
    );

    if (valid.length) {
      return (
        <div className="space-y-5">
          {valid.map((item, idx) => (
            <div key={idx}>
              <div className="flex flex-row items-start justify-between gap-1">
                <div>
                  {hasText(item.title) ? (
                    <h3 className="text-base font-black text-black">
                      {item.title}
                    </h3>
                  ) : null}

                  {[item.role, item.technologies].filter(Boolean).length > 0 ? (
                    <p className="text-sm font-semibold text-black/55">
                      {[item.role, item.technologies]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  ) : null}
                </div>

                {hasText(item.date) ? (
                  <p className="whitespace-nowrap text-sm font-bold text-black/45">
                    {item.date}
                  </p>
                ) : null}
              </div>

              {hasText(item.description) ? (
                <CvParagraph text={item.description} className="mt-2" />
              ) : null}
            </div>
          ))}
        </div>
      );
    }
  }

  return hasText(cv.projects) ? <CvParagraph text={cv.projects} /> : null;
}

function CertificationContent({ cv, compact = false }) {
  if (Array.isArray(cv.certificationsList) && cv.certificationsList.length) {
    const valid = cv.certificationsList.filter(
      (c) => hasText(c.name) || hasText(c.issuer) || hasText(c.date)
    );

    if (valid.length) {
      return (
        <div className={compact ? "space-y-3" : "space-y-4"}>
          {valid.map((item, idx) => (
            <div key={idx}>
              {hasText(item.name) ? (
                <h3 className="text-sm font-black text-black">{item.name}</h3>
              ) : null}

              {[item.issuer, item.date].filter(Boolean).length > 0 ? (
                <p className="text-sm leading-7 text-black/60">
                  {[item.issuer, item.date].filter(Boolean).join(" · ")}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      );
    }
  }

  return hasList(cv.certifications) ? (
    <BulletList items={cv.certifications} />
  ) : null;
}