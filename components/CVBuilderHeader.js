"use client";

import Image from "next/image";
import Link from "next/link";

import { motion, useReducedMotion } from "motion/react";
import { Check, Loader2, Save } from "lucide-react";

/* =========================================================
   CV BUILDER STEPS
========================================================= */

const STEPS = [
  {
    id: 1,
    label: "Choose template",
    shortLabel: "Template",
  },
  {
    id: 2,
    label: "Enter details",
    shortLabel: "Details",
  },
  {
    id: 3,
    label: "Download CV",
    shortLabel: "Download",
  },
];

/* =========================================================
   STEP INDICATOR
========================================================= */

function StepIndicator({ step, index, reduceMotion }) {
  const isActive = step.id === index + 1;
  const isCompleted = step.id < index + 1;

  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
      <motion.div
        layout={!reduceMotion}
        transition={{
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={`
          flex h-8 w-8 shrink-0 items-center justify-center
          rounded-full border text-[11px] font-bold
          transition-colors duration-300
          sm:h-9 sm:w-9

          ${
            isActive
              ? "border-accent bg-accent text-[#07183F]"
              : isCompleted
                ? "border-accent/40 bg-accent/10 text-text-primary"
                : "border-border bg-background-soft text-text-muted"
          }
        `}
      >
        {isCompleted ? (
          <Check size={15} strokeWidth={2.5} />
        ) : (
          String(step.id).padStart(2, "0")
        )}
      </motion.div>

      <span
        className={`
          hidden whitespace-nowrap text-[12px] font-semibold
          transition-colors duration-300
          lg:inline

          ${
            isActive
              ? "text-text-primary"
              : isCompleted
                ? "text-text-secondary"
                : "text-text-muted"
          }
        `}
      >
        {step.label}
      </span>
    </div>
  );
}

/* =========================================================
   CV BUILDER HEADER
========================================================= */

export default function CVBuilderHeader({
  currentStep = 0,
  isEditMode = false,
  saving = false,
  onSave,
}) {
  const reduceMotion = useReducedMotion();

  // Preserve your existing editor step mapping:
  // 0 = template, 1–5 = details, 6 = download.
  const activeStep =
    currentStep <= 0 ? 1 : currentStep >= 6 ? 3 : 2;

  return (
    <header
      className="
        relative z-30 w-full border-b border-border
        bg-background text-text-primary
      "
    >
      <div
        className="
          mx-auto flex min-h-[76px] w-full max-w-[1600px]
          items-center justify-between gap-3
          px-4 py-3 sm:px-6 lg:px-10
        "
      >
        {/* ========================================
            LOGO — LIGHT AND DARK
        ======================================== */}
<Link
  href="/"
  aria-label="QORLIQ CV homepage"
  className="
    inline-flex shrink-0 items-center
    rounded-md outline-offset-4
    focus-visible:outline-2 focus-visible:outline-accent
  "
>
  {/* Light Mode Logo */}
  <Image
    src="/QORLIQ_cv.svg"
    alt="QORLIQ CV"
    width={185}
    height={60}
    priority
    className="
      h-auto
      w-[105px]
      object-contain
      sm:w-[175px]
      lg:w-[185px]
      dark:hidden
    "
  />

  {/* Dark Mode Logo */}
  <Image
    src="/QORLIQ_cv_dark.svg"
    alt="QORLIQ CV"
    width={185}
    height={60}
    priority
    className="
      hidden
      h-auto
      w-[105px]
      object-contain
      sm:w-[175px]
      lg:w-[185px]
      dark:block
    "
  />
</Link>

        {/* ========================================
            THREE-STEP PROGRESS
        ======================================== */}

        <nav
          aria-label="CV creation progress"
          className="
            flex min-w-0 flex-1 items-center
            justify-center px-1 sm:px-4
          "
        >
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className="flex min-w-0 items-center"
            >
              <div
                aria-current={
                  activeStep === step.id ? "step" : undefined
                }
              >
                <StepIndicator
                  step={step}
                  index={activeStep - 1}
                  reduceMotion={reduceMotion}
                />
              </div>

              {index < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className="
                    mx-2 h-px w-3 bg-border-strong
                    sm:mx-4 sm:w-8 lg:mx-5 lg:w-10
                  "
                >
                  <motion.div
                    initial={false}
                    animate={{
                      width:
                        activeStep > step.id ? "100%" : "0%",
                    }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.4,
                    }}
                    className="h-full bg-accent"
                  />
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* ========================================
            SAVE / UPDATE BUTTON
        ======================================== */}

      </div>

      {/* ========================================
          MOBILE PROGRESS LINE
      ======================================== */}

      <div
        className="h-[2px] w-full bg-border md:hidden"
        aria-hidden="true"
      >
        <motion.div
          initial={false}
          animate={{
            width: `${(activeStep / STEPS.length) * 100}%`,
          }}
          transition={{
            duration: reduceMotion ? 0 : 0.4,
            ease: "easeOut",
          }}
          className="h-full bg-accent"
        />
      </div>
    </header>
  );
}