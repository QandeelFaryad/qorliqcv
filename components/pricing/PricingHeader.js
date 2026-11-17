"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Check,
  FileText,
  CreditCard,
  Download,
} from "lucide-react";

/* =========================================================
   CHECKOUT STEPS
========================================================= */

const checkoutSteps = [
  {
    id: 1,
    title: "Create CV",
    icon: FileText,
  },
  {
    id: 2,
    title: "Choose Plan",
    icon: Check,
  },
  {
    id: 3,
    title: "Payment Details",
    icon: CreditCard,
  },
  {
    id: 4,
    title: "Download CV",
    icon: Download,
  },
];

/* =========================================================
   GET COMPLETED STEP FROM PAGE URL
========================================================= */

function getCompletedStep(pathname) {
  if (pathname.startsWith("/cv-builder/success")) {
    return 4;
  }

  if (pathname.startsWith("/checkout")) {
    return 3;
  }

  if (pathname.startsWith("/pricing")) {
    return 2;
  }

  if (pathname.startsWith("/cv-builder")) {
    return 1;
  }

  return 0;
}

/* =========================================================
   PRICING HEADER
========================================================= */

export default function PricingHeader() {
  const pathname = usePathname();

  const completedStep = getCompletedStep(pathname || "");

  return (
    <header
      className="
        relative z-40 w-full
        border-b border-border
        bg-background
      "
    >
      <div
        className="
          mx-auto flex w-full max-w-[1440px]
          items-center justify-center
          px-4 py-4
          sm:px-8

          lg:min-h-[100px]
          lg:justify-between
          lg:gap-10
          lg:px-12

          xl:px-16
        "
      >
        {/* ================================================
            LOGO
        ================================================= */}

        <Link
          href="/"
          aria-label="QORLIQ CV homepage"
          className="
            inline-flex shrink-0 items-center
            rounded-md outline-offset-4
            focus-visible:outline-2
            focus-visible:outline-accent
          "
        >
          {/* LIGHT MODE LOGO */}

          <Image
            src="/QORLIQ_cv.svg"
            alt="QORLIQ CV"
            width={185}
            height={56}
            priority
            className="
              h-auto w-[158px]
              lg:w-[185px]
              dark:hidden
            "
          />

          {/* DARK MODE LOGO */}

          <Image
            src="/QORLIQ_cv_dark.svg"
            alt="QORLIQ CV"
            width={185}
            height={56}
            priority
            className="
              hidden h-auto w-[158px]
              lg:w-[185px]
              dark:block
            "
          />
        </Link>

        {/* ================================================
            CHECKOUT STEPS — DESKTOP ONLY
        ================================================= */}

        <nav
          aria-label="Checkout progress"
          className="
            hidden min-w-0
            max-w-[850px] flex-1
            lg:block
          "
        >
          <ol className="flex w-full items-start">
            {checkoutSteps.map((step, index) => {
              const isCompleted = step.id <= completedStep;

              const isCurrent =
                step.id === completedStep;

              const Icon = step.icon;

              return (
                <li
                  key={step.id}
                  aria-current={
                    isCurrent ? "step" : undefined
                  }
                  className="
                    relative flex min-w-0 flex-1
                    flex-col items-center text-center
                  "
                >
                  {/* ========================================
                      CONNECTOR LINE
                  ======================================== */}

                  {index < checkoutSteps.length - 1 && (
                    <span
                      aria-hidden="true"
                      className={`
                        absolute
                        left-[calc(50%+22px)]
                        right-[calc(-50%+22px)]
                        top-[19px]
                        h-[2px]
                        transition-colors duration-500

                        ${
                          step.id < completedStep
                            ? "bg-accent"
                            : "bg-border-strong"
                        }
                      `}
                    />
                  )}

                  {/* ========================================
                      STEP CIRCLE
                  ======================================== */}

                  <span
                    className={`
                      relative z-10
                      flex h-10 w-10
                      items-center justify-center
                      rounded-full border-2

                      transition-all duration-300
                      ease-in-out

                      ${
                        isCompleted
                          ? `
                            border-accent
                            bg-accent
                            text-[#07183F]
                            shadow-[0_0_0_4px_rgba(0,213,223,0.08)]
                          `
                          : `
                            border-border-strong
                            bg-surface
                            text-text-muted
                          `
                      }
                    `}
                  >
                    {isCompleted ? (
                      <Check
                        size={19}
                        strokeWidth={2.5}
                        className="
                          animate-in
                          zoom-in-75
                          duration-300
                        "
                      />
                    ) : (
                      <Icon
                        size={18}
                        strokeWidth={1.8}
                      />
                    )}
                  </span>

                  {/* ========================================
                      STEP LABEL
                  ======================================== */}

                  <span
                    className={`
                      mt-2.5 block
                      max-w-[125px]

                      text-[12px]
                      font-semibold
                      leading-[1.4]

                      transition-colors duration-300

                      ${
                        isCompleted
                          ? "text-text-primary"
                          : "text-text-muted"
                      }
                    `}
                  >
                    {step.title}
                  </span>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </header>
  );
}