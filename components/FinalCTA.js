"use client";

import Image from "next/image";
import Link from "next/link";

import {
  motion,
  useReducedMotion,
} from "motion/react";

import { ArrowRight } from "lucide-react";

/* =========================================================
   ANIMATION
========================================================= */

const ease = [0.22, 1, 0.36, 1];

export default function FinalCTA() {
  const reduceMotion = useReducedMotion();

  const entrance = (delay = 0) => ({
    initial: reduceMotion
      ? false
      : {
          opacity: 0,
          y: 35,
        },

    whileInView: {
      opacity: 1,
      y: 0,
    },

    viewport: {
      once: true,
      amount: 0.3,
    },

    transition: {
      duration: 0.85,
      delay,
      ease,
    },
  });

  return (
    <section
      id="get-started"
      aria-labelledby="final-cta-heading"
      className="
        relative
        isolate
        w-full
        overflow-hidden
        bg-[#0a0a0a]
        text-white
      "
    >
      {/* ============================================
          MAIN CONTAINER
      ============================================ */}

      <div
        className="
          relative
          mx-auto
          grid
          min-h-[520px]
          w-full
          max-w-[1440px]
          grid-cols-1
          items-center
          gap-12
          px-5
          py-20
          sm:px-8
          sm:py-24
          lg:min-h-[590px]
          lg:grid-cols-[1.45fr_0.55fr]
          lg:gap-8
          lg:px-12
          lg:py-24
          xl:px-16
        "
      >
        {/* ============================================
            LEFT CONTENT
        ============================================ */}

        <div className="relative z-10 min-w-0">

          {/* SECTION LABEL */}

          <motion.p
            {...entrance(0)}
            className="
              mb-7
              font-mono
              text-[10px]
              font-medium
              uppercase
              tracking-[0.22em]
              text-white/45
              sm:mb-8
            "
          >
            Ready when you are
          </motion.p>

          {/* ========================================
              MAIN HEADING
          ======================================== */}

          <h2
            id="final-cta-heading"
            className="
              max-w-[880px]
              text-[clamp(3.2rem,6.2vw,6.4rem)]
              font-semibold
              leading-[1.03]
              tracking-[-0.075em]
              text-white
            "
          >
            {/* LINE 1 */}

            <motion.span
              {...entrance(0.1)}
              className="block"
            >
              Your next role
            </motion.span>

            {/* LINE 2 */}

            <motion.span
              {...entrance(0.2)}
              className="block"
            >
              starts on{" "}

              <span
                className="
                  font-editorial
                  font-normal
                  italic
                  tracking-[-0.06em]
                  text-[#16d4cf]
                "
              >
                one clean
              </span>
            </motion.span>

            {/* LINE 3 */}

            <motion.span
              {...entrance(0.3)}
              className="
                block
                font-editorial
                font-normal
                italic
                tracking-[-0.06em]
                text-[#16d4cf]
              "
            >
              page.
            </motion.span>
          </h2>

          {/* ========================================
              BUTTONS
          ======================================== */}

          <motion.div
            {...entrance(0.45)}
            className="
              mt-9
              flex
              flex-wrap
              items-center
              gap-3
              sm:mt-10
            "
          >
            {/* PRIMARY */}

            <Link
              href="/cv-builder"
              className="
                group
                inline-flex
                min-h-[48px]
                items-center
                justify-center
                gap-3
                rounded-[6px]
                bg-[#16d4cf]
                px-6
                text-[13px]
                font-semibold
                text-[#07183f]
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-[#35e5df]
                hover:shadow-[0_12px_30px_rgba(22,212,207,0.15)]
              "
            >
              Build my CV

              <ArrowRight
                size={16}
                strokeWidth={2}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            </Link>

            {/* SECONDARY */}

            <Link
              href="/#layouts"
              className="
                inline-flex
                min-h-[48px]
                items-center
                justify-center
                rounded-[6px]
                border
                border-white/20
                bg-transparent
                px-6
                text-[13px]
                font-semibold
                text-white
                transition-all
                duration-300
                hover:border-white/50
                hover:bg-white/5
              "
            >
              Browse layouts
            </Link>
          </motion.div>
        </div>

        {/* ============================================
            RIGHT IMAGE
        ============================================ */}

        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  x: 65,
                  scale: 0.9,
                  rotate: -8,
                }
          }
          whileInView={{
            opacity: 1,
            x: 0,
            scale: 1,
            rotate: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 1.1,
            delay: 0.25,
            ease,
          }}
          className="
            relative
            flex
            min-w-0
            items-center
            justify-center
            lg:justify-end
          "
        >
          {/* FLOATING ANIMATION */}

          <motion.div
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [0, -12, 0],
                    rotate: [0, 2, 0],
                  }
            }
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="
              relative
              aspect-square
              w-full
              max-w-[290px]
              sm:max-w-[340px]
              lg:max-w-[380px]
            "
          >
            <Image
              src="/qorliq-cta.png"
              alt="QORLIQ CV"
              fill
              sizes="
                (max-width: 640px) 290px,
                (max-width: 1024px) 340px,
                380px
              "
              className="object-contain"
              priority={false}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* ============================================
          BOTTOM DIVIDER
      ============================================ */}

      <div
        aria-hidden="true"
        className="
          absolute
          inset-x-0
          bottom-0
          h-px
          bg-white/10
        "
      />
    </section>
  );
}