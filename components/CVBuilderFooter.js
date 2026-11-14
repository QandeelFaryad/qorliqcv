import Link from "next/link";

import {
  ArrowUpRight,
  
} from "lucide-react";

/* =========================================================
   FOOTER LINKS
========================================================= */

const footerLinks = [
  {
    label: "Terms & Conditions",
    href: "/terms",
  },
  {
    label: "Subscription Terms",
    href: "/subscription-terms",
  },
  {
    label: "Privacy Policy",
    href: "/privacy",
  },
  {
    label: "Cookie Policy",
    href: "/cookie-policy",
  },
  {
    label: "Contact Us",
    href: "/contact",
  },
];

/* =========================================================
   QORLIQ CV — FOOTER
========================================================= */

export default function CVBuilderFooter() {
  return (
    <footer
      className="
        w-full
        border-t border-border
        bg-background
      "
    >
      <div
        className="
          mx-auto
          flex
          w-full
          max-w-[1600px]
          flex-col
          gap-5
          px-5
          py-8
          sm:px-8
          lg:flex-row
          lg:items-start
          lg:justify-between
          lg:gap-12
          lg:px-12
        "
      >
        {/* ========================================
            LEFT — COPYRIGHT & BILLING TEXT
        ======================================== */}

        <div className="min-w-0 lg:max-w-[650px]">
          <p
            className="
              text-[15px]
              font-normal
              leading-[1.5]
              tracking-[-0.025em]
              text-text-primary
              sm:text-[18px]
            "
          >
            © {new Date().getFullYear()} QORLIQ CV.
            All Rights Reserved.
          </p>

          <p
            className="
              mt-2
              max-w-[650px]
              text-[12px]
              leading-[1.65]
              text-text-secondary
              sm:text-[13px]
            "
          >
            QORLIQ CV is a paid CV and resume builder.
            Downloading your completed CV requires a
            valid payment or active plan. Subscription
            plans renew automatically until cancelled.
            Prices and billing terms are displayed before
            checkout. You can manage your subscription
            from your account dashboard.
          </p>
        </div>

        {/* ========================================
            RIGHT — FOOTER LINKS
        ======================================== */}
{/* ========================================
    RIGHT — FOOTER NAVIGATION
======================================== */}

<nav
  aria-label="Footer navigation"
  className="
    flex flex-wrap items-center
    gap-y-3 lg:justify-end
  "
>
  {footerLinks.map((link, index) => (
    <div
      key={link.label}
      className="flex items-center"
    >
      <Link
        href={link.href}
        className="
          group relative inline-flex
          items-center gap-1.5
          whitespace-nowrap
          text-[12px] font-medium
          text-text-secondary
          transition-colors duration-300
          hover:text-accent
          focus-visible:text-accent
          focus-visible:outline-2
          focus-visible:outline-offset-4
          focus-visible:outline-accent
          sm:text-[13px]
        "
      >
        <span
          className="
            relative
            after:absolute
            after:bottom-[-4px]
            after:left-0
            after:h-[1.5px]
            after:w-full
            after:origin-left
            after:scale-x-0
            after:bg-accent
            after:transition-transform
            after:duration-300
            after:ease-[cubic-bezier(0.22,1,0.36,1)]
            group-hover:after:scale-x-100
            group-focus-visible:after:scale-x-100
          "
        >
          {link.label}
        </span>

        <ArrowUpRight
          size={12}
          strokeWidth={1.8}
          aria-hidden="true"
          className="
            -translate-x-1
            opacity-0
            text-accent
            transition-all duration-300
            group-hover:translate-x-0
            group-hover:opacity-100
            group-focus-visible:translate-x-0
            group-focus-visible:opacity-100
          "
        />
      </Link>

      {index < footerLinks.length - 1 && (
        <span
          aria-hidden="true"
          className="
            mx-3 h-5 w-px
            bg-border sm:mx-4
          "
        />
      )}
    </div>
  ))}
</nav>
      </div>
    </footer>
  );
}