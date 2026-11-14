"use client";

import Image from "next/image";
import Link from "next/link";

import {
  motion,
  useReducedMotion,
} from "motion/react";

import {
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";

/* =========================================================
   FOOTER NAVIGATION
========================================================= */

const footerLinks = [
  {
    title: "Product",
    links: [
      {
        label: "CV Templates",
        href: "/#layouts",
      },
      {
        label: "Features",
        href: "/#features",
      },
      {
        label: "How It Works",
        href: "/#how-it-works",
      },
      {
        label: "FAQs",
        href: "/#faq",
      },
    ],
  },
  {
    title: "Company",
    links: [
      {
        label: "About Us",
        href: "/about",
      },
      {
        label: "Contact Us",
        href: "/contact",
      },
      {
        label: "Help & Support",
        href: "/dashboard/support",
      },
    ],
  },
  {
    title: "Legal",
    links: [
      {
        label: "Privacy Policy",
        href: "/privacy",
      },
      {
        label: "Terms of Service",
        href: "/terms",
      },
    ],
  },
];

/* =========================================================
   ANIMATION SETTINGS
========================================================= */

const ease = [0.22, 1, 0.36, 1];

/* =========================================================
   FOOTER COLUMN
========================================================= */

function FooterColumn({ title, links }) {
  return (
    <div className="min-w-0">
      {/* COLUMN HEADING */}

      <h3
        className="
          mb-6
          text-[11px]
          font-bold
          uppercase
          tracking-[0.16em]
          text-[#B9C5D8]
          sm:text-[12px]
        "
      >
        {title}
      </h3>

      {/* LINKS */}

      <ul className="space-y-4">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="
                group
                inline-flex
                min-h-[24px]
                items-center
                gap-2
                text-[13px]
                font-medium
                leading-relaxed
                text-[#E1E7F0]
                transition-colors
                duration-200
                hover:text-[#16D4CF]
                sm:text-[14px]
              "
            >
              <span
                className="
                  relative
                  after:absolute
                  after:bottom-[-3px]
                  after:left-0
                  after:h-px
                  after:w-0
                  after:bg-[#16D4CF]
                  after:transition-all
                  after:duration-300
                  group-hover:after:w-full
                "
              >
                {link.label}
              </span>

              <ArrowUpRight
                size={14}
                strokeWidth={1.8}
                className="
                  -translate-x-1
                  text-[#16D4CF]
                  opacity-0
                  transition-all
                  duration-200
                  group-hover:translate-x-0
                  group-hover:opacity-100
                "
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* =========================================================
   FOOTER
========================================================= */

export default function Footer() {
  const reduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: {
      opacity: reduceMotion ? 1 : 0,
      y: reduceMotion ? 0 : 24,
    },

    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <footer
      className="
        relative
        w-full
        overflow-hidden
        bg-[#090B10]
        text-white
      "
    >
      {/* ============================================
          MAIN FOOTER
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
        className="
          mx-auto
          grid
          w-full
          max-w-[1440px]
          grid-cols-1
          gap-14
          px-5
          pb-16
          pt-20
          sm:px-8
          sm:pb-20
          sm:pt-24
          lg:grid-cols-[1.15fr_1fr]
          lg:gap-20
          lg:px-12
          xl:px-16
        "
      >
        {/* ========================================
            BRAND CONTENT
        ======================================== */}

        <motion.div
          variants={fadeUp}
          transition={{
            duration: 0.75,
            ease,
          }}
          className="
            flex
            max-w-[440px]
            flex-col
            items-start
          "
        >
          {/* LOGO */}
<Link
  href="/"
  aria-label="QORLIQ CV Homepage"
  className="
    inline-flex
    items-center
    transition-opacity
    duration-200
    hover:opacity-90
  "
>
  <Image
    src="/QORLIQ_cv_dark.svg"
    alt="QORLIQ CV"
    width={185}
    height={60}
    priority
    className="
      h-auto
      w-[150px]
      object-contain
      sm:w-[175px]
      lg:w-[185px]
    "
  />
</Link>

          {/* BRAND DESCRIPTION */}

          <p
            className="
              mt-7
              max-w-[420px]
              text-[15px]
              font-normal
              leading-[1.85]
              tracking-[-0.01em]
              text-[#D1DAE8]
              sm:text-[16px]
            "
          >
            Build a CV that makes a lasting impression.
            QORLIQ CV helps you create professional,
            ATS-friendly resumes with modern templates,
            intuitive editing, and a seamless experience
            from start to finish.
          </p>

          {/* OPTIONAL BRAND CTA */}

          <Link
            href="/cv-builder"
            className="
              group
              mt-7
              inline-flex
              items-center
              gap-2
              text-[13px]
              font-semibold
              text-[#16D4CF]
              transition-colors
              duration-200
              hover:text-[#51E9E3]
              sm:text-[14px]
            "
          >
            Start Building Your CV

            <ArrowRight
              size={16}
              strokeWidth={1.8}
              className="
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            />
          </Link>
        </motion.div>

        {/* ========================================
            NAVIGATION COLUMNS
        ======================================== */}

        <motion.div
          variants={fadeUp}
          transition={{
            duration: 0.75,
            delay: 0.12,
            ease,
          }}
          className="
            grid
            grid-cols-2
            gap-x-8
            gap-y-12
            sm:grid-cols-3
            sm:gap-x-10
            lg:gap-x-12
          "
        >
          {footerLinks.map((group) => (
            <FooterColumn
              key={group.title}
              title={group.title}
              links={group.links}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* ============================================
          COPYRIGHT AREA
      ============================================ */}

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
        {/* DIVIDER */}

        <div
          className="
            h-px
            w-full
            bg-white/[0.16]
          "
        />

        {/* BOTTOM ROW */}

        <div
          className="
            flex
            flex-col
            items-start
            justify-between
            gap-4
            py-7
            sm:flex-row
            sm:items-center
          "
        >
          <p
            className="
              text-[12px]
              font-medium
              leading-relaxed
              text-[#B9C5D8]
            "
          >
            © {new Date().getFullYear()} QORLIQ CV.
            All rights reserved.
          </p>

          <p
            className="
              text-[12px]
              font-medium
              leading-relaxed
              text-[#B9C5D8]
            "
          >
            Built for ambition. Designed for opportunity.
          </p>
        </div>
      </div>
    </footer>
  );
}