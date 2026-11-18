"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AlertCircle, AlertTriangle, ArrowRight, CheckCircle2, Download, X } from "lucide-react";

export default function DownloadNotification({ notice, onDismiss }) {
  const reduceMotion = useReducedMotion();
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const isLimit = Boolean(notice && (notice.code === "DOWNLOAD_LIMIT_REACHED" || /download limit|limit.{0,30}reached/i.test(notice.message || "")));
  const success = notice?.tone === "success";
  const warning = notice?.tone === "warning";

  useEffect(() => {
    if (!notice || isLimit || !success) return;
    const timer = setTimeout(onDismiss, 5200);
    return () => clearTimeout(timer);
  }, [notice, isLimit, success, onDismiss]);

  useEffect(() => {
    if (!isLimit) return;
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => closeRef.current?.focus());
    function onKeyDown(event) {
      if (event.key === "Escape") { event.preventDefault(); onDismiss(); return; }
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll('button:not([disabled]), a[href]');
      if (!focusable?.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, [isLimit, onDismiss]);

  return (
    <AnimatePresence mode="wait">
      {notice && (isLimit ? (
        <motion.div key={`limit-${notice.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.2 }}
          className="fixed inset-0 z-[220] flex items-end justify-center bg-[#07183F]/60 backdrop-blur-[3px] sm:items-center sm:p-5"
          onMouseDown={(e) => { if (e.target === e.currentTarget) onDismiss(); }}>
          <motion.section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="limit-title"
            initial={reduceMotion ? false : { opacity: 0, y: 130 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 140 }}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 310, damping: 32 }}
            className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] border border-border bg-surface px-6 pt-8 pb-[calc(24px+env(safe-area-inset-bottom))] text-center shadow-[0_25px_70px_rgba(7,24,63,.22)] sm:max-w-[440px] sm:rounded-[26px] sm:p-9 sm:[transform:none]">
            <div className="mx-auto mb-5 h-1 w-12 rounded-full bg-border-strong sm:hidden" />
            <button ref={closeRef} type="button" aria-label="Close popup" onClick={onDismiss} className="absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-text-secondary hover:bg-background-soft"><X size={19} /></button>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400"><Download size={29} /></div>
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[.14em] text-amber-700 dark:text-amber-400">Download limit reached</p>
            <h2 id="limit-title" className="mt-2 text-[27px] font-semibold tracking-[-.05em] text-text-primary">Upgrade your downloads</h2>
            <p className="mx-auto mt-3 max-w-[350px] text-[14px] leading-7 text-text-secondary">You've reached your plan's download allowance. Explore available plans to continue downloading your CV.</p>
            <Link href="/pricing" onClick={onDismiss} className="mt-7 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#07183F] px-5 text-[14px] font-semibold text-white  dark:bg-accent dark:text-[#07183F]">View plans <ArrowRight size={17}/></Link>
            <button type="button" onClick={onDismiss} className="mt-3 min-h-11 w-full cursor-pointer rounded-xl text-[13px] font-semibold text-text-secondary hover:bg-background-soft">Maybe later</button>
          </motion.section>
        </motion.div>
      ) : (
        <div key={`toast-${notice.id}`} className="pointer-events-none fixed inset-x-3 top-4 z-[210] flex justify-center sm:top-6" role={success ? "status" : "alert"} aria-live={success ? "polite" : "assertive"}>
          <motion.div initial={{ opacity: 0, y: reduceMotion ? 0 : -14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduceMotion ? 0 : -12 }} transition={{ duration: reduceMotion ? 0 : .3 }}
            className={`pointer-events-auto flex w-full max-w-[480px] items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-[0_20px_55px_rgba(15,23,42,.18)] ${success ? "border-emerald-200 bg-emerald-50 text-emerald-900" : warning ? "border-amber-200 bg-amber-50 text-amber-950" : "border-red-200 bg-red-50 text-red-900"}`}>
            {success ? <CheckCircle2 size={21} className="mt-0.5 shrink-0 text-emerald-600"/> : warning ? <AlertTriangle size={21} className="mt-0.5 shrink-0 text-amber-600"/> : <AlertCircle size={21} className="mt-0.5 shrink-0 text-red-600"/>}
            <div className="min-w-0 flex-1"><p className="text-[13px] font-bold">{success ? "Download ready" : warning ? "Please note" : "Something went wrong"}</p><p className="mt-0.5 break-words text-[13px] leading-relaxed">{notice.message}</p></div>
            <button type="button" onClick={onDismiss} aria-label="Dismiss notification" className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg hover:bg-black/5"><X size={16}/></button>
          </motion.div>
        </div>
      ))}
    </AnimatePresence>
  );
}
