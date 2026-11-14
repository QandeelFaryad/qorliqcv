"use client";

import Link from "next/link";

import {
  ArrowUpRight,
  CheckCheck,
  FileText,
  LayoutTemplate,
  PenLine,
} from "lucide-react";

import {
  motion,
  useReducedMotion,
} from "motion/react";

/* =========================================================
   STEPS DATA
========================================================= */

const steps = [
  {
    number: "01",
    title: "Choose a layout",
    description:
      "Start from a quiet, structured template — or upload an existing CV and we will reflow it into one.",
    icon: LayoutTemplate,
  },
  {
    number: "02",
    title: "Fill it in, with guidance",
    description:
      "Prompts nudge you toward specific, verb-first bullets. The preview updates as you type.",
    icon: PenLine,
  },
  {
    number: "03",
    title: "Check and export",
    description:
      "Run the ATS check, fix anything flagged, then export a pixel-clean PDF or DOCX and apply.",
    icon: CheckCheck,
  },
];

/* =========================================================
   ANIMATION CONFIG
========================================================= */

const ease = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 35,
  },

  visible: {
    opacity: 1,
    y: 0,
  },
};

/* =========================================================
   STEP CARD
========================================================= */

function StepCard({ step, index, reduceMotion }) {
  const Icon = step.icon;

  return (
    <motion.article
      variants={fadeUp}
      transition={{
        duration: 0.8,
        delay: index * 0.12,
        ease,
      }}
      className="
        group
        relative
        min-w-0
        border-t
        border-border-strong
        pt-6
        sm:pt-8
        lg:pt-10
      "
    >
      {/* Animated top cyan line */}

      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.65,
          delay: 0.2 + index * 0.15,
          ease,
        }}
        style={{
          transformOrigin: "left",
        }}
        className="
          absolute
          left-0
          top-[-1px]
          h-[2px]
          w-[64px]
          bg-accent
        "
      />

      {/* Number + Icon */}

      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <motion.span
          whileHover={
            reduceMotion
              ? undefined
              : {
                  y: -5,
                }
          }
          className="
            inline-block
            font-editorial
            text-[80px]
            font-normal
            italic
            leading-[0.9]
            tracking-[-0.09em]
            text-text-primary
            sm:text-[90px]
            lg:text-[100px]
            xl:text-[112px]
          "
        >
          {step.number}
        </motion.span>

        {/* Minimal icon */}

        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-border
            bg-surface
            text-text-secondary
            opacity-70
            transition-all
            duration-300
            group-hover:border-accent
            group-hover:text-accent
            group-hover:opacity-100
            sm:h-11
            sm:w-11
          "
        >
          <Icon
            size={19}
            strokeWidth={1.5}
          />
        </div>
      </div>

      {/* Cyan underline */}

      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.55,
          delay: 0.45 + index * 0.12,
          ease,
        }}
        style={{
          transformOrigin: "left",
        }}
        className="
          mt-5
          h-[4px]
          w-[38px]
          bg-accent
          sm:mt-6
        "
      />

      {/* Step content */}

      <div className="mt-6 max-w-[350px]">
        <h3
          className="
            text-[21px]
            font-semibold
            leading-[1.25]
            tracking-[-0.045em]
            text-text-primary
            sm:text-[23px]
            lg:text-[24px]
          "
        >
          {step.title}
        </h3>

        <p
          className="
            mt-3
            text-[14px]
            leading-[1.85]
            text-text-secondary
            sm:text-[15px]
          "
        >
          {step.description}
        </p>
      </div>
    </motion.article>
  );
}

/* =========================================================
   HOW IT WORKS
========================================================= */

export default function HowItWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="
        relative
        w-full
        overflow-hidden
        bg-background
        py-24
        sm:py-28
        lg:py-36
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[1440px]
          px-5
          sm:px-8
          lg:px-12
          xl:px-16
        "
      >
        {/* ============================================
            SECTION INTRODUCTION
        ============================================ */}

        <div
          className="
            grid
            grid-cols-1
            items-end
            gap-10
            lg:grid-cols-[1.2fr_0.8fr]
            lg:gap-16
          "
        >
          {/* ========================================
              LEFT SIDE
          ======================================== */}

          <div>
            {/* Section label */}

            <motion.div
              initial={{
                opacity: 0,
                y: 15,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.5,
              }}
              transition={{
                duration: 0.6,
                ease,
              }}
              className="
                mb-7
                flex
                items-center
                gap-3
                sm:mb-9
              "
            >
              <span
                className="
                  font-mono
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.18em]
                  text-text-muted
                "
              >
                01 — PROCESS
              </span>

              <span
                aria-hidden="true"
                className="
                  h-px
                  w-9
                  bg-accent
                "
              />
            </motion.div>

            {/* ====================================
                MAIN HEADING
            ==================================== */}

            <h2
              id="how-it-works-heading"
              className="
                max-w-[760px]
                text-[clamp(3rem,6vw,6.5rem)]
                font-semibold
                leading-[1.03]
                tracking-[-0.075em]
                text-text-primary
              "
            >
              {/* First line */}

              <motion.span
                initial={{
                  opacity: 0,
                  y: 45,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.85,
                  ease,
                }}
                className="block"
              >
                Three steps.
              </motion.span>

              {/* Second line */}

              <motion.span
                initial={{
                  opacity: 0,
                  y: 45,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.85,
                  delay: 0.15,
                  ease,
                }}
                className="block"
              >
                One clean{" "}
                <span
                  className="
                    relative
                    inline-block
                    whitespace-nowrap
                  "
                >
                  {/* Editorial italic */}

                  <span
                    className="
                      relative
                      z-10
                      font-editorial
                      font-normal
                      italic
                      tracking-[-0.08em]
                    "
                  >
                    page.
                  </span>

                  {/* Cyan highlight */}

                  <motion.span
                    aria-hidden="true"
                    initial={{
                      scaleX: 0,
                    }}
                    whileInView={{
                      scaleX: 1,
                    }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.9,
                      delay: 0.65,
                      ease,
                    }}
                    style={{
                      transformOrigin: "left",
                    }}
                    className="
                      absolute
                      bottom-[0.07em]
                      left-0
                      z-0
                      h-[0.27em]
                      w-full
                      bg-accent
                    "
                  />
                </span>
              </motion.span>
            </h2>
          </div>

          {/* ========================================
              RIGHT SIDE DESCRIPTION
          ======================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.4,
            }}
            transition={{
              duration: 0.8,
              delay: 0.25,
              ease,
            }}
            className="
              max-w-[420px]
              lg:ml-auto
              lg:pb-3
            "
          >
            <p
              className="
                text-[16px]
                leading-[1.85]
                tracking-[-0.01em]
                text-text-secondary
                sm:text-[17px]
              "
            >
              Most CV tools make you fight the
              layout. This one stays out of the
              way, so your time goes into the
              words.
            </p>
          </motion.div>
        </div>

        {/* ============================================
            THREE STEPS
        ============================================ */}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.12,
          }}
          transition={{
            staggerChildren: 0.14,
          }}
          className="
            mt-16
            grid
            grid-cols-1
            gap-x-10
            gap-y-14
            sm:mt-20
            md:grid-cols-3
            md:gap-x-7
            lg:mt-24
            lg:gap-x-12
            xl:gap-x-16
          "
        >
          {steps.map((step, index) => (
            <StepCard
              key={step.number}
              step={step}
              index={index}
              reduceMotion={reduceMotion}
            />
          ))}
        </motion.div>

        {/* ============================================
            OPTIONAL BOTTOM LINK
        ============================================ */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{ once: true }}
          transition={{
            duration: 0.7,
            delay: 0.25,
            ease,
          }}
          className="
            mt-16
            flex
            justify-start
            sm:mt-20
            lg:mt-24
          "
        >
          <Link
            href="/cv-builder"
            className="
              group
              inline-flex
              items-center
              gap-3
              border-b
              border-border-strong
              pb-2
              text-[14px]
              font-semibold
              text-text-primary
              transition-all
              duration-300
              hover:gap-5
              hover:border-accent
            "
          >
            Start building your CV

            <ArrowUpRight
              size={17}
              strokeWidth={1.8}
              className="
                transition-transform
                duration-300
                group-hover:translate-x-0.5
                group-hover:-translate-y-0.5
              "
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}