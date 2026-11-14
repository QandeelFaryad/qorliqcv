"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function DownloadNotification({ notice, onDismiss }) {
  const [closing, setClosing] = useState(false);
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  const message = String(notice?.message || "");

  const isLimitReached =
    notice?.code === "DOWNLOAD_LIMIT_REACHED" ||
    /download limit|limit.{0,30}reached/i.test(message);

  const isSuccess = notice?.tone === "success";

  useEffect(() => {
    setClosing(false);

    if (!notice || !isSuccess || isLimitReached) return;

    const timer = setTimeout(() => setClosing(true), 5500);

    return () => clearTimeout(timer);
  }, [notice, isSuccess, isLimitReached]);

  useEffect(() => {
    if (!closing) return;

    const timer = setTimeout(() => {
      onDismissRef.current?.();
    }, 200);

    return () => clearTimeout(timer);
  }, [closing, notice]);

  // Keep keyboard focus inside the upgrade popup.
  useEffect(() => {
    if (!notice || !isLimitReached) return;

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setClosing(true);
        return;
      }

      if (event.key !== "Tab") return;

      const elements = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), a[href], [tabindex="0"]'
      );

      if (!elements?.length) return;

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);

      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [notice, isLimitReached]);

  if (!notice) return null;

  const title = isSuccess
    ? "Download ready"
    : notice.tone === "warning"
      ? "Please note"
      : "Download unavailable";

  return (
    <>
      {isLimitReached ? (
        <div
          className={`modal-overlay ${closing ? "closing" : ""}`}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setClosing(true);
            }
          }}
        >
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Upgrade your limit"
            className="upgrade-modal"
          >
            <button
              ref={closeButtonRef}
              type="button"
              className="modal-close"
              aria-label="Close upgrade popup"
              onClick={() => setClosing(true)}
            >
              ×
            </button>

            <div className="upgrade-icon" aria-hidden="true">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 16V4M7 9l5-5 5 5" />
                <path d="M5 16v4h14v-4" />
              </svg>
            </div>

            <span className="eyebrow">DOWNLOAD LIMIT REACHED</span>

            <h2>Upgrade your limit</h2>

            <p className="modal-description">
              You have reached your current download limit. Explore our
              plans to upgrade your download allowance.
            </p>

            <Link
              href="/pricing"
              className="upgrade-button"
              onClick={() => onDismissRef.current?.()}
            >
              Upgrade now
              <span aria-hidden="true">→</span>
            </Link>

            <button
              type="button"
              className="later-button"
              onClick={() => setClosing(true)}
            >
              Maybe later
            </button>
          </section>
        </div>
      ) : (
        <aside
          role={notice.tone === "error" ? "alert" : "status"}
          aria-atomic="true"
          className={`download-notice ${closing ? "closing" : ""}`}
        >
          <div className="notice-icon" aria-hidden="true">
            {isSuccess ? "✓" : "!"}
          </div>

          <div className="notice-copy">
            <strong>{title}</strong>
            <p>{message}</p>
          </div>

          <button
            type="button"
            className="notice-close"
            aria-label="Dismiss notification"
            onClick={() => setClosing(true)}
          >
            ×
          </button>
        </aside>
      )}

      <style jsx>{`
        .download-notice {
          position: fixed;
          z-index: 1000;
          top: calc(16px + env(safe-area-inset-top, 0px));
          right: 12px;
          left: 12px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          border: 1px solid #b88a2c80;
          border-radius: 18px;
          background: #171511;
          color: #fff;
          box-shadow: 0 12px 40px #0003;
          animation: notice-in 0.2s ease-out both;
        }

        .notice-icon {
          display: grid;
          flex-shrink: 0;
          place-items: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #b88a2c;
          color: #111;
          font-weight: 800;
        }

        .notice-copy {
          flex: 1;
          min-width: 0;
          font-size: 14px;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .notice-copy p {
          margin: 4px 0 0;
          color: #e2ded5;
          white-space: pre-line;
        }

        .notice-close,
        .modal-close {
          display: grid;
          flex-shrink: 0;
          place-items: center;
          width: 44px;
          height: 44px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: transparent;
          cursor: pointer;
          font-size: 26px;
          line-height: 1;
        }

        .notice-close {
          margin: -8px;
          color: #fff;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow-y: auto;
          background: rgba(15, 13, 10, 0.65);
          animation: overlay-in 0.2s ease-out both;
        }

        .upgrade-modal {
          position: relative;
          box-sizing: border-box;
          width: 100%;
          max-width: 440px;
          max-height: calc(100dvh - 40px);
          overflow-y: auto;
          padding: 36px 28px 24px;
          border: 1px solid #e8dcc4;
          border-radius: 24px;
          background: #fffdf8;
          text-align: center;
          box-shadow: 0 24px 80px #0004;
          animation: modal-in 0.2s ease-out both;
        }

        .modal-close {
          position: absolute;
          top: 10px;
          right: 10px;
          color: #756b5a;
          transition: background 0.2s ease;
        }

        .modal-close:hover {
          background: #f1eadc;
        }

        .upgrade-icon {
          display: grid;
          place-items: center;
          width: 64px;
          height: 64px;
          margin: 0 auto 22px;
          border: 1px solid #dfc995;
          border-radius: 20px;
          background: #f7edda;
          color: #92691c;
        }

        .eyebrow {
          display: block;
          color: #89651f;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.16em;
        }

        h2 {
          margin: 12px 0;
          color: #211c14;
          font-size: 28px;
          font-weight: 750;
          line-height: 1.2;
          letter-spacing: -0.035em;
        }

        .modal-description {
          margin: 0 0 26px;
          color: #716859;
          font-size: 14px;
          line-height: 1.7;
        }

        .upgrade-modal :global(.upgrade-button) {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          box-sizing: border-box;
          width: 100%;
          min-height: 50px;
          padding: 14px 20px;
          border-radius: 12px;
          background: #b88a2c;
          color: #17120a;
          font-size: 14px;
          font-weight: 800;
          text-decoration: none;
          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }

        .upgrade-modal :global(.upgrade-button:hover) {
          background: #c99a3b;
          transform: translateY(-1px);
        }

        .later-button {
          min-height: 44px;
          margin-top: 10px;
          padding: 8px 16px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #716859;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        button:focus-visible,
        .upgrade-modal :global(.upgrade-button:focus-visible) {
          outline: 2px solid #b88a2c;
          outline-offset: 4px;
        }

        .download-notice.closing {
          animation: notice-out 0.2s ease-in both;
        }

        .modal-overlay.closing {
          animation: overlay-out 0.2s ease-in both;
        }

        @keyframes notice-in {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes notice-out {
          to {
            opacity: 0;
            transform: translateY(-12px);
          }
        }

        @keyframes overlay-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes overlay-out {
          to {
            opacity: 0;
          }
        }

        @keyframes modal-in {
          from {
            transform: translateY(12px) scale(0.98);
          }
          to {
            transform: translateY(0) scale(1);
          }
        }

        @media (min-width: 768px) {
          .download-notice {
            top: calc(24px + env(safe-area-inset-top, 0px));
            right: 24px;
            left: auto;
            width: 400px;
            max-width: calc(100vw - 48px);
            box-sizing: border-box;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .download-notice,
          .download-notice.closing,
          .modal-overlay,
          .modal-overlay.closing,
          .upgrade-modal {
            animation-duration: 0.01ms;
          }

          .upgrade-modal :global(.upgrade-button) {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}