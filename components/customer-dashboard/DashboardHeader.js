"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  Bell,
  ChevronDown,
  Menu,
  Plus,
  Settings,
  UserRound,
  LogOut,
  FileText,
  FilePlus2,
  FilePenLine,
  Download,
  Loader2,
  RefreshCw,
  Sun,
  Moon,
  X,
  Check,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "motion/react";

/* =========================================================
   DESIGN CONFIGURATION
========================================================= */

const EASE = [0.22, 1, 0.36, 1];

const COLORS = {
  primary: "var(--qd-text-primary)",
  secondary: "var(--qd-text-secondary)",
  muted: "var(--qd-text-muted)",
  surface: "var(--qd-surface)",
  surfaceSecondary: "var(--qd-surface-secondary)",
  backgroundSoft: "var(--qd-background-soft)",
  backgroundMuted: "var(--qd-background-muted)",
  border: "var(--qd-border)",
  accent: "var(--qd-accent)",
};

/* =========================================================
   PAGE INFORMATION — EXISTING ROUTES PRESERVED
========================================================= */

const pageDetails = {
  "/dashboard": {
    title: "Dashboard",
    description:
      "Manage your CVs, downloads, subscription, and account.",
  },

  "/dashboard/cvs": {
    title: "My CVs",
    description:
      "View, edit, and manage your saved CVs.",
  },

  "/dashboard/templates": {
    title: "CV Templates",
    description:
      "Explore professional CV templates.",
  },

  "/dashboard/downloads": {
    title: "Downloads",
    description:
      "Access your CV download history.",
  },

  "/dashboard/billing": {
    title: "Subscription & Billing",
    description:
      "Manage your package, payments, and billing information.",
  },

  "/dashboard/orders": {
    title: "Orders",
    description:
      "Review your purchase history and payment records.",
  },

  "/dashboard/settings": {
    title: "Account Settings",
    description:
      "Update your profile, password, and account preferences.",
  },

  "/dashboard/support": {
    title: "Help & Support",
    description:
      "Get assistance with your account, CVs, and payments.",
  },
};

/* =========================================================
   HELPERS — EXISTING FUNCTIONALITY PRESERVED
========================================================= */

function getTimestamp(value) {
  if (!value) return null;

  const timestamp = new Date(value).getTime();

  return Number.isFinite(timestamp)
    ? timestamp
    : null;
}

function firstText(...values) {
  return (
    values.find(
      (value) =>
        typeof value === "string" &&
        value.trim()
    ) || ""
  );
}

function getInitials(name = "") {
  return (
    String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) =>
        word.charAt(0).toUpperCase()
      )
      .join("") || "U"
  );
}

/* =========================================================
   BUILD NOTIFICATIONS — EXISTING LOGIC PRESERVED
========================================================= */

function buildNotifications(cvs, downloads) {
  const notifications = [];
  const titles = new Map();

  for (const cv of cvs) {
    const id = cv._id || cv.id;

    if (!id) continue;

    const documentName =
      firstText(
        cv.title,
        cv.jobTitle,
        cv.personalInfo?.jobTitle
      ) || "Untitled CV";

    titles.set(String(id), documentName);

    const createdAt = getTimestamp(cv.createdAt);
    const updatedAt = getTimestamp(cv.updatedAt);

    if (createdAt !== null) {
      notifications.push({
        id: `cv-created-${id}`,
        title: "CV created",
        message: "You created a CV.",
        documentName,
        timestamp: createdAt,
        icon: FilePlus2,
        iconClass:
          "bg-emerald-500/10 text-emerald-600",
        href: `/dashboard/cvs/${encodeURIComponent(
          String(id)
        )}`,
      });
    }

    if (
      updatedAt !== null &&
      (createdAt === null ||
        updatedAt > createdAt)
    ) {
      notifications.push({
        id: `cv-updated-${id}`,
        title: "CV updated",
        message: "Your CV record was updated.",
        documentName,
        timestamp: updatedAt,
        icon: FilePenLine,
        iconClass:
          "bg-blue-500/10 text-blue-600",
        href: `/dashboard/cvs/${encodeURIComponent(
          String(id)
        )}`,
      });
    }
  }

  for (const record of downloads) {
    const id = record._id || record.id;

    const timestamp = getTimestamp(
      record.downloadedAt ||
        record.createdAt
    );

    if (!id || timestamp === null) continue;

    const cvId =
      record.cvId &&
      typeof record.cvId === "object"
        ? record.cvId._id
        : record.cvId;

    const documentName =
      firstText(
        record.cvTitle,
        titles.get(String(cvId || ""))
      ) || "Untitled CV";

    const format = String(
      record.format || ""
    ).toLowerCase();

    const status = String(
      record.status || ""
    ).toLowerCase();

    let title = "Download activity";
    let message =
      "A download request was recorded.";

    let icon = Download;

    let iconClass =
      "bg-blue-500/10 text-blue-600";

    if (
      status === "completed" ||
      status === "successful"
    ) {
      if (format === "pdf") {
        title = "PDF downloaded";
        message =
          "Your CV PDF download was recorded as completed.";

        iconClass =
          "bg-red-500/10 text-red-600";
      } else if (
        ["docx", "doc", "word"].includes(
          format
        )
      ) {
        title = "Word file downloaded";
        message =
          "Your CV Word download was recorded as completed.";

        icon = FileText;

        iconClass =
          "bg-indigo-500/10 text-indigo-600";
      } else {
        title = "CV downloaded";
        message =
          "Your CV download was recorded as completed.";
      }
    } else if (status === "pending") {
      title = "Download pending";
      message =
        "Your CV download request is pending.";

      iconClass =
        "bg-orange-500/10 text-orange-600";
    } else if (status === "failed") {
      title = "Download failed";
      message =
        "Your CV download was recorded as failed.";

      iconClass =
        "bg-red-500/10 text-red-600";
    } else if (status === "expired") {
      title = "Download expired";
      message =
        "Your CV download record is marked as expired.";

      iconClass =
        "bg-amber-500/10 text-amber-600";
    }

    notifications.push({
      id: `download-${id}`,
      title,
      message,
      documentName,
      timestamp,
      icon,
      iconClass,
      href: "/dashboard/downloads",
    });
  }

  return notifications.sort(
    (a, b) => b.timestamp - a.timestamp
  );
}

/* =========================================================
   ACTIVITY TIME
========================================================= */

function formatActivityTime(timestamp) {
  const minutes = Math.max(
    0,
    Math.floor(
      (Date.now() - timestamp) / 60000
    )
  );

  if (minutes < 1) return "Just now";

  if (minutes < 60) {
    return `${minutes} minute${
      minutes === 1 ? "" : "s"
    } ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${
      hours === 1 ? "" : "s"
    } ago`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) return "Yesterday";

  if (days < 7) return `${days} days ago`;

  return new Date(
    timestamp
  ).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* =========================================================
   FETCH RECORDS — EXISTING API LOGIC PRESERVED
========================================================= */

async function fetchRecords(url, key, signal) {
  const response = await fetch(url, {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
    signal,
  });

  if (response.status === 401) {
    throw new Error(
      "Please log in to view your activity."
    );
  }

  const data = await response
    .json()
    .catch(() => null);

  if (
    !response.ok ||
    !data ||
    data.success === false ||
    !Array.isArray(data[key])
  ) {
    throw new Error(
      "Could not load recent activity. Please try again."
    );
  }

  return data[key];
}

/* =========================================================
   REUSABLE HEADER ICON BUTTON
========================================================= */

function HeaderIconButton({
  children,
  onClick,
  label,
  expanded,
  disabled = false,
  className = "",
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-expanded={expanded}
      whileHover={
        reducedMotion
          ? undefined
          : { y: -1 }
      }
      whileTap={
        reducedMotion
          ? undefined
          : { scale: 0.94 }
      }
      transition={{
        duration: 0.18,
      }}
      className={`
        relative
        inline-flex
        h-11
        w-11
        shrink-0
        items-center
        justify-center
        rounded-xl

        border
        border-[var(--qd-border)]

        bg-[var(--qd-surface)]
        text-[var(--qd-text-secondary)]

        transition-colors
        duration-200

        hover:border-[var(--qd-border-strong)]
        hover:bg-[var(--qd-background-soft)]
        hover:text-[var(--qd-text-primary)]

        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-[var(--qd-accent)]

        disabled:cursor-not-allowed
        disabled:opacity-50

        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}

/* =========================================================
   ANIMATED LIGHT / DARK THEME TOGGLE
========================================================= */

function DashboardThemeToggle({
  theme = "light",
  onThemeToggle,
  themeReady = true,
}) {
  const reducedMotion = useReducedMotion();

  const isDark = theme === "dark";

  return (
    <motion.button
      type="button"
      onClick={onThemeToggle}
      disabled={
        !themeReady ||
        typeof onThemeToggle !== "function"
      }
      aria-label={
        isDark
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      title={
        isDark ? "Light mode" : "Dark mode"
      }
      aria-pressed={isDark}
      whileHover={
        reducedMotion
          ? undefined
          : { y: -1 }
      }
      whileTap={
        reducedMotion
          ? undefined
          : { scale: 0.95 }
      }
      className="
        relative
        flex
        h-11
        w-11
        shrink-0
        items-center
        justify-center
        overflow-hidden
        rounded-xl

        border
        border-[var(--qd-border)]

        bg-[var(--qd-surface)]
        text-[var(--qd-text-primary)]

        transition-colors
        duration-300

        hover:bg-[var(--qd-background-soft)]
        hover:border-[var(--qd-border-strong)]

        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-[var(--qd-accent)]

        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={
              reducedMotion
                ? false
                : {
                    opacity: 0,
                    rotate: -45,
                    scale: 0.6,
                  }
            }
            animate={{
              opacity: 1,
              rotate: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              rotate: 45,
              scale: 0.6,
            }}
            transition={{
              duration: reducedMotion
                ? 0
                : 0.25,
              ease: EASE,
            }}
            className="
              flex
              items-center
              justify-center
              text-[var(--qd-accent)]
            "
          >
            <Sun
              size={20}
              strokeWidth={1.9}
            />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={
              reducedMotion
                ? false
                : {
                    opacity: 0,
                    rotate: 45,
                    scale: 0.6,
                  }
            }
            animate={{
              opacity: 1,
              rotate: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              rotate: -45,
              scale: 0.6,
            }}
            transition={{
              duration: reducedMotion
                ? 0
                : 0.25,
              ease: EASE,
            }}
            className="
              flex
              items-center
              justify-center
            "
          >
            <Moon
              size={20}
              strokeWidth={1.9}
            />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* =========================================================
   USER AVATAR
========================================================= */

function UserAvatar({
  user,
  large = false,
}) {
  const [failedImage, setFailedImage] =
    useState("");

  const sizeClasses = large
    ? "h-12 w-12 text-sm"
    : "h-9 w-9 text-xs";

  if (
    user.image &&
    failedImage !== user.image
  ) {
    return (
      <img
        src={user.image}
        alt={user.name || "Profile"}
        referrerPolicy="no-referrer"
        onError={() =>
          setFailedImage(user.image)
        }
        className={`
          ${sizeClasses}
          shrink-0
          rounded-xl
          object-cover
        `}
      />
    );
  }

  return (
    <div
      className={`
        ${sizeClasses}

        flex
        shrink-0
        items-center
        justify-center

        rounded-xl
        border
        border-[var(--qd-border)]

        bg-[var(--qd-background-muted)]

        font-semibold
        text-[var(--qd-text-primary)]
      `}
    >
      {getInitials(user.name)}
    </div>
  );
}

/* =========================================================
   PROFILE MENU LINK
========================================================= */

function ProfileMenuLink({
  href,
  icon: Icon,
  label,
  onClick,
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="
        group
        flex
        min-h-[44px]
        w-full
        items-center
        gap-3

        rounded-xl
        px-3

        text-[13px]
        font-medium
        text-[var(--qd-text-secondary)]

        transition-colors
        duration-200

        hover:bg-[var(--qd-background-soft)]
        hover:text-[var(--qd-text-primary)]
      "
    >
      <Icon
        size={18}
        strokeWidth={1.8}
        className="
          text-[var(--qd-text-muted)]
          transition-colors
          group-hover:text-[var(--qd-text-primary)]
        "
      />

      <span className="flex-1">
        {label}
      </span>

      <ArrowRight
        size={15}
        className="
          opacity-0
          transition-opacity
          group-hover:opacity-60
        "
      />
    </Link>
  );
}

/* =========================================================
   MAIN DASHBOARD HEADER
========================================================= */

export default function DashboardHeader({
  onMobileMenuOpen,
  onLogout,

  // Independent dashboard theme
  theme = "light",
  onThemeToggle,
  themeReady = true,
}) {
  const pathname =
    usePathname() || "/dashboard";

  const reducedMotion = useReducedMotion();

  const {
    data: session,
    status,
  } = useSession();

  /* =====================================================
     STATES
  ===================================================== */

  const [
    isProfileOpen,
    setIsProfileOpen,
  ] = useState(false);

  const [
    isNotificationsOpen,
    setIsNotificationsOpen,
  ] = useState(false);

  const [showAll, setShowAll] =
    useState(false);

  const [reloadKey, setReloadKey] =
    useState(0);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [logoutError, setLogoutError] =
    useState("");

  const [
    activityState,
    setActivityState,
  ] = useState({
    owner: "",
    items: [],
    loading: true,
    error: "",
  });

  const profileMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);

  /* =====================================================
     ACCOUNT DATA
  ===================================================== */

  const accountKey =
    status === "authenticated"
      ? String(
          session?.user?.id ||
            session?.user?.email ||
            ""
        )
      : "";

  const user = {
    name:
      status === "loading"
        ? "Loading..."
        : session?.user?.name ||
          "User",

    email:
      session?.user?.email || "",

    image:
      session?.user?.image || "",
  };

  /* =====================================================
     NOTIFICATION DATA
  ===================================================== */

  const ownsActivity =
    Boolean(accountKey) &&
    activityState.owner === accountKey;

  const notifications = ownsActivity
    ? activityState.items
    : [];

  const activityLoading =
    status === "loading" ||
    (Boolean(accountKey) &&
      (!ownsActivity ||
        activityState.loading));

  const activityError = ownsActivity
    ? activityState.error
    : "";

  const visibleNotifications = showAll
    ? notifications
    : notifications.slice(0, 6);

  /* =====================================================
     CURRENT PAGE
  ===================================================== */

  const currentPage = useMemo(() => {
    if (pageDetails[pathname]) {
      return pageDetails[pathname];
    }

    const matchingPath = Object.keys(
      pageDetails
    )
      .filter(
        (path) => path !== "/dashboard"
      )
      .sort(
        (a, b) => b.length - a.length
      )
      .find((path) =>
        pathname.startsWith(
          `${path}/`
        )
      );

    return (
      pageDetails[matchingPath] || {
        title: "Customer Dashboard",
        description:
          "Manage your account and CV builder activity.",
      }
    );
  }, [pathname]);

  /* =====================================================
     FETCH RECENT ACTIVITY — PRESERVED
  ===================================================== */

  useEffect(() => {
    const controller =
      new AbortController();

    let active = true;
    let timedOut = false;

    if (!accountKey) {
      setActivityState({
        owner: "",
        items: [],
        loading: false,
        error: "",
      });

      return () =>
        controller.abort();
    }

    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 15000);

    async function loadActivity() {
      setActivityState(
        (previous) => ({
          owner: accountKey,

          items:
            previous.owner === accountKey
              ? previous.items
              : [],

          loading: true,
          error: "",
        })
      );

      try {
        const [
          cvs,
          downloads,
        ] = await Promise.all([
          fetchRecords(
            "/api/cv",
            "cvs",
            controller.signal
          ),

          fetchRecords(
            "/api/downloads",
            "downloads",
            controller.signal
          ),
        ]);

        if (!active) return;

        setActivityState({
          owner: accountKey,

          items:
            buildNotifications(
              cvs,
              downloads
            ),

          loading: false,
          error: "",
        });
      } catch (error) {
        if (!active) return;

        setActivityState({
          owner: accountKey,
          items: [],
          loading: false,

          error: timedOut
            ? "The request took too long. Please try again."
            : error.message ||
              "Could not load recent activity.",
        });
      } finally {
        clearTimeout(timeout);
      }
    }

    void loadActivity();

    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [
    accountKey,
    pathname,
    reloadKey,
  ]);

  /* =====================================================
     OUTSIDE CLICK / ESCAPE
  ===================================================== */

  useEffect(() => {
    const handleOutsideClick = (
      event
    ) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(
          event.target
        )
      ) {
        setIsProfileOpen(false);
      }

      if (
        notificationMenuRef.current &&
        !notificationMenuRef.current.contains(
          event.target
        )
      ) {
        setIsNotificationsOpen(false);
      }
    };

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key === "Escape"
      ) {
        setIsProfileOpen(false);

        setIsNotificationsOpen(
          false
        );
      }
    };

    document.addEventListener(
      "pointerdown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  /* =====================================================
     RESET MENUS ON NAVIGATION
  ===================================================== */

  useEffect(() => {
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
    setShowAll(false);
    setLogoutError("");
  }, [
    pathname,
    accountKey,
  ]);

  /* =====================================================
     TOGGLE NOTIFICATIONS
  ===================================================== */

  const toggleNotifications = () => {
    if (!isNotificationsOpen) {
      setReloadKey(
        (value) => value + 1
      );

      setShowAll(false);
    }

    setIsNotificationsOpen(
      (value) => !value
    );

    setIsProfileOpen(false);
  };

  /* =====================================================
     LOGOUT — PRESERVED
  ===================================================== */

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    setLogoutError("");

    try {
      if (
        typeof onLogout === "function"
      ) {
        await onLogout();
      } else {
        await signOut({
          callbackUrl: "/login",
        });
      }

      setIsProfileOpen(false);

      setIsNotificationsOpen(
        false
      );
    } catch {
      setLogoutError(
        "Unable to log out. Please try again."
      );
    } finally {
      setLoggingOut(false);
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <header
      className="
        relative
        z-30
        shrink-0

        border-b
        border-[var(--qd-border)]

        bg-[var(--qd-surface)]

        text-[var(--qd-text-primary)]

        transition-colors
        duration-300
      "
    >
      {/* ===============================================
          MAIN HEADER
      =============================================== */}

      <div
        className="
          flex
          min-h-[82px]
          items-center
          gap-2.5

          px-4

          sm:gap-3
          sm:px-6

          lg:px-8
        "
      >
        {/* MOBILE MENU */}

        <HeaderIconButton
          onClick={onMobileMenuOpen}
          label="Open dashboard menu"
          className="lg:hidden"
        >
          <Menu
            size={21}
            strokeWidth={1.9}
          />
        </HeaderIconButton>

        {/* PAGE TITLE */}

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
            duration:
              reducedMotion
                ? 0
                : 0.45,

            ease: EASE,
          }}
          className="
            min-w-0
            flex-1
          "
        >
          <h1
            className="
              truncate

              text-[18px]
              font-semibold
              leading-tight
              tracking-[-0.035em]

              text-[var(--qd-text-primary)]

              sm:text-[21px]
              lg:text-[22px]
            "
          >
            {currentPage.title}
          </h1>

          <p
            className="
              mt-1
              hidden
              truncate

              text-[12px]
              leading-5
              text-[var(--qd-text-secondary)]

              sm:block
              lg:text-[13px]
            "
          >
            {currentPage.description}
          </p>
        </motion.div>

        {/* ===============================================
            RIGHT ACTIONS
        =============================================== */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-2

            sm:gap-2.5
          "
        >
          {/* CREATE CV BUTTON */}
<motion.div
  whileHover={
    reducedMotion
      ? undefined
      : { y: -2 }
  }
  whileTap={
    reducedMotion
      ? undefined
      : { scale: 0.98 }
  }
  className="hidden sm:block"
>
  <Link
    href="/cv-builder"
    className="
      inline-flex
      min-h-[44px]
      items-center
      justify-center
      gap-2
      rounded-xl
      bg-[var(--qd-primary)]
      px-4
      text-[13px]
      font-semibold
      transition-all
      duration-200
      hover:bg-[var(--qd-primary-hover)]
      focus-visible:outline-2
      focus-visible:outline-offset-2
      focus-visible:outline-[var(--qd-accent)]
    "
    style={{
      color: theme === "dark" ? "#061747" : "#FFFFFF",
    }}
  >
    <Plus
      size={18}
      strokeWidth={2}
      style={{
        color: theme === "dark" ? "#061747" : "#FFFFFF",
      }}
    />

    <span
      style={{
        color: theme === "dark" ? "#061747" : "#FFFFFF",
      }}
    >
      Create CV
    </span>
  </Link>
</motion.div>

          {/* LIGHT / DARK TOGGLE */}

          <DashboardThemeToggle
            theme={theme}
            onThemeToggle={
              onThemeToggle
            }
            themeReady={themeReady}
          />

          {/* ===========================================
              NOTIFICATIONS
          =========================================== */}

          <div
            ref={notificationMenuRef}
            className="
              shrink-0
              sm:relative
            "
          >
            <HeaderIconButton
              onClick={
                toggleNotifications
              }
              label="Open recent activity notifications"
              expanded={
                isNotificationsOpen
              }
            >
              <Bell
                size={20}
                strokeWidth={1.85}
              />

              {notifications.length > 0 && (
                <span
                  className="
                    absolute
                    right-1
                    top-1

                    flex
                    h-4
                    min-w-4
                    items-center
                    justify-center

                    rounded-full

                    bg-[#ef4444]
                    px-1

                    text-[9px]
                    font-bold
                    text-white
                  "
                >
                  {notifications.length > 9
                    ? "9+"
                    : notifications.length}
                </span>
              )}
            </HeaderIconButton>

            {/* ANIMATED NOTIFICATION PANEL */}

            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  key="notification-panel"
                  initial={
                    reducedMotion
                      ? false
                      : {
                          opacity: 0,
                          y: -8,
                          scale: 0.98,
                        }
                  }
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: -6,
                    scale: 0.98,
                  }}
                  transition={{
                    duration:
                      reducedMotion
                        ? 0
                        : 0.22,
                    ease: EASE,
                  }}
                  className="
                    absolute
                    left-4
                    right-4
                    top-[76px]

                    z-50
                    overflow-hidden

                    rounded-[18px]

                    border
                    border-[var(--qd-border)]

                    bg-[var(--qd-surface)]

                    shadow-[0_20px_60px_rgba(7,24,63,0.15)]

                    sm:left-auto
                    sm:right-0
                    sm:top-[calc(100%+14px)]
                    sm:w-[390px]
                  "
                >
                  {/* PANEL HEADER */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-3

                      border-b
                      border-[var(--qd-border)]

                      px-5
                      py-4
                    "
                  >
                    <div>
                      <h2
                        className="
                          text-[14px]
                          font-semibold
                          text-[var(--qd-text-primary)]
                        "
                      >
                        Notifications
                      </h2>

                      <p
                        className="
                          mt-1
                          text-[11px]
                          text-[var(--qd-text-secondary)]
                        "
                      >
                        Your recent CV and download activity
                      </p>
                    </div>

                    <button
                      type="button"
                      aria-label="Refresh notifications"
                      disabled={
                        activityLoading ||
                        !accountKey
                      }
                      onClick={() =>
                        setReloadKey(
                          (value) =>
                            value + 1
                        )
                      }
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg

                        text-[var(--qd-text-muted)]

                        transition-colors

                        hover:bg-[var(--qd-background-soft)]
                        hover:text-[var(--qd-text-primary)]

                        disabled:opacity-40
                      "
                    >
                      <RefreshCw
                        size={17}
                        className={
                          activityLoading
                            ? "animate-spin"
                            : ""
                        }
                      />
                    </button>
                  </div>

                  {/* NOTIFICATION LIST */}

                  <div
                    className="
                      max-h-[min(60vh,480px)]
                      overflow-y-auto

                      [scrollbar-width:thin]
                      [scrollbar-color:var(--qd-border-strong)_transparent]
                    "
                  >
                    {activityLoading ? (
                      <div
                        role="status"
                        className="
                          flex
                          items-center
                          justify-center
                          gap-2

                          px-6
                          py-12

                          text-[13px]
                          text-[var(--qd-text-secondary)]
                        "
                      >
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />

                        Loading activity...
                      </div>
                    ) : !accountKey ? (
                      <div className="px-6 py-10 text-center">
                        <p className="text-[13px] text-[var(--qd-text-secondary)]">
                          Please log in to view your activity.
                        </p>

                        <Link
                          href="/login"
                          className="
                            mt-3
                            inline-block
                            text-[13px]
                            font-semibold
                            text-[var(--qd-primary)]
                          "
                        >
                          Log in
                        </Link>
                      </div>
                    ) : activityError ? (
                      <div
                        role="alert"
                        className="px-6 py-9 text-center"
                      >
                        <p className="text-[13px] text-red-500">
                          {activityError}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            setReloadKey(
                              (value) =>
                                value + 1
                            )
                          }
                          className="
                            mt-3
                            text-[13px]
                            font-semibold
                            text-[var(--qd-primary)]
                          "
                        >
                          Try again
                        </button>
                      </div>
                    ) : notifications.length > 0 ? (
                      visibleNotifications.map(
                        (notification) => {
                          const Icon =
                            notification.icon;

                          return (
                            <Link
                              key={
                                notification.id
                              }
                              href={
                                notification.href
                              }
                              onClick={() =>
                                setIsNotificationsOpen(
                                  false
                                )
                              }
                              className="
                                group
                                flex
                                w-full
                                gap-3

                                border-b
                                border-[var(--qd-border)]

                                px-5
                                py-4

                                text-left

                                transition-colors
                                duration-200

                                last:border-b-0

                                hover:bg-[var(--qd-background-soft)]
                              "
                            >
                              <div
                                className={`
                                  mt-0.5
                                  flex
                                  h-10
                                  w-10
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-xl

                                  ${notification.iconClass}
                                `}
                              >
                                <Icon
                                  size={18}
                                  strokeWidth={1.8}
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p
                                  className="
                                    text-[13px]
                                    font-semibold
                                    text-[var(--qd-text-primary)]
                                  "
                                >
                                  {notification.title}
                                </p>

                                <p
                                  className="
                                    mt-1
                                    text-[12px]
                                    leading-[1.65]
                                    text-[var(--qd-text-secondary)]
                                  "
                                >
                                  {notification.message}
                                </p>

                                <p
                                  className="
                                    mt-2
                                    truncate
                                    text-[11px]
                                    font-medium
                                    text-[var(--qd-text-secondary)]
                                  "
                                >
                                  {notification.documentName}
                                </p>

                                <time
                                  dateTime={new Date(
                                    notification.timestamp
                                  ).toISOString()}
                                  className="
                                    mt-2
                                    block
                                    text-[10px]
                                    text-[var(--qd-text-muted)]
                                  "
                                >
                                  {formatActivityTime(
                                    notification.timestamp
                                  )}
                                </time>
                              </div>
                            </Link>
                          );
                        }
                      )
                    ) : (
                      <div className="px-6 py-12 text-center">
                        <div
                          className="
                            mx-auto
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center

                            rounded-2xl

                            bg-[var(--qd-background-muted)]
                            text-[var(--qd-text-primary)]
                          "
                        >
                          <Bell size={21} />
                        </div>

                        <p
                          className="
                            mt-4
                            text-[13px]
                            font-semibold
                            text-[var(--qd-text-primary)]
                          "
                        >
                          No recent activity
                        </p>

                        <p
                          className="
                            mx-auto
                            mt-1.5
                            max-w-[250px]
                            text-[12px]
                            leading-[1.7]
                            text-[var(--qd-text-secondary)]
                          "
                        >
                          Your CV creations, updates, and downloads will appear here.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* VIEW ALL */}

                  {!activityLoading &&
                    !activityError &&
                    notifications.length > 6 && (
                      <button
                        type="button"
                        onClick={() =>
                          setShowAll(
                            (value) => !value
                          )
                        }
                        className="
                          flex
                          min-h-[44px]
                          w-full
                          items-center
                          justify-center

                          border-t
                          border-[var(--qd-border)]

                          text-[12px]
                          font-semibold
                          text-[var(--qd-text-primary)]

                          transition-colors

                          hover:bg-[var(--qd-background-soft)]
                        "
                      >
                        {showAll
                          ? "Show Less"
                          : "View All Activity"}
                      </button>
                    )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ===========================================
              PROFILE MENU
          =========================================== */}

          <div
            ref={profileMenuRef}
            className="
              shrink-0
              sm:relative
            "
          >
            <motion.button
              type="button"
              onClick={() => {
                setIsProfileOpen(
                  (value) => !value
                );

                setIsNotificationsOpen(
                  false
                );
              }}
              aria-label="Open account menu"
              aria-expanded={isProfileOpen}
              whileHover={
                reducedMotion
                  ? undefined
                  : { y: -1 }
              }
              whileTap={
                reducedMotion
                  ? undefined
                  : { scale: 0.98 }
              }
              className="
                flex
                min-h-[44px]
                items-center
                gap-2.5

                rounded-xl
                border
                border-[var(--qd-border)]

                bg-[var(--qd-surface)]

                p-1
                pr-1

                transition-colors
                duration-200

                hover:border-[var(--qd-border-strong)]
                hover:bg-[var(--qd-background-soft)]

                md:pr-3
              "
            >
              <UserAvatar user={user} />

              <div
                className="
                  hidden
                  min-w-0
                  text-left
                  md:block
                "
              >
                <p
                  className="
                    max-w-32
                    truncate
                    text-[12px]
                    font-semibold
                    text-[var(--qd-text-primary)]
                  "
                >
                  {user.name}
                </p>

                <p
                  className="
                    mt-0.5
                    max-w-32
                    truncate
                    text-[10px]
                    text-[var(--qd-text-muted)]
                  "
                >
                  {user.email}
                </p>
              </div>

              <motion.span
                animate={{
                  rotate: isProfileOpen
                    ? 180
                    : 0,
                }}
                transition={{
                  duration:
                    reducedMotion
                      ? 0
                      : 0.2,
                }}
                className="
                  hidden
                  text-[var(--qd-text-muted)]
                  md:block
                "
              >
                <ChevronDown size={16} />
              </motion.span>
            </motion.button>

            {/* ANIMATED PROFILE DROPDOWN */}

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  key="profile-dropdown"
                  initial={
                    reducedMotion
                      ? false
                      : {
                          opacity: 0,
                          y: -8,
                          scale: 0.97,
                        }
                  }
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: -6,
                    scale: 0.97,
                  }}
                  transition={{
                    duration:
                      reducedMotion
                        ? 0
                        : 0.22,

                    ease: EASE,
                  }}
                  className="
                    absolute
                    right-4
                    top-[76px]

                    z-50
                    w-[280px]
                    max-w-[calc(100vw-32px)]

                    overflow-hidden

                    rounded-[18px]

                    border
                    border-[var(--qd-border)]

                    bg-[var(--qd-surface)]

                    shadow-[0_20px_60px_rgba(7,24,63,0.15)]

                    sm:right-0
                    sm:top-[calc(100%+14px)]
                  "
                >
                  {/* ACCOUNT INFO */}

                  <div
                    className="
                      border-b
                      border-[var(--qd-border)]

                      px-4
                      py-4
                    "
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        user={user}
                        large
                      />

                      <div className="min-w-0">
                        <p
                          title={user.name}
                          className="
                            truncate
                            text-[13px]
                            font-semibold
                            text-[var(--qd-text-primary)]
                          "
                        >
                          {user.name}
                        </p>

                        <p
                          title={user.email}
                          className="
                            mt-1
                            truncate
                            text-[11px]
                            text-[var(--qd-text-muted)]
                          "
                        >
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* PROFILE ACTIONS */}

                  {status === "authenticated" ? (
                    <>
                      <div className="p-2">
                        <ProfileMenuLink
                          href="/dashboard/settings"
                          icon={UserRound}
                          label="My Profile"
                          onClick={() =>
                            setIsProfileOpen(
                              false
                            )
                          }
                        />

                        <ProfileMenuLink
                          href="/dashboard/settings"
                          icon={Settings}
                          label="Account Settings"
                          onClick={() =>
                            setIsProfileOpen(
                              false
                            )
                          }
                        />
                      </div>

                      {/* LOGOUT */}

                      <div
                        className="
                          border-t
                          border-[var(--qd-border)]
                          p-2
                        "
                      >
                        {logoutError && (
                          <p
                            role="alert"
                            className="
                              px-3
                              py-2
                              text-[12px]
                              text-red-500
                            "
                          >
                            {logoutError}
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={
                            handleLogout
                          }
                          disabled={
                            loggingOut
                          }
                          className="
                            flex
                            min-h-[44px]
                            w-full
                            items-center
                            gap-3

                            rounded-xl
                            px-3

                            text-[13px]
                            font-medium
                            text-red-500

                            transition-colors

                            hover:bg-red-500/10

                            disabled:opacity-50
                          "
                        >
                          {loggingOut ? (
                            <Loader2
                              size={18}
                              className="animate-spin"
                            />
                          ) : (
                            <LogOut
                              size={18}
                              strokeWidth={1.8}
                            />
                          )}

                          {loggingOut
                            ? "Logging out..."
                            : "Logout"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div
                      className="
                        p-4
                        text-[13px]
                        text-[var(--qd-text-secondary)]
                      "
                    >
                      {status === "loading" ? (
                        "Loading account..."
                      ) : (
                        <Link
                          href="/login"
                          className="
                            font-semibold
                            text-[var(--qd-primary)]
                          "
                        >
                          Log in
                        </Link>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ===============================================
          MOBILE CREATE CV BUTTON
      =============================================== */}

      <div
        className="
          border-t
          border-[var(--qd-border)]

          px-4
          py-3

          sm:hidden
        "
      >
       <Link
  href="/cv-builder"
  className="
    flex
    min-h-[44px]
    w-full
    items-center
    justify-center
    gap-2
    rounded-xl
    bg-[var(--qd-primary)]
    px-4

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
  <Plus
    size={18}
    strokeWidth={2}
    className="text-inherit"
  />

  Create New CV
</Link>
      </div>
    </header>
  );
}