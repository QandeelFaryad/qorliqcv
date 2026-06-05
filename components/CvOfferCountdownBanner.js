"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  CV_LAST_POPUP_KEY,
  formatCountdown,
  getOfferStartedAt,
  getOfferState,
} from "@/lib/cvOfferCountdown";

export default function CvOfferCountdownBanner() {
  const pathname = usePathname();

  const [offerState, setOfferState] = useState(null);
  const [showLastPopup, setShowLastPopup] = useState(false);

  const isSuccessPage =
    pathname?.includes("/success") ||
    pathname?.includes("/payment-success") ||
    pathname?.includes("/order-success");

  useEffect(() => {
    if (isSuccessPage) return;

    const startedAt = getOfferStartedAt();

    const updateCountdown = () => {
      const nextState = getOfferState(startedAt);

      setOfferState(nextState);

      if (nextState.isLastStage && nextState.isActive) {
        const popupShown = window.sessionStorage.getItem(CV_LAST_POPUP_KEY);

        if (!popupShown) {
          setShowLastPopup(true);
          window.sessionStorage.setItem(CV_LAST_POPUP_KEY, "true");
        }
      }
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [isSuccessPage]);

  if (isSuccessPage || !offerState || offerState.isExpired) {
    return null;
  }

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-[999999] h-[36px] border-b border-white/10 bg-[#080808]/95 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-center px-4">
          <div className="flex max-w-full items-center gap-2 overflow-hidden rounded-full border border-red-400/35 bg-gradient-to-r from-[#7f0000] via-[#b00000] to-[#7f0000] px-3 py-1 text-[10px] font-black uppercase tracking-[0.13em] text-white shadow-[0_0_22px_rgba(220,38,38,0.32)] sm:gap-3 sm:px-4 sm:text-[11px]">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-[12px]">
              🔥
            </span>

            <span className="hidden whitespace-nowrap text-white sm:inline">
              CV Builder Limited Offer
            </span>

            <span className="whitespace-nowrap text-white sm:hidden">
              CV Offer
            </span>

            <span className="h-3 w-px shrink-0 bg-white/25" />

            <span className="hidden whitespace-nowrap text-white/80 md:inline">
              {offerState.stageLabel}
            </span>

            <span className="whitespace-nowrap text-white/75 md:hidden">
              {offerState.isLastStage ? "Final Offer" : "Limited Deal"}
            </span>

            <span className="rounded-full border border-white/30 bg-white/15 px-2.5 py-0.5 font-black tracking-[0.08em] text-white shadow-[0_0_18px_rgba(255,255,255,0.14)]">
              {formatCountdown(offerState.remainingSeconds)}
            </span>

            <span className="hidden whitespace-nowrap text-white/60 lg:inline">
              Offer expires after final countdown
            </span>
          </div>
        </div>
      </div>

      {showLastPopup ? (
        <div className="fixed inset-0 z-[1000000] flex items-center justify-center bg-black/80 px-4">
          <div className="max-w-md rounded-3xl bg-white p-6 text-center text-black shadow-2xl">
            <h2 className="text-2xl font-black">Last Countdown Started</h2>

            <p className="mt-3 text-sm leading-6 text-black/70">
              This is the final 2-minute offer countdown. After this, the CV
              Builder discount will expire.
            </p>

            <button
              type="button"
              onClick={() => setShowLastPopup(false)}
              className="mt-6 rounded-full bg-black px-6 py-3 text-xs font-black uppercase tracking-[0.14em] text-white"
            >
              Continue
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}