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
} from "lucide-react";

const pageDetails = {
  "/dashboard": {
    title: "Dashboard",
    description: "Manage your CVs, downloads, subscription, and account.",
  },
  "/dashboard/cvs": {
    title: "My CVs",
    description: "View, edit, and manage your saved CVs.",
  },
  "/dashboard/templates": {
    title: "CV Templates",
    description: "Explore professional CV templates.",
  },
  "/dashboard/downloads": {
    title: "Downloads",
    description: "Access your CV download history.",
  },
  "/dashboard/billing": {
    title: "Subscription & Billing",
    description: "Manage your package, payments, and billing information.",
  },
  "/dashboard/orders": {
    title: "Orders",
    description: "Review your purchase history and payment records.",
  },
  "/dashboard/settings": {
    title: "Account Settings",
    description: "Update your profile, password, and account preferences.",
  },
  "/dashboard/support": {
    title: "Help & Support",
    description: "Get assistance with your account, CVs, and payments.",
  },
};

function getTimestamp(value) {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function firstText(...values) {
  return (
    values.find(
      (value) => typeof value === "string" && value.trim()
    ) || ""
  );
}

function buildNotifications(cvs, downloads) {
  const notifications = [];
  const titles = new Map();

  for (const cv of cvs) {
    const id = cv._id || cv.id;
    if (!id) continue;

    const documentName =
      firstText(cv.title, cv.jobTitle, cv.personalInfo?.jobTitle) ||
      "Untitled CV";

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
        iconClass: "bg-emerald-50 text-emerald-700",
        href: `/dashboard/cvs/${encodeURIComponent(String(id))}`,
      });
    }

    if (
      updatedAt !== null &&
      (createdAt === null || updatedAt > createdAt)
    ) {
      notifications.push({
        id: `cv-updated-${id}`,
        title: "CV updated",
        message: "Your CV record was updated.",
        documentName,
        timestamp: updatedAt,
        icon: FilePenLine,
        iconClass: "bg-blue-50 text-blue-700",
        href: `/dashboard/cvs/${encodeURIComponent(String(id))}`,
      });
    }
  }

  for (const record of downloads) {
    const id = record._id || record.id;
    const timestamp = getTimestamp(
      record.downloadedAt || record.createdAt
    );

    if (!id || timestamp === null) continue;

    const cvId =
      record.cvId && typeof record.cvId === "object"
        ? record.cvId._id
        : record.cvId;

    const documentName =
      firstText(
        record.cvTitle,
        titles.get(String(cvId || ""))
      ) || "Untitled CV";

    const format = String(record.format || "").toLowerCase();
    const status = String(record.status || "").toLowerCase();

    let title = "Download activity";
    let message = "A download request was recorded.";
    let icon = Download;
    let iconClass = "bg-blue-50 text-blue-700";

    if (status === "completed" || status === "successful") {
      if (format === "pdf") {
        title = "PDF downloaded";
        message = "Your CV PDF download was recorded as completed.";
        iconClass = "bg-red-50 text-red-700";
      } else if (["docx", "doc", "word"].includes(format)) {
        title = "Word file downloaded";
        message = "Your CV Word download was recorded as completed.";
        icon = FileText;
        iconClass = "bg-indigo-50 text-indigo-700";
      } else {
        title = "CV downloaded";
        message = "Your CV download was recorded as completed.";
      }
    } else if (status === "pending") {
      title = "Download pending";
      message = "Your CV download request is pending.";
      iconClass = "bg-orange-50 text-orange-700";
    } else if (status === "failed") {
      title = "Download failed";
      message = "Your CV download was recorded as failed.";
      iconClass = "bg-red-50 text-red-700";
    } else if (status === "expired") {
      title = "Download expired";
      message = "Your CV download record is marked as expired.";
      iconClass = "bg-amber-50 text-amber-700";
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

  return notifications.sort((a, b) => b.timestamp - a.timestamp);
}

function formatActivityTime(timestamp) {
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - timestamp) / 60000)
  );

  if (minutes < 1) return "Just now";
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

async function fetchRecords(url, key, signal) {
  const response = await fetch(url, {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
    signal,
  });

  if (response.status === 401) {
    throw new Error("Please log in to view your activity.");
  }

  const data = await response.json().catch(() => null);

  if (
    !response.ok ||
    !data ||
    data.success === false ||
    !Array.isArray(data[key])
  ) {
    throw new Error("Could not load recent activity. Please try again.");
  }

  return data[key];
}

export default function DashboardHeader({
  onMobileMenuOpen,
  onLogout,
}) {
  const pathname = usePathname() || "/dashboard";
  const { data: session, status } = useSession();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const [activityState, setActivityState] = useState({
    owner: "",
    items: [],
    loading: true,
    error: "",
  });

  const profileMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);

  const accountKey =
    status === "authenticated"
      ? String(session?.user?.id || session?.user?.email || "")
      : "";

  const user = {
    name:
      status === "loading"
        ? "Loading..."
        : session?.user?.name || "User",
    email: session?.user?.email || "",
    image: session?.user?.image || "",
  };

  // Prevent a previous account's activity being shown during account changes.
  const ownsActivity =
    Boolean(accountKey) && activityState.owner === accountKey;

  const notifications = ownsActivity ? activityState.items : [];
  const activityLoading =
    status === "loading" ||
    (Boolean(accountKey) && (!ownsActivity || activityState.loading));

  const activityError = ownsActivity ? activityState.error : "";
  const visibleNotifications = showAll
    ? notifications
    : notifications.slice(0, 6);

  const currentPage = useMemo(() => {
    if (pageDetails[pathname]) return pageDetails[pathname];

    const matchingPath = Object.keys(pageDetails)
      .filter((path) => path !== "/dashboard")
      .sort((a, b) => b.length - a.length)
      .find((path) => pathname.startsWith(`${path}/`));

    return (
      pageDetails[matchingPath] || {
        title: "Customer Dashboard",
        description: "Manage your account and CV builder activity.",
      }
    );
  }, [pathname]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let timedOut = false;

    if (!accountKey) {
      setActivityState({
        owner: "",
        items: [],
        loading: false,
        error: "",
      });
      return () => controller.abort();
    }

    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 15000);

    async function loadActivity() {
      setActivityState((previous) => ({
        owner: accountKey,
        items: previous.owner === accountKey ? previous.items : [],
        loading: true,
        error: "",
      }));

      try {
        const [cvs, downloads] = await Promise.all([
          fetchRecords("/api/cv", "cvs", controller.signal),
          fetchRecords("/api/downloads", "downloads", controller.signal),
        ]);

        if (!active) return;

        setActivityState({
          owner: accountKey,
          items: buildNotifications(cvs, downloads),
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
            : error.message || "Could not load recent activity.",
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
  }, [accountKey, pathname, reloadKey]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }

      if (
        notificationMenuRef.current &&
        !notificationMenuRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
    setShowAll(false);
    setLogoutError("");
  }, [pathname, accountKey]);

  const toggleNotifications = () => {
    if (!isNotificationsOpen) {
      setReloadKey((value) => value + 1);
      setShowAll(false);
    }

    setIsNotificationsOpen((value) => !value);
    setIsProfileOpen(false);
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    setLogoutError("");

    try {
      if (typeof onLogout === "function") {
        await onLogout();
      } else {
        await signOut({ callbackUrl: "/login" });
      }

      setIsProfileOpen(false);
      setIsNotificationsOpen(false);
    } catch {
      setLogoutError("Unable to log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="relative z-30 shrink-0 border-b border-black/5 bg-qorliqIvory/95 backdrop-blur-xl">
      <div className="flex min-h-20 items-center gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMobileMenuOpen}
          aria-label="Open dashboard menu"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white text-qorliqDark shadow-sm transition hover:border-qorliqGold/50 hover:bg-qorliqCream lg:hidden"
        >
          <Menu size={21} />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold tracking-tight text-qorliqDark sm:text-2xl">
            {currentPage.title}
          </h1>
          <p className="mt-0.5 hidden truncate text-sm text-black/50 sm:block">
            {currentPage.description}
          </p>
        </div>

        <Link
          href="/cv-builder"
          className="hidden min-h-11 items-center justify-center gap-2 rounded-xl bg-qorliqGold px-4 text-sm font-bold text-qorliqDark shadow-gold transition hover:bg-qorliqGoldDark hover:text-white sm:inline-flex"
        >
          <Plus size={18} />
          Create CV
        </Link>

        <div ref={notificationMenuRef} className="shrink-0 sm:relative">
          <button
            type="button"
            onClick={toggleNotifications}
            aria-label="Open recent activity notifications"
            aria-expanded={isNotificationsOpen}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/10 bg-white text-qorliqDark shadow-sm transition hover:border-qorliqGold/50 hover:bg-qorliqCream"
          >
            <Bell size={20} />

            {notifications.length > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute left-4 right-4 top-20 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-luxury sm:left-auto sm:right-0 sm:top-[calc(100%+12px)] sm:w-96">
              <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
                <div>
                  <h2 className="text-sm font-bold text-qorliqDark">
                    Notifications
                  </h2>
                  <p className="mt-0.5 text-xs text-black/45">
                    Your recent CV and download activity
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Refresh notifications"
                  disabled={activityLoading || !accountKey}
                  onClick={() => setReloadKey((value) => value + 1)}
                  className="rounded-lg p-2 text-black/50 hover:bg-qorliqCream disabled:opacity-40"
                >
                  <RefreshCw
                    size={16}
                    className={activityLoading ? "animate-spin" : ""}
                  />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {activityLoading ? (
                  <div
                    role="status"
                    className="flex items-center justify-center gap-2 px-6 py-10 text-sm text-black/50"
                  >
                    <Loader2 size={18} className="animate-spin" />
                    Loading activity...
                  </div>
                ) : !accountKey ? (
                  <div className="px-6 py-10 text-center">
                    <p className="text-sm text-black/50">
                      Please log in to view your activity.
                    </p>
                    <Link
                      href="/login"
                      className="mt-3 inline-block text-sm font-bold text-qorliqGoldDark"
                    >
                      Log in
                    </Link>
                  </div>
                ) : activityError ? (
                  <div role="alert" className="px-6 py-8 text-center">
                    <p className="text-sm text-red-600">
                      {activityError}
                    </p>
                    <button
                      type="button"
                      onClick={() => setReloadKey((value) => value + 1)}
                      className="mt-3 text-sm font-bold text-qorliqGoldDark"
                    >
                      Try again
                    </button>
                  </div>
                ) : notifications.length > 0 ? (
                  visibleNotifications.map((notification) => {
                    const Icon = notification.icon;

                    return (
                      <Link
                        key={notification.id}
                        href={notification.href}
                        onClick={() => setIsNotificationsOpen(false)}
                        className="flex w-full gap-3 border-b border-black/5 px-5 py-4 text-left transition last:border-b-0 hover:bg-qorliqCream/60"
                      >
                        <div
                          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${notification.iconClass}`}
                        >
                          <Icon size={17} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-qorliqDark">
                            {notification.title}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-black/50">
                            {notification.message}
                          </p>

                          <p className="mt-2 truncate text-xs font-medium text-black/60">
                            {notification.documentName}
                          </p>

                          <time
                            dateTime={new Date(
                              notification.timestamp
                            ).toISOString()}
                            className="mt-2 block text-[11px] font-medium text-black/35"
                          >
                            {formatActivityTime(notification.timestamp)}
                          </time>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="px-6 py-10 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-qorliqCream text-qorliqGoldDark">
                      <Bell size={21} />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-qorliqDark">
                      No recent activity
                    </p>
                    <p className="mt-1 text-xs leading-5 text-black/45">
                      Your CV creations, updates, and downloads will appear here.
                    </p>
                  </div>
                )}
              </div>

              {!activityLoading &&
                !activityError &&
                notifications.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setShowAll((value) => !value)}
                    className="block w-full border-t border-black/5 px-5 py-3.5 text-center text-sm font-semibold text-qorliqGoldDark hover:bg-qorliqCream"
                  >
                    {showAll ? "Show Less" : "View All Activity"}
                  </button>
                )}
            </div>
          )}
        </div>

        <div ref={profileMenuRef} className="shrink-0 sm:relative">
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen((value) => !value);
              setIsNotificationsOpen(false);
            }}
            aria-label="Open account menu"
            aria-expanded={isProfileOpen}
            className="flex min-h-11 items-center gap-2 rounded-xl border border-black/10 bg-white p-1.5 pr-2.5 shadow-sm transition hover:border-qorliqGold/50 hover:bg-qorliqCream"
          >
            <UserAvatar user={user} />

            <div className="hidden min-w-0 text-left md:block">
              <p className="max-w-32 truncate text-xs font-bold text-qorliqDark">
                {user.name}
              </p>
              <p className="max-w-32 truncate text-[10px] text-black/45">
                {user.email}
              </p>
            </div>

            <ChevronDown
              size={16}
              className={`hidden text-black/45 transition-transform md:block ${
                isProfileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isProfileOpen && (
            <div className="absolute right-4 top-20 w-64 max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-luxury sm:right-0 sm:top-[calc(100%+12px)]">
              <div className="border-b border-black/5 px-4 py-4">
                <div className="flex items-center gap-3">
                  <UserAvatar user={user} large />

                  <div className="min-w-0">
                    <p
                      title={user.name}
                      className="truncate text-sm font-bold text-qorliqDark"
                    >
                      {user.name}
                    </p>
                    <p
                      title={user.email}
                      className="mt-0.5 truncate text-xs text-black/45"
                    >
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              {status === "authenticated" ? (
                <>
                  <div className="p-2">
                    <ProfileMenuLink
                      href="/dashboard/settings"
                      icon={UserRound}
                      label="My Profile"
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <ProfileMenuLink
                      href="/dashboard/settings"
                      icon={Settings}
                      label="Account Settings"
                      onClick={() => setIsProfileOpen(false)}
                    />
                  </div>

                  <div className="border-t border-black/5 p-2">
                    {logoutError && (
                      <p role="alert" className="px-3 py-2 text-xs text-red-600">
                        {logoutError}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      {loggingOut ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : (
                        <LogOut size={17} />
                      )}
                      {loggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-3 text-sm">
                  {status === "loading" ? (
                    "Loading account..."
                  ) : (
                    <Link href="/login" className="font-bold text-qorliqGoldDark">
                      Log in
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-black/5 px-4 py-3 sm:hidden">
        <Link
          href="/cv-builder"
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-qorliqGold px-4 text-sm font-bold text-qorliqDark shadow-gold transition hover:bg-qorliqGoldDark hover:text-white"
        >
          <Plus size={18} />
          Create New CV
        </Link>
      </div>
    </header>
  );
}

function UserAvatar({ user, large = false }) {
  const [failedImage, setFailedImage] = useState("");
  const sizeClasses = large ? "h-12 w-12 text-sm" : "h-8 w-8 text-xs";

  if (user.image && failedImage !== user.image) {
    return (
      <img
        src={user.image}
        alt={user.name || "Profile"}
        referrerPolicy="no-referrer"
        onError={() => setFailedImage(user.image)}
        className={`${sizeClasses} shrink-0 rounded-xl object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} flex shrink-0 items-center justify-center rounded-xl bg-qorliqGold font-black text-qorliqDark`}
    >
      {getInitials(user.name)}
    </div>
  );
}

function ProfileMenuLink({ href, icon: Icon, label, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-qorliqDark transition hover:bg-qorliqCream"
    >
      <Icon size={17} className="text-black/45" />
      {label}
    </Link>
  );
}

function getInitials(name = "") {
  return (
    String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("") || "U"
  );
}