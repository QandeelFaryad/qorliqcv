// PDF and Word exports use a Blob URL. No window.open(), location changes,
// form submission, or navigation to the generated document.
export function paginateContent(totalHeight, pageHeight, ranges = [], padding = 0) {
  if (!(totalHeight > 0) || !(pageHeight > 0) || padding * 2 >= pageHeight) {
    throw new Error("Invalid PDF page dimensions.");
  }

  const slices = [];
  let sourceY = 0;
  while (sourceY < totalHeight) {
    const topPadding = slices.length ? padding : 0;
    const remaining = totalHeight - sourceY;
    const available = pageHeight - topPadding - (remaining > pageHeight - topPadding ? padding : 0);
    const ideal = Math.min(sourceY + available, totalHeight);
    let cut = ideal;
    if (ideal < totalHeight) {
      const minimum = sourceY + available * 0.88;
      while (true) {
        const crossing = ranges.filter((range) => range.top < cut && range.bottom > cut);
        if (!crossing.length) break;
        const next = Math.min(...crossing.map((range) => range.top));
        if (next <= minimum || next >= cut) { cut = ideal; break; }
        cut = next;
      }
    }
    slices.push({ sourceY, sourceHeight: cut - sourceY, topPadding });
    sourceY = cut;
  }
  return slices;
}

export function triggerDownload(blob, filename) {
  if (!(blob instanceof Blob) || blob.size === 0) {
    throw new Error("The generated file is empty. Please try again.");
  }

  const safeName = String(filename || "QORLIQ-CV.pdf").replace(/[\\/\u0000-\u001f]/g, "_");
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = safeName;
  anchor.target = "_self";
  anchor.rel = "noopener noreferrer";
  anchor.style.display = "none";

  try {
    document.body.appendChild(anchor);
    anchor.click();
  } finally {
    anchor.remove();
    // Do not revoke immediately: browsers may still be consuming the URL.
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  }
}
