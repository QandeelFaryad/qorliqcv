"use client";

import { motion, useReducedMotion } from "motion/react";
import { Check, Minus } from "lucide-react";

/* =========================================================
   COMPARISON DATA
   Based on the QORLIQ CV PDF
========================================================= */

const comparisons = [
  {
    usual: "Rainbow templates fighting for attention",
    qorliq: "Quiet typography that lets your work lead",
  },
  {
    usual: "Blank boxes and no guidance on what to write",
    qorliq:
      "Prompts that push you toward specific, verb-first bullets",
  },
  {
    usual: "Surprises at the final export step",
    qorliq: "A live preview of exactly what you will send",
  },
  {
    usual: "Dozens of near-identical layouts",
    qorliq: "A few layouts, each one considered",
  },
];

/* =========================================================
   ANIMATION CONFIG
========================================================= */

const ease = [0.22, 1, 0.36, 1];

/* =========================================================
   COMPARISON ROW
========================================================= */

function ComparisonRow({ item, index }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 25,
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.25,
      }}
      transition={{
        duration: 0.65,
        delay: index * 0.09,
        ease,
      }}
      className="
        group
        grid
        grid-cols-1
        border-b
        border-border
        md:grid-cols-2
      "
    >
      {/* ========================================
          THE USUAL BUILDER
      ======================================== */}

      <div
        className="
          flex
          min-h-[92px]
          items-center
          gap-4
          px-5
          py-5
          sm:px-7
          lg:min-h-[104px]
          lg:px-9
        "
      >
        <span
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-border-strong
            text-text-muted
          "
        >
          <Minus size={15} strokeWidth={1.8} />
        </span>

        <p
          className="
            max-w-[420px]
            text-[14px]
            leading-[1.7]
            text-text-secondary
            sm:text-[15px]
          "
        >
          {item.usual}
        </p>
      </div>

      {/* ========================================
          QORLIQ CV
      ======================================== */}

      <div
        className="
          relative
          flex
          min-h-[92px]
          items-center
          gap-4
          border-t
          border-border
          bg-background-soft
          px-5
          py-5
          transition-colors
          duration-300
          group-hover:bg-background-muted
          sm:px-7
          md:border-t-0
          md:border-l
          lg:min-h-[104px]
          lg:px-9
        "
      >
        {/* Cyan accent */}

        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.35,
            delay: 0.2 + index * 0.1,
            ease,
          }}
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-accent
            text-[#061747]
          "
        >
          <Check size={16} strokeWidth={2.2} />
        </motion.span>

        <p
          className="
            max-w-[460px]
            text-[14px]
            font-semibold
            leading-[1.7]
            tracking-[-0.01em]
            text-text-primary
            sm:text-[15px]
          "
        >
          {item.qorliq}
        </p>
      </div>
    </motion.div>
  );
}

/* =========================================================
   DIFFERENCE SECTION
========================================================= */

export default function DifferenceSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="difference"
      aria-labelledby="difference-heading"
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
            SECTION INTRO
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
          {/* LEFT HEADING */}

          <div>
            <motion.div
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 15,
                    }
              }
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
              className="
                mb-8
                flex
                items-center
                gap-3
              "
            >
              <span
                className="
                  font-mono
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.19em]
                  text-text-muted
                "
              >
                04 — THE DIFFERENCE
              </span>

              <span
                aria-hidden="true"
                className="h-px w-9 bg-accent"
              />
            </motion.div>

            {/* HEADING */}

            <h2
              id="difference-heading"
              className="
                max-w-[780px]
                text-[clamp(3rem,6vw,6.5rem)]
                font-semibold
                leading-[1.05]
                tracking-[-0.075em]
                text-text-primary
              "
            >
              <motion.span
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                        y: 35,
                      }
                }
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  ease,
                }}
                className="block"
              >
                Why it feels
              </motion.span>

              <motion.span
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                        y: 35,
                      }
                }
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  delay: 0.14,
                  ease,
                }}
                className="block"
              >
                <span className="relative inline-block">
                  <span
                    className="
                      relative
                      z-10
                      font-editorial
                      font-normal
                      italic
                      tracking-[-0.07em]
                    "
                  >
                    different.
                  </span>

                  {/* Animated cyan highlight */}

                  <motion.span
                    aria-hidden="true"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.85,
                      delay: 0.65,
                      ease,
                    }}
                    style={{
                      transformOrigin: "left center",
                    }}
                    className="
                      absolute
                      bottom-[0.07em]
                      left-0
                      z-0
                      h-[0.28em]
                      w-full
                      bg-accent
                    "
                  />
                </span>
              </motion.span>
            </h2>
          </div>

          {/* RIGHT DESCRIPTION */}

          <motion.p
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 25,
                  }
            }
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease,
            }}
            className="
              max-w-[420px]
              text-[16px]
              leading-[1.85]
              tracking-[-0.01em]
              text-text-secondary
              lg:ml-auto
              lg:pb-3
            "
          >
            Most builders compete on how many templates
            they have. We compete on how good your CV
            looks when it lands.
          </motion.p>
        </div>

        {/* ============================================
            COMPARISON TABLE
        ============================================ */}

        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 30,
                }
          }
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.1,
          }}
          transition={{
            duration: 0.75,
            delay: 0.1,
            ease,
          }}
          className="
            mt-16
            overflow-hidden
            rounded-[16px]
            border
            border-border
            bg-surface
            sm:mt-20
            lg:mt-24
          "
        >
          {/* TABLE HEADER */}

          <div
            className="
              grid
              grid-cols-2
              border-b
              border-border
            "
          >
            {/* USUAL BUILDER */}

            <div
              className="
                flex
                min-h-[74px]
                items-center
                px-5
                py-5
                sm:px-7
                lg:px-9
              "
            >
              <span
                className="
                  font-mono
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-text-muted
                  sm:text-[11px]
                "
              >
                The Usual Builder
              </span>
            </div>

            {/* QORLIQ HEADER */}

            <div
              className="
                flex
                min-h-[74px]
                items-center
                justify-between
                gap-3
                border-l
                border-border
                bg-[#07183f]
                px-5
                py-5
                sm:px-7
                lg:px-9
              "
            >
              <span
                className="
                  font-mono
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-white
                  sm:text-[11px]
                "
              >
                QORLIQ CV
              </span>

              <span
                aria-hidden="true"
                className="
                  h-2
                  w-2
                  shrink-0
                  rounded-full
                  bg-accent
                "
              />
            </div>
          </div>

          {/* TABLE ROWS */}

          <div>
            {comparisons.map((item, index) => (
              <ComparisonRow
                key={item.usual}
                item={item}
                index={index}
              />
            ))}
          </div>

          {/* BOTTOM ACCENT */}

          <div
            aria-hidden="true"
            className="h-[3px] w-full bg-accent"
          />
        </motion.div>
      </div>
    </section>
  );
}