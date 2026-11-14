"use client";

import {
  motion,
  useReducedMotion,
} from "motion/react";

import {
  ArrowUpRight,
  Check,
  Eye,
  FileCheck2,
  FileText,
  Layers3,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

/* =========================================================
   ANIMATION CONFIGURATION
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
   FEATURE LABEL
========================================================= */

function FeatureLabel({ icon: Icon, children }) {
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <Icon
        size={15}
        strokeWidth={1.7}
        className="text-[#16d4cf]"
      />

      <span
        className="
          font-mono
          text-[10px]
          font-medium
          uppercase
          tracking-[0.19em]
          text-[#16d4cf]
        "
      >
        {children}
      </span>
    </div>
  );
}

/* =========================================================
   CARD WRAPPER
========================================================= */

function FeatureCard({
  children,
  className = "",
  index = 0,
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      variants={fadeUp}
      transition={{
        duration: 0.75,
        delay: index * 0.08,
        ease,
      }}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -5,
            }
      }
      className={`
        group
        relative
        min-w-0
        overflow-hidden
        rounded-[12px]
        border
        border-white/[0.08]
        bg-[#141414]
        p-6
        transition-colors
        duration-300
        hover:border-white/[0.17]
        sm:p-7
        lg:p-8
        ${className}
      `}
    >
      {children}
    </motion.article>
  );
}

/* =========================================================
   SMART REWRITE
========================================================= */

function SmartRewriteCard() {
  return (
    <FeatureCard index={0}>
      <FeatureLabel icon={Sparkles}>
        Smart Rewrite
      </FeatureLabel>

      <h3
        className="
          max-w-[520px]
          text-[26px]
          font-semibold
          leading-[1.16]
          tracking-[-0.055em]
          text-white
          sm:text-[30px]
          lg:text-[34px]
        "
      >
        Say what you did. Not what you were responsible for.
      </h3>

      <p
        className="
          mt-4
          max-w-[520px]
          text-[14px]
          leading-[1.8]
          text-white/50
        "
      >
        Weak bullets get flagged and rewritten in plain,
        active language. You approve every change.
      </p>

      {/* ============================================
          BEFORE / AFTER
      ============================================ */}

      <div
        className="
          mt-8
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-2
        "
      >
        {/* BEFORE */}

        <div
          className="
            min-h-[138px]
            rounded-lg
            border
            border-white/10
            bg-[#101010]
            p-4
          "
        >
          <span
            className="
              font-mono
              text-[9px]
              uppercase
              tracking-[0.16em]
              text-white/35
            "
          >
            Before
          </span>

          <p
            className="
              mt-4
              text-[13px]
              leading-[1.65]
              text-white/55
            "
          >
            Responsible for managing the sales team
            and reporting.
          </p>
        </div>

        {/* AFTER */}

        <motion.div
          initial={{
            borderColor: "rgba(255,255,255,0.1)",
          }}
          whileInView={{
            borderColor: "rgba(22,212,207,0.6)",
          }}
          viewport={{ once: true }}
          transition={{
            duration: 0.9,
            delay: 0.5,
          }}
          className="
            min-h-[138px]
            rounded-lg
            border
            bg-[#101010]
            p-4
            shadow-[0_0_0_1px_rgba(22,212,207,0.05)]
          "
        >
          <div className="flex items-center justify-between">
            <span
              className="
                font-mono
                text-[9px]
                uppercase
                tracking-[0.16em]
                text-[#16d4cf]
              "
            >
              After
            </span>

            <Check
              size={14}
              className="text-[#16d4cf]"
            />
          </div>

          <p
            className="
              mt-4
              text-[13px]
              leading-[1.65]
              text-white/85
            "
          >
            Led a six-person sales team and reported
            pipeline weekly to leadership.
          </p>
        </motion.div>
      </div>
    </FeatureCard>
  );
}

/* =========================================================
   ATS READY
========================================================= */

function ATSReadyCard() {
  const checks = [
    "Real, selectable text",
    "Standard section headings",
    "Clean reading order",
    "No text locked in images",
  ];

  return (
    <FeatureCard index={1}>
      <FeatureLabel icon={ShieldCheck}>
        ATS-Ready
      </FeatureLabel>

      <h3
        className="
          max-w-[300px]
          text-[26px]
          font-semibold
          leading-[1.2]
          tracking-[-0.05em]
          text-white
          sm:text-[29px]
          lg:text-[31px]
        "
      >
        Built so parsers can read it
      </h3>

      {/* CHECKLIST */}

      <div className="mt-8">
        {checks.map((item, index) => (
          <motion.div
            key={item}
            initial={{
              opacity: 0,
              x: -12,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{ once: true }}
            transition={{
              duration: 0.45,
              delay: 0.15 + index * 0.1,
              ease,
            }}
            className="
              flex
              min-h-[46px]
              items-center
              gap-3
              border-t
              border-white/[0.08]
              py-3
            "
          >
            <Check
              size={15}
              strokeWidth={2}
              className="
                shrink-0
                text-[#16d4cf]
              "
            />

            <span className="text-[13px] text-white/75">
              {item}
            </span>
          </motion.div>
        ))}
      </div>
    </FeatureCard>
  );
}

/* =========================================================
   LIVE PREVIEW ILLUSTRATION
========================================================= */

function LivePreviewIllustration() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="
        mt-8
        flex
        h-[135px]
        items-end
        justify-start
      "
    >
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, -5, 0],
              }
        }
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          relative
          w-full
          max-w-[285px]
          overflow-hidden
          rounded-[6px]
          bg-white
          p-4
          shadow-[0_12px_32px_rgba(0,0,0,0.18)]
        "
      >
        <div className="h-[5px] w-[95px] rounded-sm bg-[#171717]" />

        <div className="mt-2 h-[3px] w-[42px] bg-[#16d4cf]" />

        <div className="mt-4 space-y-2">
          <div className="h-[3px] w-full rounded-full bg-[#d7d7d7]" />

          <div className="h-[3px] w-[90%] rounded-full bg-[#e0e0e0]" />

          <div className="h-[3px] w-[75%] rounded-full bg-[#e0e0e0]" />
        </div>

        {/* Animated typing cursor */}

        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  opacity: [1, 0, 1],
                }
          }
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
          className="
            absolute
            bottom-4
            left-[68%]
            h-[8px]
            w-[2px]
            bg-[#16d4cf]
          "
        />
      </motion.div>
    </div>
  );
}

/* =========================================================
   LIVE PREVIEW CARD
========================================================= */

function LivePreviewCard() {
  return (
    <FeatureCard index={2} className="flex flex-col">
      <FeatureLabel icon={Eye}>
        Live Preview
      </FeatureLabel>

      <h3
        className="
          max-w-[300px]
          text-[25px]
          font-semibold
          leading-[1.2]
          tracking-[-0.05em]
          text-white
        "
      >
        See every change as you type
      </h3>

      <p
        className="
          mt-3
          text-[13px]
          leading-[1.8]
          text-white/50
        "
      >
        No refresh, no guessing how the page will break.
      </p>

      <div className="mt-auto">
        <LivePreviewIllustration />
      </div>
    </FeatureCard>
  );
}

/* =========================================================
   VERSIONS ILLUSTRATION
========================================================= */

function VersionsIllustration() {
  return (
    <div
      className="
        relative
        mt-8
        flex
        h-[135px]
        items-center
        justify-center
      "
    >
      {/* BACK DOCUMENT */}

      <motion.div
        initial={{
          opacity: 0,
          x: -15,
          y: -10,
        }}
        whileInView={{
          opacity: 1,
          x: 0,
          y: 0,
        }}
        viewport={{ once: true }}
        transition={{
          duration: 0.7,
        }}
        className="
          absolute
          h-[75px]
          w-[170px]
          -translate-x-5
          -translate-y-4
          rounded-[5px]
          border
          border-white/20
          bg-[#171717]
        "
      />

      {/* MIDDLE DOCUMENT */}

      <motion.div
        initial={{
          opacity: 0,
          x: -10,
          y: -5,
        }}
        whileInView={{
          opacity: 1,
          x: 0,
          y: 0,
        }}
        viewport={{ once: true }}
        transition={{
          duration: 0.7,
          delay: 0.15,
        }}
        className="
          absolute
          h-[75px]
          w-[170px]
          -translate-x-2
          -translate-y-1
          rounded-[5px]
          border
          border-white/25
          bg-[#141414]
        "
      />

      {/* FRONT DOCUMENT */}

      <motion.div
        initial={{
          opacity: 0,
          x: 15,
          y: 15,
        }}
        whileInView={{
          opacity: 1,
          x: 0,
          y: 0,
        }}
        viewport={{ once: true }}
        transition={{
          duration: 0.7,
          delay: 0.3,
        }}
        className="
          absolute
          flex
          h-[75px]
          w-[170px]
          translate-x-3
          translate-y-2
          flex-col
          justify-center
          rounded-[5px]
          border
          border-[#16d4cf]/60
          bg-[#101010]
          px-4
          shadow-[0_0_20px_rgba(22,212,207,0.06)]
        "
      >
        <div className="h-[5px] w-[75px] rounded-sm bg-white" />

        <div className="mt-2 h-[3px] w-[45px] bg-[#16d4cf]" />

        <div className="mt-3 h-[2px] w-[110px] bg-white/15" />
      </motion.div>
    </div>
  );
}

/* =========================================================
   VERSIONS CARD
========================================================= */

function VersionsCard() {
  return (
    <FeatureCard index={3} className="flex flex-col">
      <FeatureLabel icon={Layers3}>
        Versions
      </FeatureLabel>

      <h3
        className="
          max-w-[300px]
          text-[25px]
          font-semibold
          leading-[1.2]
          tracking-[-0.05em]
          text-white
        "
      >
        One master, many applications
      </h3>

      <p
        className="
          mt-3
          text-[13px]
          leading-[1.8]
          text-white/50
        "
      >
        Duplicate your master CV and tailor a copy
        for each role.
      </p>

      <div className="mt-auto">
        <VersionsIllustration />
      </div>
    </FeatureCard>
  );
}

/* =========================================================
   EXPORT CARD
========================================================= */

function ExportCard() {
  const formats = ["PDF", "DOCX", "TXT"];

  return (
    <FeatureCard
      index={4}
      className="
        flex
        flex-col
        border-[#192574]
        !bg-[#0b1460]
        hover:border-[#16d4cf]/40
      "
    >
      <FeatureLabel icon={FileText}>
        Export
      </FeatureLabel>

      <h3
        className="
          max-w-[300px]
          text-[25px]
          font-semibold
          leading-[1.2]
          tracking-[-0.05em]
          text-white
        "
      >
        Export that holds up
      </h3>

      <p
        className="
          mt-3
          text-[13px]
          leading-[1.8]
          text-white/60
        "
      >
        Fonts embedded, margins exact. What you see
        is what lands in the inbox.
      </p>

      {/* FORMATS */}

      <div className="mt-auto flex flex-wrap gap-2 pt-10">
        {formats.map((format, index) => (
          <motion.span
            key={format}
            initial={{
              opacity: 0,
              y: 12,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{ once: true }}
            transition={{
              duration: 0.45,
              delay: 0.3 + index * 0.12,
            }}
            whileHover={{
              y: -3,
              borderColor: "#16d4cf",
            }}
            className="
              inline-flex
              h-9
              items-center
              justify-center
              rounded-[5px]
              border
              border-[#16d4cf]/50
              px-3
              font-mono
              text-[11px]
              font-medium
              tracking-[0.1em]
              text-[#16d4cf]
            "
          >
            {format}
          </motion.span>
        ))}
      </div>
    </FeatureCard>
  );
}

/* =========================================================
   FEATURES SECTION
========================================================= */

export default function FeaturesSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="
        relative
        w-full
        overflow-hidden
        bg-[#0b0b0b]
        py-24
        text-white
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
            lg:grid-cols-[1.25fr_0.75fr]
            lg:gap-16
          "
        >
          {/* LEFT HEADING */}

          <div>
            <motion.p
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
                duration: 0.6,
                ease,
              }}
              className="
                mb-8
                font-mono
                text-[10px]
                uppercase
                tracking-[0.19em]
                text-white/40
              "
            >
              02 — FEATURES
            </motion.p>

            <h2
              id="features-heading"
              className="
                max-w-[800px]
                text-[clamp(3rem,6vw,6rem)]
                font-semibold
                leading-[1.05]
                tracking-[-0.075em]
              "
            >
              <motion.span
                initial={{
                  opacity: 0,
                  y: 35,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  ease,
                }}
                className="block"
              >
                Everything a CV
              </motion.span>

              <motion.span
                initial={{
                  opacity: 0,
                  y: 35,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  delay: 0.12,
                  ease,
                }}
                className="block"
              >
                needs.
              </motion.span>

              <motion.span
                initial={{
                  opacity: 0,
                  y: 35,
                }}
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
                  block
                  font-editorial
                  font-normal
                  italic
                  tracking-[-0.07em]
                  text-[#16d4cf]
                "
              >
                Nothing it doesn&apos;t.
              </motion.span>
            </h2>
          </div>

          {/* RIGHT DESCRIPTION */}

          <motion.p
            initial={{
              opacity: 0,
              y: 25,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              delay: 0.25,
              ease,
            }}
            className="
              max-w-[380px]
              text-[16px]
              leading-[1.8]
              text-white/50
              lg:ml-auto
              lg:pb-3
            "
          >
            Five tools, each doing one job properly.
            No template carnival, no dashboard maze.
          </motion.p>
        </div>

        {/* ============================================
            FEATURE GRID
        ============================================ */}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.1,
          }}
          transition={{
            staggerChildren: 0.12,
          }}
          className="mt-16 space-y-3 sm:mt-20"
        >
          {/* TOP ROW */}

          <div
            className="
              grid
              grid-cols-1
              gap-3
              lg:grid-cols-[1.65fr_0.95fr]
            "
          >
            <SmartRewriteCard />

            <ATSReadyCard />
          </div>

          {/* BOTTOM ROW */}

          <div
            className="
              grid
              grid-cols-1
              gap-3
              md:grid-cols-3
            "
          >
            <LivePreviewCard />

            <VersionsCard />

            <ExportCard />
          </div>
        </motion.div>
      </div>
    </section>
  );
}