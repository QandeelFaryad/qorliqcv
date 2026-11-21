"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  AlertCircle,
  ArrowUpRight,
  Building2,
  Check,
  CheckCircle2,
  ExternalLink,
  Globe2,
  LoaderCircle,
  Mail,
  MapPin,
  MessageSquareText,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

/* =========================================================
   CONFIGURATION
========================================================= */

const EASE = [0.22, 1, 0.36, 1];

const CONTACT_EMAIL = "support@qorliqcv.com";
const WEBSITE = "https://www.qorliqcv.com/";

const INITIAL_FORM = {
  name: "",
  email: "",
  message: "",
};

const COMPANY_DETAILS = [
  ["Brand", "QORLIQ"],
  ["Operated by", "HOORAB GROUP OF COMPANIES LTD"],
  ["Company Reg. No.", "15800546"],
  ["VAT", "GB-506539390"],
];

const ERROR_DURATION = 7000;

/* =========================================================
   ANIMATION HELPER
========================================================= */

function useReveal() {
  const reducedMotion = useReducedMotion();

  return (delay = 0) => ({
    initial: reducedMotion ? false : { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.12 },
    transition: {
      duration: reducedMotion ? 0 : 0.55,
      delay: reducedMotion ? 0 : delay,
      ease: EASE,
    },
  });
}

/* =========================================================
   REUSABLE FORM INPUT
========================================================= */

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
}) {
  return (
    <div className="group min-w-0">
      <label
        htmlFor={`contact-${name}`}
        className="mb-2 block text-[13px] font-semibold text-text-primary"
      >
        {label}
        <span className="ml-1 text-[#089D98] dark:text-accent">
          *
        </span>
      </label>

      <div className="relative">
        <Icon
          size={18}
          strokeWidth={1.7}
          aria-hidden="true"
          className={`
            pointer-events-none absolute left-4 top-1/2
            -translate-y-1/2 transition-colors duration-200
            ${
              error
                ? "text-red-500"
                : "text-text-muted group-focus-within:text-[#089D98] dark:group-focus-within:text-accent"
            }
          `}
        />

        <input
          id={`contact-${name}`}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={name === "name" ? "name" : "email"}
          maxLength={name === "name" ? 100 : 254}
          required
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `contact-${name}-error` : undefined
          }
          className={`
            h-[52px] w-full rounded-xl border
            bg-background pl-12 pr-4
            text-[14px] text-text-primary
            outline-none transition-all duration-200
            placeholder:text-text-muted focus:ring-[3px]
            ${
              error
                ? "border-red-400 focus:border-red-400 focus:ring-red-400/10"
                : "border-border hover:border-[#b7c6d9] focus:border-[#089D98] focus:ring-[#089D98]/10 dark:hover:border-accent/40"
            }
          `}
        />
      </div>

      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={`contact-${name}-error`}
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 flex items-center gap-1.5 overflow-hidden text-[12px] text-red-500"
          >
            <AlertCircle size={13} aria-hidden="true" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   CONTACT INFORMATION
   RIGHT SIDE — COMPACT SPACING
========================================================= */

function ContactInformation() {
  const reveal = useReveal();

  return (
    <motion.aside
      {...reveal(0.1)}
      aria-labelledby="contact-information-heading"
      className="
        flex h-full min-w-0 flex-col
        overflow-hidden rounded-[24px]
        border border-border bg-surface
        shadow-[0_12px_42px_rgba(7,24,63,0.045)]
        sm:rounded-[26px]
      "
    >
      {/* TOP ACCENT */}

      <div className="h-[3px] w-full shrink-0 bg-gradient-to-r from-[#07183F] via-[#089D98] to-[#04c6ca]" />

      <div className="flex flex-1 flex-col p-5 sm:p-6 lg:p-7">
        {/* HEADING */}

        <div className="border-b border-border pb-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#089D98] dark:text-accent">
            CONTACT INFORMATION
          </p>

          <h2
            id="contact-information-heading"
            className="mt-2 text-[clamp(2rem,3vw,2.7rem)] font-semibold leading-[1.12] tracking-[-0.06em] text-text-primary"
          >
            Get in touch
            <span className="text-[#089D98] dark:text-accent">
              .
            </span>
          </h2>

          <p className="mt-2 max-w-[440px] text-[13px] leading-[1.7] text-text-secondary">
            Have a question about QORLIQ CV? Reach our team for
            account, billing and CV-related assistance.
          </p>
        </div>

        {/* EMAIL + WEBSITE */}

        <div className="space-y-4 border-b border-border py-5">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="group flex min-w-0 items-start gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#089D98]/10 text-[#089D98] dark:text-accent">
              <Mail size={19} strokeWidth={1.8} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[12px] text-text-muted">
                Email address
              </p>
              <p className="mt-0.5 break-all text-[13px] font-semibold text-text-primary transition-colors group-hover:text-[#089D98] dark:group-hover:text-accent">
                {CONTACT_EMAIL}
              </p>
            </div>

            <ArrowUpRight
              size={16}
              className="mt-1 shrink-0 text-text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>

          <a
            href={WEBSITE}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex min-w-0 items-start gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#089D98]/10 text-[#089D98] dark:text-accent">
              <Globe2 size={19} strokeWidth={1.8} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[12px] text-text-muted">
                Official website
              </p>
              <p className="mt-0.5 text-[13px] font-semibold text-text-primary transition-colors group-hover:text-[#089D98] dark:group-hover:text-accent">
                www.qorliqcv.com
              </p>
            </div>

            <ExternalLink
              size={15}
              className="mt-1 shrink-0 text-text-muted"
            />
          </a>
        </div>

        {/* LOCATION */}

        <div className="flex items-start gap-3 border-b border-border py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#089D98]/10 text-[#089D98] dark:text-accent">
            <MapPin size={19} strokeWidth={1.8} />
          </div>

          <div>
            <h3 className="text-[14px] font-semibold text-text-primary">
              Where we are
            </h3>

            <p className="mt-1 text-[13px] leading-[1.7] text-text-secondary">
              United Kingdom
              <br />
              Serving Clients Internationally
            </p>
          </div>
        </div>

        {/* COMPANY */}

        <div className="pt-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#089D98]/10 text-[#089D98] dark:text-accent">
              <Building2 size={19} strokeWidth={1.8} />
            </div>

            <h3 className="text-[14px] font-semibold text-text-primary">
              Company
            </h3>
          </div>

          <dl className="space-y-2.5">
            {COMPANY_DETAILS.map(([label, value]) => (
              <div
                key={label}
                className="grid grid-cols-[105px_minmax(0,1fr)] gap-3 text-[13px] sm:grid-cols-[125px_minmax(0,1fr)]"
              >
                <dt className="text-text-muted">
                  {label}
                </dt>

                <dd className="min-w-0 break-words font-semibold leading-[1.5] text-text-primary">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* BOTTOM NOTE */}

        <div className="mt-auto pt-5">
          <div className="flex items-start gap-2 border-t border-border pt-4 text-[12px] leading-[1.7] text-text-muted">
            <ShieldCheck
              size={16}
              className="mt-0.5 shrink-0 text-[#089D98] dark:text-accent"
            />

            <span>
              Your enquiry will be handled by the QORLIQ CV support team.
            </span>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

/* =========================================================
   SUCCESS POPUP
   DESKTOP — CENTER
   MOBILE — FULL-WIDTH BOTTOM SHEET
========================================================= */

function SuccessPopup({ open, onClose, reducedMotion }) {
  const [mounted, setMounted] = useState(false);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "Tab") {
        const dialog = closeButtonRef.current?.closest(
          '[role="dialog"]'
        );

        if (!dialog) return;

        const focusable = Array.from(
          dialog.querySelectorAll(
            'button:not([disabled]), a[href], input:not([disabled])'
          )
        );

        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === last
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(focusTimer);
      previousFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center sm:p-5">
          {/* BACKDROP */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.25 }}
            className="absolute inset-0 bg-[#07183F]/55 backdrop-blur-[5px]"
            onClick={onClose}
          />

          {/* POPUP */}

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-success-title"
            aria-describedby="contact-success-description"
            initial={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 100, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 100, scale: 0.98 }
            }
            transition={{
              duration: reducedMotion ? 0.1 : 0.48,
              ease: EASE,
            }}
            className="
              relative z-10 w-full
              max-h-[90dvh] overflow-y-auto
              rounded-t-[28px]
              border border-border bg-surface

              px-6 pt-7
              pb-[calc(env(safe-area-inset-bottom)+28px)]

              shadow-[0_-20px_70px_rgba(7,24,63,0.16)]

              sm:max-w-[440px]
              sm:rounded-[26px]
              sm:p-9
              sm:shadow-[0_30px_100px_rgba(7,24,63,0.25)]
            "
          >
            {/* MOBILE HANDLE */}

            <div className="mx-auto mb-7 h-1 w-12 rounded-full bg-border sm:hidden" />

            {/* CLOSE */}

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close success popup"
              className="
                absolute right-5 top-5
                flex h-9 w-9 items-center justify-center
                rounded-lg text-text-muted
                transition-colors hover:bg-background-soft
                hover:text-text-primary
                focus-visible:outline-2
                focus-visible:outline-accent
              "
            >
              <X size={19} />
            </button>

            {/* SUCCESS ICON */}

            <motion.div
              initial={
                reducedMotion
                  ? false
                  : { scale: 0.6, opacity: 0 }
              }
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 230,
                damping: 18,
                delay: reducedMotion ? 0 : 0.12,
              }}
              className="
                mx-auto flex h-[74px] w-[74px]
                items-center justify-center
                rounded-full bg-emerald-50
                dark:bg-emerald-500/10
              "
            >
              <div className="flex h-[53px] w-[53px] items-center justify-center rounded-full bg-emerald-500 text-white">
                <Check size={28} strokeWidth={2.7} />
              </div>
            </motion.div>

            {/* CONTENT */}

            <motion.div
              initial={
                reducedMotion
                  ? false
                  : { opacity: 0, y: 12 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reducedMotion ? 0 : 0.35,
                delay: reducedMotion ? 0 : 0.2,
              }}
              className="mt-6 text-center"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
                SUCCESS
              </p>

              <h2
                id="contact-success-title"
                className="mt-2 text-[25px] font-semibold leading-tight tracking-[-0.05em] text-text-primary"
              >
                Message sent successfully!
              </h2>

              <p
                id="contact-success-description"
                className="mx-auto mt-3 max-w-[340px] text-[14px] leading-[1.8] text-text-secondary"
              >
                Thank you for contacting QORLIQ CV. Your message
                has been received. Our support team will review it.
              </p>
            </motion.div>

            {/* CONFIRMATION */}

            <div className="
              mt-7 flex items-center justify-center gap-2
              rounded-xl border border-emerald-200
              bg-emerald-50 px-4 py-3
              text-[12px] font-medium text-emerald-700
              dark:border-emerald-800/50
              dark:bg-emerald-500/10
              dark:text-emerald-300
            ">
              <CheckCircle2 size={16} />
              Your enquiry has been submitted.
            </div>

            {/* DONE */}

            <motion.button
              type="button"
              onClick={onClose}
              whileHover={
                reducedMotion ? undefined : { y: -2 }
              }
              whileTap={
                reducedMotion ? undefined : { scale: 0.98 }
              }
              className="
                mt-6 flex min-h-[52px] w-full
                items-center justify-center
                rounded-xl bg-[#07183F]
                px-5 text-[14px] font-semibold text-white
                transition-colors hover:bg-[#102B66]
                dark:bg-accent dark:text-[#07183F]
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-accent
              "
            >
              Done
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* =========================================================
   ERROR NOTIFICATION — TOP SLIDE-DOWN
========================================================= */

function ErrorNotification({
  notice,
  onClose,
  reducedMotion,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!notice) return;

    const timer = window.setTimeout(onClose, ERROR_DURATION);

    return () => window.clearTimeout(timer);
  }, [notice, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {notice && (
        <motion.div
          key={notice.id}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          initial={
            reducedMotion
              ? { opacity: 0 }
              : { opacity: 0, y: -70 }
          }
          animate={{ opacity: 1, y: 0 }}
          exit={
            reducedMotion
              ? { opacity: 0 }
              : { opacity: 0, y: -45 }
          }
          transition={{
            duration: reducedMotion ? 0.1 : 0.38,
            ease: EASE,
          }}
          className="
            fixed left-3 right-3
            top-[calc(env(safe-area-inset-top)+14px)]
            z-[10000] mx-auto
            w-auto max-w-[410px]

            sm:left-auto sm:right-6
            sm:top-6 sm:mx-0 sm:w-full
          "
        >
          <div className="
            flex items-start gap-3 rounded-xl
            border border-red-200 bg-red-50
            px-4 py-3.5 text-red-900
            shadow-[0_12px_40px_rgba(7,24,63,0.13)]
            dark:border-red-800
            dark:bg-red-950 dark:text-red-100
          ">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
            />

            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold">
                Something went wrong
              </p>

              <p className="mt-0.5 text-[13px] leading-relaxed">
                {notice.message}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Dismiss error"
              className="shrink-0 rounded-md p-1 opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-current"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* =========================================================
   MAIN CONTACT FORM
========================================================= */

export default function ContactForm() {
  const reducedMotion = useReducedMotion();
  const reveal = useReveal();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [successOpen, setSuccessOpen] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);

  /* =========================================================
     NOTIFICATION HELPERS
  ========================================================= */

  const closeSuccess = useCallback(() => {
    setSuccessOpen(false);
  }, []);

  const closeError = useCallback(() => {
    setErrorNotice(null);
  }, []);

  const showError = (message) => {
    setErrorNotice({
      id: `${Date.now()}-${Math.random()}`,
      message,
    });
  };

  /* =========================================================
     INPUT CHANGE
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateForm = () => {
    const nextErrors = {};

    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (!name) {
      nextErrors.name = "Please enter your name.";
    } else if (name.length < 2) {
      nextErrors.name =
        "Name must contain at least 2 characters.";
    } else if (name.length > 100) {
      nextErrors.name =
        "Name must not exceed 100 characters.";
    }

    if (!email) {
      nextErrors.email = "Please enter your email address.";
    } else if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      nextErrors.email =
        "Please enter a valid email address.";
    }

    if (!message) {
      nextErrors.message =
        "Please enter your message.";
    } else if (message.length < 10) {
      nextErrors.message =
        "Please enter at least 10 characters.";
    } else if (message.length > 3000) {
      nextErrors.message =
        "Message must not exceed 3000 characters.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    setErrorNotice(null);

    if (!validateForm()) {
      showError(
        "Please complete all required fields correctly."
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        if (data.errors) {
          setErrors(data.errors);
        }

        throw new Error(
          data.message ||
            "Unable to send your message. Please try again."
        );
      }

      // Reset only after successful submission
      setForm(INITIAL_FORM);
      setErrors({});

      // Show animated success popup
      setSuccessOpen(true);
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section
      id="contact-form"
      aria-label="Contact QORLIQ CV"
      className="relative bg-background py-14 sm:py-20 lg:py-24"
    >
      <div className="mx-auto w-full max-w-[1232px] px-5 sm:px-8 lg:px-10">
        {/* ================================================
            TWO-COLUMN LAYOUT
            LEFT: CONTACT FORM
            RIGHT: CONTACT INFORMATION
        ================================================= */}

        <div className="
          grid grid-cols-1 items-stretch gap-6
          lg:grid-cols-[1.05fr_0.95fr]
          lg:gap-7 xl:gap-8
        ">
          {/* ================================================
              LEFT SIDE — CONTACT FORM
          ================================================= */}

          <motion.div
            {...reveal(0)}
            className="
              flex h-full min-w-0 flex-col
              overflow-hidden rounded-[24px]
              border border-border bg-surface
              shadow-[0_12px_42px_rgba(7,24,63,0.045)]
              sm:rounded-[26px]
            "
          >
            {/* TOP ACCENT */}

            <div className="h-[3px] w-full shrink-0 bg-gradient-to-r from-[#07183F] via-[#089D98] to-[#04c6ca]" />

            <div className="flex flex-1 flex-col p-5 sm:p-6 lg:p-7">
              {/* FORM HEADER */}

              <div className="mb-6 border-b border-border pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#089D98]/10 text-[#089D98] dark:text-accent">
                    <MessageSquareText
                      size={20}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div>
                    <h2
                      id="contact-form-heading"
                      className="text-[20px] font-semibold tracking-[-0.04em] text-text-primary"
                    >
                      Send us a message
                    </h2>

                    <p className="mt-1 text-[13px] leading-6 text-text-secondary">
                      Fill in the details below. We'll be happy to help.
                    </p>
                  </div>
                </div>
              </div>

              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-1 flex-col"
              >
                {/* NAME + EMAIL */}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField
                    label="Full name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    icon={UserRound}
                    error={errors.name}
                  />

                  <FormField
                    label="Email address"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    icon={Mail}
                    error={errors.email}
                  />
                </div>

                {/* MESSAGE */}

                <div className="mt-5">
                  <label
                    htmlFor="contact-message"
                    className="mb-2 block text-[13px] font-semibold text-text-primary"
                  >
                    Your message
                    <span className="ml-1 text-[#089D98] dark:text-accent">
                      *
                    </span>
                  </label>

                  <div className="group relative">
                    <MessageSquareText
                      size={18}
                      strokeWidth={1.7}
                      aria-hidden="true"
                      className={`
                        pointer-events-none absolute left-4 top-[18px]
                        transition-colors duration-200
                        ${
                          errors.message
                            ? "text-red-500"
                            : "text-text-muted group-focus-within:text-[#089D98] dark:group-focus-within:text-accent"
                        }
                      `}
                    />

                    <textarea
                      id="contact-message"
                      name="message"
                      rows={6}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Please describe how we can help you..."
                      minLength={10}
                      maxLength={3000}
                      required
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={
                        errors.message
                          ? "contact-message-error"
                          : undefined
                      }
                      className={`
                        min-h-[170px] w-full resize-y
                        rounded-xl border bg-background
                        py-4 pl-12 pr-4
                        text-[14px] leading-7 text-text-primary
                        outline-none transition-all duration-200
                        placeholder:text-text-muted focus:ring-[3px]
                        ${
                          errors.message
                            ? "border-red-400 focus:border-red-400 focus:ring-red-400/10"
                            : "border-border hover:border-[#b7c6d9] focus:border-[#089D98] focus:ring-[#089D98]/10 dark:hover:border-accent/40"
                        }
                      `}
                    />
                  </div>

                  <div className="mt-2 flex items-start justify-between gap-3">
                    {errors.message ? (
                      <p
                        id="contact-message-error"
                        role="alert"
                        className="flex items-center gap-1.5 text-[12px] text-red-500"
                      >
                        <AlertCircle size={13} />
                        {errors.message}
                      </p>
                    ) : (
                      <span />
                    )}

                    <span className="shrink-0 text-[11px] tabular-nums text-text-muted">
                      {form.message.length}/3000
                    </span>
                  </div>
                </div>

                {/* BOTTOM ACTION */}

                <div className="mt-auto pt-6">
                  <div className="border-t border-border pt-5">
                    <div className="flex items-start gap-2 text-[12px] leading-[1.7] text-text-muted">
                      <ShieldCheck
                        size={16}
                        className="mt-0.5 shrink-0 text-[#089D98] dark:text-accent"
                        aria-hidden="true"
                      />

                      <span>
                        Please avoid sharing passwords or payment card
                        information.
                      </span>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={
                        reducedMotion || submitting
                          ? undefined
                          : { y: -2 }
                      }
                      whileTap={
                        reducedMotion || submitting
                          ? undefined
                          : { scale: 0.985 }
                      }
                      className="
                        mt-5 flex min-h-[52px] w-full
                        items-center justify-center gap-2.5
                        rounded-xl bg-[#07183F] px-6
                        text-[14px] font-semibold text-white
                        transition-colors 
                        disabled:cursor-not-allowed
                        disabled:opacity-65
                        dark:bg-accent dark:text-[#07183F]
                        focus-visible:outline-2
                        focus-visible:outline-offset-2
                        focus-visible:outline-accent
                      "
                    >
                      {submitting ? (
                        <>
                          <LoaderCircle
                            size={18}
                            className="animate-spin"
                            aria-hidden="true"
                          />
                          Sending message...
                        </>
                      ) : (
                        <>
                          Send message
                          <ArrowUpRight
                            size={18}
                            aria-hidden="true"
                          />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>

          {/* ================================================
              RIGHT SIDE — CONTACT INFORMATION
          ================================================= */}

          <ContactInformation />
        </div>
      </div>

      {/* SUCCESS POPUP */}

      <SuccessPopup
        open={successOpen}
        onClose={closeSuccess}
        reducedMotion={reducedMotion}
      />

      {/* ERROR NOTIFICATION */}

      <ErrorNotification
        notice={errorNotice}
        onClose={closeError}
        reducedMotion={reducedMotion}
      />
    </section>
  );
}