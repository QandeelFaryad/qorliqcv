"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  LayoutTemplate,
  Download,
  CreditCard,
  ReceiptText,
  Settings,
  CircleHelp,
  LogOut,
  Crown,
  X,
} from "lucide-react";

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

function isRouteActive(pathname, href) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname.startsWith(href);
}

export default function DashboardSidebar({
  isMobileOpen = false,
  onMobileClose,
  onLogout,
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [planData, setPlanData] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [planError, setPlanError] = useState("");

  const userName =
    status === "loading"
      ? "Loading..."
      : session?.user?.name || "User";

  const userEmail = session?.user?.email || "";

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

        if (!response.ok || !data || data.success === false) {
          throw new Error("Unable to load plan.");
        }

        if (!active) return;

        // Supports { access: {...} } or top-level plan fields.
        setPlanData(data.access ?? data);
      } catch (error) {
        if (!active || error.name === "AbortError") return;

        setPlanError("Unable to load plan.");
      } finally {
        if (active) setPlanLoading(false);
      }
    }

    void fetchAccess();

    return () => {
      active = false;
      controller.abort();
    };
  }, [status, session?.user?.id, pathname]);

  const planName =
    planData?.planName ||
    formatPlanName(planData?.plan);

  const handleNavigationClick = () => {
    onMobileClose?.();
  };

  const handleLogout = async () => {
    if (typeof onLogout === "function") {
      await onLogout();
      return;
    }

    await signOut({ callbackUrl: "/login" });
  };

  // Aapka existing return (...) yahan rahega.
  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close dashboard menu"
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-dvh w-[290px] flex-col
          overflow-hidden
          border-r border-white/10
          bg-qorliqDark text-white
          shadow-luxury
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-6">
          <Link
            href="/dashboard"
            onClick={handleNavigationClick}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-qorliqGold/40 bg-qorliqGold/10 shadow-gold">
              <span className="text-xl font-black text-qorliqGold">
                Q
              </span>
            </div>

            <div>
              <p className="text-lg font-bold tracking-wide text-white">
                Qorliq
              </p>

              <p className="text-xs font-medium tracking-[0.18em] text-qorliqGold">
                CV BUILDER
              </p>
            </div>
          </Link>

          <button
            type="button"
            aria-label="Close menu"
            onClick={onMobileClose}
            className="
              inline-flex h-10 w-10 items-center justify-center
              rounded-xl border border-white/10
              text-white/70 transition
              hover:border-qorliqGold/40
              hover:bg-qorliqGold/10
              hover:text-qorliqGold
              lg:hidden
            "
          >
            <X size={20} />
          </button>
        </div>

      <div className="dashboard-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-6">
          <div className="mb-8">
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
              Workspace
            </p>

            <nav className="space-y-1.5">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isRouteActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavigationClick}
                    className={`
                      group relative flex min-h-12 items-center gap-3
                      rounded-xl px-3.5 py-3
                      text-sm font-medium
                      transition-all duration-200
                      ${
                        active
                          ? "bg-qorliqGold text-qorliqDark shadow-gold"
                          : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                      }
                    `}
                  >
                    {active && (
                      <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-qorliqDark" />
                    )}

                    <Icon
                      size={19}
                      className={
                        active
                          ? "text-qorliqDark"
                          : "text-white/50 group-hover:text-qorliqGold"
                      }
                    />

                    <span className="truncate">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
              Account
            </p>

            <nav className="space-y-1.5">
              {secondaryNavigationItems.map((item) => {
                const Icon = item.icon;
                const active = isRouteActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavigationClick}
                    className={`
                      group flex min-h-12 items-center gap-3
                      rounded-xl px-3.5 py-3
                      text-sm font-medium
                      transition-all duration-200
                      ${
                        active
                          ? "bg-qorliqGold text-qorliqDark shadow-gold"
                          : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                      }
                    `}
                  >
                    <Icon
                      size={19}
                      className={
                        active
                          ? "text-qorliqDark"
                          : "text-white/50 group-hover:text-qorliqGold"
                      }
                    />

                    <span className="truncate">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-8 rounded-2xl border border-qorliqGold/20 bg-gradient-to-br from-qorliqGold/15 to-transparent p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-qorliqGold text-qorliqDark shadow-gold">
                <Crown size={19} />
              </div>

              <span className="rounded-full border border-qorliqGold/30 bg-qorliqGold/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-qorliqGold">
                Plan
              </span>
            </div>

            <p className="text-sm font-semibold text-white">
              {planLoading
  ? "Loading plan..."
  : planError
    ? "Plan unavailable"
    : planName}
            </p>
<p className="mt-1 text-xs leading-5 text-white/50">
  {planError
    ? planError
    : "View your package details and manage your subscription."}
</p>  

            <Link
              href="/pricing"
              onClick={handleNavigationClick}
              className="
                mt-4 inline-flex w-full items-center justify-center
                rounded-xl bg-qorliqGold px-4 py-2.5
                text-sm font-bold text-qorliqDark
                shadow-gold transition-all duration-200
                hover:bg-qorliqGoldDark
                hover:text-white
              "
            >
              View Packages
            </Link>
          </div>
        </div>

     <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3">
  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-qorliqGold text-sm font-black text-qorliqDark">
    {status === "loading" ? "…" : getInitials(userName)}
  </div>

  <div className="min-w-0 flex-1">
    <p
      title={userName}
      className="truncate text-sm font-semibold text-white"
    >
      {userName}
    </p>

    <p
      title={userEmail}
      className="truncate text-xs text-white/45"
    >
      {userEmail}
    </p>
  </div>
</div>
      </aside>
    </>
  );
}

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
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}