"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

import {
  ArrowUpRight,
  Check,
  CircleHelp,
  Headset,
  Mail,
  MessageCircleQuestion,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

/* =========================================================
   CONFIGURATION
========================================================= */

const SUPPORT_EMAIL = "support@qorliqcv.com";

const EASE = [0.22, 1, 0.36, 1];

const benefits = [
  {
    title: "Reliable support",
    detail: "Get help when you need it.",
  },
  {
    title: "Helpful guidance",
    detail: "Clear answers to your questions.",
  },
  {
    title: "Dedicated assistance",
    detail: "Support for your CV journey.",
  },
];

/* =========================================================
   ANIMATED CONTACT ILLUSTRATION
========================================================= */

function ContactIllustration({ reducedMotion }) {
  const floatingAnimation = (delay = 0, distance = 9) => {
    if (reducedMotion) return {};

    return {
      animate: {
        y: [0, -distance, 0],
      },

      transition: {
        duration: 5.8,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
        delay,
      },
    };
  };

  return (
    <motion.div
      aria-hidden="true"
      initial={
        reducedMotion
          ? false
          : {
              opacity: 0,
              scale: 0.94,
              y: 22,
            }
      }
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      transition={{
        duration: reducedMotion ? 0 : 0.85,
        delay: reducedMotion ? 0 : 0.18,
        ease: EASE,
      }}
      className="
        relative
        mx-auto
        flex
        aspect-[1.12]
        w-full
        max-w-[570px]
        items-center
        justify-center
      "
    >
      {/* ================================================
          BACKGROUND SHAPES
      ================================================= */}

      <div
        className="
          absolute
          inset-[8%_3%_8%_5%]
          rounded-[42%_56%_52%_46%]
          bg-[#d6f8fa]
          dark:bg-accent/10
        "
      />

      <div
        className="
          absolute
          inset-[20%_10%_14%_14%]
          rounded-full
          bg-white/60
          blur-[55px]
          dark:bg-accent/5
        "
      />

      <div
        className="
          absolute
          bottom-[12%]
          left-[18%]
          right-[18%]
          h-8
          rounded-full
          bg-[#0c6e86]/10
          blur-xl
          dark:bg-black/30
        "
      />

      {/* ================================================
          FLOATING HEADSET ICON
      ================================================= */}

      <motion.div
        {...floatingAnimation(0.2, 8)}
        className="
          absolute
          left-[7%]
          top-[19%]
          z-20
          grid
          h-[66px]
          w-[66px]
          -rotate-12
          place-items-center
          rounded-[20px]
          border
          border-[#e0edf5]
          bg-white
          text-[#07183F]
          shadow-[0_16px_34px_rgba(7,24,63,0.10)]
          dark:border-border
          dark:bg-surface
          dark:text-text-primary
          sm:h-[78px]
          sm:w-[78px]
        "
      >
        <Headset
          className="h-7 w-7 sm:h-8 sm:w-8"
          strokeWidth={1.7}
        />
      </motion.div>

      {/* ================================================
          FLOATING QUESTION ICON
      ================================================= */}

      <motion.div
        {...floatingAnimation(0.65, 11)}
        className="
          absolute
          right-[6%]
          top-[20%]
          z-20
          grid
          h-[61px]
          w-[61px]
          rotate-12
          place-items-center
          rounded-[20px]
          border
          border-[#e0edf5]
          bg-white
          text-[#07183F]
          shadow-[0_16px_34px_rgba(7,24,63,0.10)]
          dark:border-border
          dark:bg-surface
          dark:text-text-primary
          sm:h-[76px]
          sm:w-[76px]
        "
      >
        <MessageCircleQuestion
          className="h-7 w-7 sm:h-8 sm:w-8"
          strokeWidth={1.7}
        />
      </motion.div>

      {/* ================================================
          FLOATING SECURITY ICON
      ================================================= */}

      <motion.div
        {...floatingAnimation(1.2, 7)}
        className="
          absolute
          bottom-[24%]
          left-[7%]
          z-20
          grid
          h-[54px]
          w-[54px]
          rotate-12
          place-items-center
          rounded-2xl
          border
          border-[#e0edf5]
          bg-white
          text-[#079da7]
          shadow-[0_16px_34px_rgba(7,24,63,0.10)]
          dark:border-border
          dark:bg-surface
          dark:text-accent
          sm:h-[66px]
          sm:w-[66px]
        "
      >
        <ShieldCheck
          className="h-6 w-6 sm:h-7 sm:w-7"
          strokeWidth={1.7}
        />
      </motion.div>

      {/* ================================================
          MAIN ENVELOPE
      ================================================= */}

      <motion.div
        {...floatingAnimation(0.1, 5)}
        className="
          relative
          z-10
          w-[68%]
          max-w-[368px]
          pt-[18%]
        "
      >
        {/* LETTER */}

        <div
          className="
            absolute
            left-[10%]
            right-[10%]
            top-[1%]
            z-0
            flex
            h-[65%]
            flex-col
            rounded-[23px]
            border
            border-[#dbeaf1]
            bg-white
            p-[8%]
            shadow-[0_16px_50px_rgba(7,24,63,0.12)]
            dark:border-border
            dark:bg-surface
          "
        >
          {/* LOGO */}

          <div
            className="
              flex
              items-center
              gap-2
              text-[clamp(12px,1.7vw,19px)]
              font-black
              tracking-[-0.06em]
              text-[#07183f]
              dark:text-text-primary
            "
          >
            QORLIQ

            <span
              className="
                rounded-[5px]
                bg-[#00c9d3]
                px-1
                py-0.5
                text-[0.75em]
                font-bold
                tracking-normal
                text-white
              "
            >
              CV
            </span>
          </div>

          {/* LETTER CONTENT */}

          <div className="mt-[14%] h-[6px] w-full rounded-full bg-[#d7e1ee]" />

          <div className="mt-[5%] h-[6px] w-[87%] rounded-full bg-[#d7e1ee]" />

          <div className="mt-[5%] h-[6px] w-[68%] rounded-full bg-[#e4ebf3]" />
        </div>

        {/* ENVELOPE BODY */}

        <div
          className="
            relative
            z-10
            aspect-[1.4]
            overflow-hidden
            rounded-[24px]
            bg-gradient-to-br
            from-[#effbfc]
            via-[#b1f1f3]
            to-[#33cbd4]
            shadow-[0_25px_55px_rgba(6,85,115,0.17)]
            dark:from-[#164a62]
            dark:via-[#127b89]
            dark:to-[#0bbec9]
          "
        >
          {/* ENVELOPE BACK FOLD */}

          <div
            className="
              absolute
              inset-x-0
              bottom-0
              top-[11%]
              bg-[#e7f9fc]
              [clip-path:polygon(0_0,50%_57%,100%_0,100%_100%,0_100%)]
              dark:bg-[#d8f7fb]
            "
          />

          {/* ENVELOPE FRONT FOLD */}

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-br
              from-[#d5f5fa]
              to-[#59d8e2]
              [clip-path:polygon(0_100%,50%_44%,100%_100%)]
            "
          />
        </div>
      </motion.div>

      {/* ================================================
          ANIMATED SEND ICON
      ================================================= */}

      <motion.div
        initial={
          reducedMotion
            ? false
            : {
                opacity: 0,
                x: -20,
                y: 15,
                rotate: -13,
              }
        }
        animate={{
          opacity: 1,
          x: 0,
          y: 0,
          rotate: -13,
        }}
        transition={{
          delay: reducedMotion ? 0 : 0.65,
          duration: reducedMotion ? 0 : 0.6,
          ease: EASE,
        }}
        className="
          absolute
          bottom-[15%]
          right-[10%]
          z-20
          rounded-[18px]
          bg-white/90
          p-3
          text-[#00aebb]
          shadow-[0_16px_35px_rgba(7,24,63,0.12)]
          dark:bg-surface
        "
      >
        <Send
          size={35}
          strokeWidth={1.6}
        />
      </motion.div>

      {/* DECORATIVE SPARKLE */}

      <Sparkles
        className="
          absolute
          right-[14%]
          top-[8%]
          h-8
          w-8
          text-[#05bfc9]
        "
        strokeWidth={2}
      />
    </motion.div>
  );
}

/* =========================================================
   CONTACT HERO COMPONENT
========================================================= */

export default function ContactHero() {
  const reducedMotion = useReducedMotion();

  /* ================================================
      ENTRANCE ANIMATION
  ================================================= */

  const enter = (delay = 0, y = 18) => ({
    initial: reducedMotion
      ? false
      : {
          opacity: 0,
          y,
        },

    animate: {
      opacity: 1,
      y: 0,
    },

    transition: {
      duration: reducedMotion ? 0 : 0.65,
      delay: reducedMotion ? 0 : delay,
      ease: EASE,
    },
  });

  return (
    <section
      id="contact-hero"
      aria-labelledby="contact-hero-title"
      className="
        relative
        isolate
        overflow-hidden
        bg-background
        text-text-primary
      "
    >
      {/* ================================================
          SUBTLE BACKGROUND
      ================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          right-[-15%]
          top-[-20%]
          h-[580px]
          w-[580px]
          rounded-full
          bg-[#d9fbfe]/35
          blur-[100px]
          dark:bg-accent/5
        "
      />

      {/* ================================================
          MAIN HERO LAYOUT
      ================================================= */}

      <div
        className="
          relative
          mx-auto
          grid
          w-full
          max-w-[1440px]
          grid-cols-1
          items-center
          gap-10

          px-5
          pb-16
          pt-14

          sm:px-8
          sm:pb-20
          sm:pt-20

          lg:min-h-[680px]
          lg:grid-cols-[1.08fr_0.92fr]
          lg:gap-8
          lg:px-12
          lg:pb-24
          lg:pt-20

          xl:px-16
        "
      >
        {/* ================================================
            LEFT SIDE CONTENT
        ================================================= */}

        <div className="relative z-10 max-w-[730px]">
          {/* EYEBROW */}

          <motion.div
            {...enter(0)}
            className="mb-7 flex items-center gap-3"
          >
            <span className="h-[4px] w-11 rounded-full bg-[#04bac2]" />

            <span
              className="
                text-[11px]
                font-bold
                uppercase
                tracking-[0.15em]
                text-text-primary
                sm:text-[12px]
              "
            >
              CONTACT US
            </span>
          </motion.div>

          {/* ================================================
              MAIN HEADING
          ================================================= */}

          <motion.h1
            id="contact-hero-title"
            {...enter(0.09, 23)}
            className="
              max-w-[750px]
              text-[clamp(2.8rem,5.3vw,5.2rem)]
              font-bold
              leading-[1.08]
              tracking-[-0.065em]
              text-text-primary
            "
          >
            Get in touch with the QORLIQ CV{" "}
            <span
              className="
                relative
                inline-block
                text-[#04aeb8]
                dark:text-accent
              "
            >
              team.

              {/* UNDERLINE */}

              <motion.span
                aria-hidden="true"
                initial={
                  reducedMotion
                    ? false
                    : {
                        scaleX: 0,
                      }
                }
                animate={{
                  scaleX: 1,
                }}
                transition={{
                  duration: reducedMotion ? 0 : 0.8,
                  delay: reducedMotion ? 0 : 0.6,
                  ease: EASE,
                }}
                className="
                  absolute
                  -bottom-1
                  left-[3%]
                  h-[4px]
                  w-[94%]
                  origin-left
                  rounded-full
                  bg-[#04c6ca]
                  sm:-bottom-2
                "
              />
            </span>
          </motion.h1>

          {/* ================================================
              DESCRIPTION
          ================================================= */}

          <motion.p
            {...enter(0.19)}
            className="
              mt-7
              max-w-[640px]
              text-[15px]
              leading-[1.85]
              text-text-secondary
              sm:text-[17px]
            "
          >
            Have a question about your account, a subscription,
            or creating your CV? We're here to help. Reach our
            support team directly by email — no contact form required.
          </motion.p>

          {/* ================================================
              SUPPORT BENEFITS
          ================================================= */}

          <div className="mt-8 space-y-3.5">
            {benefits.map((item, index) => (
              <motion.div
                key={item.title}
                {...enter(0.29 + index * 0.075, 12)}
                className="
                  flex
                  items-start
                  gap-3.5
                  sm:items-center
                "
              >
                {/* CHECK ICON */}

                <span
                  className="
                    grid
                    h-9
                    w-9
                    shrink-0
                    place-items-center
                    rounded-xl
                    bg-[#d9f7f8]
                    text-[#05a8b2]
                    dark:bg-accent/15
                    dark:text-accent
                  "
                >
                  <Check
                    size={19}
                    strokeWidth={3}
                    aria-hidden="true"
                  />
                </span>

                {/* TEXT */}

                <p
                  className="
                    text-[14px]
                    leading-7
                    text-text-secondary
                    sm:text-[15px]
                  "
                >
                  <strong className="mr-2 font-bold text-text-primary">
                    {item.title}
                  </strong>

                  {item.detail}
                </p>
              </motion.div>
            ))}
          </div>

          {/* ================================================
              ACTION BUTTONS
          ================================================= */}

          <motion.div
            {...enter(0.56, 14)}
            className="
              mt-9
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:flex-wrap
            "
          >
            {/* EMAIL SUPPORT */}

            <motion.a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                "Contact QORLIQ CV Support"
              )}`}
              whileHover={
                reducedMotion
                  ? undefined
                  : {
                      y: -3,
                    }
              }
              whileTap={
                reducedMotion
                  ? undefined
                  : {
                      scale: 0.985,
                    }
              }
              className="
                inline-flex
                min-h-[53px]
                items-center
                justify-center
                gap-3
                rounded-xl
                bg-[#07183f]
                px-7
                text-[14px]
                font-semibold
                text-white
                shadow-[0_9px_25px_rgba(7,24,63,0.13)]
                transition-colors
                

                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-accent

                dark:bg-accent
                dark:text-[#07183f]
              "
            >
              <Mail
                size={19}
                strokeWidth={1.9}
                aria-hidden="true"
              />

              Email Support

              <ArrowUpRight
                size={18}
                strokeWidth={1.9}
                aria-hidden="true"
              />
            </motion.a>

            {/* HELP CENTER */}

            <motion.div
              whileHover={
                reducedMotion
                  ? undefined
                  : {
                      y: -3,
                    }
              }
              whileTap={
                reducedMotion
                  ? undefined
                  : {
                      scale: 0.985,
                    }
              }
            >
              <Link
                href="/support"
                className="
                  inline-flex
                  min-h-[53px]
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-xl
                  border
                  border-border-strong
                  bg-surface
                  px-7
                  text-[14px]
                  font-semibold
                  text-text-primary
                  transition-colors

                  hover:border-accent
                  hover:bg-background-soft

                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-accent
                "
              >
                <CircleHelp
                  size={19}
                  strokeWidth={1.9}
                  aria-hidden="true"
                />

                Visit Help Center
              </Link>
            </motion.div>
          </motion.div>

          {/* ================================================
              SUPPORT EMAIL
          ================================================= */}

          <motion.p
            {...enter(0.65, 8)}
            className="
              mt-4
              text-[12px]
              leading-6
              text-text-muted
            "
          >
            Email us at{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="
                font-semibold
                text-text-primary
                underline
                decoration-border-strong
                underline-offset-4
                transition-colors
                hover:decoration-accent
              "
            >
              {SUPPORT_EMAIL}
            </a>
          </motion.p>
        </div>

        {/* ================================================
            RIGHT SIDE ILLUSTRATION
        ================================================= */}

        <div className="relative min-w-0 lg:pl-2">
          <ContactIllustration reducedMotion={reducedMotion} />
        </div>
      </div>
    </section>
  );
}