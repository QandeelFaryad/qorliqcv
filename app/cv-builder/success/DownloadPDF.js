"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import DownloadNotification from "./DownloadNotification";

const DownloadContext = createContext(null);

async function downloadRequest(method, body) {
  const response = await fetch("/api/downloads", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false || data.code === "DOWNLOAD_LIMIT_REACHED" || (method === "PUT" && !data.success)) {
    const error = new Error(data.message || data.error || (method === "PUT" ? "Unable to authorize download." : "Unable to save download history."));
    error.code = data.code;
    throw error;
  }
  return data;
}

export function DownloadProvider({ cv, cvRef, hasAccess, children }) {
  const lock = useRef(false);
  const mounted = useRef(true);
  const [operation, setOperation] = useState(null);
  const [notice, setNotice] = useState(null);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const download = async (format) => {
    if (lock.current) return;
    lock.current = true;
    let started = false;
    const label = format === "pdf" ? "PDF" : "Word";
    const notify = (message, tone) => {
      if (mounted.current) setNotice({ id: Date.now(), message, tone });
    };
    const stage = (phase) => { if (mounted.current) setOperation({ format, phase }); };
    try {
      if (!hasAccess) throw new Error("Your subscription is inactive or expired. Please renew your plan.");
      if (navigator.onLine === false) throw new Error("You are offline. Reconnect and try again.");
      if (!cvRef.current) throw new Error("CV preview not found. Please refresh and try again.");
      const cvId = cv?._id || cv?.id || new URLSearchParams(window.location.search).get("cvId");
      if (typeof cvId !== "string" || !/^[a-fA-F0-9]{24}$/.test(cvId)) throw new Error("CV ID missing or invalid. Please reload your CV.");
      stage("authorizing");
      // Preserve the existing server contract: PUT consumes the allowance.
      // No file or history is created if authorization is refused.
      const engine = await import("./cvExport");
      await downloadRequest("PUT", { cvId });
      stage("generating");
      const result = await (format === "pdf" ? engine.generatePDF : engine.generateWord)({ cv, previewElement: cvRef.current });
      if (!result?.success) throw new Error(`Unable to generate ${label}. Please try again.`);
      started = true;
      stage("history");
      await downloadRequest("POST", { cvId, format, fileSize: result.fileSize });
      notify(`${label} download started.`, "success");
    } catch (error) {
      notify(started ? `${label} download started, but history could not be saved. ${error.message || "Please try again later."}` : error.message || `Unable to download ${label}.`, started || error.code === "DOWNLOAD_LIMIT_REACHED" ? "warning" : "error");
    } finally {
      lock.current = false;
      if (mounted.current) setOperation(null);
    }
  };

  return (
    <DownloadContext.Provider value={{ operation, download }}>
      {children}
      <DownloadNotification notice={notice} onDismiss={() => setNotice(null)} />
    </DownloadContext.Provider>
  );
}

function DownloadButton({ format }) {
  const context = useContext(DownloadContext);
  if (!context) throw new Error("Download buttons must be inside DownloadProvider.");
  const { operation, download } = context;
  const active = operation?.format === format;
  const label = format === "pdf" ? "PDF" : "MS Word";
  const text = !active ? `Download ${label}` : operation.phase === "authorizing" ? "Checking access..." : operation.phase === "history" ? "Saving history..." : `Preparing ${label}...`;
  return (
    <button type="button" onClick={() => download(format)} disabled={Boolean(operation)} aria-busy={active}
      className={`min-h-12 w-full rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.1em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B88A2C] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto ${format === "pdf" ? "bg-[#B88A2C] text-black hover:bg-white" : "border border-white/25 text-white hover:border-[#B88A2C] hover:text-[#B88A2C]"}`}>
      {text}
    </button>
  );
}

export default function DownloadPDF() { return <DownloadButton format="pdf" />; }
export function DownloadWord() { return <DownloadButton format="word" />; }
