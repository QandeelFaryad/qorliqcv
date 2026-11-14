// Keep every source pixel; only move cuts back to nearby line boundaries.
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
      // Each move clears an intersecting line in either column. Limit whitespace
      // to 12%; oversized photos/blocks fall back to a normal page cut.
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
  if (!blob?.size) throw new Error("The generated file is empty. Please try again.");
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  try { anchor.click(); }
  finally {
    anchor.remove();
    // Give browsers time to consume the object URL, especially on mobile.
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
}
