"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import {
  motion,
  useReducedMotion,
} from "motion/react";

import {
  useEffect,
  useState,
} from "react";

/* =========================================================
   INDUSTRIES
========================================================= */

const industries = [
  "DESIGNERS",
  "ENGINEERS",
  "ANALYSTS",
  "NURSES",
  "TEACHERS",
  "MARKETERS",
  "FOUNDERS",
  "GRADUATES",
];

/* =========================================================
   ANIMATION VARIANTS
========================================================= */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 28,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const staggerContainer = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.13,
      delayChildren: 0.1,
    },
  },
};

const previewEntrance = {
  hidden: {
    opacity: 0,
    x: 55,
    y: 25,
    rotate: 2,
    scale: 0.96,
  },

  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,

    transition: {
      duration: 1.05,
      delay: 0.25,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* =========================================================
   ANIMATED TEXT
========================================================= */
function AnimatedLine({
  children,
  delay = 0,
  className = "",
}) {
  const reduceMotion = useReducedMotion();

  return (
    <span className={`block overflow-hidden ${className}`}>
      <motion.span
        className="block"
        initial={
          reduceMotion
            ? false
            : {
                opacity: 0,
                y: 55,
              }
        }
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.8,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/* =========================================================
   TYPING TEXT
========================================================= */

function TypingText() {
  const fullText =
    "Led the onboarding redesign";

  const [text, setText] = useState("");

  useEffect(() => {
    let index = 0;
    let timeout;

    const startTimeout = setTimeout(() => {
      const type = () => {
        index += 1;

        setText(fullText.slice(0, index));

        if (index < fullText.length) {
          timeout = setTimeout(type, 65);
        }
      };

      type();
    }, 1600);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <span className="inline-flex items-center">
      {text}

      <motion.span
        className="
          ml-[2px]
          inline-block
          h-[12px]
          w-[1px]
          bg-accent
        "
        animate={{
          opacity: [1, 0, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
        }}
      />
    </span>
  );
}

/* =========================================================
   CV PREVIEW
========================================================= */

function CVPreview() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={previewEntrance}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        amount: 0.15,
      }}
      className="
        relative
        mx-auto
        w-full
        max-w-[440px]
        lg:mx-0
        lg:max-w-none
      "
    >
      {/* Floating container */}

      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, -9, 0],
              }
        }
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* ========================================
            CV DOCUMENT
        ======================================== */}

        <div
          className="
            relative
            ml-auto
            min-h-[490px]
            w-[82%]
            overflow-hidden
            border
            border-[#e5e5e5]
            bg-white
            px-6
            pb-10
            pt-7
            text-[#111111]
            shadow-[0_12px_45px_rgba(0,0,0,0.055)]
            sm:min-h-[530px]
            sm:px-7
            lg:min-h-[540px]
            lg:w-[84%]
          "
        >
          {/* NAME */}

          <div className="mb-2">
            <h3
              className="
                text-[19px]
                font-extrabold
                leading-tight
                tracking-[-0.06em]
                sm:text-[21px]
              "
            >
              <motion.span
                initial={{
                  backgroundSize: "0% 100%",
                }}
                whileInView={{
                  backgroundSize: "100% 100%",
                }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  delay: 1,
                }}
                style={{
                  backgroundImage:
                    "linear-gradient(to top, #17d4d0 35%, transparent 35%)",
                  backgroundRepeat: "no-repeat",
                }}
              >
                Amara Okafor
              </motion.span>
            </h3>

            <p
              className="
                mt-1
                font-mono
                text-[7px]
                uppercase
                tracking-[0.2em]
                text-[#555555]
              "
            >
              Product Designer
            </p>

            <p
              className="
                mt-2
                text-[8px]
                leading-relaxed
                text-[#555555]
              "
            >
              amara.okafor@email.com
              <span className="mx-1">·</span>
              amaraokafor.design
            </p>
          </div>

          <div className="mb-4 h-px bg-[#111111]" />

          {/* SUMMARY */}

          <section className="mb-5">
            <h4 className="mb-2 font-mono text-[7px] uppercase tracking-[0.16em] text-[#555]">
              Summary
            </h4>

            <p className="text-[8px] leading-[1.7] text-[#333] sm:text-[9px]">
              Designer with seven years shaping calm,
              usable products. Works close to research
              and engineering, and ships.
            </p>
          </section>

          {/* EXPERIENCE */}

          <section className="mb-5">
            <h4 className="mb-2 font-mono text-[7px] uppercase tracking-[0.16em] text-[#555]">
              Experience
            </h4>

            <div className="space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h5 className="text-[8px] font-bold sm:text-[9px]">
                    Senior Product Designer,
                    Northfield
                  </h5>

                  <span className="shrink-0 text-[7px] text-[#666]">
                    2022 — Now
                  </span>
                </div>

                <ul className="mt-1 list-disc space-y-1 pl-3 text-[8px] leading-[1.5] text-[#444]">
                  <li>
                    Led the onboarding redesign,
                    simplifying setup from nine steps
                    to four.
                  </li>

                  <li>
                    Built a shared component library
                    used across five product teams.
                  </li>
                </ul>
              </div>

              <div>
                <div className="flex items-start justify-between gap-2">
                  <h5 className="text-[8px] font-bold sm:text-[9px]">
                    Product Designer, Brightpath
                  </h5>

                  <span className="shrink-0 text-[7px] text-[#666]">
                    2019 — 2022
                  </span>
                </div>

                <ul className="mt-1 list-disc space-y-1 pl-3 text-[8px] leading-[1.5] text-[#444]">
                  <li>
                    Owned the mobile checkout from
                    first sketch to release.
                  </li>

                  <li>
                    Ran a monthly research round-table
                    with customers.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* SKILLS */}

          <section>
            <h4 className="mb-2 font-mono text-[7px] uppercase tracking-[0.16em] text-[#555]">
              Skills
            </h4>

            <div className="flex flex-wrap gap-1">
              {[
                "Figma",
                "Research",
                "Prototyping",
                "Design systems",
              ].map((skill) => (
                <span
                  key={skill}
                  className="
                    rounded-[3px]
                    border
                    border-[#555]
                    px-1.5
                    py-0.5
                    text-[7px]
                    leading-none
                  "
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* ========================================
            FLOATING AI EDITOR
        ======================================== */}

        <motion.div
          initial={{
            opacity: 0,
            x: -35,
            y: 25,
            scale: 0.92,
          }}
          whileInView={{
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
          }}
          viewport={{ once: true }}
          transition={{
            duration: 0.8,
            delay: 0.9,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            absolute
            bottom-[12%]
            left-0
            z-10
            w-[205px]
            rounded-[11px]
            border
            border-white/10
            bg-[#0b0b0b]
            p-3.5
            text-white
            shadow-[0_18px_45px_rgba(0,0,0,0.18)]
            sm:w-[235px]
          "
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />

            <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-white/55">
              Job title
            </span>
          </div>

          <div className="rounded-md border border-white/15 px-3 py-2 text-[10px]">
            Product Designer
          </div>

          <div className="mb-2 mt-3 font-mono text-[8px] uppercase tracking-[0.15em] text-white/55">
            Bullet
          </div>

          <div className="min-h-[37px] rounded-md border border-accent/70 px-3 py-2 text-[9px]">
            <TypingText />
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <motion.span
              whileHover={{
                scale: 1.04,
              }}
              className="
                rounded
                bg-accent
                px-2.5
                py-1.5
                text-[8px]
                font-semibold
                text-[#061747]
              "
            >
              Improve wording
            </motion.span>

            <motion.span
              animate={
                reduceMotion
                  ? undefined
                  : {
                      opacity: [0.65, 1, 0.65],
                    }
              }
              transition={{
                duration: 2.5,
                repeat: Infinity,
              }}
              className="flex items-center gap-1 text-[9px] text-accent"
            >
              <Check size={11} />
              ATS
            </motion.span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* =========================================================
   HERO SECTION
========================================================= */

export default function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="home"
      className="
        relative
        w-full
        overflow-hidden
        bg-background
      "
    >
      {/* ================================================
          MAIN HERO
      ================================================= */}

      <div
        className="
          mx-auto
          grid
          min-h-[650px]
          w-full
          max-w-[1440px]
          grid-cols-1
          items-center
          gap-12
          px-5
          pb-16
          pt-14
          sm:px-8
          lg:min-h-[690px]
          lg:grid-cols-[1fr_0.9fr]
          lg:gap-10
          lg:px-12
          lg:pb-0
          lg:pt-8
          xl:px-16
        "
      >
        {/* ============================================
            LEFT CONTENT
        ============================================ */}

        <div className="relative z-10">
          {/* BADGE */}

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{ once: true }}
            transition={{
              duration: 0.65,
            }}
            className="
              mb-8
              inline-flex
              items-center
              gap-3
              rounded-full
              border
              border-border-strong
              bg-surface
              py-1.5
              pl-1.5
              pr-4
            "
          >
            <span className="rounded-full bg-accent px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#061747]">
              New
            </span>

            <span className="text-[11px] font-medium text-text-primary">
              Built-in ATS check on every export
            </span>
          </motion.div>

          {/* ========================================
              HEADING
          ======================================== */}

  <h1
  className="
    relative
    max-w-[760px]
    text-[clamp(3.5rem,7vw,7.5rem)]
    font-semibold
    leading-[1.08]
    tracking-[-0.075em]
    text-text-primary
  "
>
  <AnimatedLine delay={0.1}>
    Build a CV
  </AnimatedLine>

  <AnimatedLine delay={0.25}>
    <span className="inline-block">
      that{" "}
      <span className="relative inline-block whitespace-nowrap">
        <span
          className="
            relative
            z-10
            font-editorial
            font-normal
            italic
            tracking-[-0.065em]
            text-text-primary
          "
        >
          gets read.
        </span>

        {/* Animated cyan background */}

        <motion.span
          aria-hidden="true"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: 0.85,
            delay: 1,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            transformOrigin: "left center",
          }}
          className="
            absolute
            bottom-[0.08em]
            left-0
            z-0
            h-[0.28em]
            w-full
            bg-accent
          "
        />
      </span>
    </span>
  </AnimatedLine>
</h1>

          {/* ========================================
              DESCRIPTION
          ======================================== */}

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-14 max-w-[440px] lg:mt-20"
          >
            <motion.p
              variants={fadeUp}
              className="
                text-[15px]
                leading-[1.85]
                tracking-[-0.01em]
                text-text-secondary
                sm:text-[16px]
              "
            >
              QORLIQ CV turns your experience into a
              sharp, ATS-ready document in minutes.
              No clutter, no gimmicks — just a page
              that reads well and looks like you
              meant it.
            </motion.p>

            {/* BUTTONS */}

            <motion.div
              variants={fadeUp}
              className="
                mt-7
                flex
                flex-wrap
                items-center
                gap-3
              "
            >
              <motion.div
                whileHover={
                  reduceMotion
                    ? undefined
                    : {
                        y: -3,
                      }
                }
                whileTap={{
                  scale: 0.98,
                }}
              >
                <Link
                  href="/cv-builder"
                  className="
                    group
                    inline-flex
                    h-12
                    items-center
                    justify-center
                    gap-3
                    rounded-lg
                    bg-[#0b0b0b]
                    px-5
                    text-[13px]
                    font-semibold
                    text-white
                    shadow-sm
                    transition-colors
                    hover:bg-[#222]

                    dark:bg-accent
                    dark:text-[#061747]
                    dark:hover:bg-accent-hover
                  "
                >
                  Build my CV

                  <ArrowRight
                    size={15}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </motion.div>

              <motion.div
                whileHover={
                  reduceMotion
                    ? undefined
                    : {
                        y: -3,
                      }
                }
                whileTap={{
                  scale: 0.98,
                }}
              >
                <Link
                  href="/#layouts"
                  className="
                    inline-flex
                    h-12
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-border-strong
                    bg-surface
                    px-5
                    text-[13px]
                    font-semibold
                    text-text-primary
                    transition-colors
                    hover:bg-background-soft
                  "
                >
                  See the layouts
                </Link>
              </motion.div>
            </motion.div>

            {/* BENEFITS */}

            <motion.div
              variants={fadeUp}
              className="
                mt-7
                flex
                flex-wrap
                items-center
                gap-x-5
                gap-y-3
              "
            >
              {[
                "No card needed",
                "PDF & DOCX export",
                "Parser-friendly",
              ].map((item) => (
                <span
                  key={item}
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    whitespace-nowrap
                    text-[11px]
                    text-text-secondary
                  "
                >
                  <CheckCircle2
                    size={13}
                    className="fill-accent text-[#061747]"
                  />

                  {item}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* ============================================
            RIGHT SIDE
        ============================================ */}

        <div
          className="
            relative
            flex
            min-w-0
            items-center
            justify-center
            lg:justify-end
          "
        >
          <CVPreview />
        </div>
      </div>

      {/* ================================================
          INDUSTRY STRIP
      ================================================= */}

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
          delay: 0.2,
        }}
        className="
          relative
          z-20
          w-full
          bg-[#0b0b0b]
          py-5
          text-white
        "
      >
        <div
          className="
            mx-auto
            flex
            max-w-[1440px]
            flex-wrap
            items-center
            justify-center
            gap-x-7
            gap-y-4
            px-5
            lg:justify-between
            lg:px-12
            xl:px-16
          "
        >
          <span
            className="
              font-mono
              text-[9px]
              uppercase
              tracking-[0.18em]
              text-white/55
            "
          >
            Made for
          </span>

          {industries.map((industry, index) => (
            <motion.div
              key={industry}
              initial={{
                opacity: 0,
                y: 10,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{ once: true }}
              transition={{
                duration: 0.45,
                delay: index * 0.055,
              }}
              className="
                flex
                items-center
                gap-2
              "
            >
              <motion.span
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        opacity: [0.65, 1, 0.65],
                      }
                }
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
                className="h-[5px] w-[5px] bg-accent"
              />

              <span
                className="
                  font-mono
                  text-[9px]
                  font-semibold
                  tracking-[0.12em]
                  text-white/85
                "
              >
                {industry}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}