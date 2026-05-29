"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toCanvas } from "html-to-image";
import jsPDF from "jspdf";

/* =========================
   TEMPLATE CONFIG
========================= */

const colorSets = {
  blue: ["#2563EB", "#1D4ED8", "#0F172A", "#60A5FA", "#DBEAFE"],
  gold: ["#B88A2C", "#A16207", "#111827", "#FACC15", "#FEF3C7"],
  black: ["#111827", "#020617", "#374151", "#94A3B8", "#F1F5F9"],
  purple: ["#7C3AED", "#5B21B6", "#312E81", "#A78BFA", "#EDE9FE"],
  green: ["#059669", "#047857", "#064E3B", "#34D399", "#D1FAE5"],
  teal: ["#0F766E", "#115E59", "#134E4A", "#5EEAD4", "#CCFBF1"],
  red: ["#DC2626", "#B91C1C", "#7F1D1D", "#F87171", "#FEE2E2"],
  cyan: ["#0891B2", "#0E7490", "#164E63", "#67E8F9", "#CFFAFE"],
  rose: ["#DB2777", "#BE123C", "#831843", "#FDA4AF", "#FFE4E6"],
  slate: ["#475569", "#334155", "#0F172A", "#CBD5E1", "#F8FAFC"],
  orange: ["#EA580C", "#C2410C", "#7C2D12", "#FDBA74", "#FFEDD5"],
};

const cvTemplates = [
  { id: "eu-photo-document", name: "EU Photo Document", layout: "eu-photo-document", photo: true, photoShape: "eu", colors: colorSets.blue },
  { id: "berlin-side-photo", name: "Berlin Side Photo", layout: "berlin-side-photo", photo: true, photoShape: "square", colors: colorSets.black },
  { id: "corporate-circle-photo", name: "Corporate Circle Photo", layout: "corporate-circle-photo", photo: true, photoShape: "circle-ring", colors: colorSets.blue },
  { id: "creative-blob-photo", name: "Creative Blob Photo", layout: "creative-blob-photo", photo: true, photoShape: "blob", colors: colorSets.purple },
  { id: "luxury-oval-photo", name: "Luxury Oval Photo", layout: "luxury-oval-photo", photo: true, photoShape: "oval", colors: colorSets.gold },
  { id: "london-executive", name: "London Executive", layout: "london-executive", photo: false, colors: colorSets.gold },
  { id: "clean-ats", name: "Clean ATS", layout: "clean-ats", photo: false, colors: colorSets.blue },
  { id: "classic-pro", name: "Classic Pro", layout: "classic-pro", photo: false, colors: colorSets.slate },
  { id: "tech-minimal", name: "Tech Minimal", layout: "tech-minimal", photo: false, colors: colorSets.cyan },
  { id: "graduate-fresh", name: "Graduate Fresh", layout: "graduate-fresh", photo: false, colors: colorSets.green },
  { id: "formal-uk", name: "Formal UK", layout: "formal-uk", photo: false, colors: colorSets.black },
  { id: "senior-director", name: "Senior Director", layout: "senior-director", photo: false, colors: colorSets.orange },
  { id: "admin-professional", name: "Admin Professional", layout: "admin-professional", photo: false, colors: colorSets.slate },
  { id: "healthcare-clinical", name: "Healthcare Clinical", layout: "healthcare-clinical", photo: false, colors: colorSets.teal },
  { id: "sales-leader", name: "Sales Leader", layout: "sales-leader", photo: false, colors: colorSets.red },
  { id: "finance-analyst", name: "Finance Analyst", layout: "finance-analyst", photo: false, colors: colorSets.cyan },
  { id: "stockholm-clean", name: "Stockholm Clean", layout: "stockholm-clean", photo: false, colors: colorSets.blue },
  { id: "dubai-corporate", name: "Dubai Corporate", layout: "dubai-corporate", photo: false, colors: colorSets.teal },
  { id: "canada-simple", name: "Canada Simple", layout: "canada-simple", photo: false, colors: colorSets.red },
  { id: "academic-scholar", name: "Academic Scholar", layout: "academic-scholar", photo: false, colors: colorSets.purple },
  { id: "legal-advisor", name: "Legal Advisor", layout: "legal-advisor", photo: false, colors: colorSets.slate },
  { id: "hospitality-premium", name: "Hospitality Premium", layout: "hospitality-premium", photo: false, colors: colorSets.rose },
  { id: "engineer-grid", name: "Engineer Grid", layout: "engineer-grid", photo: false, colors: colorSets.orange },
  { id: "teacher-friendly", name: "Teacher Friendly", layout: "teacher-friendly", photo: false, colors: colorSets.green },
  { id: "project-manager", name: "Project Manager", layout: "project-manager", photo: false, colors: colorSets.purple },
  { id: "customer-service", name: "Customer Service", layout: "customer-service", photo: false, colors: colorSets.blue },
  { id: "marketing-bold", name: "Marketing Bold", layout: "marketing-bold", photo: false, colors: colorSets.rose },
  { id: "hr-professional", name: "HR Professional", layout: "hr-professional", photo: false, colors: colorSets.slate },
  { id: "data-analyst", name: "Data Analyst", layout: "data-analyst", photo: false, colors: colorSets.cyan },
  { id: "premium-monogram", name: "Premium Monogram", layout: "premium-monogram", photo: false, colors: colorSets.gold },
];

const templateConfig = cvTemplates.reduce((acc, template) => {
  acc[template.id] = {
    ...template,
    accent: template.colors?.[0] || "#2563EB",
  };
  return acc;
}, {});

const legacyTemplateMap = {
  "ats-professional": "clean-ats",
  "modern-corporate": "berlin-side-photo",
  "executive-leadership": "london-executive",
  "creative-portfolio": "creative-blob-photo",
  "graduate-entry": "graduate-fresh",
  "technical-it": "tech-minimal",
  "academic-research": "academic-scholar",
  "international-europass": "eu-photo-document",
  executive: "london-executive",
  modern: "berlin-side-photo",
  creative: "creative-blob-photo",
  minimal: "clean-ats",
};

const emptyCV = {
  template: "clean-ats",
  selectedColor: "",
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
  photoZoom: 1,
  photoPositionX: 50,
  photoPositionY: 50,
  summary: "",
  skills: [],
  skillLevels: [],
  languages: [],
  languageLevels: [],
  certifications: [],
  strengths: [],
  achievements: [],
  hobbies: [],
  references: "",
  experience: "",
  education: "",
  projects: "",
  experiences: [],
  educations: [],
  projectsList: [],
  certificationsList: [],
  additionalSections: [],
  atsScore: 0,
};

/* =========================
   EXPORT HELPERS
========================= */

function safeFileName(name) {
  const clean = String(name || "qorliq-cv")
    .trim()
    .replace(/[^a-z0-9-_ ]/gi, "")
    .replace(/\s+/g, "-")
    .toLowerCase();

  return clean || "qorliq-cv";
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

  if (src.startsWith("data:image/")) return src;

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

    if (dataUrl) img.src = dataUrl;

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

/* =========================
   PAGE
========================= */

export default function SuccessPage() {
  const cvRef = useRef(null);
  const previewShellRef = useRef(null);

  const [cv, setCv] = useState(emptyCV);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accessChecking, setAccessChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessError, setAccessError] = useState("");
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingWord, setDownloadingWord] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [previewHeight, setPreviewHeight] = useState(1123);

  const config = useMemo(() => getTemplateConfig(cv), [cv]);

  useEffect(() => {
    async function verifyAccessAndLoadCV() {
      try {
        setAccessChecking(true);
        setLoading(true);
        setError("");
        setAccessError("");

        const verifyRes = await fetch("/api/stripe/sync-subscription", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const verifyData = await verifyRes.json();

        if (!verifyRes.ok || !verifyData.success) {
          setHasAccess(false);
          setAccessError(
            verifyData.error || "Please complete payment to download your CV."
          );
          setLoading(false);
          return;
        }

        const active =
          verifyData.databaseStatus === "active" ||
          verifyData.hasActiveSubscription === true ||
          verifyData.hasAccess === true;

        if (!active) {
          setHasAccess(false);
          setAccessError("Your subscription is inactive or expired.");
          setLoading(false);
          return;
        }

        setHasAccess(true);

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
          template: resolveTemplateId(loadedCV.template),
          selectedColor: loadedCV.selectedColor || loadedCV.color || "",
          skills: normalizeList(loadedCV.skills),
          skillLevels: normalizeList(loadedCV.skillLevels),
          languages: normalizeList(loadedCV.languages),
          languageLevels: normalizeList(loadedCV.languageLevels),
          certifications: normalizeList(loadedCV.certifications),
          strengths: normalizeList(loadedCV.strengths),
          achievements: normalizeList(loadedCV.achievements),
          hobbies: normalizeList(loadedCV.hobbies),
          experiences: Array.isArray(loadedCV.experiences)
            ? loadedCV.experiences
            : [],
          educations: Array.isArray(loadedCV.educations)
            ? loadedCV.educations
            : [],
          projectsList: Array.isArray(loadedCV.projectsList)
            ? loadedCV.projectsList
            : [],
          certificationsList: Array.isArray(loadedCV.certificationsList)
            ? loadedCV.certificationsList
            : [],
          additionalSections: Array.isArray(loadedCV.additionalSections)
            ? loadedCV.additionalSections
            : [],
        });
      } catch (error) {
        console.error("Load CV/access error:", error);
        setError(error.message || "Unable to load CV.");
      } finally {
        setAccessChecking(false);
        setLoading(false);
      }
    }

    verifyAccessAndLoadCV();
  }, []);

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

      if (previewShellRef.current) resizeObserver.observe(previewShellRef.current);
      if (cvRef.current) resizeObserver.observe(cvRef.current);
    }

    window.addEventListener("resize", updatePreviewSize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(updatePreviewSize).catch(() => {});
    }

    const timer = setTimeout(updatePreviewSize, 300);

    return () => {
      window.removeEventListener("resize", updatePreviewSize);
      clearTimeout(timer);

      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [loading, cv, config.layout]);

function createExportClone(element) {
  if (!element) return null;

  const clone = element.cloneNode(true);

  clone.id = "qorliq-cv-export-clone";

  clone.style.width = "794px";
  clone.style.minWidth = "794px";
  clone.style.maxWidth = "794px";
  clone.style.height = "auto";
  clone.style.minHeight = "1123px";
  clone.style.background = "#ffffff";
  clone.style.margin = "0";
  clone.style.padding = "0";

  clone.style.position = "absolute";
  clone.style.top = "0";
  clone.style.left = "0";
  clone.style.transform = "none";
  clone.style.transformOrigin = "top left";
  clone.style.opacity = "1";
  clone.style.visibility = "visible";
  clone.style.pointerEvents = "none";
  clone.style.zIndex = "999999";
  clone.style.overflow = "visible";
  clone.style.boxShadow = "none";
  clone.style.clipPath = "inset(0 0 0 0)";
  clone.style.display = "block";

  const wrapper = document.createElement("div");
  wrapper.id = "qorliq-cv-export-wrapper";

  wrapper.style.position = "fixed";
  wrapper.style.top = "0";
  wrapper.style.left = "0";
  wrapper.style.width = "794px";
  wrapper.style.minWidth = "794px";
  wrapper.style.height = "auto";
  wrapper.style.minHeight = "1123px";
  wrapper.style.background = "#ffffff";
  wrapper.style.opacity = "0";
  wrapper.style.pointerEvents = "none";
  wrapper.style.zIndex = "999999";
  wrapper.style.overflow = "visible";

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  const cvDownloadBlocks = clone.querySelectorAll("#cv-download");

  cvDownloadBlocks.forEach((block) => {
    block.style.width = "794px";
    block.style.minWidth = "794px";
    block.style.maxWidth = "794px";
    block.style.height = "auto";
    block.style.minHeight = "1123px";
    block.style.background = "#ffffff";
    block.style.overflow = "visible";
    block.style.boxShadow = "none";
  });

  /*
    Important:
    createExportClone ke andar clone use hota hai,
    exportElement nahi.
  */
  const exportSidebarsForPdf = clone.querySelectorAll("aside");

  exportSidebarsForPdf.forEach((aside) => {
    const isFullHeightSidebar =
      aside.getAttribute("data-full-height-sidebar") === "true";

    aside.style.alignSelf = "flex-start";
    aside.style.height = "auto";
    aside.style.maxHeight = "none";
    aside.style.overflow = "visible";
    aside.style.breakInside = "avoid";
    aside.style.pageBreakInside = "avoid";

    if (isFullHeightSidebar) {
      aside.style.minHeight = "1123px";
    } else {
      aside.style.minHeight = "0";
    }
  });

  const exportMainBlocksForPdf = clone.querySelectorAll("main");

  exportMainBlocksForPdf.forEach((main) => {
    main.style.alignItems = "flex-start";
    main.style.overflow = "visible";
  });

  clone.querySelectorAll("*").forEach((node) => {
    const style = window.getComputedStyle(node);

    if (style.display === "none") {
      return;
    }

    if (style.overflow === "hidden") {
      node.style.overflow = "visible";
    }

    if (style.maxHeight && style.maxHeight !== "none") {
      node.style.maxHeight = "none";
    }

    node.style.visibility = "visible";
  });

  return clone;
}

function removeExportClone(clone) {
  const wrapper = document.getElementById("qorliq-cv-export-wrapper");

  if (wrapper && wrapper.parentNode) {
    wrapper.parentNode.removeChild(wrapper);
    return;
  }

  if (clone && clone.parentNode) {
    clone.parentNode.removeChild(clone);
  }
}
const downloadPDF = async () => {
  if (downloadingPDF) return;

  if (!hasAccess) {
    alert("Your subscription is inactive or expired. Please renew your plan.");
    return;
  }

  const previewElement = cvRef.current;

  if (!previewElement) {
    alert("CV preview not found. Please refresh and try again.");
    return;
  }

  let exportElement = null;
  let restoreImages = null;

  try {
    setDownloadingPDF(true);

    if (document.fonts?.ready) await document.fonts.ready;

    exportElement = createExportClone(previewElement);

    if (!exportElement) {
      throw new Error("Unable to prepare CV for PDF.");
    }

    restoreImages = await prepareImagesForPDF(exportElement);
    await waitForImages(exportElement);

    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => setTimeout(resolve, 600));

    const exportWidth = 794;
    const a4HeightPx = 1123;

    const realHeight = Math.ceil(
      Math.max(
        a4HeightPx,
        exportElement.scrollHeight || 0,
        exportElement.offsetHeight || 0,
        exportElement.getBoundingClientRect().height || 0
      )
    );

    if (!realHeight || realHeight < 100) {
      throw new Error("CV height not detected. Please try again.");
    }

    exportElement.style.width = `${exportWidth}px`;
    exportElement.style.minWidth = `${exportWidth}px`;
    exportElement.style.maxWidth = `${exportWidth}px`;
    exportElement.style.height = `${realHeight}px`;
    exportElement.style.minHeight = `${realHeight}px`;
    exportElement.style.background = "#ffffff";
    exportElement.style.margin = "0";
    exportElement.style.padding = "0";
    exportElement.style.transform = "none";
    exportElement.style.boxShadow = "none";
    exportElement.style.overflow = "visible";
    exportElement.style.opacity = "1";
    exportElement.style.visibility = "visible";

    /*
      Only real full-height sidebars should be stretched.
      Corporate Circle / small rounded aside will stay normal.
    */
    const hasFullHeightSidebar =
      exportElement.querySelector('[data-full-height-sidebar="true"]') !== null;

    const exportSidebars = exportElement.querySelectorAll("aside");

    exportSidebars.forEach((aside) => {
      const isFullHeightSidebar =
        aside.getAttribute("data-full-height-sidebar") === "true";

      aside.style.height = "auto";
      aside.style.alignSelf = "flex-start";
      aside.style.overflow = "visible";
      aside.style.maxHeight = "none";
      aside.style.breakInside = "avoid";
      aside.style.pageBreakInside = "avoid";

      if (isFullHeightSidebar) {
        aside.style.minHeight = `${a4HeightPx}px`;
      } else {
        aside.style.minHeight = "0";
      }
    });

    const exportGridLayouts = exportElement.querySelectorAll(".grid");

    exportGridLayouts.forEach((grid) => {
      grid.style.alignItems = "flex-start";
      grid.style.overflow = "visible";
    });

    const pixelRatio = 1.5;

    const fullCanvas = await toCanvas(exportElement, {
      cacheBust: true,
      pixelRatio,
      backgroundColor: "#ffffff",
      width: exportWidth,
      height: realHeight,
      canvasWidth: exportWidth * pixelRatio,
      canvasHeight: realHeight * pixelRatio,
      style: {
        width: `${exportWidth}px`,
        minWidth: `${exportWidth}px`,
        maxWidth: `${exportWidth}px`,
        height: `${realHeight}px`,
        minHeight: `${realHeight}px`,
        background: "#ffffff",
        margin: "0",
        padding: "0",
        transform: "none",
        boxShadow: "none",
        overflow: "visible",
        opacity: "1",
        visibility: "visible",
      },
    });

    if (!fullCanvas || !fullCanvas.width || !fullCanvas.height) {
      throw new Error("PDF capture failed. Canvas is empty.");
    }

    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pdfWidthMm = 210;
    const pdfHeightMm = 297;

    const pageHeightCanvas = Math.floor(
      fullCanvas.width * (pdfHeightMm / pdfWidthMm)
    );

    const findSafePageCut = (canvas, startY, pageHeight) => {
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        return Math.min(startY + pageHeight, canvas.height);
      }

      const idealCutY = Math.min(startY + pageHeight, canvas.height);

      if (idealCutY >= canvas.height) {
        return canvas.height;
      }

      const scanStartX = Math.floor(canvas.width * 0.42);
      const scanWidth = Math.floor(canvas.width * 0.52);

      const searchFromY = Math.max(idealCutY - 60, startY);
      const searchToY = Math.max(
        startY + Math.floor(pageHeight * 0.55),
        startY + 140
      );

      for (let scanY = searchFromY; scanY >= searchToY; scanY -= 2) {
        const row = ctx.getImageData(scanStartX, scanY, scanWidth, 1).data;

        let contentPixels = 0;

        for (let x = 0; x < scanWidth; x += 6) {
          const i = x * 4;

          const r = row[i];
          const g = row[i + 1];
          const b = row[i + 2];

          const isContent = r < 245 || g < 245 || b < 245;

          if (isContent) contentPixels++;
        }

        if (contentPixels < 6) {
          return scanY;
        }
      }

      return idealCutY;
    };

    /*
      Full-height sidebar templates:
      - no top padding on page 2
      - no bottom padding on page 1
      - exact A4 cut

      Other templates:
      - safe cut
      - 8mm bottom/top padding
    */
    const nextPageTopPaddingMm = hasFullHeightSidebar ? 0 : 8;
    const pageBottomPaddingMm = hasFullHeightSidebar ? 0 : 8;

    const nextPageTopPaddingCanvas = Math.floor(
      (nextPageTopPaddingMm / pdfHeightMm) * pageHeightCanvas
    );

    const pageBottomPaddingCanvas = Math.floor(
      (pageBottomPaddingMm / pdfHeightMm) * pageHeightCanvas
    );

 let y = 0;
let pageIndex = 0;

/*
  IMPORTANT:
  Sometimes html-to-image creates canvas 1-20px taller than A4.
  Without tolerance, it creates a blank second PDF page.
*/
const blankPageToleranceCanvas = Math.floor(pixelRatio * 30);

// If CV fits in one A4 page, export only one page.
if (fullCanvas.height <= pageHeightCanvas + blankPageToleranceCanvas) {
  const pageCanvas = document.createElement("canvas");
  pageCanvas.width = fullCanvas.width;
  pageCanvas.height = pageHeightCanvas;

  const ctx = pageCanvas.getContext("2d");

  if (!ctx) {
    throw new Error("Unable to create PDF page canvas.");
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

  ctx.drawImage(
    fullCanvas,
    0,
    0,
    fullCanvas.width,
    Math.min(fullCanvas.height, pageHeightCanvas),
    0,
    0,
    fullCanvas.width,
    Math.min(fullCanvas.height, pageHeightCanvas)
  );

  const pageDataUrl = pageCanvas.toDataURL("image/jpeg", 0.82);

  if (!pageDataUrl || pageDataUrl === "data:,") {
    throw new Error("PDF page capture failed.");
  }

  pdf.addImage(
    pageDataUrl,
    "JPEG",
    0,
    0,
    pdfWidthMm,
    pdfHeightMm,
    undefined,
    "FAST"
  );
} else {
  while (y < fullCanvas.height) {
    const remainingHeight = fullCanvas.height - y;

    // Stop if only tiny blank/tolerance area is left.
    if (remainingHeight <= blankPageToleranceCanvas) {
      break;
    }

    const willNeedAnotherPage =
      remainingHeight > pageHeightCanvas + blankPageToleranceCanvas;

    const topPaddingCanvas = hasFullHeightSidebar
      ? 0
      : pageIndex === 0
      ? 0
      : nextPageTopPaddingCanvas;

    const bottomPaddingCanvas = hasFullHeightSidebar
      ? 0
      : willNeedAnotherPage
      ? pageBottomPaddingCanvas
      : 0;

    const availablePageHeight =
      pageHeightCanvas - topPaddingCanvas - bottomPaddingCanvas;

    const cutY = hasFullHeightSidebar
      ? Math.min(y + pageHeightCanvas, fullCanvas.height)
      : willNeedAnotherPage
      ? findSafePageCut(fullCanvas, y, availablePageHeight)
      : fullCanvas.height;

    let sliceHeight = Math.max(
      1,
      Math.min(cutY - y, fullCanvas.height - y)
    );

    // If last slice is tiny, do not create another blank page.
    if (sliceHeight <= blankPageToleranceCanvas && pageIndex > 0) {
      break;
    }

    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = fullCanvas.width;
    pageCanvas.height = pageHeightCanvas;

    const ctx = pageCanvas.getContext("2d");

    if (!ctx) {
      throw new Error("Unable to create PDF page canvas.");
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

    ctx.drawImage(
      fullCanvas,
      0,
      y,
      fullCanvas.width,
      sliceHeight,
      0,
      topPaddingCanvas,
      fullCanvas.width,
      sliceHeight
    );

    const pageDataUrl = pageCanvas.toDataURL("image/jpeg", 0.82);

    if (!pageDataUrl || pageDataUrl === "data:,") {
      throw new Error("PDF page capture failed.");
    }

    if (pageIndex > 0) {
      pdf.addPage();
    }

    pdf.addImage(
      pageDataUrl,
      "JPEG",
      0,
      0,
      pdfWidthMm,
      pdfHeightMm,
      undefined,
      "FAST"
    );

    y += sliceHeight;
    pageIndex += 1;
  }
}

    const fileName = `${safeFileName(cv.fullName || "qorliq-cv")}.pdf`;

    pdf.save(fileName);
  } catch (error) {
    console.error("PDF download error:", error);
    alert(error?.message || "PDF download failed.");
  } finally {
    if (restoreImages) restoreImages();
    removeExportClone(exportElement);
    setDownloadingPDF(false);
  }
};

  const downloadWord = async () => {
    if (downloadingWord) return;

    if (!hasAccess) {
      alert("Your subscription is inactive or expired. Please renew your plan.");
      return;
    }

    const previewElement = cvRef.current;

    if (!previewElement) {
      alert("CV preview not found. Please refresh and try again.");
      return;
    }

    let exportElement = null;
    let restoreImages = null;

    try {
      setDownloadingWord(true);

      if (document.fonts?.ready) await document.fonts.ready;

      exportElement = createExportClone(previewElement);

      if (!exportElement) throw new Error("Unable to prepare CV for Word.");

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

  if (loading || accessChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#B88A2C]">
          Checking your access...
        </p>
      </main>
    );
  }

  if (accessError || !hasAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">
        <div className="max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 text-center">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-red-300">
            Access Required
          </p>

          <h1 className="mt-4 text-3xl font-black">Subscription Required</h1>

          <p className="mt-4 text-sm leading-7 text-white/55">
            {accessError || "Please choose a plan to download your CV."}
          </p>

          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              const cvId = params.get("cvId") || "";
              const template = params.get("template") || "";
              window.location.href = `/pricing?cvId=${cvId}&template=${template}`;
            }}
            className="mt-6 rounded-full bg-[#B88A2C] px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-white"
          >
            Choose Plan
          </button>
        </div>
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
        <div className="mb-8 flex flex-col gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#B88A2C]">
              Payment Successful
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">
              Download your CV
            </h1>

            <p className="mt-2 text-sm text-white/50">
              Selected template:{" "}
              <span className="font-bold text-[#B88A2C]">{config.name}</span>.
              Your CV is ready for export.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={downloadPDF}
              disabled={downloadingPDF || downloadingWord}
              className="w-full rounded-full bg-[#B88A2C] px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {downloadingPDF ? "Preparing PDF..." : "Download PDF"}
            </button>

            <button
              type="button"
              onClick={downloadWord}
              disabled={downloadingPDF || downloadingWord}
              className="w-full rounded-full border border-white/15 px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:border-[#B88A2C] hover:text-[#B88A2C] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {downloadingWord ? "Preparing Word..." : "Download Word"}
            </button>
          </div>
        </div>

     <div
  ref={previewShellRef}
  className="mx-auto w-full overflow-x-auto overflow-y-visible rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-2 sm:p-4"
>
       <div
  className="relative mx-auto"
  style={{
    height: `${previewHeight}px`,
    minHeight: `${previewHeight}px`,
    maxWidth: "100%",
    overflow: "visible",
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

/* =========================
   TEMPLATE RENDERER
========================= */

function TemplateRenderer({ cv, config }) {
  const layout = config.layout || config.id || "clean-ats";

  const map = {
    "eu-photo-document": <EUPhotoDocumentCV cv={cv} config={config} />,
    "berlin-side-photo": <BerlinSidePhotoCV cv={cv} config={config} />,
    "corporate-circle-photo": <CorporateCirclePhotoCV cv={cv} config={config} />,
    "creative-blob-photo": <CreativeBlobPhotoCV cv={cv} config={config} />,
    "luxury-oval-photo": <LuxuryOvalPhotoCV cv={cv} config={config} />,
    "london-executive": <LondonExecutiveCV cv={cv} config={config} />,
    "clean-ats": <CleanATSCV cv={cv} config={config} />,
    "classic-pro": <ClassicProCV cv={cv} config={config} />,
    "tech-minimal": <TechMinimalCV cv={cv} config={config} />,
    "graduate-fresh": <GraduateFreshCV cv={cv} config={config} />,
    "formal-uk": <FormalUKCV cv={cv} config={config} />,
    "senior-director": <SeniorDirectorCV cv={cv} config={config} />,
    "admin-professional": <AdminProfessionalCV cv={cv} config={config} />,
    "healthcare-clinical": <HealthcareClinicalCV cv={cv} config={config} />,
    "sales-leader": <SalesLeaderCV cv={cv} config={config} />,
    "finance-analyst": <FinanceAnalystCV cv={cv} config={config} />,
    "stockholm-clean": <StockholmCleanCV cv={cv} config={config} />,
    "dubai-corporate": <DubaiCorporateCV cv={cv} config={config} />,
    "canada-simple": <CanadaSimpleCV cv={cv} config={config} />,
    "academic-scholar": <AcademicScholarCV cv={cv} config={config} />,
    "legal-advisor": <LegalAdvisorCV cv={cv} config={config} />,
    "hospitality-premium": <HospitalityPremiumCV cv={cv} config={config} />,
    "engineer-grid": <EngineerGridCV cv={cv} config={config} />,
    "teacher-friendly": <TeacherFriendlyCV cv={cv} config={config} />,
    "project-manager": <ProjectManagerCV cv={cv} config={config} />,
    "customer-service": <CustomerServiceCV cv={cv} config={config} />,
    "marketing-bold": <MarketingBoldCV cv={cv} config={config} />,
    "hr-professional": <HRProfessionalCV cv={cv} config={config} />,
    "data-analyst": <DataAnalystCV cv={cv} config={config} />,
    "premium-monogram": <PremiumMonogramCV cv={cv} config={config} />,
  };

  return map[layout] || <CleanATSCV cv={cv} config={config} />;
}

/* =========================
   TEMPLATE DESIGNS
========================= */

function HeaderBackground({ children, accent, dark = false, className = "" }) {
  const safeAccent = accent || "#111827";

  return (
    <header
      className={`rounded-[32px] p-8 ${
        dark ? "text-white" : "text-black"
      } ${className}`}
      style={{
        background: dark
          ? `linear-gradient(135deg, ${safeAccent}, #020617)`
          : `${safeAccent}14`,
      }}
    >
      {children}
    </header>
  );
}

function EUPhotoDocumentCV({ cv, config }) {
  const accent = config.accent || "#2563EB";

  return (
    <CVPage>
      <div className="-m-12 min-h-[1219px] overflow-visible bg-white p-12 font-sans text-black">
        <header
          className="mb-6 flex gap-4 border-b pb-4"
          style={{ borderColor: `${accent}55` }}
        >
          <div className="shrink-0">
            <ProfilePhoto cv={cv} config={config} large />
          </div>

          <div>
            <p
              className="mb-1 text-[10px] font-black uppercase tracking-[.22em]"
              style={{ color: accent }}
            >
              European CV
            </p>

            <h1 className="text-3xl font-black leading-tight tracking-[-0.035em] text-slate-950">
              {name(cv)}
            </h1>

            <p
              className="mt-1 text-sm font-bold uppercase tracking-wider"
              style={{ color: accent }}
            >
              {title(cv)}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-[30%_70%] items-start gap-8">
          <aside className="space-y-6">
            <div>
              <p
                className="mb-2 text-xs font-black uppercase tracking-wider"
                style={{ color: accent }}
              >
                Contact
              </p>

              <div className="text-[12px] leading-relaxed text-slate-600">
                <ContactLine cv={cv} />
              </div>
            </div>

            <div className="text-[12px] leading-relaxed text-slate-700">
              <SideCVSections cv={cv} accent={accent} />
            </div>
          </aside>

          <main className="space-y-6">
            {hasText(cv.summary) && (
              <div>
                <p
                  className="mb-2 text-xs font-black uppercase tracking-wider"
                  style={{ color: accent }}
                >
                  Profile
                </p>

                <p className="whitespace-pre-line text-[12px] leading-relaxed text-slate-700">
                  {cv.summary}
                </p>
              </div>
            )}

            <div className="text-[12px] leading-relaxed text-slate-700">
              <MainCVSections cv={cv} accent={accent} skipSummary />
            </div>
          </main>
        </div>
      </div>
    </CVPage>
  );
}
function BerlinSidePhotoCV({ cv, config }) {
  const accent = config.accent;
  const dark = exactDark(config) || "#0F172A";

  return (
    <div
      id="cv-download"
      className="grid bg-white text-black shadow-2xl print:shadow-none"
      style={{
        width: "794px",
        minHeight: "1123px",
        gridTemplateColumns: "285px 509px",
      }}
    >
      <aside
        data-full-height-sidebar="true"
        className="min-h-[1123px] self-start px-8 py-10 text-white"
        style={{
          background: `linear-gradient(180deg, ${dark} 0%, ${dark} 45%, ${accent} 100%)`,
        }}
      >
        <ProfilePhoto cv={cv} config={config} large dark />

        <h1 className="mt-6 text-3xl font-black leading-tight tracking-[-0.035em] text-white">
          {name(cv)}
        </h1>

        <p className="mt-2 text-sm font-semibold text-white/75">
          {title(cv)}
        </p>

        <div className="mt-8">
          <SmallTitle title="Contact" dark />
          <ContactStack cv={cv} dark />
        </div>

        <div className="mt-8 space-y-8 [&_*]:text-white [&_p]:text-white/75 [&_li]:text-white/75 [&_span]:text-white/75">
          <SideCVSections cv={cv} accent="#ffffff" dark />
        </div>
      </aside>

      <main className="space-y-8 px-10 py-10">
        <section
          className="rounded-[1.5rem] p-6"
          style={{ backgroundColor: `${accent}12` }}
        >
          <CVSection title="Profile" accent={accent}>
            <Paragraph text={cv.summary} />
          </CVSection>
        </section>

        <MainCVSections cv={cv} accent={accent} skipSummary />
      </main>
    </div>
  );
}

function CorporateCirclePhotoCV({ cv, config }) {
  const accent = config.accent;

  return (
    <CVPage>
      <header className="flex items-center gap-7">
        <ProfilePhoto
          cv={cv}
          config={{ ...config, photoShape: "circle-ring" }}
          large
        />

        <div>
          <h1 className="text-5xl font-black tracking-[-0.055em]">
            {name(cv)}
          </h1>

          <p className="mt-2 text-lg font-bold" style={{ color: accent }}>
            {title(cv)}
          </p>

          <ContactLine cv={cv} />
        </div>
      </header>

      <main className="mt-10 grid grid-cols-[1fr_260px] gap-9">
        <section className="space-y-8">
          <MainCVSections cv={cv} accent={accent} />
        </section>

      <aside
  className="rounded-[28px] p-6"
  style={{ backgroundColor: `${accent}10` }}
>
  <SideCVSections cv={cv} accent={accent} />
</aside>
      </main>
    </CVPage>
  );
}

function CreativeBlobPhotoCV({ cv, config }) {
  const accent = config.accent;

  return (
    <CVPage>
      <header
        className="rounded-[36px] p-8"
        style={{ background: `linear-gradient(135deg, ${accent}20, #fff)` }}
      >
        <div className="flex items-center gap-7">
          <ProfilePhoto
            cv={cv}
            config={{ ...config, photoShape: "blob" }}
            large
          />

          <div>
            <p
              className="text-xs font-black uppercase tracking-[0.3em]"
              style={{ color: accent }}
            >
              Creative Profile
            </p>

            <h1 className="mt-2 text-5xl font-black tracking-[-0.06em]">
              {name(cv)}
            </h1>

            <p className="mt-2 text-lg font-bold" style={{ color: accent }}>
              {title(cv)}
            </p>

            <ContactLine cv={cv} />
          </div>
        </div>
      </header>

      <main className="mt-8 grid grid-cols-2 gap-7">
        <section className="space-y-7">
          <MainCVSections cv={cv} accent={accent} />
        </section>

        <aside className="space-y-7">
          <SideCVSections cv={cv} accent={accent} />
          <AdditionalSectionsContent cv={cv} accent={accent} />
        </aside>
      </main>
    </CVPage>
  );
}

function LuxuryOvalPhotoCV({ cv, config }) {
  const accent = config.accent;

  return (
    <CVPage ivory>
      <header className="text-center">
        <div className="flex justify-center">
          <ProfilePhoto
            cv={cv}
            config={{ ...config, photoShape: "oval" }}
            large
          />
        </div>

        <p
          className="mt-5 text-xs font-black uppercase tracking-[0.32em]"
          style={{ color: accent }}
        >
          Premium CV
        </p>

        <h1 className="mt-3 font-serif text-5xl font-bold">{name(cv)}</h1>

        <p className="mt-3 text-xl font-semibold text-black/65">
          {title(cv)}
        </p>

        <ContactLine cv={cv} />

        <div
          className="mx-auto mt-5 h-1 w-24 rounded-full"
          style={{ backgroundColor: accent }}
        />
      </header>

      <main className="mt-10 grid grid-cols-[240px_1fr] gap-9">
        <aside className="space-y-8">
          <SideCVSections cv={cv} accent={accent} />
        </aside>

        <section className="space-y-8">
          <MainCVSections cv={cv} accent={accent} />
        </section>
      </main>
    </CVPage>
  );
}

function LondonExecutiveCV({ cv, config }) {
  const accent = config.accent || "#B88A2C";
  const dark = exactDark(config) || "#111827";

  return (
    <div
      id="cv-download"
      className="bg-white text-black shadow-2xl print:shadow-none"
      style={{
        width: "794px",
        minHeight: "1123px",
        overflow: "visible",
      }}
    >
      <header
        className="px-10 py-12 text-white"
        style={{
          background: `linear-gradient(135deg, ${dark} 0%, #020617 100%)`,
        }}
      >
        <p
          className="text-xs font-black uppercase tracking-[0.3em]"
          style={{ color: accent }}
        >
          Executive Profile
        </p>

        <h1 className="mt-3 text-5xl font-black tracking-[-0.055em]">
          {name(cv)}
        </h1>

        <p className="mt-3 text-xl font-semibold text-white/70">
          {title(cv)}
        </p>

        <ContactLine cv={cv} dark />

        <div
          className="mt-6 h-1.5 w-24 rounded-full"
          style={{ backgroundColor: accent }}
        />
      </header>

      <main className="grid grid-cols-[250px_1fr] gap-9 p-10">
        <aside>
          <SideCVSections cv={cv} accent={accent} />
        </aside>

        <section className="space-y-8">
          <MainCVSections cv={cv} accent={accent} />
        </section>
      </main>
    </div>
  );
}

function CleanATSCV({ cv, config }) {
  return (
    <CVPage>
      <header
        className="border-b pb-7"
        style={{ borderColor: `${config.accent}55` }}
      >
        <h1 className="text-5xl font-black tracking-[-0.055em]">
          {name(cv)}
        </h1>

        <p
          className="mt-2 text-sm font-black uppercase tracking-[0.2em]"
          style={{ color: config.accent }}
        >
          {title(cv)}
        </p>

        <ContactLine cv={cv} />
      </header>

      <main className="mt-8 space-y-8">
        <MainCVSections cv={cv} accent={config.accent} />
        <SideCVSections cv={cv} accent={config.accent} />
      </main>
    </CVPage>
  );
}

function ClassicProCV({ cv, config }) {
  return (
    <CVPage>
      <header className="text-center">
        <h1 className="font-serif text-5xl font-bold">{name(cv)}</h1>

        <p
          className="mt-2 text-lg font-bold uppercase tracking-[0.22em]"
          style={{ color: config.accent }}
        >
          {title(cv)}
        </p>

        <ContactLine cv={cv} center />

        <div
          className="mx-auto mt-5 h-px w-full"
          style={{ backgroundColor: `${config.accent}55` }}
        />
      </header>

      <main className="mt-8 space-y-8">
        <MainCVSections cv={cv} accent={config.accent} />
        <SideCVSections cv={cv} accent={config.accent} />
      </main>
    </CVPage>
  );
}

function TechMinimalCV({ cv, config }) {
  return (
    <CVPage>
      <header className="rounded-[32px] bg-slate-950 p-8 text-white">
        <p
          className="font-mono text-sm font-bold"
          style={{ color: config.accent }}
        >
          const candidate =
        </p>

        <h1 className="mt-2 font-mono text-5xl font-black tracking-[-0.055em]">
          {name(cv)}
        </h1>

        <p className="mt-2 text-lg text-white/65">{title(cv)}</p>

        <ContactLine cv={cv} dark />
      </header>

      <main className="mt-9 grid grid-cols-[1fr_260px] gap-9">
        <section className="space-y-8">
          <MainCVSections cv={cv} accent={config.accent} />
        </section>

        <aside className="rounded-[28px] bg-slate-50 p-6">
          <SideCVSections cv={cv} accent={config.accent} />
        </aside>
      </main>
    </CVPage>
  );
}

function GraduateFreshCV({ cv, config }) {
  const accent = config?.accent || "#111827";

  // Data Clean-up & Checkers
  const educationItems = Array.isArray(cv.education) ? cv.education : [];
  const experienceItems = Array.isArray(cv.experience) ? cv.experience : [];

  const hasEducationArray = educationItems.length > 0;
  const hasEducationText =
    typeof cv.education === "string" && cv.education.trim().length > 0;

  const hasExperienceArray = experienceItems.length > 0;
  const hasExperienceText =
    typeof cv.experience === "string" && cv.experience.trim().length > 0;

  const achievements =
    cv.achievements || cv.achievement || cv.awards || cv.accomplishments;

  const certificates =
    cv.certifications ||
    cv.certificates ||
    cv.certificate ||
    cv.courses ||
    cv.training;

  const additionalSections =
    cv.additionalSections ||
    cv.customSections ||
    cv.extraSections ||
    cv.additional ||
    cv.extras;

  return (
    <CVPage>
      {/* 1. Header Section */}
      <header
        className="rounded-[32px] p-8"
        style={{ backgroundColor: `${accent}14` }}
      >
        <h1 className="text-4xl sm:text-5xl font-black tracking-[-0.055em] text-black">
          {name(cv)}
        </h1>

        <p className="mt-2 text-lg font-bold" style={{ color: accent }}>
          {title(cv)}
        </p>

        <div className="mt-4">
          <ContactLine cv={cv} />
        </div>
      </header>

      {/* 2. Main Content Grid (4 Controlled Boxes Structure) */}
      <main className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* ==================== BOX 1: PROFILE, SKILLS & LANGUAGES ==================== */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <CVSection title="Profile" accent={accent}>
            {(hasText(cv.summary) || hasText(cv.profile)) && (
              <Paragraph text={cv.summary || cv.profile} />
            )}

            {hasList(cv.skills) && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-black/70">
                  Skills
                </p>
                <SkillPills items={cv.skills} levels={cv.skillLevels} />
              </div>
            )}

            {hasList(cv.languages) && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-black/70">
                  Languages
                </p>
                <LanguageList
                  items={cv.languages}
                  levels={cv.languageLevels}
                />
              </div>
            )}
          </CVSection>
        </section>

        {/* ==================== BOX 2: EDUCATION ==================== */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <CVSection title="Education" accent={accent}>
            {(hasEducationArray || hasEducationText) && (
              <>
                {hasEducationArray ? (
                  <div className="relative border-l border-slate-200 ml-2 pl-4 space-y-5 pt-1">
                    {educationItems.map((item, index) => {
                      const eduTitle = item.degree || item.title || item.course || item.qualification || "";
                      const eduPlace = item.school || item.institution || item.university || item.college || "";
                      const eduDate = item.year || item.date || item.period || "";

                      return (
                        <div key={index} className="relative group">
                          {/* Timeline Dot */}
                          <span 
                            className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white transition-transform group-hover:scale-125"
                            style={{ backgroundColor: accent }}
                          />

                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div className="space-y-0.5">
                              {eduTitle && (
                                <h4 className="text-sm font-black text-slate-950 tracking-tight leading-snug uppercase">
                                  {eduTitle}
                                </h4>
                              )}
                              {eduPlace && (
                                <p className="text-xs font-bold text-slate-600">
                                  {eduPlace}
                                </p>
                              )}
                            </div>

                            {eduDate && (
                              <div className="shrink-0">
                                <span className="inline-block text-[11px] font-black tracking-wide text-slate-800 bg-slate-100/90 border border-slate-200 px-3 py-1 rounded-md shadow-sm sm:text-right">
                                  {eduDate}
                                </span>
                              </div>
                            )}
                          </div>

                          {item.description && (
                            <p className="mt-2 text-xs leading-relaxed text-slate-500 whitespace-pre-line font-medium">
                              {item.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Paragraph text={cv.education} />
                )}
              </>
            )}
          </CVSection>
        </section>

        {/* ==================== BOX 3: CERTIFICATIONS & ACHIEVEMENTS ==================== */}
        {(hasList(certificates) || hasText(certificates) || hasList(achievements) || hasText(achievements)) && (
          <section className="col-span-1 sm:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <CVSection title="Certifications & Achievements" accent={accent}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Certifications Block */}
                {(hasList(certificates) || hasText(certificates)) && (
                  <div>
                    {/* Dynamic Selected Accent Color Applied */}
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.15em]" style={{ color: accent }}>
                      Certifications
                    </p>
                    {hasList(certificates) ? (
                      <BulletList items={certificates} />
                    ) : (
                      <Paragraph text={certificates} />
                    )}
                  </div>
                )}

                {/* Achievements Block */}
                {(hasList(achievements) || hasText(achievements)) && (
                  <div>
                    {/* Dynamic Selected Accent Color Applied */}
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.15em]" style={{ color: accent }}>
                      Achievements
                    </p>
                    {hasList(achievements) ? (
                      <BulletList items={achievements} />
                    ) : (
                      <Paragraph text={achievements} />
                    )}
                  </div>
                )}
              </div>
            </CVSection>
          </section>
        )}

        {/* ==================== BOX 4: WORK EXPERIENCE ==================== */}
        {(hasExperienceArray || hasExperienceText) && (
          <section className="col-span-1 sm:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <CVSection title="Work Experience" accent={accent}>
              {hasExperienceArray ? (
                <div className="relative border-l border-slate-200 ml-2 pl-4 space-y-6 pt-1">
                  {experienceItems.map((item, index) => {
                    const expTitle = item.role || item.position || item.title || item.jobTitle || "";
                    const expCompany = item.company || item.employer || item.organization || "";
                    const expDate = item.period || item.date || item.year || "";

                    return (
                      <div key={index} className="relative group">
                        {/* Timeline Dot */}
                        <span 
                          className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white transition-transform group-hover:scale-125"
                          style={{ backgroundColor: accent }}
                        />

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full">
                          <div className="space-y-0.5">
                            {expTitle && (
                              <h4 className="text-sm font-black text-slate-950 tracking-tight leading-snug uppercase">
                                {expTitle}
                              </h4>
                            )}
                            {expCompany && (
                              <p className="text-xs font-bold text-slate-600">
                                {expCompany}
                              </p>
                            )}
                          </div>

                          {expDate && (
                            <div className="shrink-0 sm:text-right">
                              <span className="inline-block text-[11px] font-black tracking-wide text-slate-800 bg-slate-100/90 border border-slate-200 px-3 py-1 rounded-md shadow-sm">
                                {expDate}
                              </span>
                            </div>
                          )}
                        </div>

                        {item.description && (
                          <p className="mt-2 text-xs leading-relaxed text-slate-500 whitespace-pre-line font-medium pl-0.5">
                            {item.description}
                          </p>
                        )}

                        {Array.isArray(item.bullets) && item.bullets.length > 0 && (
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-slate-600 font-medium">
                            {item.bullets.map((bullet, bulletIndex) => (
                              <li key={bulletIndex}>{bullet}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Paragraph text={cv.experience} />
              )}
            </CVSection>
          </section>
        )}

        {/* Extra Info & Custom Blocks Sections (With Selected Accent Color Heading Match) */}
        {(hasList(cv.strengths) || hasList(cv.hobbies) || hasList(cv.interests) || additionalSections || hasText(cv.references)) && (
          <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
            
            {/* Strengths & Hobbies Block */}
            {(hasList(cv.strengths) || hasList(cv.hobbies) || hasList(cv.interests)) && (
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                {hasList(cv.strengths) && (
                  <div className="mb-5">
                    {/* Dynamic Selected Accent Color */}
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.15em]" style={{ color: accent }}>
                      Strengths
                    </p>
                    <BulletList items={cv.strengths} />
                  </div>
                )}
                {hasList(cv.hobbies) && (
                  <div>
                    {/* Dynamic Selected Accent Color */}
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.15em]" style={{ color: accent }}>
                      Hobbies & Interests
                    </p>
                    <BulletList items={cv.hobbies} />
                  </div>
                )}
              </section>
            )}

            {/* References & Additional Information Block */}
            {(additionalSections || hasText(cv.references)) && (
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                {hasText(cv.references) && (
                  <div className="mb-5">
                    {/* Dynamic Selected Accent Color */}
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.15em]" style={{ color: accent }}>
                      References
                    </p>
                    <Paragraph text={cv.references} />
                  </div>
                )}
                {typeof additionalSections === "string" && additionalSections.trim().length > 0 && (
                  <div>
                    {/* Dynamic Selected Accent Color */}
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.15em]" style={{ color: accent }}>
                      Additional Information
                    </p>
                    <Paragraph text={additionalSections} />
                  </div>
                )}
              </section>
            )}
          </div>
        )}

      </main>
    </CVPage>
  );
}
function FormalUKCV({ cv, config }) {
  const accent = config?.accent || "#111827";

  return (
    <CVPage>
      <header
        className="border-4 p-7 text-center"
        style={{ borderColor: accent }}
      >
        <h1 className="text-4xl font-bold uppercase tracking-[0.12em] text-black">
          {name(cv)}
        </h1>

        <p className="mt-2 text-base text-black/60">{title(cv)}</p>

        <ContactLine cv={cv} center />
      </header>

      <main className="mt-9 grid grid-cols-[0.34fr_0.66fr] gap-8">
        <aside className="space-y-7">
          {hasList(cv.skills) ? (
            <CVSection title="Skills" accent={accent}>
              <SkillPills items={cv.skills} levels={cv.skillLevels} />
            </CVSection>
          ) : null}

          {hasList(cv.languages) ? (
            <CVSection title="Languages" accent={accent}>
              <LanguageList
                items={cv.languages}
                levels={cv.languageLevels}
              />
            </CVSection>
          ) : null}

          {hasList(cv.strengths) ? (
            <CVSection title="Strengths" accent={accent}>
              <BulletList items={cv.strengths} />
            </CVSection>
          ) : null}

          {hasList(cv.hobbies) ? (
            <CVSection title="Hobbies & Interests" accent={accent}>
              <BulletList items={cv.hobbies} />
            </CVSection>
          ) : null}

          {hasList(cv.interests) && !hasList(cv.hobbies) ? (
            <CVSection title="Interests" accent={accent}>
              <BulletList items={cv.interests} />
            </CVSection>
          ) : null}

          {hasText(cv.references) ? (
            <CVSection title="References" accent={accent}>
              <Paragraph text={cv.references} />
            </CVSection>
          ) : null}
        </aside>

        <section className="space-y-8">
          <MainCVSections cv={cv} accent={accent} />
        </section>
      </main>
    </CVPage>
  );
}

function AcademicScholarCV({ cv, config }) {
  return <FormalCV cv={cv} config={config} label="Curriculum Vitae" serif />;
}

function LegalAdvisorCV({ cv, config }) {
  return <FormalCV cv={cv} config={config} label="Legal Advisor CV" serif />;
}

function SeniorDirectorCV({ cv, config }) {
  return (
    <CVPage>
      <div
        className="mb-8 h-4 rounded-full"
        style={{ backgroundColor: config.accent }}
      />

      <header>
        <p
          className="text-xs font-black uppercase tracking-[0.32em]"
          style={{ color: config.accent }}
        >
          Senior Leadership Profile
        </p>

        <h1 className="mt-3 text-6xl font-black tracking-[-0.065em]">
          {name(cv)}
        </h1>

        <p className="mt-2 text-xl font-bold text-black/60">{title(cv)}</p>

        <ContactLine cv={cv} />
      </header>

      <main className="mt-10 grid grid-cols-[250px_1fr] gap-10">
        <aside>
          <SideCVSections cv={cv} accent={config.accent} />
        </aside>

        <section className="space-y-8">
          <MainCVSections cv={cv} accent={config.accent} />
        </section>
      </main>
    </CVPage>
  );
}

function AdminProfessionalCV({ cv, config }) {
  const accent = config.accent || "#475569";

  return (
    <CVPage>
      <header className="flex items-stretch">
        <div className="w-3 rounded-full" style={{ backgroundColor: accent }} />

        <div className="pl-6">
          <h1 className="text-5xl font-black tracking-[-0.055em]">
            {name(cv)}
          </h1>

          <p className="mt-2 text-lg text-black/60">{title(cv)}</p>

          <ContactLine cv={cv} />
        </div>
      </header>

      <main className="mt-9 space-y-8">
        <section className="border-l-4 pl-6" style={{ borderColor: accent }}>
          <MainCVSections cv={cv} accent={accent} />
        </section>

        <SideCVSections cv={cv} accent={accent} />
      </main>
    </CVPage>
  );
}

function HealthcareClinicalCV({ cv, config }) {
  return (
    <CVPage>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-black tracking-[-0.055em]">
            {name(cv)}
          </h1>

          <p
            className="mt-2 text-lg font-bold"
            style={{ color: config.accent }}
          >
            {title(cv)}
          </p>

          <ContactLine cv={cv} />
        </div>

        <div
          className="flex h-20 w-20 items-center justify-center rounded-full text-4xl font-black text-white"
          style={{ backgroundColor: config.accent }}
        >
          +
        </div>
      </header>

      <main className="mt-9 grid grid-cols-[1fr_260px] gap-8">
        <section className="space-y-8">
          <MainCVSections cv={cv} accent={config.accent} />
        </section>

        <aside
          className="rounded-3xl p-6"
          style={{ backgroundColor: `${config.accent}10` }}
        >
          <SideCVSections cv={cv} accent={config.accent} />
        </aside>
      </main>
    </CVPage>
  );
}

function SalesLeaderCV({ cv, config }) {
  const accent = config.accent;

  return (
    <CVPage>
      <HeaderBackground accent={accent} dark>
        <h1 className="text-5xl font-black tracking-[-0.055em]">
          {name(cv)}
        </h1>

        <p className="mt-2 text-lg text-white/75">{title(cv)}</p>

        <ContactLine cv={cv} dark />
      </HeaderBackground>

      <div className="mt-7 grid grid-cols-3 gap-4 text-center">
        <Metric value="128%" label="Target" />
        <Metric value="42" label="Clients" />
        <Metric value="£2M" label="Pipeline" />
      </div>

      <main className="mt-8 space-y-8">
        <MainCVSections cv={cv} accent={accent} />
        <SideCVSections cv={cv} accent={accent} />
      </main>
    </CVPage>
  );
}

function FinanceAnalystCV({ cv, config }) {
  const accent = config.accent || "#0891B2";

  return (
    <CVPage>
      <header className="pb-7">
        <p
          className="text-xs font-black uppercase tracking-[0.32em]"
          style={{ color: accent }}
        >
          Financial Profile
        </p>

        <h1 className="mt-3 text-5xl font-black tracking-[-0.055em]">
          {name(cv)}
        </h1>

        <p className="mt-2 text-lg text-black/60">{title(cv)}</p>

        <ContactLine cv={cv} />
      </header>

      <div className="mt-8 grid h-28 grid-cols-5 items-end gap-2">
        {[35, 55, 45, 70, 60].map((height, index) => (
          <div
            key={index}
            className="rounded-t"
            style={{
              height: `${height}%`,
              backgroundColor: accent,
            }}
          />
        ))}
      </div>

      <main className="mt-9 grid grid-cols-[260px_1fr] gap-9">
        <aside className="rounded-3xl bg-slate-50 p-6">
          <SideCVSections cv={cv} accent={accent} />
        </aside>

        <section className="space-y-8">
          <MainCVSections cv={cv} accent={accent} />
        </section>
      </main>
    </CVPage>
  );
}

function StockholmCleanCV({ cv, config }) {
  return (
    <CVPage>
      <header className="flex justify-between gap-6">
        <div>
          <h1 className="text-5xl font-light tracking-[-0.055em]">
            {name(cv)}
          </h1>

          <p
            className="mt-2 text-lg font-bold"
            style={{ color: config.accent }}
          >
            {title(cv)}
          </p>

          <ContactLine cv={cv} />
        </div>

        <div
          className="h-24 w-24 rounded-full"
          style={{ backgroundColor: `${config.accent}18` }}
        />
      </header>

      <main className="mt-10 space-y-8">
        <MainCVSections cv={cv} accent={config.accent} />
        <SideCVSections cv={cv} accent={config.accent} />
      </main>
    </CVPage>
  );
}

function DubaiCorporateCV({ cv, config }) {
  return (
    <div
      id="cv-download"
      className="min-h-[1123px] w-[794px] overflow-visible bg-white text-black shadow-2xl print:shadow-none"
    >
      <header
        className="p-10 text-right text-white"
        style={{ backgroundColor: exactDark(config) }}
      >
        <p
          className="text-xs uppercase tracking-[0.3em]"
          style={{ color: config.accent }}
        >
          Corporate Profile
        </p>

        <h1 className="mt-2 text-5xl font-black tracking-[-0.055em]">
          {name(cv)}
        </h1>

        <p className="mt-2 text-lg text-white/70">{title(cv)}</p>

        <ContactLine cv={cv} dark />
      </header>

      <main className="grid grid-cols-[260px_1fr] gap-10 p-10">
        <aside>
          <SideCVSections cv={cv} accent={config.accent} />
        </aside>

        <section className="space-y-8">
          <MainCVSections cv={cv} accent={config.accent} />
        </section>
      </main>
    </div>
  );
}

function CanadaSimpleCV({ cv, config }) {
  return (
    <CVPage>
      <header
        className="border-l-[14px] pl-6"
        style={{ borderColor: config.accent }}
      >
        <h1 className="text-5xl font-black tracking-[-0.055em]">
          {name(cv)}
        </h1>

        <p className="mt-2 text-lg text-black/60">{title(cv)}</p>

        <ContactLine cv={cv} />
      </header>

      <main className="mt-9 space-y-8">
        <MainCVSections cv={cv} accent={config.accent} />
        <SideCVSections cv={cv} accent={config.accent} />
      </main>
    </CVPage>
  );
}

function HospitalityPremiumCV({ cv, config }) {
  return (
    <CVPage ivory>
      <header
        className="rounded-[36px] p-8"
        style={{ backgroundColor: `${config.accent}10` }}
      >
        <p
          className="text-xs font-black uppercase tracking-[0.3em]"
          style={{ color: config.accent }}
        >
          Hospitality Profile
        </p>

        <h1 className="mt-2 font-serif text-5xl font-bold">{name(cv)}</h1>

        <p className="mt-2 text-lg text-black/60">{title(cv)}</p>

        <ContactLine cv={cv} />
      </header>

      <main className="mt-9 grid grid-cols-[1fr_260px] gap-8">
        <section className="space-y-8">
          <MainCVSections cv={cv} accent={config.accent} />
        </section>

        <aside>
          <SideCVSections cv={cv} accent={config.accent} />
        </aside>
      </main>
    </CVPage>
  );
}

function EngineerGridCV({ cv, config }) {
  return (
    <CVPage>
      <header>
        <p
          className="text-xs font-black uppercase tracking-[0.3em]"
          style={{ color: config.accent }}
        >
          Engineering CV
        </p>

        <h1 className="mt-2 text-5xl font-black tracking-[-0.055em]">
          {name(cv)}
        </h1>

        <p className="mt-2 text-lg text-black/60">{title(cv)}</p>

        <ContactLine cv={cv} />
      </header>

      <main className="mt-9 grid grid-cols-2 gap-7">
        <section className="space-y-7">
          <MainCVSections cv={cv} accent={config.accent} />
        </section>

        <aside className="space-y-7 rounded-3xl border border-slate-200 p-6">
          <SideCVSections cv={cv} accent={config.accent} />
        </aside>
      </main>
    </CVPage>
  );
}

function TeacherFriendlyCV({ cv, config }) {
  const accent = config.accent;

  return (
    <CVPage>
      <HeaderBackground accent={accent}>
        <p
          className="text-xs font-black uppercase tracking-[0.3em]"
          style={{ color: accent }}
        >
          Education CV
        </p>

        <h1 className="mt-2 text-5xl font-black tracking-[-0.055em]">
          {name(cv)}
        </h1>

        <p className="mt-2 text-lg text-black/60">{title(cv)}</p>

        <ContactLine cv={cv} />
      </HeaderBackground>

      <main className="mt-9">
        <section
          className="rounded-[1.5rem] border-l-8 p-7"
          style={{ borderColor: accent }}
        >
          <MainCVSections cv={cv} accent={accent} />
        </section>

        <aside className="mt-8">
          <SideCVSections cv={cv} accent={accent} />
        </aside>
      </main>
    </CVPage>
  );
}

function CustomerServiceCV({ cv, config }) {
  return (
    <BadgeHeaderCV cv={cv} config={config} badge="★" label="Service Profile" />
  );
}

function ProjectManagerCV({ cv, config }) {
  return (
    <CVPage>
      <header>
        <h1 className="text-5xl font-black tracking-[-0.055em]">
          {name(cv)}
        </h1>

        <p
          className="mt-2 text-lg font-bold"
          style={{ color: config.accent }}
        >
          {title(cv)}
        </p>

        <ContactLine cv={cv} />
      </header>

      <main className="mt-9 space-y-8">
        {hasText(cv.summary) ? (
          <CVSection title="Professional Summary" accent={config.accent}>
            <Paragraph text={cv.summary} />
          </CVSection>
        ) : null}

        <CVSection title="Project Timeline" accent={config.accent}>
          <div
            className="space-y-6 border-l-2 pl-6"
            style={{ borderColor: config.accent }}
          >
            <ExperienceContent cv={cv} timeline accent={config.accent} />
          </div>
        </CVSection>

        <MainCVSections
          cv={cv}
          accent={config.accent}
          skipSummary
          skipExperience
        />

        <SideCVSections cv={cv} accent={config.accent} />
      </main>
    </CVPage>
  );
}

function MarketingBoldCV({ cv, config }) {
  return (
    <CVPage>
      <header
        className="rounded-[36px] p-8 text-white"
        style={{
          background: `linear-gradient(135deg, ${config.accent}, ${exactDark(
            config
          )})`,
        }}
      >
        <p className="text-xs font-black uppercase tracking-[0.3em] text-white/65">
          Marketing Profile
        </p>

        <h1 className="mt-2 text-5xl font-black tracking-[-0.055em]">
          {name(cv)}
        </h1>

        <p className="mt-2 text-lg text-white/75">{title(cv)}</p>

        <ContactLine cv={cv} dark />
      </header>

      <main className="mt-8 grid grid-cols-[1fr_260px] gap-8">
        <section className="space-y-8">
          <MainCVSections cv={cv} accent={config.accent} />
        </section>

        <aside>
          <SideCVSections cv={cv} accent={config.accent} />
        </aside>
      </main>
    </CVPage>
  );
}

function HRProfessionalCV({ cv, config }) {
  return (
    <CVPage>
      <header className="grid grid-cols-[96px_1fr] gap-6">
        <Monogram name={name(cv)} accent={config.accent} />

        <div>
          <p
            className="text-xs font-black uppercase tracking-[0.3em]"
            style={{ color: config.accent }}
          >
            Human Resources
          </p>

          <h1 className="mt-2 text-5xl font-black tracking-[-0.055em]">
            {name(cv)}
          </h1>

          <p className="mt-2 text-lg text-black/60">{title(cv)}</p>

          <ContactLine cv={cv} />
        </div>
      </header>

      <main className="mt-9 grid grid-cols-[260px_1fr] gap-9">
        <aside className="rounded-3xl bg-slate-50 p-6">
          <SideCVSections cv={cv} accent={config.accent} />
        </aside>

        <section className="space-y-8">
          <MainCVSections cv={cv} accent={config.accent} />
        </section>
      </main>
    </CVPage>
  );
}

function DataAnalystCV({ cv, config }) {
  return (
    <CVPage>
      <header className="rounded-[32px] border border-slate-200 p-8">
        <p
          className="font-mono text-xs font-black uppercase tracking-[0.25em]"
          style={{ color: config.accent }}
        >
          Data Profile
        </p>

        <h1 className="mt-2 font-mono text-5xl font-black tracking-[-0.055em]">
          {name(cv)}
        </h1>

        <p className="mt-2 text-lg text-black/60">{title(cv)}</p>

        <ContactLine cv={cv} />
      </header>

      <div className="mt-7 grid grid-cols-3 gap-4">
        <Metric value="SQL" label="Analysis" />
        <Metric value="BI" label="Reports" />
        <Metric value="KPI" label="Tracking" />
      </div>

      <main className="mt-8 grid grid-cols-[1fr_260px] gap-8">
        <section className="space-y-8">
          <MainCVSections cv={cv} accent={config.accent} />
        </section>

        <aside>
          <SideCVSections cv={cv} accent={config.accent} />
        </aside>
      </main>
    </CVPage>
  );
}

function PremiumMonogramCV({ cv, config }) {
  return (
    <CVPage ivory>
      <header className="text-center">
        <div className="mx-auto">
          <Monogram name={name(cv)} accent={config.accent} />
        </div>

        <p
          className="mt-5 text-xs font-black uppercase tracking-[0.32em]"
          style={{ color: config.accent }}
        >
          Premium Profile
        </p>

        <h1 className="mt-3 font-serif text-5xl font-bold">{name(cv)}</h1>

        <p className="mt-3 text-lg text-black/60">{title(cv)}</p>

        <ContactLine cv={cv} center />
      </header>

      <main className="mt-10 grid grid-cols-[240px_1fr] gap-9">
        <aside>
          <SideCVSections cv={cv} accent={config.accent} />
        </aside>

        <section className="space-y-8">
          <MainCVSections cv={cv} accent={config.accent} />
        </section>
      </main>
    </CVPage>
  );
}

/* =========================
   SHARED TEMPLATE BLOCKS
========================= */

function FormalCV({ cv, config, label = "Professional CV", serif = false }) {
  return (
    <CVPage>
      <header className="text-center">
        <p
          className="text-xs font-black uppercase tracking-[0.32em]"
          style={{ color: config.accent }}
        >
          {label}
        </p>

        <h1
          className={`mt-3 text-5xl ${
            serif ? "font-serif font-bold" : "font-black tracking-[-0.055em]"
          }`}
        >
          {name(cv)}
        </h1>

        <p className="mt-2 text-lg text-black/60">{title(cv)}</p>

        <ContactLine cv={cv} center />

        <div
          className="mx-auto mt-5 h-px w-full"
          style={{ backgroundColor: `${config.accent}55` }}
        />
      </header>

      <main className="mt-9 space-y-8">
        <MainCVSections cv={cv} accent={config.accent} />
        <SideCVSections cv={cv} accent={config.accent} />
      </main>
    </CVPage>
  );
}

function BadgeHeaderCV({
  cv,
  config,
  badge = "✓",
  label = "Professional Profile",
}) {
  return (
    <CVPage>
      <header className="flex items-center justify-between gap-6">
        <div>
          <p
            className="text-xs font-black uppercase tracking-[0.3em]"
            style={{ color: config.accent }}
          >
            {label}
          </p>

          <h1 className="mt-2 text-5xl font-black tracking-[-0.055em]">
            {name(cv)}
          </h1>

          <p className="mt-2 text-lg text-black/60">{title(cv)}</p>

          <ContactLine cv={cv} />
        </div>

        <div
          className="flex h-20 w-20 items-center justify-center rounded-full text-4xl font-black text-white"
          style={{ backgroundColor: config.accent }}
        >
          {badge}
        </div>
      </header>

      <main className="mt-9 grid grid-cols-[1fr_260px] gap-8">
        <section className="space-y-8">
          <MainCVSections cv={cv} accent={config.accent} />
        </section>

        <aside
          className="rounded-3xl p-6"
          style={{ backgroundColor: `${config.accent}10` }}
        >
          <SideCVSections cv={cv} accent={config.accent} />
        </aside>
      </main>
    </CVPage>
  );
}
function CVPage({ children, ivory = false }) {
  return (
    <div
      id="cv-download"
      className={`w-[794px] min-h-[1123px] overflow-visible px-12 py-12 text-black shadow-2xl print:min-h-[1123px] print:w-full print:overflow-visible print:shadow-none ${
        ivory ? "bg-[#FBF7EF]" : "bg-white"
      }`}
      style={{
        width: "794px",
        minHeight: "1123px",
        height: "auto",
        overflow: "visible",
        backgroundColor: ivory ? "#FBF7EF" : "#ffffff",
      }}
    >
      {children}
    </div>
  );
}

function MainCVSections({
  cv,
  accent,
  skipSummary = false,
  skipExperience = false,
}) {
  return (
    <>
      {!skipSummary && hasText(cv.summary) ? (
        <CVSection title="Professional Summary" accent={accent}>
          <Paragraph text={cv.summary} />
        </CVSection>
      ) : null}

      {!skipExperience && hasValidExperience(cv) ? (
        <CVSection title="Work Experience" accent={accent}>
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

      {hasList(cv.achievements) ? (
        <CVSection title="Achievements" accent={accent}>
          <BulletList items={cv.achievements} />
        </CVSection>
      ) : null}

      {hasValidCertifications(cv) ? (
        <CVSection title="Certifications" accent={accent}>
          <CertificationContent cv={cv} />
        </CVSection>
      ) : null}

      <AdditionalSectionsContent cv={cv} accent={accent} />
    </>
  );
}

function SideCVSections({ cv, accent = "#111827", dark = false }) {
  return (
    <>
      {hasList(cv.skills) ? (
        <div className="mt-8 first:mt-0">
          <SmallTitle title="Skills" dark={dark} accent={accent} />
          <SkillPills
            items={cv.skills}
            levels={cv.skillLevels}
            dark={dark}
            accent={accent}
          />
        </div>
      ) : null}

      {hasList(cv.languages) ? (
        <div className="mt-8">
          <SmallTitle title="Languages" dark={dark} accent={accent} />
          <LanguageList
            items={cv.languages}
            levels={cv.languageLevels}
            dark={dark}
          />
        </div>
      ) : null}

      {hasList(cv.strengths) ? (
        <div className="mt-8">
          <SmallTitle title="Strengths" dark={dark} accent={accent} />
          <BulletList items={cv.strengths} dark={dark} />
        </div>
      ) : null}

      {hasList(cv.hobbies) ? (
        <div className="mt-8">
          <SmallTitle title="Interests" dark={dark} accent={accent} />
          <BulletList items={cv.hobbies} dark={dark} />
        </div>
      ) : null}

      {hasText(cv.references) ? (
        <div className="mt-8">
          <SmallTitle title="References" dark={dark} accent={accent} />
          <Paragraph text={cv.references} dark={dark} />
        </div>
      ) : null}
    </>
  );
}

function CVSection({ title, children, accent }) {
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

function SmallTitle({ title, dark = false, accent = "#111827" }) {
  return (
    <p
      className="mb-2 text-xs font-black uppercase tracking-wider"
      style={{ color: dark ? "rgba(255,255,255,0.9)" : accent }}
    >
      {title}
    </p>
  );
}

function Paragraph({ text, dark = false, className = "" }) {
  if (!hasText(text)) return null;

  return (
    <p
      className={`whitespace-pre-line text-[12px] leading-6 ${
        dark ? "text-white/75" : "text-slate-600"
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
      className={`space-y-2 text-[12px] leading-6 ${
        dark ? "text-white/75" : "text-slate-600"
      }`}
    >
      {list.map((item, index) => (
        <li key={`${item}-${index}`} className="flex gap-2">
          <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SkillPills({ items, levels = [], dark = false, accent = "#111827" }) {
  const list = normalizeList(items);

  if (!list.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {list.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="rounded-full px-3 py-1.5 text-[10.5px] font-bold"
          style={{
            backgroundColor: dark ? "rgba(255,255,255,0.16)" : accent,
            color: "#ffffff",
            border: dark
              ? "1px solid rgba(255,255,255,0.22)"
              : `1px solid ${accent}`,
          }}
        >
          {item}
          {levels?.[index] ? ` · ${levels[index]}` : ""}
        </span>
      ))}
    </div>
  );
}

function LanguageList({ items, levels = [], dark = false }) {
  const list = normalizeList(items);

  if (!list.length) return null;

  return (
    <div className="space-y-2">
      {list.map((item, index) => (
        <p
          key={`${item}-${index}`}
          className={`text-[12px] ${
            dark ? "text-white/75" : "text-slate-600"
          }`}
        >
          {item}
          {levels?.[index] ? ` — ${levels[index]}` : ""}
        </p>
      ))}
    </div>
  );
}

function ContactLine({ cv, dark = false, center = false }) {
  const items = [
    cv.email,
    cv.phone,
    cv.location,
    cv.linkedIn,
    cv.github,
    cv.portfolio,
    cv.website,
  ].filter(hasText);

  if (!items.length) return null;

  return (
    <p
      className={`mt-4 text-[11.5px] leading-6 ${
        center ? "text-center" : ""
      } ${dark ? "text-white/65" : "text-slate-500"}`}
    >
      {items.join(" · ")}
    </p>
  );
}

function ContactStack({ cv, dark = false }) {
  const items = [
    cv.email,
    cv.phone,
    cv.location,
    cv.linkedIn,
    cv.github,
    cv.portfolio,
    cv.website,
  ].filter(hasText);

  if (!items.length) return null;

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <p
          key={`${item}-${index}`}
          className={`break-all text-[11.5px] leading-5 ${
            dark ? "text-white/75" : "text-slate-600"
          }`}
        >
          {item}
        </p>
      ))}
    </div>
  );
}

function ExperienceContent({ cv, timeline = false, accent = "#111827" }) {
  const items = getValidExperience(cv);

  if (!items.length) {
    return hasText(cv.experience) ? <Paragraph text={cv.experience} /> : null;
  }

  return (
    <div className="space-y-6">
      {items.map((item, index) => (
        <div key={index} className="relative">
          {timeline ? (
            <span
              className="absolute -left-[31px] top-1 h-3 w-3 rounded-full"
              style={{ backgroundColor: accent }}
            />
          ) : null}

          <div className="flex items-start justify-between gap-4">
            <div>
              {hasText(item.jobTitle) ? (
                <h3 className="text-[13px] font-black text-slate-950">
                  {item.jobTitle}
                </h3>
              ) : null}

              {[item.company, item.location].filter(hasText).length ? (
                <p className="mt-1 text-[11.5px] font-semibold text-slate-500">
                  {[item.company, item.location].filter(hasText).join(" · ")}
                </p>
              ) : null}
            </div>

            {[item.startDate, item.current ? "Present" : item.endDate].filter(
              hasText
            ).length ? (
              <p className="whitespace-nowrap text-[11px] font-bold text-slate-400">
                {[item.startDate, item.current ? "Present" : item.endDate]
                  .filter(hasText)
                  .join(" — ")}
              </p>
            ) : null}
          </div>

          {hasText(item.description) ? (
            <Paragraph text={item.description} className="mt-2" />
          ) : null}
        </div>
      ))}
    </div>
  );
}

function EducationContent({ cv }) {
  const items = getValidEducation(cv);

  if (!items.length) {
    return hasText(cv.education) ? <Paragraph text={cv.education} /> : null;
  }

  return (
    <div className="space-y-5">
      {items.map((item, index) => {
        const dateText = [item.startDate, item.endDate]
          .filter(hasText)
          .join(" — ");

        return (
          <div key={index}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {hasText(item.degree) ? (
                  <h3 className="text-[13px] font-black leading-tight text-slate-950">
                    {item.degree}
                  </h3>
                ) : null}

                {[item.institution, item.location].filter(hasText).length ? (
                  <p className="mt-1 text-[11.5px] font-semibold leading-tight text-slate-500">
                    {[item.institution, item.location]
                      .filter(hasText)
                      .join(" · ")}
                  </p>
                ) : null}
              </div>

              {hasText(dateText) ? (
                <p className="shrink-0 whitespace-nowrap text-right text-[11px] font-bold leading-tight text-slate-400">
                  {dateText}
                </p>
              ) : null}
            </div>

            {hasText(item.description) ? (
              <Paragraph text={item.description} className="mt-2" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function ProjectsContent({ cv }) {
  const items = getValidProjects(cv);

  if (!items.length) {
    return hasText(cv.projects) ? <Paragraph text={cv.projects} /> : null;
  }

  return (
    <div className="space-y-5">
      {items.map((item, index) => (
        <div key={index}>
          <div className="flex items-start justify-between gap-4">
            <div>
              {hasText(item.title) ? (
                <h3 className="text-[13px] font-black text-slate-950">
                  {item.title}
                </h3>
              ) : null}

              {[item.role, item.technologies].filter(hasText).length ? (
                <p className="mt-1 text-[11.5px] font-semibold text-slate-500">
                  {[item.role, item.technologies].filter(hasText).join(" · ")}
                </p>
              ) : null}
            </div>

            {hasText(item.date) ? (
              <p className="whitespace-nowrap text-[11px] font-bold text-slate-400">
                {item.date}
              </p>
            ) : null}
          </div>

          {hasText(item.description) ? (
            <Paragraph text={item.description} className="mt-2" />
          ) : null}
        </div>
      ))}
    </div>
  );
}

function CertificationContent({ cv }) {
  const items = getValidCertifications(cv);

  if (!items.length) {
    return hasList(cv.certifications) ? (
      <BulletList items={cv.certifications} />
    ) : null;
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index}>
          {hasText(item.name) ? (
            <h3 className="text-[12px] font-black text-slate-950">
              {item.name}
            </h3>
          ) : null}

          {[item.issuer, item.date].filter(hasText).length ? (
            <p className="text-[11px] leading-5 text-slate-500">
              {[item.issuer, item.date].filter(hasText).join(" · ")}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function AdditionalSectionsContent({ cv, accent }) {
  const items = Array.isArray(cv.additionalSections)
    ? cv.additionalSections.filter(
        (item) => hasText(item.title) || hasText(item.description)
      )
    : [];

  return (
    <>
      {items.map((item, index) => (
        <CVSection
          key={`${item.title || "section"}-${index}`}
          title={item.title || "Additional Information"}
          accent={accent}
        >
          <Paragraph text={item.description} />
        </CVSection>
      ))}
    </>
  );
}

function ProfilePhoto({ cv, config, large = false, dark = false }) {
  const accent = config.accent;

  const shapeMap = {
    eu: "rounded-md",
    square: "rounded-xl",
    "circle-ring": "rounded-full ring-4 ring-white",
    blob: "rounded-[42%_58%_55%_45%/48%_42%_58%_52%]",
    oval: "rounded-[45%]",
  };

  const shape = shapeMap[config.photoShape] || "rounded-full";
  const size = large ? "h-32 w-32" : "h-24 w-24";

  return (
    <div
      className={`${size} ${shape} shrink-0 overflow-hidden border bg-slate-100 shadow`}
      style={{ borderColor: dark ? "rgba(255,255,255,.35)" : accent }}
    >
      {hasText(cv.photo) ? (
        <img
          src={cv.photo}
          alt={cv.fullName || "Profile"}
          className="h-full w-full object-cover"
          style={{
            transform: `scale(${Number(cv.photoZoom) || 1})`,
            transformOrigin: `${Number(cv.photoPositionX) || 50}% ${
              Number(cv.photoPositionY) || 50
            }%`,
          }}
        />
      ) : (
        <DefaultAvatar name={cv.fullName} accent={accent} />
      )}
    </div>
  );
}

function DefaultAvatar({ name = "Candidate", accent = "#2563EB" }) {
  const initials = String(name || "Candidate")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="flex h-full w-full items-center justify-center text-3xl font-black"
      style={{ color: accent, backgroundColor: `${accent}12` }}
    >
      {initials || "CV"}
    </div>
  );
}

function Monogram({ name, accent }) {
  const initials = String(name || "Candidate")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border-2 text-3xl font-black"
      style={{ borderColor: `${accent}66`, color: accent }}
    >
      {initials || "CV"}
    </div>
  );
}

function Metric({ value, label }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 text-center">
      <p className="text-xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

/* =========================
   DATA HELPERS
========================= */

function resolveTemplateId(template) {
  const rawTemplate = template || "clean-ats";

  if (templateConfig[rawTemplate]) return rawTemplate;

  if (legacyTemplateMap[rawTemplate]) return legacyTemplateMap[rawTemplate];

  return "clean-ats";
}

function getTemplateConfig(cv) {
  const resolvedId = resolveTemplateId(cv?.template);
  const template = templateConfig[resolvedId] || templateConfig["clean-ats"];

  return {
    ...template,
    id: resolvedId,
    layout: resolvedId,
    name: template.name || "Clean ATS",
    photo: Boolean(template.photo),
    photoShape: template.photoShape || "circle",
    colors: template.colors || colorSets.blue,
    accent:
      cv?.selectedColor ||
      cv?.color ||
      template.accent ||
      template.colors?.[0] ||
      "#2563EB",
  };
}

function exactDark(config) {
  return config.colors?.[2] || config.colors?.[1] || "#0F172A";
}

function name(cv) {
  return hasText(cv.fullName) ? cv.fullName : "Your Name";
}

function title(cv) {
  return hasText(cv.jobTitle) ? cv.jobTitle : "Professional Title";
}

function normalizeList(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  return String(value)
    .split(/,|\n|;|·/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function hasText(value) {
  return value !== undefined && value !== null && String(value).trim().length > 0;
}

function hasList(value) {
  return normalizeList(value).length > 0;
}

function getValidExperience(cv) {
  return Array.isArray(cv.experiences)
    ? cv.experiences.filter(
        (item) =>
          hasText(item.jobTitle) ||
          hasText(item.company) ||
          hasText(item.location) ||
          hasText(item.startDate) ||
          hasText(item.endDate) ||
          hasText(item.description)
      )
    : [];
}

function getValidEducation(cv) {
  return Array.isArray(cv.educations)
    ? cv.educations.filter(
        (item) =>
          hasText(item.degree) ||
          hasText(item.institution) ||
          hasText(item.location) ||
          hasText(item.startDate) ||
          hasText(item.endDate) ||
          hasText(item.description)
      )
    : [];
}

function getValidProjects(cv) {
  return Array.isArray(cv.projectsList)
    ? cv.projectsList.filter(
        (item) =>
          hasText(item.title) ||
          hasText(item.role) ||
          hasText(item.technologies) ||
          hasText(item.date) ||
          hasText(item.description)
      )
    : [];
}

function getValidCertifications(cv) {
  return Array.isArray(cv.certificationsList)
    ? cv.certificationsList.filter(
        (item) => hasText(item.name) || hasText(item.issuer) || hasText(item.date)
      )
    : [];
}

function hasValidExperience(cv) {
  return getValidExperience(cv).length > 0 || hasText(cv.experience);
}

function hasValidEducation(cv) {
  return getValidEducation(cv).length > 0 || hasText(cv.education);
}

function hasValidProjects(cv) {
  return getValidProjects(cv).length > 0 || hasText(cv.projects);
}

function hasValidCertifications(cv) {
  return getValidCertifications(cv).length > 0 || hasList(cv.certifications);
}