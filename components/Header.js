"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowUpRight,
  Menu,
  X,
  Sun,
  Moon,
  ChevronRight,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { usePathname } from "next/navigation";

/* ================================================
   NAVIGATION
================================================ */

const navigation = [
  {
    label: "How it works",
    href: "/#how-it-works",
  },
  {
    label: "Features",
    href: "/#features",
  },
  {
    label: "Layouts",
    href: "/#layouts",
  },
  {
    label: "FAQ",
    href: "/#faq",
  },
];

/* ================================================
   THEME TOGGLE
================================================ */

function ThemeToggle({ theme, toggleTheme }) {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        theme === "dark"
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      aria-pressed={theme === "dark"}
      title={
        theme === "dark"
          ? "Light mode"
          : "Dark mode"
      }
      className="
        group
        relative
        flex
        h-10
        w-10
        shrink-0
        items-center
        justify-center
        rounded-full
        border
        border-border
        bg-surface
        text-text-primary
        transition-all
        duration-300
        hover:border-accent
        hover:bg-background-soft
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-accent
        focus-visible:ring-offset-2
        focus-visible:ring-offset-background
      "
    >
      <Sun
        size={18}
        strokeWidth={1.8}
        className="
          absolute
          rotate-0
          scale-100
          transition-all
          duration-300
          dark:rotate-90
          dark:scale-0
        "
      />

      <Moon
        size={18}
        strokeWidth={1.8}
        className="
          absolute
          -rotate-90
          scale-0
          transition-all
          duration-300
          dark:rotate-0
          dark:scale-100
        "
      />
    </button>
  );
}

/* ================================================
   HEADER
================================================ */

export default function Header() {
  const pathname = usePathname();

  const [theme, setTheme] = useState("light");

  const [mounted, setMounted] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);

  const [headerVisible, setHeaderVisible] =
    useState(true);

  const [scrolled, setScrolled] = useState(false);

  const lastScrollY = useRef(0);

  const scrollFrame = useRef(null); 
  const [activeHash, setActiveHash] = useState("");

useEffect(() => {
  const updateActiveHash = () => {
    setActiveHash(window.location.hash);
  };

  updateActiveHash();

  window.addEventListener("hashchange", updateActiveHash);

  return () => {
    window.removeEventListener(
      "hashchange",
      updateActiveHash
    );
  };
}, [pathname]);

const isActiveLink = (href) => {
  const [linkPath, linkHash] = href.split("#");

  if (pathname !== (linkPath || "/")) {
    return false;
  }

  return Boolean(linkHash) && activeHash === `#${linkHash}`;
};

  /* ================================================
     THEME INITIALIZATION
  ================================================ */

  useEffect(() => {
    const savedTheme = localStorage.getItem(
      "qorliq-theme"
    );

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const initialTheme =
      savedTheme === "dark" ||
      savedTheme === "light"
        ? savedTheme
        : prefersDark
          ? "dark"
          : "light";

    document.documentElement.classList.toggle(
      "dark",
      initialTheme === "dark"
    );

    document.documentElement.style.colorScheme =
      initialTheme;

    setTheme(initialTheme);

    setMounted(true);
  }, []);

  /* ================================================
     TOGGLE THEME
  ================================================ */

  const toggleTheme = () => {
    const nextTheme =
      theme === "dark" ? "light" : "dark";

    document.documentElement.classList.toggle(
      "dark",
      nextTheme === "dark"
    );

    document.documentElement.style.colorScheme =
      nextTheme;

    localStorage.setItem(
      "qorliq-theme",
      nextTheme
    );

    setTheme(nextTheme);
  };

  /* ================================================
     SCROLL BEHAVIOR
  ================================================ */

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      if (scrollFrame.current !== null) return;

      scrollFrame.current = window.requestAnimationFrame(
        () => {
          const currentScrollY = Math.max(
            0,
            window.scrollY
          );

          const previousScrollY =
            lastScrollY.current;

          const difference =
            currentScrollY - previousScrollY;

          setScrolled(currentScrollY > 16);

          /* Always display navbar near top */

          if (currentScrollY < 80) {
            setHeaderVisible(true);
          }

          /* Keep navbar visible with mobile menu */

          else if (mobileOpen) {
            setHeaderVisible(true);
          }

          /* Scroll downward */

          else if (difference > 5) {
            setHeaderVisible(false);
          }

          /* Scroll upward */

          else if (difference < -5) {
            setHeaderVisible(true);
          }

          lastScrollY.current =
            currentScrollY;

          scrollFrame.current = null;
        }
      );
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    handleScroll();

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );

      if (scrollFrame.current !== null) {
        cancelAnimationFrame(
          scrollFrame.current
        );
      }
    };
  }, [mobileOpen]);

  /* ================================================
     CLOSE MOBILE MENU ON ROUTE CHANGE
  ================================================ */

  useEffect(() => {
    setMobileOpen(false);
    setHeaderVisible(true);
  }, [pathname]);

  /* ================================================
     MOBILE MENU — ESCAPE
  ================================================ */

  useEffect(() => {
    if (!mobileOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [mobileOpen]);

  return (
    <>
      {/* ============================================
          FIXED HEADER
      ============================================ */}

      <header
        className={`
          fixed
          inset-x-0
          top-0
          z-50
          w-full
          border-b
          transition-[transform,background-color,border-color,box-shadow]
          duration-300
          ease-[cubic-bezier(0.22,1,0.36,1)]
          motion-reduce:transition-none

          ${
            headerVisible
              ? "translate-y-0"
              : "-translate-y-full"
          }

          ${
            scrolled || mobileOpen
              ? `
                border-border
                bg-background/95
                shadow-[0_8px_30px_rgba(0,0,0,0.035)]
                backdrop-blur-xl
                dark:shadow-[0_8px_30px_rgba(0,0,0,0.16)]
              `
              : `
                border-transparent
                bg-background
              `
          }
        `}
      >
        {/* ========================================
            MAIN NAVBAR
        ======================================== */}

        <div
          className="
            mx-auto
            flex
            h-[76px]
            w-full
            max-w-[1440px]
            items-center
            justify-between
            gap-6
            px-5
            sm:px-8
            lg:h-[84px]
            lg:px-12
            xl:px-16
          "
        >
          {/* ====================================
              LOGO
          ==================================== */}

          <Link
            href="/"
            aria-label="QORLIQ CV — Home"
            className="
              relative
              z-10
              flex
              shrink-0
              items-center
              outline-none
              focus-visible:rounded-md
              focus-visible:ring-2
              focus-visible:ring-accent
            "
            onClick={() =>
              setMobileOpen(false)
            }
          >
<div className="relative">
  {/* Light Mode Logo */}
  <Image
    src="/QORLIQ_cv.svg"
    alt="QORLIQ CV"
    width={185}
    height={56}
    priority
    className="h-auto w-[158px] lg:w-[185px] dark:hidden"
  />

  {/* Dark Mode Logo */}
  <Image
    src="/QORLIQ_cv_dark.svg"
    alt="QORLIQ CV"
    width={185}
    height={56}
    priority
    className="hidden h-auto w-[158px] lg:w-[185px] dark:block"
  />
</div>
          </Link>

          {/* ====================================
              DESKTOP NAVIGATION
          ==================================== */}
{/* ====================================
    DESKTOP NAVIGATION
==================================== */}

<nav
  aria-label="Main navigation"
  className="
    hidden items-center justify-center
    gap-7 lg:flex xl:gap-9
  "
>
  {navigation.map((item) => {
    const active = isActiveLink(item.href);

    return (
      <Link
        key={item.label}
        href={item.href}
        onClick={() => {
          setActiveHash(
            `#${item.href.split("#")[1]}`
          );
        }}
        aria-current={active ? "location" : undefined}
        className={`
          relative
          whitespace-nowrap
          py-2
          text-[13px]
          font-medium
          tracking-[-0.01em]
          transition-colors
          duration-300

          after:absolute
          after:bottom-0
          after:left-0
          after:h-[2px]
          after:rounded-full
          after:bg-accent
          after:transition-all
          after:duration-300

          focus-visible:outline-2
          focus-visible:outline-offset-4
          focus-visible:outline-accent

          ${
            active
              ? `
                font-semibold
                text-text-primary
                after:w-full
              `
              : `
                text-text-secondary
                hover:text-text-primary
                after:w-0
                hover:after:w-full
              `
          }
        `}
      >
        {item.label}
      </Link>
    );
  })}
</nav>

          {/* ====================================
              DESKTOP ACTIONS
          ==================================== */}

          <div
            className="
              hidden
              shrink-0
              items-center
              gap-3
              lg:flex
            "
          >
            {mounted ? (
              <ThemeToggle
                theme={theme}
                toggleTheme={toggleTheme}
              />
            ) : (
              <span
                className="
                  h-10
                  w-10
                  rounded-full
                  border
                  border-border
                "
                aria-hidden="true"
              />
            )}

            <Link
              href="/login"
              className="
                inline-flex
                h-10
                items-center
                justify-center
                whitespace-nowrap
                rounded-full
                px-4
                text-[13px]
                font-semibold
                text-text-primary
                transition-colors
                duration-200
                hover:bg-background-soft
              "
            >
              Log in
            </Link>
<Link
  href="/cv-builder"
  className="
    group
    inline-flex
    h-11
    items-center
    justify-center
    gap-2.5
    whitespace-nowrap
    rounded-xl
    bg-[#07183f]
    px-6
    text-[13px]
    font-semibold
    tracking-[-0.01em]
    text-white
    shadow-sm
    transition-all
    duration-300

    hover:-translate-y-0.5
    hover:bg-[#102b66]
    hover:shadow-[0_8px_20px_rgba(7,24,63,0.15)]

    focus-visible:outline-2
    focus-visible:outline-offset-4
    focus-visible:outline-accent

    dark:bg-accent
    dark:text-[#061747]
    dark:hover:bg-accent-hover
  "
>
  <span>Create Your CV</span>

  <ArrowUpRight
    size={16}
    strokeWidth={1.9}
    className="
      transition-transform
      duration-300
      group-hover:translate-x-0.5
      group-hover:-translate-y-0.5
    "
  />
</Link>
          </div>

          {/* ====================================
              MOBILE ACTIONS
          ==================================== */}

          <div
            className="
              flex
              items-center
              gap-2
              lg:hidden
            "
          >
            {mounted ? (
              <ThemeToggle
                theme={theme}
                toggleTheme={toggleTheme}
              />
            ) : (
              <span
                className="
                  h-10
                  w-10
                  rounded-full
                  border
                  border-border
                "
                aria-hidden="true"
              />
            )}

            <button
              type="button"
              aria-label={
                mobileOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              onClick={() => {
                setMobileOpen((prev) => !prev);
                setHeaderVisible(true);
              }}
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-border
                bg-surface
                text-text-primary
                transition-colors
                duration-200
                hover:bg-background-soft
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-accent
              "
            >
              {mobileOpen ? (
                <X
                  size={21}
                  strokeWidth={1.8}
                />
              ) : (
                <Menu
                  size={21}
                  strokeWidth={1.8}
                />
              )}
            </button>
          </div>
        </div>

        {/* ========================================
            MOBILE NAVIGATION
        ======================================== */}

        <div
          id="mobile-navigation"
          inert={!mobileOpen}
          className={`
            grid
            overflow-hidden
            border-border
            bg-background
            transition-[grid-template-rows,opacity,border-color]
            duration-300
            ease-in-out
            lg:hidden

            ${
              mobileOpen
                ? `
                  grid-rows-[1fr]
                  border-t
                  opacity-100
                `
                : `
                  grid-rows-[0fr]
                  border-transparent
                  opacity-0
                `
            }
          `}
        >
          <div className="min-h-0 overflow-hidden">
            <nav
              aria-label="Mobile navigation"
              className="
                flex
                flex-col
                px-5
                pb-6
                pt-3
                sm:px-8
              "
            >
            {navigation.map((item) => {
  const active = isActiveLink(item.href);

  return (
    <Link
      key={item.label}
      href={item.href}
      onClick={() => {
        setActiveHash(
          `#${item.href.split("#")[1]}`
        );

        setMobileOpen(false);
      }}
      aria-current={active ? "location" : undefined}
      className={`
        group
        relative
        flex
        min-h-13
        items-center
        justify-between
        border-b
        border-border
        py-3
        pl-4
        pr-1
        text-[15px]
        font-medium
        transition-all
        duration-300

        ${
          active
            ? `
              bg-accent/10
              font-semibold
              text-text-primary
            `
            : `
              text-text-secondary
              hover:bg-background-soft
              hover:text-text-primary
            `
        }
      `}
    >
      {/* ACTIVE INDICATOR */}

      {active && (
        <span
          aria-hidden="true"
          className="
            absolute
            inset-y-2
            left-0
            w-[3px]
            rounded-full
            bg-accent
          "
        />
      )}

      <span>{item.label}</span>

      <ChevronRight
        size={17}
        className={`
          transition-all
          duration-300

          ${
            active
              ? "translate-x-1 text-accent"
              : `
                text-text-muted
                group-hover:translate-x-1
                group-hover:text-accent
              `
          }
        `}
      />
    </Link>
  );
})}

              {/* Mobile buttons */}

              <div
                className="
                  mt-6
                  grid
                  grid-cols-2
                  gap-3
                "
              >
                <Link
                  href="/login"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="
                    inline-flex
                    h-12
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-border-strong
                    bg-surface
                    text-sm
                    font-semibold
                    text-text-primary
                    transition-colors
                    hover:bg-background-soft
                  "
                >
                  Log in
                </Link>
<Link
  href="/cv-builder"
  onClick={() => setMobileOpen(false)}
  className="
    group
    inline-flex
    h-12
    items-center
    justify-center
    gap-2
    rounded-xl
    bg-[#07183f]
    px-3
    text-sm
    font-semibold
    text-white
    transition-all
    duration-300
    hover:bg-[#102b66]

    dark:bg-accent
    dark:text-[#061747]
    dark:hover:bg-accent-hover
  "
>
  Create Your CV

  <ArrowUpRight
    size={16}
    className="
      transition-transform
      duration-300
      group-hover:translate-x-0.5
      group-hover:-translate-y-0.5
    "
  />
</Link>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* ============================================
          HEADER SPACE
          Prevents page content from jumping
      ============================================ */}

      <div
        aria-hidden="true"
        className="h-[76px] lg:h-[84px]"
      />
    </>
  );
}