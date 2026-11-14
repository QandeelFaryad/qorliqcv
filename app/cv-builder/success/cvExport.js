"use client";
import { toCanvas } from "html-to-image";
import jsPDF from "jspdf";
import { paginateContent, triggerDownload } from "./downloadUtils";

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

function createExportClone(element) {
  if (!element) return null;

  // Remove an old clone if a previous export failed.
  document.getElementById("qorliq-cv-export-wrapper")?.remove();

  const clone = element.cloneNode(true);

  clone.id = "qorliq-cv-export-clone";

  Object.assign(clone.style, {
    width: "794px",
    minWidth: "794px",
    maxWidth: "794px",
    height: "auto",
    minHeight: "1123px",
    background: "#ffffff",
    margin: "0",
    padding: "0",
    position: "relative",
    top: "0",
    left: "0",
    transform: "none",
    transformOrigin: "top left",
    opacity: "1",
    visibility: "visible",
    pointerEvents: "none",
    overflow: "visible",
    boxShadow: "none",
    display: "block",
    WebkitFontSmoothing: "antialiased",
    textRendering: "geometricPrecision",
  });

  const wrapper = document.createElement("div");

  wrapper.id = "qorliq-cv-export-wrapper";

  Object.assign(wrapper.style, {
    position: "fixed",
    top: "0",
    left: "-100000px",
    width: "794px",
    minWidth: "794px",
    height: "auto",
    minHeight: "1123px",
    background: "#ffffff",
    opacity: "1",
    visibility: "visible",
    pointerEvents: "none",
    zIndex: "-1",
    overflow: "visible",
  });

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  clone.querySelectorAll("#cv-download").forEach((block) => {
    Object.assign(block.style, {
      width: "794px",
      minWidth: "794px",
      maxWidth: "794px",
      height: "auto",
      minHeight: "1123px",
      background: "#ffffff",
      overflow: "visible",
      boxShadow: "none",
    });
  });

  clone.querySelectorAll("main, section, article").forEach((block) => {
    block.style.maxHeight = "none";
    block.style.overflow = "visible";
  });

  clone.querySelectorAll("aside").forEach((aside) => {
    const fullHeight =
      aside.getAttribute("data-full-height-sidebar") === "true";

    aside.style.alignSelf = "flex-start";
    aside.style.height = "auto";
    aside.style.maxHeight = "none";
    aside.style.overflow = "visible";

    if (fullHeight) {
      aside.style.minHeight = "1123px";
    }
  });

  clone.querySelectorAll("*").forEach((node) => {
    node.style.visibility = "visible";

    const isPhotoFrame =
      node.matches?.(
        [
          ".profile-photo-frame",
          ".cv-photo-frame",
          "[data-profile-photo-frame='true']",
        ].join(",")
      ) ||
      node.closest?.(
        [
          ".profile-photo-frame",
          ".cv-photo-frame",
          "[data-profile-photo-frame='true']",
        ].join(",")
      );

    if (!isPhotoFrame) {
      const isContentClipped =
        node.scrollHeight > node.clientHeight + 2 &&
        node.clientHeight > 0;

      if (isContentClipped) {
        node.style.height = "auto";
        node.style.maxHeight = "none";
        node.style.overflow = "visible";
      }
    }
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
export async function generatePDF({ cv, previewElement }) {
  const MAX_PDF_SIZE = 20 * 1024 * 1024;
  let exportElement = null;
  let restoreImages = null;

  try {


    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    exportElement = createExportClone(previewElement);

    if (!exportElement) {
      throw new Error("Unable to prepare CV for PDF.");
    }

    restoreImages = await prepareImagesForPDF(exportElement);
    await waitForImages(exportElement);

    await new Promise((resolve) => requestAnimationFrame(resolve));
    

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
      throw new Error("CV height was not detected.");
    }

    /* =========================================
       EXPORT DESIGN SETTINGS
    ========================================= */
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

    exportElement.querySelectorAll(".grid").forEach((grid) => {
      grid.style.alignItems = "flex-start";
      grid.style.overflow = "visible";
    });

    /* =========================================
       PROFILE PHOTO FIX
    ========================================= */
    const profileFrames = exportElement.querySelectorAll(
      [
        ".profile-photo-frame",
        ".cv-photo-frame",
        "[data-profile-photo-frame='true']",
      ].join(",")
    );

    profileFrames.forEach((frame) => {
      frame.style.overflow = "hidden";
      frame.style.display = "flex";
      frame.style.alignItems = "center";
      frame.style.justifyContent = "center";

      const image = frame.querySelector("img");

      if (image) {
        image.style.width = "100%";
        image.style.height = "100%";
        image.style.maxWidth = "100%";
        image.style.maxHeight = "100%";
        image.style.objectFit = "cover";
  
        image.style.display = "block";
      }
    });

    exportElement.querySelectorAll("img").forEach((image) => {
      image.style.maxWidth = "100%";

      image.style.display = "block";

      if (
        !image.closest(
          [
            ".profile-photo-frame",
            ".cv-photo-frame",
            "[data-profile-photo-frame='true']",
          ].join(",")
        )
      ) {
        image.style.objectFit = image.style.objectFit || "contain";
      }
    });

    /* =========================================
       SEARCHABLE DATA HELPERS
    ========================================= */
    const cleanExtractionText = (value) => {
      return String(value || "")
        .replace(/\u00a0/g, " ")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n[ \t]+/g, "\n")
        .replace(/[ \t]{2,}/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    };

    const htmlToExtractionText = (value) => {
      if (!value) return "";

      const container = document.createElement("div");
      container.innerHTML = String(value)
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#039;/gi, "'");

      container.querySelectorAll("script, style, iframe").forEach((e) => e.remove());
      container.querySelectorAll("br").forEach((e) => e.replaceWith(document.createTextNode("\n")));

      container.querySelectorAll("li").forEach((element, index) => {
        const parent = element.parentElement;
        const marker = parent?.tagName === "OL" ? `${index + 1}. ` : "- ";
        element.insertBefore(document.createTextNode(`\n${marker}`), element.firstChild);
        element.appendChild(document.createTextNode("\n"));
      });

      container
        .querySelectorAll(["p", "div", "blockquote", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol"].join(","))
        .forEach((element) => {
          element.insertAdjacentText("afterend", "\n");
        });

      return cleanExtractionText(container.textContent || container.innerText || "");
    };

    const getPlainItemText = (item) => {
      if (!item) return "";
      if (typeof item === "string") return cleanExtractionText(item);
      return cleanExtractionText(
        item.name || item.title || item.label || item.value || item.text || item.skill || item.language || ""
      );
    };

    const getDateRange = (item = {}) => {
      const startDate = item.startDate || item.start || item.from || "";
      const isCurrent = item.current === true || item.isCurrent === true || item.currentlyWorking === true;
      const endDate = isCurrent ? "Present" : item.endDate || item.end || item.to || item.year || "";

      return [startDate, endDate].map(cleanExtractionText).filter(Boolean).join(" - ");
    };

    const extractionLines = [];

    const addBlankLine = () => {
      if (extractionLines.length && extractionLines[extractionLines.length - 1] !== "") {
        extractionLines.push("");
      }
    };

    const addLine = (value) => {
      const text = cleanExtractionText(value);
      if (!text) return;

      text.split("\n").forEach((line) => {
        const cleanLine = cleanExtractionText(line);
        if (cleanLine) extractionLines.push(cleanLine);
        else addBlankLine();
      });
    };

    const addHtml = (value) => {
      const text = htmlToExtractionText(value);
      if (!text) return;

      text.split("\n").forEach((line) => {
        const cleanLine = line.trim();
        if (cleanLine) extractionLines.push(cleanLine);
        else addBlankLine();
      });
    };

    const addSection = (title) => {
      addBlankLine();
      addLine(String(title).toUpperCase());
    };

    /* =========================================
       BUILD LOGICAL ATS DATA ORDER
    ========================================= */
    addLine(cv.fullName);
    addLine(cv.jobTitle);

    addLine(
      [cv.email, cv.phone, cv.location, cv.linkedIn, cv.github, cv.portfolio, cv.website]
        .map(cleanExtractionText)
        .filter(Boolean)
        .join(" | ")
    );

    if (cv.summary) {
      addSection("Professional Summary");
      addHtml(cv.summary);
    }

    const experiences = Array.isArray(cv.experiences) ? cv.experiences.filter(Boolean) : [];

    if (experiences.length || cv.experience) {
      addSection("Work Experience");

      if (experiences.length) {
        experiences.forEach((item) => {
          const jobTitle = item.jobTitle || item.title || item.position || item.role || "";
          const company = item.company || item.employer || item.organization || "";

          addLine([jobTitle, company].map(cleanExtractionText).filter(Boolean).join(" - "));
          addLine([getDateRange(item), item.location].map(cleanExtractionText).filter(Boolean).join(" | "));

          if (item.description) addHtml(item.description);
          if (item.responsibilities) addHtml(item.responsibilities);

          if (Array.isArray(item.bullets)) {
            item.bullets.forEach((bullet) => {
              addLine(`- ${cleanExtractionText(bullet)}`);
            });
          }
          addBlankLine();
        });
      } else {
        addHtml(cv.experience);
      }
    }

    const educations = Array.isArray(cv.educations) ? cv.educations.filter(Boolean) : [];

    if (educations.length || cv.education) {
      addSection("Education");

      if (educations.length) {
        educations.forEach((item) => {
          const degree = item.degree || item.title || item.qualification || item.course || "";
          const institution = item.institution || item.school || item.university || item.college || "";

          addLine([degree, institution].map(cleanExtractionText).filter(Boolean).join(" - "));
          addLine([getDateRange(item), item.location].map(cleanExtractionText).filter(Boolean).join(" | "));

          if (item.description) addHtml(item.description);
          addBlankLine();
        });
      } else {
        addHtml(cv.education);
      }
    }

    if (Array.isArray(cv.skills) && cv.skills.length) {
      addSection("Skills");
      addLine(
        cv.skills
          .map((skill, index) => {
            const skillText = getPlainItemText(skill);
            const level = cv.skillLevels?.[index] || skill?.level || "";
            return level ? `${skillText} (${level})` : skillText;
          })
          .filter(Boolean)
          .join(", ")
      );
    }

    if (Array.isArray(cv.languages) && cv.languages.length) {
      addSection("Languages");
      cv.languages.forEach((language, index) => {
        const languageText = getPlainItemText(language);
        const level = cv.languageLevels?.[index] || language?.level || "";
        addLine(level ? `- ${languageText} - ${level}` : `- ${languageText}`);
      });
    }

    const certifications =
      Array.isArray(cv.certificationsList) && cv.certificationsList.length
        ? cv.certificationsList
        : Array.isArray(cv.certifications)
        ? cv.certifications
        : [];

    if (certifications.length) {
      addSection("Certifications");
      certifications.forEach((item) => {
        if (typeof item === "string") {
          addLine(`- ${item}`);
          return;
        }
        addLine(
          `- ${[
            item.name || item.title || item.certificate,
            item.issuer || item.institution || item.organization,
            item.date || item.year || item.issuedDate,
          ]
            .map(cleanExtractionText)
            .filter(Boolean)
            .join(" | ")}`
        );
      });
    }

    const projects = Array.isArray(cv.projectsList) ? cv.projectsList.filter(Boolean) : [];

    if (projects.length || cv.projects) {
      addSection("Projects");

      if (projects.length) {
        projects.forEach((item) => {
          addLine(
            [item.title || item.name || item.projectTitle, item.role, item.date || item.year]
              .map(cleanExtractionText)
              .filter(Boolean)
              .join(" | ")
          );

          if (item.technologies) {
            addLine(
              `Technologies: ${
                Array.isArray(item.technologies) ? item.technologies.join(", ") : item.technologies
              }`
            );
          }

          if (item.description) addHtml(item.description);

          if (Array.isArray(item.bullets)) {
            item.bullets.forEach((bullet) => addLine(`- ${bullet}`));
          }
          addBlankLine();
        });
      } else {
        addHtml(cv.projects);
      }
    }

    if (Array.isArray(cv.achievements) && cv.achievements.length) {
      addSection("Career Achievements");
      cv.achievements.forEach((achievement) => {
        addLine(`- ${getPlainItemText(achievement)}`);
      });
    }

    if (Array.isArray(cv.strengths) && cv.strengths.length) {
      addSection("Key Strengths");
      cv.strengths.forEach((strength) => {
        addLine(`- ${getPlainItemText(strength)}`);
      });
    }

    if (Array.isArray(cv.additionalSections)) {
      cv.additionalSections.filter(Boolean).forEach((section) => {
        addSection(section.title || "Additional Information");
        addHtml(section.description || section.content || "");
      });
    }

    if (Array.isArray(cv.hobbies) && cv.hobbies.length) {
      addSection("Hobbies and Interests");
      addLine(cv.hobbies.map(getPlainItemText).filter(Boolean).join(", "));
    }

    if (cv.references) {
      addSection("References");
      if (Array.isArray(cv.references)) {
        cv.references.forEach((reference) => {
          if (typeof reference === "string") {
            addLine(reference);
            return;
          }
          addLine(
            [
              reference.name,
              reference.jobTitle || reference.position,
              reference.company,
              reference.email,
              reference.phone,
            ]
              .map(cleanExtractionText)
              .filter(Boolean)
              .join(" | ")
          );
        });
      } else {
        addHtml(cv.references);
      }
    }

    /* =========================================
       HIGH-QUALITY DESIGN CAPTURE
    ========================================= */
    const pixelRatio = 3.5; // High DPI for crisp rendering (kept below 4.0 to avoid oversized PNG data on long CVs)

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
      throw new Error("PDF capture failed.");
    }

    const pdfWidthMm = 210;
    const pdfHeightMm = 297;
    const pageHeightCanvas = Math.floor(fullCanvas.width * (pdfHeightMm / pdfWidthMm));

    /* =========================================
       SAFE PAGE CUT ALGORITHM
    ========================================= */
    const scaleY = fullCanvas.height / realHeight;
    const rootTop = exportElement.getBoundingClientRect().top;
    const protectedRanges = [];
    const walker = document.createTreeWalker(exportElement, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      if (!walker.currentNode.textContent.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(walker.currentNode);
      for (const rect of range.getClientRects()) {
        if (rect.height > 0) protectedRanges.push({
          top: Math.floor((rect.top - rootTop) * scaleY),
          bottom: Math.ceil((rect.bottom - rootTop) * scaleY),
        });
      }
    }
    exportElement.querySelectorAll("img, [data-profile-photo-frame], h2, h3").forEach((node) => {
      const rect = node.getBoundingClientRect();
      protectedRanges.push({
        top: Math.floor((rect.top - rootTop) * scaleY),
        bottom: Math.ceil((rect.bottom - rootTop + (/^H/.test(node.tagName) ? 24 : 0)) * scaleY),
      });
    });
    // Ignore trailing container padding only; never drop a short content tail.
    const contentBottom = Math.max(0, ...protectedRanges.map((range) => range.bottom));
    const endY = Math.min(fullCanvas.height, Math.max(pageHeightCanvas, contentBottom + Math.ceil(20 * scaleY)));
    const pageSlices = paginateContent(endY, pageHeightCanvas, protectedRanges, Math.ceil(16 * scaleY));

    if (!pageSlices.length) throw new Error("No PDF pages were generated.");

    /* =========================================
       ATS-OPTIMIZED PDF BUILDER
    ========================================= */
    const buildPdf = ({ imageScale, imageQuality, imageCompression, format = "JPEG" }) => {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
        putOnlyUsedFonts: true,
        precision: 3,
      });

      pdf.setProperties({
        title: `${cv.fullName || "Professional"} CV`,
        subject: "Professional Curriculum Vitae",
        author: cv.fullName || "Qorliq CV Builder",
        creator: "Qorliq CV Builder",
        keywords: "CV, resume, candidate, employment, work experience, education, skills",
      });

      if (typeof pdf.setLanguage === "function") pdf.setLanguage("en-GB");

      pdf.setFont("helvetica", "normal");

      const normalizePdfText = (value) => {
        return String(value || "")
          .normalize("NFKC")
          .replace(/[‘’]/g, "'")
          .replace(/[“”]/g, '"')
          .replace(/[–—]/g, "-")
          .replace(/•/g, "-")
          .replace(/…/g, "...")
          .replace(/\u00a0/g, " ")
          .replace(/[^\x20-\x7E£€\n]/g, " ")
          .replace(/[ \t]{2,}/g, " ")
          .trim();
      };

      // Full printable width for natural ATS reading order
      const maxTextWidth = 194;
      const wrappedLines = [];

      extractionLines.forEach((item) => {
        if (!item) {
          wrappedLines.push("");
          return;
        }
        const cleanLine = normalizePdfText(item);
        if (!cleanLine) {
          wrappedLines.push("");
          return;
        }

        const lines = pdf.splitTextToSize(cleanLine, maxTextWidth);
        lines.forEach((line) => wrappedLines.push(String(line)));
      });

      const linesPerPage = Math.max(1, Math.ceil(wrappedLines.length / pageSlices.length));
      const lineStep = 280 / linesPerPage;
      const fontSize = Math.max(5, Math.min(8, lineStep * 2.2));

      pageSlices.forEach((pageSlice, pIndex) => {
        if (pIndex > 0) pdf.addPage();

        /* Render Standard (Non-Suspicious) Selectable ATS Text Layer FIRST.
           Using normal fill-mode text (not "invisible" Tr-3 mode) is important:
           many real-world ATS parsers specifically detect and DISCARD Tr-3
           invisible text because it was historically abused for resume
           keyword-stuffing. Normal fill-mode text is indistinguishable from
           any genuine PDF text, so every ATS/parser extracts it reliably. */
        const startLine = pIndex * linesPerPage;
        const endLine = Math.min(startLine + linesPerPage, wrappedLines.length);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(fontSize);
        pdf.setTextColor(0, 0, 0);
        pdf.setCharSpace(0);

        for (let l = startLine; l < endLine; l++) {
          const line = wrappedLines[l];
          const localIndex = l - startLine;

          const textX = 8;
          const textY = 8 + localIndex * lineStep + fontSize * 0.22;

          if (line) {
            pdf.text(line, textX, textY, { baseline: "alphabetic" });
          }
        }

        /* Render Canvas Background */
        const targetWidth = Math.max(1, Math.round(fullCanvas.width * imageScale));
        const targetHeight = Math.max(1, Math.round(pageHeightCanvas * imageScale));

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = targetWidth;
        pageCanvas.height = targetHeight;

        const context = pageCanvas.getContext("2d");
        if (!context) throw new Error("Unable to create PDF page.");

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, targetWidth, targetHeight);

        context.drawImage(
          fullCanvas,
          0,
          pageSlice.sourceY,
          fullCanvas.width,
          pageSlice.sourceHeight,
          0,
          Math.round(pageSlice.topPadding * imageScale),
          targetWidth,
          Math.round(pageSlice.sourceHeight * imageScale)
        );

        const pageImage =
          format === "PNG"
            ? pageCanvas.toDataURL("image/png")
            : pageCanvas.toDataURL("image/jpeg", imageQuality);

        if (!pageImage || pageImage === "data:,") {
          throw new Error("PDF image generation failed.");
        }

        // Drawn AFTER the text, on top of it: this fully-opaque design image
        // physically covers the text layer underneath with real pixels — not
        // an alpha/opacity trick — so there is zero ghosting at any zoom or
        // print setting, while the text itself remains 100% normal/extractable.
        pdf.addImage(pageImage, format, 0, 0, pdfWidthMm, pdfHeightMm, undefined, imageCompression);
      });

      return pdf;
    };

    /* =========================================
       QUALITY RESOLUTION STEPPING
    ========================================= */
    const totalCanvasPixels = fullCanvas.width * fullCanvas.height;
    const PNG_SAFE_PIXEL_LIMIT = 15_000_000; // conservative threshold to avoid RangeError on giant lossless PNGs

    const qualityPresets = [
      ...(totalCanvasPixels <= PNG_SAFE_PIXEL_LIMIT
        ? [{ imageScale: 1, imageQuality: 1, imageCompression: "NONE", format: "PNG" }]
        : []),
      { imageScale: 1, imageQuality: 0.97, imageCompression: "NONE", format: "JPEG" },
      { imageScale: 1, imageQuality: 0.92, imageCompression: "MEDIUM", format: "JPEG" },
      { imageScale: 0.9, imageQuality: 0.88, imageCompression: "MEDIUM", format: "JPEG" },
    ];

    let finalPdfBlob = null;

    for (const preset of qualityPresets) {
      try {
        const generatedPdf = buildPdf(preset);
        const arrayBuffer = generatedPdf.output("arraybuffer");
        const candidateBlob = new Blob([arrayBuffer], { type: "application/pdf" });

        if (candidateBlob.size <= MAX_PDF_SIZE) {
          finalPdfBlob = candidateBlob;
          break;
        }
      } catch (presetError) {
        console.warn("PDF preset failed, trying next preset:", preset, presetError);
        // If even the last (lowest/safest) preset fails, rethrow so the outer catch can alert the user
        if (preset === qualityPresets[qualityPresets.length - 1]) {
          throw presetError;
        }
      }
    }

    if (!finalPdfBlob) throw new Error("The PDF exceeds 20 MB. Please use a smaller profile photo or shorten the CV.");

    triggerDownload(finalPdfBlob, `${safeFileName(cv.fullName)}.pdf`);

return {
  success: true,
  fileSize:
    finalPdfBlob.size >= 1024 * 1024
      ? `${(finalPdfBlob.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(finalPdfBlob.size / 1024).toFixed(2)} KB`,
};
  } catch (error) {
    console.error("PDF Export Error:", error);
    throw error;
  } finally {
    if (restoreImages) restoreImages();
    removeExportClone(exportElement);

  }
};

  export async function generateWord({ cv, previewElement }) {
      let exportElement = null;
    let restoreImages = null;

    try {
  

      if (document.fonts?.ready) await document.fonts.ready;

      exportElement = createExportClone(previewElement);

      if (!exportElement) throw new Error("Unable to prepare CV for Word.");

      restoreImages = await prepareImagesForPDF(exportElement);
      await waitForImages(exportElement);
      

      const htmlDocx = await import("html-docx-js/dist/html-docx");


      exportElement.querySelectorAll("*").forEach((node) => {
        const computed = getComputedStyle(node);
        for (const property of computed) node.style.setProperty(property, computed.getPropertyValue(property));
      });
      const html = getWordHtml(exportElement.innerHTML);
      const blob = (htmlDocx.default || htmlDocx).asBlob(html, { margins: { top: 0, right: 0, bottom: 0, left: 0 } });

      triggerDownload(blob, `${safeFileName(cv.fullName || "qorliq-cv")}.docx`);

return {
  success: true,
  fileSize:
    blob.size >= 1024 * 1024
      ? `${(blob.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(blob.size / 1024).toFixed(2)} KB`,
};
    } catch (error) {
      console.error("Word download error:", error);
      throw error;
    } finally {
      if (restoreImages) restoreImages();
      removeExportClone(exportElement);
  
    }
  };

