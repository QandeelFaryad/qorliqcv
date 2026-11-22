"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Download,
  CreditCard,
  Settings,
  CircleHelp,
  Crown,
  X,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useReducedMotion,
} from "motion/react";

/* =========================================================
   CONFIGURATION
========================================================= */

const EASE = [0.22, 1, 0.36, 1];

/* =========================================================
   NAVIGATION
   ALL EXISTING ROUTES PRESERVED
========================================================= */

const navigationItems = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "My CVs",
    href: "/dashboard/cvs",
    icon: FileText,
  },
  {
    name: "Create New CV",
    href: "/cv-builder",
    icon: PlusCircle,
  },
  {
    name: "Downloads",
    href: "/dashboard/downloads",
    icon: Download,
  },
  {
    name: "Subscription & Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
];

const secondaryNavigationItems = [
  {
    name: "Account Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    name: "Help & Support",
    href: "/dashboard/support",
    icon: CircleHelp,
  },
];

/* =========================================================
   ACTIVE ROUTE
========================================================= */

function isRouteActive(pathname, href) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname.startsWith(href);
}

/* =========================================================
   SIDEBAR LOGO
   DIRECT IMAGES — NO HEADERLOGO COMPONENT
========================================================= */

function SidebarLogo({ onNavigate }) {
  return (
    <Link
      href="/dashboard"
      onClick={onNavigate}
      aria-label="QORLIQ CV Dashboard"
      className="
        inline-flex
        min-w-0
        flex-1
        items-center
        rounded-md
        outline-offset-4
        transition-opacity
        duration-200
        hover:opacity-85
        focus-visible:outline-2
        focus-visible:outline-[var(--qd-accent)]
      "
    >
      {/* LIGHT MODE LOGO */}

      <Image
        src="/QORLIQ_cv.svg"
        alt="QORLIQ CV"
        width={260}
        height={80}
        priority
        sizes="(max-width: 639px) 155px, (max-width: 1023px) 200px, 240px"
        className="
          block
          h-auto
          w-[155px]
          max-w-full
          object-contain

          sm:w-[200px]
          lg:w-[220px]
          xl:w-[240px]

          [.q-dashboard[data-theme='dark']_&]:hidden
        "
      />

      {/* DARK MODE LOGO */}

      <Image
        src="/QORLIQ_cv_dark.svg"
        alt="QORLIQ CV"
        width={260}
        height={80}
        priority
        sizes="(max-width: 639px) 155px, (max-width: 1023px) 200px, 240px"
        className="
          hidden
          h-auto
          w-[155px]
          max-w-full
          object-contain

          sm:w-[200px]
          lg:w-[220px]
          xl:w-[240px]

          [.q-dashboard[data-theme='dark']_&]:block
        "
      />
    </Link>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({ children, reducedMotion }) {
  return (
    <motion.div
      initial={
        reducedMotion
          ? false
          : {
              opacity: 0,
              y: 8,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: reducedMotion ? 0 : 0.4,
        ease: EASE,
      }}
      className="
        mb-3
        flex
        items-center
        gap-3
        px-3
      "
    >
      <span
        className="
          text-[11px]
          font-semibold
          uppercase
          tracking-[0.13em]
          text-[var(--qd-text-muted)]
        "
      >
        {children}
      </span>

      <span
        aria-hidden="true"
        className="
          h-px
          min-w-0
          flex-1
          bg-[var(--qd-border)]
        "
      />
    </motion.div>
  );
}

/* =========================================================
   PREMIUM NAVIGATION ITEM
========================================================= */

function SidebarNavItem({
  item,
  pathname,
  onNavigate,
  index,
  reducedMotion,
}) {
  const Icon = item.icon;

  const active = isRouteActive(pathname, item.href);

  return (
    <motion.div
      initial={
        reducedMotion
          ? false
          : {
              opacity: 0,
              x: -14,
            }
      }
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        duration: reducedMotion ? 0 : 0.45,
        delay: reducedMotion ? 0 : 0.08 + index * 0.045,
        ease: EASE,
      }}
      className="relative"
    >
      <motion.div
        whileHover={
          reducedMotion
            ? undefined
            : {
                x: 2,
              }
        }
        whileTap={
          reducedMotion
            ? undefined
            : {
                scale: 0.985,
              }
        }
        transition={{
          duration: 0.18,
          ease: "easeOut",
        }}
      >
        <Link
          href={item.href}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          className={`
            group
            relative
            flex
            h-[52px]
            w-full
            items-center
            gap-3.5
            overflow-hidden
            rounded-[13px]
            px-3.5

            text-[14px]
            font-medium
            tracking-[-0.012em]

            outline-none

            transition-colors
            duration-200

            focus-visible:ring-2
            focus-visible:ring-[var(--qd-accent)]

            ${
              active
                ? `
                  bg-[var(--qd-background-muted)]
                  font-semibold
                  text-[var(--qd-text-primary)]
                `
                : `
                  text-[var(--qd-text-secondary)]
                  hover:bg-[var(--qd-background-soft)]
                  hover:text-[var(--qd-text-primary)]
                `
            }
          `}
        >
          {/* ANIMATED ACTIVE BACKGROUND */}

          {active && (
            <motion.span
              layoutId="customer-sidebar-active-bg"
              initial={false}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : {
                      type: "spring",
                      stiffness: 360,
                      damping: 35,
                    }
              }
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-0
                rounded-[13px]
                border
                border-[var(--qd-border)]
              "
            />
          )}

          {/* ANIMATED ACTIVE INDICATOR */}

          {active && (
            <motion.span
              layoutId="customer-sidebar-active-line"
              initial={false}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : {
                      type: "spring",
                      stiffness: 420,
                      damping: 32,
                    }
              }
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-y-[12px]
                left-0
                w-[3px]
                rounded-r-full
                bg-[var(--qd-accent)]
              "
            />
          )}

          {/* ICON */}

          <span
            className={`
              relative
              z-10
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-[10px]

              transition-colors
              duration-200

              ${
                active
                  ? `
                    bg-[var(--qd-surface)]
                    text-[var(--qd-primary)]
                  `
                  : `
                    text-[var(--qd-text-muted)]
                    group-hover:bg-[var(--qd-surface)]
                    group-hover:text-[var(--qd-text-primary)]
                  `
              }
            `}
          >
            <Icon
              size={20}
              strokeWidth={active ? 2 : 1.85}
              aria-hidden="true"
            />
          </span>

          {/* LABEL */}

          <span
            className="
              relative
              z-10
              min-w-0
              flex-1
              truncate
            "
          >
            {item.name}
          </span>

          {/* ACTIVE ARROW */}

          <AnimatePresence mode="wait">
            {active && (
              <motion.span
                key="active-arrow"
                initial={
                  reducedMotion
                    ? false
                    : {
                        opacity: 0,
                        x: -5,
                      }
                }
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: 5,
                }}
                transition={{
                  duration: reducedMotion ? 0 : 0.2,
                }}
                className="
                  relative
                  z-10
                  shrink-0
                  text-[var(--qd-text-secondary)]
                "
              >
                <ChevronRight
                  size={17}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </motion.div>
    </motion.div>
  );
}

/* =========================================================
   SUBSCRIPTION CARD
========================================================= */

function SidebarSubscription({
  planName,
  planLoading,
  planError,
  onNavigate,
  reducedMotion,
}) {
  return (
    <motion.div
      initial={
        reducedMotion
          ? false
          : {
              opacity: 0,
              y: 18,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: reducedMotion ? 0 : 0.5,
        delay: reducedMotion ? 0 : 0.3,
        ease: EASE,
      }}
      className="
        relative
        overflow-hidden
        rounded-[17px]
        border
        border-[var(--qd-border)]
        bg-[var(--qd-background-soft)]
        p-[17px]
      "
    >
      {/* CARD HEADER */}

      <div className="flex items-center justify-between gap-3">
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-[var(--qd-background-muted)]
            text-[var(--qd-text-primary)]
          "
        >
          <Crown
            size={20}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </div>

        <span
          className="
            inline-flex
            items-center
            gap-1.5
            rounded-full
            border
            border-[var(--qd-border)]
            bg-[var(--qd-surface)]
            px-2.5
            py-1.5
            text-[10px]
            font-semibold
            text-[var(--qd-text-secondary)]
          "
        >
          <span
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-[var(--qd-accent)]
            "
          />

          Your plan
        </span>
      </div>

      {/* PLAN DETAILS */}

      <div className="mt-4">
        <p
          className="
            text-[11px]
            font-medium
            text-[var(--qd-text-muted)]
          "
        >
          Current subscription
        </p>

        <h3
          className="
            mt-1
            break-words
            text-[15px]
            font-semibold
            leading-[1.5]
            tracking-[-0.025em]
            text-[var(--qd-text-primary)]
          "
        >
          {planLoading
            ? "Loading plan..."
            : planError
              ? "Plan unavailable"
              : planName}
        </h3>

        <p
          className="
            mt-1.5
            text-[12px]
            leading-[1.7]
            text-[var(--qd-text-secondary)]
          "
        >
          {planError
            ? planError
            : "Manage your subscription and explore available packages."}
        </p>
      </div>

      {/* PRICING BUTTON */}

      <motion.div
        className="mt-4"
        whileHover={
          reducedMotion
            ? undefined
            : {
                y: -2,
              }
        }
        whileTap={
          reducedMotion
            ? undefined
            : {
                scale: 0.985,
              }
        }
        transition={{
          duration: 0.18,
        }}
      >
     <Link
  href="/pricing"
  onClick={onNavigate}
  className="
    flex
    min-h-[43px]
    w-full
    items-center
    justify-center
    gap-2
    rounded-[11px]
    bg-[var(--qd-primary)]
    px-3
    text-[13px]
    font-semibold

    !text-white
    [.q-dashboard[data-theme=dark]_&]:!text-[#061747]

    transition-all
    duration-200
    hover:bg-[var(--qd-primary-hover)]

    focus-visible:outline-2
    focus-visible:outline-offset-2
    focus-visible:outline-[var(--qd-accent)]
  "
>
  View Packages

  <ArrowUpRight
    size={16}
    strokeWidth={1.9}
    aria-hidden="true"
  />
</Link>
      </motion.div>
    </motion.div>
  );
}

/* =========================================================
   USER PROFILE
========================================================= */

function SidebarProfile({
  userName,
  userEmail,
  status,
  reducedMotion,
}) {
  return (
    <motion.div
      initial={
        reducedMotion
          ? false
          : {
              opacity: 0,
              y: 10,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: reducedMotion ? 0 : 0.4,
        delay: reducedMotion ? 0 : 0.25,
        ease: EASE,
      }}
      className="
        flex
        min-w-0
        items-center
        gap-3
        rounded-[13px]
        px-2
        py-2
      "
    >
      {/* AVATAR */}

      <div
        className="
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-[13px]
          border
          border-[var(--qd-border)]
          bg-[var(--qd-background-muted)]
          text-[13px]
          font-semibold
          text-[var(--qd-text-primary)]
        "
      >
        {status === "loading"
          ? "…"
          : getInitials(userName)}
      </div>

      {/* USER INFORMATION */}

      <div className="min-w-0 flex-1">
        <p
          title={userName}
          className="
            truncate
            text-[13px]
            font-semibold
            text-[var(--qd-text-primary)]
          "
        >
          {userName}
        </p>

        <p
          title={userEmail}
          className="
            mt-1
            truncate
            text-[11px]
            text-[var(--qd-text-muted)]
          "
        >
          {userEmail}
        </p>
      </div>
    </motion.div>
  );
}

/* =========================================================
   CUSTOMER DASHBOARD SIDEBAR
========================================================= */

export default function DashboardSidebar({
  isMobileOpen = false,
  onMobileClose,
  onLogout,
}) {
  const pathname = usePathname();

  const reducedMotion = useReducedMotion();

  const { data: session, status } = useSession();

  /* =====================================================
     STATE
  ===================================================== */

  const [planData, setPlanData] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [planError, setPlanError] = useState("");

  /* =====================================================
     USER DETAILS
  ===================================================== */

  const userName =
    status === "loading"
      ? "Loading..."
      : session?.user?.name || "User";

  const userEmail = session?.user?.email || "";

  /* =====================================================
     EXISTING SUBSCRIPTION API
  ===================================================== */

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setPlanData(null);
    setPlanError("");

    if (status === "loading") {
      setPlanLoading(true);

      return () => {
        active = false;
        controller.abort();
      };
    }

    if (status !== "authenticated") {
      setPlanLoading(false);

      return () => {
        active = false;
        controller.abort();
      };
    }

    async function fetchAccess() {
      setPlanLoading(true);

      try {
        const response = await fetch("/api/user/access", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await response.json().catch(() => null);

        if (
          !response.ok ||
          !data ||
          data.success === false
        ) {
          throw new Error("Unable to load plan.");
        }

        if (!active) return;

        setPlanData(data.access ?? data);
      } catch (error) {
        if (!active || error.name === "AbortError") return;

        setPlanError("Unable to load plan.");
      } finally {
        if (active) {
          setPlanLoading(false);
        }
      }
    }

    void fetchAccess();

    return () => {
      active = false;
      controller.abort();
    };
  }, [status, session?.user?.id, pathname]);

  /* =====================================================
     PLAN NAME
  ===================================================== */

  const planName =
    planData?.planName ||
    formatPlanName(planData?.plan);

  /* =====================================================
     NAVIGATION
  ===================================================== */

  const handleNavigationClick = () => {
    onMobileClose?.();
  };

  /* =====================================================
     EXISTING LOGOUT LOGIC
  ===================================================== */

  const handleLogout = async () => {
    if (typeof onLogout === "function") {
      await onLogout();
      return;
    }

    await signOut({
      callbackUrl: "/login",
    });
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <>
      {/* ===============================================
          MOBILE BACKDROP
      =============================================== */}

      <AnimatePresence>
        {isMobileOpen && (
          <motion.button
            key="dashboard-sidebar-backdrop"
            type="button"
            aria-label="Close dashboard menu"
            onClick={onMobileClose}
            initial={
              reducedMotion
                ? false
                : { opacity: 0 }
            }
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reducedMotion ? 0 : 0.25,
            }}
            className="
              fixed
              inset-0
              z-40
              bg-[#06132c]/55
              backdrop-blur-[3px]
              lg:hidden
            "
          />
        )}
      </AnimatePresence>

      {/* ===============================================
          SIDEBAR CONTAINER
      =============================================== */}

      <aside
        aria-label="Customer dashboard sidebar"
        className={`
          fixed
          inset-y-0
          left-0
          z-50

          flex
          h-dvh
          w-[290px]
          flex-col

          overflow-hidden

          border-r
          border-[var(--qd-border)]

          bg-[var(--qd-surface)]
          font-sans

          shadow-[8px_0_32px_rgba(7,24,63,0.04)]

          transition-transform
          duration-[380ms]
          ease-[cubic-bezier(0.22,1,0.36,1)]

          motion-reduce:transition-none
          lg:translate-x-0

          ${
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* ===============================================
            SIDEBAR HEADER / LOGOS
        =============================================== */}

        <div
          className="
            flex
            h-[82px]
            shrink-0
            items-center
            justify-between

            border-b
            border-[var(--qd-border)]
            px-5
          "
        >
          <SidebarLogo
            onNavigate={handleNavigationClick}
          />

          {/* MOBILE CLOSE */}

          <motion.button
            type="button"
            aria-label="Close menu"
            onClick={onMobileClose}
            whileTap={
              reducedMotion
                ? undefined
                : { scale: 0.92 }
            }
            transition={{
              duration: 0.2,
            }}
            className="
              ml-2
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-[10px]

              border
              border-[var(--qd-border)]

              bg-[var(--qd-background-soft)]
              text-[var(--qd-text-secondary)]

              transition-colors
              duration-200

              hover:bg-[var(--qd-background-muted)]
              hover:text-[var(--qd-text-primary)]

              lg:hidden
            "
          >
            <X
              size={19}
              strokeWidth={1.8}
            />
          </motion.button>
        </div>

        {/* ===============================================
            SCROLLABLE NAVIGATION
        =============================================== */}

        <div
          className="
            min-h-0
            flex-1
            overflow-x-hidden
            overflow-y-auto

            px-4
            pb-6
            pt-7

            [scrollbar-width:thin]
            [scrollbar-color:var(--qd-border-strong)_transparent]
          "
        >
          {/* WORKSPACE NAVIGATION */}

          <section aria-label="Workspace navigation">
            <SectionHeading
              reducedMotion={reducedMotion}
            >
              Workspace
            </SectionHeading>

            <LayoutGroup id="customer-sidebar-navigation">
              <nav
                aria-label="Workspace"
                className="space-y-1.5"
              >
                {navigationItems.map((item, index) => (
                  <SidebarNavItem
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    onNavigate={handleNavigationClick}
                    index={index}
                    reducedMotion={reducedMotion}
                  />
                ))}
              </nav>

              {/* ACCOUNT NAVIGATION */}

              <div className="mt-8">
                <SectionHeading
                  reducedMotion={reducedMotion}
                >
                  Account
                </SectionHeading>

                <nav
                  aria-label="Account"
                  className="space-y-1.5"
                >
                  {secondaryNavigationItems.map(
                    (item, index) => (
                      <SidebarNavItem
                        key={item.href}
                        item={item}
                        pathname={pathname}
                        onNavigate={handleNavigationClick}
                        index={navigationItems.length + index}
                        reducedMotion={reducedMotion}
                      />
                    )
                  )}
                </nav>
              </div>
            </LayoutGroup>
          </section>

          {/* SUBSCRIPTION CARD */}

          <div className="mt-8">
            <SidebarSubscription
              planName={planName}
              planLoading={planLoading}
              planError={planError}
              onNavigate={handleNavigationClick}
              reducedMotion={reducedMotion}
            />
          </div>
        </div>

        {/* ===============================================
            USER PROFILE FOOTER
        =============================================== */}

        <div
          className="
            shrink-0
            border-t
            border-[var(--qd-border)]
            bg-[var(--qd-surface)]

            px-4
            py-3
          "
        >
          <SidebarProfile
            userName={userName}
            userEmail={userEmail}
            status={status}
            reducedMotion={reducedMotion}
          />
        </div>
      </aside>
    </>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getInitials(name = "") {
  const initials = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  return initials || "QC";
}

function formatPlanName(plan) {
  if (typeof plan !== "string" || !plan.trim()) {
    return "Plan details unavailable";
  }

  if (plan.toLowerCase() === "free") {
    return "Free Plan";
  }

  return plan
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}