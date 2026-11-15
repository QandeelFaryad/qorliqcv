"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  UserRound,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { usePathname } from "next/navigation";

import {
  signOut,
  useSession,
} from "next-auth/react";

/* =========================================================
   NAVIGATION
========================================================= */

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

/* =========================================================
   THEME TOGGLE
========================================================= */

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
        flex h-10 w-10 shrink-0
        items-center justify-center
        rounded-full
        border border-border
        bg-surface
        text-text-primary

        transition-all duration-300

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
        aria-hidden="true"
        className="
          absolute
          rotate-0 scale-100
          transition-all duration-300

          dark:rotate-90
          dark:scale-0
        "
      />

      <Moon
        size={18}
        strokeWidth={1.8}
        aria-hidden="true"
        className="
          absolute
          -rotate-90 scale-0
          transition-all duration-300

          dark:rotate-0
          dark:scale-100
        "
      />
    </button>
  );
}

/* =========================================================
   USER AVATAR MENU

   Built directly inside Header.jsx.
========================================================= */

function UserAvatarMenu({
  session,
  pathname,
  onNavigate,
}) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const user = session?.user;

  const userName =
    user?.name?.trim() ||
    user?.email?.split("@")[0] ||
    "My Account";

  const userEmail = user?.email || "";

  const userImage = user?.image || "";

  // NextAuth normally exposes "role".
  // "roll" is supported as a fallback.
  const userRole = String(
    user?.role || user?.roll || "user"
  ).toLowerCase();

  const isAdmin = userRole === "admin";

  const dashboardHref = isAdmin
    ? "/admin"
    : "/dashboard";

  const dashboardLabel = isAdmin
    ? "Admin Dashboard"
    : "My Dashboard";

  const initials = userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  /* ================================================
     CLOSE ON ROUTE CHANGE
  ================================================ */

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /* ================================================
     CLOSE ON OUTSIDE CLICK / ESCAPE
  ================================================ */

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener(
      "pointerdown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open]);

  /* ================================================
     LOGOUT
  ================================================ */

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    setOpen(false);

    try {
      await signOut({
        callbackUrl: "/",
        redirect: true,
      });
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
    }
  };

  return (
    <div
      ref={menuRef}
      className="relative shrink-0"
    >
      {/* ============================================
          AVATAR BUTTON
      ============================================ */}

      <button
        ref={buttonRef}
        type="button"
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="qorliq-account-menu"
        onClick={() => setOpen((prev) => !prev)}
        className={`
          group
          flex h-11 items-center gap-2
          rounded-full
          border
          py-1 pl-1 pr-2

          transition-all duration-300

          hover:border-accent
          hover:bg-background-soft

          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-accent

          ${
            open
              ? "border-accent bg-background-soft"
              : "border-border bg-surface"
          }
        `}
      >
        {/* AVATAR */}

        <span
          className="
            relative
            flex h-8 w-8 shrink-0
            items-center justify-center
            overflow-hidden
            rounded-full
            bg-accent/15
            text-[12px]
            font-bold
            text-text-primary
            ring-1 ring-border
          "
        >
          {userImage ? (
            <Image
              src={userImage}
              alt=""
              fill
              sizes="32px"
              unoptimized
              className="object-cover"
            />
          ) : (
            <span aria-hidden="true">
              {initials || (
                <UserRound size={17} />
              )}
            </span>
          )}
        </span>

        {/* DESKTOP NAME */}

        <span
          className="
            hidden max-w-[110px]
            truncate
            text-[12px]
            font-semibold
            text-text-primary
            xl:block
          "
        >
          {userName.split(" ")[0]}
        </span>

        {/* DROPDOWN ARROW */}

        <ChevronDown
          size={15}
          strokeWidth={1.8}
          aria-hidden="true"
          className={`
            text-text-secondary
            transition-transform duration-300

            ${open ? "rotate-180" : ""}
          `}
        />
      </button>

      {/* ============================================
          DROPDOWN

          Keep mounted for smooth exit animation.
      ============================================ */}

      <div
        id="qorliq-account-menu"
        role="menu"
        aria-label="Account options"
        inert={!open}
        className={`
          absolute
          right-0 top-full
          z-[100]
          mt-3
          w-[min(320px,calc(100vw-28px))]
          origin-top-right
          overflow-hidden
          rounded-2xl

          border border-border
          bg-surface
          text-text-primary

          shadow-[0_18px_55px_rgba(7,24,63,0.14)]
          dark:shadow-[0_18px_55px_rgba(0,0,0,0.35)]

          transition-[opacity,transform,visibility]
          duration-250
          ease-[cubic-bezier(0.22,1,0.36,1)]
          motion-reduce:transition-none

          ${
            open
              ? `
                visible
                translate-y-0
                scale-100
                opacity-100
              `
              : `
                invisible
                pointer-events-none
                -translate-y-2
                scale-[0.97]
                opacity-0
              `
          }
        `}
      >
        {/* ========================================
            USER INFORMATION
        ======================================== */}

        <div
          className="
            border-b border-border
            bg-background-soft/60
            px-5 py-5
          "
        >
          <div className="flex items-center gap-3">
            {/* LARGE AVATAR */}

            <div
              className="
                relative
                flex h-12 w-12 shrink-0
                items-center justify-center
                overflow-hidden
                rounded-full
                border border-border
                bg-accent/15
                text-[15px]
                font-bold
                text-text-primary
              "
            >
              {userImage ? (
                <Image
                  src={userImage}
                  alt=""
                  fill
                  sizes="48px"
                  unoptimized
                  className="object-cover"
                />
              ) : (
                initials || (
                  <UserRound size={22} />
                )
              )}
            </div>

            {/* USER NAME / EMAIL */}

            <div className="min-w-0 flex-1">
              <p
                className="
                  truncate
                  text-[14px]
                  font-semibold
                  tracking-[-0.02em]
                  text-text-primary
                "
              >
                {userName}
              </p>

              {userEmail && (
                <p
                  className="
                    mt-1 truncate
                    text-[12px]
                    text-text-secondary
                  "
                  title={userEmail}
                >
                  {userEmail}
                </p>
              )}
            </div>
          </div>

          {/* ACCOUNT ROLE */}

          <div className="mt-4">
            <span
              className="
                inline-flex
                items-center gap-1.5
                rounded-full
                border border-accent/25
                bg-accent/10
                px-2.5 py-1

                text-[10px]
                font-semibold
                uppercase
                tracking-[0.08em]
                text-text-primary
              "
            >
              {isAdmin ? (
                <ShieldCheck
                  size={12}
                  className="text-accent"
                />
              ) : (
                <UserRound
                  size={12}
                  className="text-accent"
                />
              )}

              {isAdmin
                ? "Administrator"
                : "Member"}
            </span>
          </div>
        </div>

        {/* ========================================
            ACCOUNT NAVIGATION
        ======================================== */}

        <div className="p-2">
          <Link
            href={dashboardHref}
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
            className="
              group
              flex min-h-12
              items-center gap-3

              rounded-xl
              px-3 py-2.5

              text-[13px]
              font-medium
              text-text-primary

              transition-all duration-200

              hover:bg-background-soft
              hover:text-accent

              focus-visible:outline-2
              focus-visible:outline-accent
            "
          >
            <span
              className="
                flex h-9 w-9 shrink-0
                items-center justify-center
                rounded-lg
                border border-border
                bg-background-soft
                text-text-secondary

                transition-colors duration-200

                group-hover:border-accent/30
                group-hover:text-accent
              "
            >
              {isAdmin ? (
                <ShieldCheck size={18} />
              ) : (
                <LayoutDashboard size={18} />
              )}
            </span>

            <span className="flex-1">
              {dashboardLabel}
            </span>

            <ChevronRight
              size={16}
              className="
                text-text-muted
                transition-transform duration-200
                group-hover:translate-x-1
                group-hover:text-accent
              "
            />
          </Link>
        </div>

        {/* DIVIDER */}

        <div className="mx-4 h-px bg-border" />

        {/* ========================================
            LOGOUT
        ======================================== */}

        <div className="p-2">
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            disabled={loggingOut}
            className="
              group
              flex min-h-12 w-full
              items-center gap-3
              rounded-xl

              px-3 py-2.5
              text-left

              text-[13px]
              font-medium
              text-text-primary

              transition-all duration-200

              hover:bg-red-500/5
              hover:text-red-600

              dark:hover:text-red-400

              focus-visible:outline-2
              focus-visible:outline-red-500

              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <span
              className="
                flex h-9 w-9 shrink-0
                items-center justify-center
                rounded-lg

                border border-border
                bg-background-soft
                text-text-secondary

                transition-colors duration-200

                group-hover:border-red-500/20
                group-hover:text-red-600

                dark:group-hover:text-red-400
              "
            >
              <LogOut
                size={18}
                strokeWidth={1.8}
              />
            </span>

            <span>
              {loggingOut
                ? "Signing out..."
                : "Log out"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN HEADER
========================================================= */

export default function Header() {
  const pathname = usePathname();

  const {
    data: session,
    status,
  } = useSession();

  /* ================================================
     HEADER STATES
  ================================================ */

  const [theme, setTheme] =
    useState("light");

  const [mounted, setMounted] =
    useState(false);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [headerVisible, setHeaderVisible] =
    useState(true);

  const [scrolled, setScrolled] =
    useState(false);

  const [activeHash, setActiveHash] =
    useState("");

  const lastScrollY = useRef(0);

  const scrollFrame = useRef(null);

  /* ================================================
     SESSION
  ================================================ */

  const isAuthenticated =
    status === "authenticated" &&
    Boolean(session?.user);

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
     THEME TOGGLE
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
     ACTIVE NAVIGATION
  ================================================ */

  useEffect(() => {
    const updateActiveHash = () => {
      setActiveHash(window.location.hash);
    };

    updateActiveHash();

    window.addEventListener(
      "hashchange",
      updateActiveHash
    );

    return () => {
      window.removeEventListener(
        "hashchange",
        updateActiveHash
      );
    };
  }, [pathname]);

  const isActiveLink = useCallback(
    (href) => {
      const [linkPath, linkHash] =
        href.split("#");

      if (pathname !== (linkPath || "/")) {
        return false;
      }

      return (
        Boolean(linkHash) &&
        activeHash === `#${linkHash}`
      );
    },
    [pathname, activeHash]
  );

  const handleNavClick = (href) => {
    const hash = href.split("#")[1];

    if (hash) {
      setActiveHash(`#${hash}`);
    }

    setMobileOpen(false);
    setHeaderVisible(true);
  };

  /* ================================================
     SCROLL BEHAVIOR
  ================================================ */

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      if (scrollFrame.current !== null) {
        return;
      }

      scrollFrame.current =
        window.requestAnimationFrame(() => {
          const currentScrollY = Math.max(
            0,
            window.scrollY
          );

          const previousScrollY =
            lastScrollY.current;

          const difference =
            currentScrollY - previousScrollY;

          setScrolled(currentScrollY > 16);

          if (currentScrollY < 80) {
            setHeaderVisible(true);
          } else if (mobileOpen) {
            setHeaderVisible(true);
          } else if (difference > 5) {
            setHeaderVisible(false);
          } else if (difference < -5) {
            setHeaderVisible(true);
          }

          lastScrollY.current =
            currentScrollY;

          scrollFrame.current = null;
        });
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

        scrollFrame.current = null;
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
     MOBILE MENU ESCAPE
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

  /* ================================================
     LOGIN / AVATAR COMPONENT

     Reused on desktop and mobile.
  ================================================ */

  const renderAccountAction = () => {
    if (status === "loading") {
      return (
        <span
          aria-label="Loading account"
          className="
            h-10 w-10
            animate-pulse
            rounded-full
            border border-border
            bg-background-soft
          "
        />
      );
    }

    if (isAuthenticated) {
      return (
        <UserAvatarMenu
          session={session}
          pathname={pathname}
          onNavigate={() => {
            setMobileOpen(false);
          }}
        />
      );
    }

    return (
      <Link
        href="/login"
        onClick={() => {
          setMobileOpen(false);
        }}
        className="
          inline-flex h-10
          shrink-0 items-center
          justify-center

          whitespace-nowrap
          rounded-full
          px-4

          text-[13px]
          font-semibold
          text-text-primary

          transition-colors duration-200

          hover:bg-background-soft

          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-accent
        "
      >
        Log in
      </Link>
    );
  };

  /* ================================================
     CTA BUTTON
  ================================================ */

  const renderCTA = (mobile = false) => (
    <Link
      href="/cv-builder"
      onClick={() => setMobileOpen(false)}
      className={`
        group
        inline-flex
        items-center justify-center
        gap-2.5

        rounded-xl
        bg-[#07183f]

        text-[13px]
        font-semibold
        tracking-[-0.01em]
        text-white

        transition-all duration-300

        hover:bg-[#102b66]

        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-accent

        dark:bg-accent
        dark:text-[#061747]
        dark:hover:bg-accent-hover

        ${
          mobile
            ? "h-12 w-full px-3"
            : `
              h-11
              whitespace-nowrap
              px-6
              shadow-sm

              hover:-translate-y-0.5
              hover:shadow-md
            `
        }
      `}
    >
      <span>Create Your CV</span>

      <ArrowUpRight
        size={16}
        strokeWidth={1.9}
        aria-hidden="true"
        className="
          transition-transform duration-300

          group-hover:translate-x-0.5
          group-hover:-translate-y-0.5
        "
      />
    </Link>
  );

  /* =========================================================
     RENDER HEADER
  ========================================================= */

  return (
    <>
      <header
        className={`
          fixed inset-x-0 top-0 z-50
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
        {/* ============================================
            MAIN NAVBAR
        ============================================ */}

        <div
          className="
            mx-auto
            flex h-[76px]
            w-full max-w-[1440px]
            items-center justify-between
            gap-3

            px-5
            sm:px-8

            lg:h-[84px]
            lg:gap-6
            lg:px-12

            xl:px-16
          "
        >
          {/* ========================================
              LOGO
          ======================================== */}

          <Link
            href="/"
            aria-label="QORLIQ CV — Home"
            onClick={() => {
              setMobileOpen(false);
            }}
            className="
              relative z-10
              inline-flex shrink-0
              items-center

              rounded-md

              focus-visible:outline-2
              focus-visible:outline-offset-4
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
                h-auto w-[125px]
                object-contain

                dark:hidden

                sm:w-[158px]
                lg:w-[185px]
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
                hidden h-auto w-[125px]
                object-contain

                dark:block

                sm:w-[158px]
                lg:w-[185px]
              "
            />
          </Link>

          {/* ========================================
              DESKTOP NAVIGATION
          ======================================== */}

          <nav
            aria-label="Main navigation"
            className="
              hidden
              items-center justify-center
              gap-7

              lg:flex
              xl:gap-9
            "
          >
            {navigation.map((item) => {
              const active = isActiveLink(
                item.href
              );

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() =>
                    handleNavClick(item.href)
                  }
                  aria-current={
                    active
                      ? "location"
                      : undefined
                  }
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

          {/* ========================================
              DESKTOP ACTIONS
          ======================================== */}

          <div
            className="
              hidden shrink-0
              items-center gap-3

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
                aria-hidden="true"
                className="
                  h-10 w-10
                  rounded-full
                  border border-border
                "
              />
            )}

            {/* LOGIN OR AVATAR */}

            {renderAccountAction()}

            {/* CREATE CV */}

            {renderCTA()}
          </div>

          {/* ========================================
              MOBILE ACTIONS
          ======================================== */}

          <div
            className="
              flex shrink-0
              items-center gap-2

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
                aria-hidden="true"
                className="
                  h-10 w-10
                  rounded-full
                  border border-border
                "
              />
            )}

            {/* MOBILE AVATAR */}

            {isAuthenticated && (
              <UserAvatarMenu
                session={session}
                pathname={pathname}
                onNavigate={() =>
                  setMobileOpen(false)
                }
              />
            )}

            {/* MOBILE MENU BUTTON */}

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
                setMobileOpen(
                  (prev) => !prev
                );

                setHeaderVisible(true);
              }}
              className="
                flex h-10 w-10
                items-center justify-center

                rounded-xl
                border border-border
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

        {/* ============================================
            MOBILE NAVIGATION
        ============================================ */}

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
                flex flex-col
                px-5 pb-6 pt-3
                sm:px-8
              "
            >
              {/* NAVIGATION LINKS */}

              {navigation.map((item) => {
                const active = isActiveLink(
                  item.href
                );

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() =>
                      handleNavClick(
                        item.href
                      )
                    }
                    aria-current={
                      active
                        ? "location"
                        : undefined
                    }
                    className={`
                      group
                      relative
                      flex min-h-13
                      items-center justify-between

                      border-b border-border
                      py-3 pl-4 pr-1

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
                    {active && (
                      <span
                        aria-hidden="true"
                        className="
                          absolute
                          inset-y-2 left-0
                          w-[3px]
                          rounded-full
                          bg-accent
                        "
                      />
                    )}

                    <span>
                      {item.label}
                    </span>

                    <ChevronRight
                      size={17}
                      aria-hidden="true"
                      className={`
                        transition-all
                        duration-300

                        ${
                          active
                            ? `
                              translate-x-1
                              text-accent
                            `
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

              {/* ====================================
                  MOBILE ACCOUNT / CTA ACTIONS
              ==================================== */}

              <div
                className={`
                  mt-6 grid gap-3

                  ${
                    isAuthenticated
                      ? "grid-cols-1"
                      : "grid-cols-2"
                  }
                `}
              >
                {/* GUEST LOGIN */}

                {!isAuthenticated && (
                  <Link
                    href="/login"
                    onClick={() =>
                      setMobileOpen(false)
                    }
                    className="
                      inline-flex h-12
                      items-center justify-center

                      rounded-xl

                      border border-border-strong
                      bg-surface

                      text-sm font-semibold
                      text-text-primary

                      transition-colors

                      hover:bg-background-soft

                      focus-visible:outline-2
                      focus-visible:outline-accent
                    "
                  >
                    Log in
                  </Link>
                )}

                {/* CREATE CV */}

                {renderCTA(true)}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* ============================================
          HEADER HEIGHT SPACER
      ============================================ */}

      <div
        aria-hidden="true"
        className="
          h-[76px]
          lg:h-[84px]
        "
      />
    </>
  );
}