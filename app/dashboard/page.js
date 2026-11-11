"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  FileText,
  Download,
  Crown,
  Sparkles,
  ArrowRight,
  Calendar,
  LayoutTemplate,
  Eye,
  Plus,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import RecentActivity from "@/components/customer-dashboard/RecentActivity";

const emptyState = {
  owner: "",
  loading: true,
  cvs: [],
  downloads: [],
  access: null,
  errors: {},
};

function textValue(...values) {
  return (
    values.find(
      (value) => typeof value === "string" && value.trim()
    ) || ""
  );
}

function timestamp(value) {
  if (!value) return 0;
  const result = new Date(value).getTime();
  return Number.isFinite(result) ? result : 0;
}

function formatDate(value) {
  if (!timestamp(value)) return "Not available";

  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatLabel(value) {
  if (typeof value !== "string" || !value.trim()) return "";

  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function fetchData(url, signal) {
  const response = await fetch(url, {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
    signal,
  });

  const data = await response.json().catch(() => null);

  if (response.status === 401) {
    throw new Error("Please log in again.");
  }

  if (!response.ok || !data || data.success === false) {
    throw new Error("Could not load data. Please try again.");
  }

  return data;
}

function normalizeCV(cv) {
  return {
    id: String(cv._id || cv.id),
    name:
      textValue(
        cv.title,
        cv.jobTitle,
        cv.personalInfo?.jobTitle
      ) || "Untitled CV",
    template:
      textValue(
        cv.templateName,
        cv.template?.name,
        cv.template
      ) || "Not selected",
    status: String(cv.status || "draft").toLowerCase(),
    updatedAt: cv.updatedAt || cv.createdAt,
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [state, setState] = useState(emptyState);
  const [reloadKey, setReloadKey] = useState(0);

  const accountKey =
    status === "authenticated"
      ? String(session?.user?.id || session?.user?.email || "")
      : "";

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let timedOut = false;

    if (status !== "authenticated" || !accountKey) {
      setState({
        ...emptyState,
        loading: status === "loading",
      });

      return () => controller.abort();
    }

    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 15000);

    async function loadDashboard() {
      setState({
        ...emptyState,
        owner: accountKey,
        loading: true,
      });

      const results = await Promise.allSettled([
        fetchData("/api/cv", controller.signal).then((data) => {
          if (!Array.isArray(data.cvs)) {
            throw new Error("Invalid CV response.");
          }

          return data.cvs
            .filter((cv) => cv && (cv._id || cv.id))
            .map(normalizeCV);
        }),

        fetchData("/api/downloads", controller.signal).then((data) => {
          if (!Array.isArray(data.downloads)) {
            throw new Error("Invalid downloads response.");
          }

          return data.downloads.filter(
            (record) => record && typeof record === "object"
          );
        }),

        fetchData("/api/user/access", controller.signal).then((data) => {
          const access = data.access ?? data;

          if (!access || typeof access !== "object") {
            throw new Error("Invalid access response.");
          }

          return access;
        }),
      ]);

      clearTimeout(timeout);
      if (!active) return;

      const [cvResult, downloadResult, accessResult] = results;
      const errors = {};

      for (const [key, result] of [
        ["cvs", cvResult],
        ["downloads", downloadResult],
        ["access", accessResult],
      ]) {
        if (result.status === "rejected") {
          errors[key] = timedOut
            ? "Request timed out. Please retry."
            : result.reason?.message || "Could not load data.";
        }
      }

      setState({
        owner: accountKey,
        loading: false,
        cvs: cvResult.status === "fulfilled" ? cvResult.value : [],
        downloads:
          downloadResult.status === "fulfilled"
            ? downloadResult.value
            : [],
        access:
          accessResult.status === "fulfilled"
            ? accessResult.value
            : null,
        errors,
      });
    }

    void loadDashboard();

    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [accountKey, status, reloadKey]);

  const ownsData =
    Boolean(accountKey) && state.owner === accountKey;

  const loading =
    status === "loading" ||
    (status === "authenticated" && (!ownsData || state.loading));

  const cvs = ownsData ? state.cvs : [];
  const downloads = ownsData ? state.downloads : [];
  const access = ownsData ? state.access : null;
  const errors = ownsData ? state.errors : {};

  const completedCVs = cvs.filter(
    (cv) => cv.status === "completed"
  ).length;

  const successfulDownloads = downloads.filter((record) =>
    ["completed", "successful"].includes(
      String(record.status || "").toLowerCase()
    )
  ).length;

  const completionRate = cvs.length
    ? Math.round((completedCVs / cvs.length) * 100)
    : 0;

  const downloadSuccessRate = downloads.length
    ? Math.round((successfulDownloads / downloads.length) * 100)
    : 0;

  const recentCVs = [...cvs]
    .sort((a, b) => timestamp(b.updatedAt) - timestamp(a.updatedAt))
    .slice(0, 3);

  const retry = () => setReloadKey((value) => value + 1);
  const userName = session?.user?.name || "";

  if (status === "unauthenticated") {
    return (
      <section className="rounded-3xl border border-black/5 bg-white p-10 text-center">
        <h1 className="text-xl font-bold text-qorliqDark">
          Please log in
        </h1>
        <p className="mt-3 text-sm text-black/50">
          Log in to view your dashboard.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-xl bg-qorliqGold px-6 py-3 font-bold text-qorliqDark"
        >
          Log in
        </Link>
      </section>
    );
  }

  return (
    <div className="dashboard-scrollbar h-full w-full min-w-0 space-y-6 overflow-y-auto overflow-x-hidden pr-1 sm:pr-2 lg:space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-qorliqDark via-qorliqCharcoal to-black p-6 text-white shadow-luxury sm:p-8 lg:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-qorliqGold/10 blur-3xl"
        />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-qorliqGold/15 bg-qorliqGold/15 px-4 py-2 text-sm font-semibold text-qorliqGold">
              <Sparkles size={16} />
              {userName ? `Welcome back, ${userName}` : "Welcome Back"}
            </div>

            <h1 className="text-3xl font-black leading-tight sm:text-4xl">
              Build Professional CVs
              <br />
              That Get Interviews.
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-white/70 sm:text-base sm:leading-8">
              Create, edit and download ATS-friendly CVs with premium
              templates. Manage your resumes and track your progress
              from one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/cv-builder"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-qorliqGold px-5 py-3 text-sm font-bold text-qorliqDark shadow-gold transition hover:bg-qorliqGoldDark hover:text-white"
              >
                <Plus size={18} />
                Create New CV
              </Link>

              <Link
                href="/dashboard/templates"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-qorliqGold hover:bg-white/5"
              >
                <LayoutTemplate size={18} />
                Browse Templates
              </Link>
            </div>
          </div>

          <div className="hidden shrink-0 justify-center lg:flex">
            <div className="rounded-3xl border border-qorliqGold/20 bg-white/5 p-8 text-center backdrop-blur">
              <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full border border-qorliqGold/30 bg-qorliqGold/10">
                <FileText size={40} className="text-qorliqGold" />
              </div>
              <h3 className="text-lg font-bold">
                Professional CV Builder
              </h3>
              <p className="mt-2 text-sm text-white/60">
                Your next opportunity starts here
              </p>
            </div>
          </div>
        </div>
      </section>

 <section className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:gap-6">
  {[
    {
      title: "Total CVs",
      value: cvs.length,
      percentage: completionRate,
      label: "Completed",
      description: `${completedCVs} of ${cvs.length} CVs completed`,
      color: "#B88A2C",
      background: "#FAF5E9",
      icon: FileText,
      href: "/dashboard/cvs",
      error: errors.cvs,
    },
    {
      title: "Downloads",
      value: downloads.length,
      percentage: downloadSuccessRate,
      label: "Successful",
      description: `${successfulDownloads} successful download records`,
      color: "#059669",
      background: "#ECFDF5",
      icon: Download,
      href: "/dashboard/downloads",
      error: errors.downloads,
    },
    {
      title: "Completed CVs",
      value: completedCVs,
      percentage: completionRate,
      label: "Completed",
      description: `${cvs.length - completedCVs} CVs remaining`,
      color: "#6366F1",
      background: "#EEF2FF",
      icon: CheckCircle2,
      href: "/dashboard/cvs",
      error: errors.cvs,
    },
  ].map((card) => {
    const Icon = card.icon;
    const percentage = Math.min(
      100,
      Math.max(0, Number(card.percentage) || 0)
    );

    const radius = 43;
    const circumference = 2 * Math.PI * radius;
    const ready = !loading && !card.error;

    return (
      <Link
        key={card.title}
        href={card.href}
        className="group min-w-0 overflow-hidden rounded-3xl border border-black/[0.06] bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg motion-safe:hover:-translate-y-1 xl:p-6"
      >
        <div className="mb-5 flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{
              color: card.color,
              backgroundColor: card.background,
            }}
          >
            <Icon size={18} aria-hidden="true" />
          </div>

          <h3 className="text-sm font-semibold text-black/60">
            {card.title}
          </h3>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {loading ? (
              <div
                aria-label={`Loading ${card.title}`}
                className="h-12 w-20 rounded-xl bg-black/5 motion-safe:animate-pulse"
              />
            ) : (
              <p className="text-4xl font-black tracking-tight text-qorliqDark xl:text-5xl">
                {card.error ? "—" : card.value}
              </p>
            )}

            <p className="mt-2 text-xs text-black/40">
              {card.title === "Downloads"
                ? "Download records"
                : "Saved resumes"}
            </p>
          </div>

          <div
            className="relative flex h-28 w-28 shrink-0 items-center justify-center"
            role={ready ? "progressbar" : undefined}
            aria-label={`${card.title}: ${card.label.toLowerCase()}`}
            aria-valuemin={ready ? 0 : undefined}
            aria-valuemax={ready ? 100 : undefined}
            aria-valuenow={ready ? percentage : undefined}
          >
            <svg
              viewBox="0 0 112 112"
              className="absolute inset-0 h-full w-full -rotate-90"
              aria-hidden="true"
            >
              <circle
                cx="56"
                cy="56"
                r={radius}
                fill="none"
                stroke={card.background}
                strokeWidth="8"
              />

              <circle
                cx="56"
                cy="56"
                r={radius}
                fill="none"
                stroke={card.color}
                strokeWidth="8"
                strokeLinecap={
                  ready && percentage > 0 ? "round" : "butt"
                }
                strokeDasharray={circumference}
                strokeDashoffset={
                  circumference *
                  (1 - (ready ? percentage : 0) / 100)
                }
                className="motion-safe:transition-[stroke-dashoffset] motion-safe:duration-700 motion-safe:ease-out"
              />
            </svg>

            <div className="text-center">
              <p
                className="text-2xl font-black tracking-tight"
                style={{ color: card.color }}
              >
                {ready ? `${percentage}%` : "—"}
              </p>

              <p className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-black/40">
                {loading
                  ? "Loading"
                  : card.error
                    ? "Unavailable"
                    : card.label}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-black/5 pt-4">
          <p
            className={`text-xs leading-5 ${
              card.error ? "text-red-600" : "text-black/45"
            }`}
          >
            {loading
              ? "Loading your data..."
              : card.error || card.description}
          </p>

          <ArrowRight
            size={16}
            className="shrink-0 text-black/30 transition group-hover:text-qorliqGoldDark"
            aria-hidden="true"
          />
        </div>
      </Link>
    );
  })}
</section>

  

      <div className="grid items-start gap-6 xl:grid-cols-3 lg:gap-8">
        <section className="min-w-0 overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 p-5 sm:p-6">
            <div>
              <h2 className="text-xl font-bold text-qorliqDark">
                Recent CVs
              </h2>
              <p className="mt-1 text-sm text-black/45">
                Your latest resumes
              </p>
            </div>

            <Link
              href="/dashboard/cvs"
              className="inline-flex items-center gap-2 text-sm font-semibold text-qorliqGoldDark hover:text-qorliqGold"
            >
              View All
              <ArrowRight size={17} />
            </Link>
          </div>

          {loading ? (
            <div role="status" className="space-y-5 p-6">
              <span className="sr-only">Loading CVs...</span>
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  aria-hidden="true"
                  className="h-20 rounded-2xl bg-black/5 motion-safe:animate-pulse"
                />
              ))}
            </div>
          ) : errors.cvs ? (
            <div role="alert" className="p-8 text-center">
              <p className="text-sm text-red-600">{errors.cvs}</p>
              <button
                type="button"
                onClick={retry}
                className="mt-4 text-sm font-bold text-qorliqGoldDark"
              >
                Try again
              </button>
            </div>
          ) : recentCVs.length ? (
            <div className="divide-y divide-black/5">
              {recentCVs.map((cv) => (
                <CVRow key={cv.id} cv={cv} />
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <FileText
                size={32}
                className="mx-auto text-qorliqGoldDark"
              />
              <h3 className="mt-4 font-bold text-qorliqDark">
                Create your first CV
              </h3>
              <p className="mt-2 text-sm text-black/45">
                Your saved resumes will appear here.
              </p>
              <Link
                href="/cv-builder"
                className="mt-5 inline-flex rounded-xl bg-qorliqGold px-5 py-3 text-sm font-bold text-qorliqDark"
              >
                Get Started
              </Link>
            </div>
          )}
        </section>

        <SubscriptionCard
          access={access}
          loading={loading}
          error={errors.access}
          onRetry={retry}
        />
      </div>

      {status === "authenticated" && (
        <RecentActivity
          key={`${accountKey}-${reloadKey}`}
          limit={6}
        />
      )}
    </div>
  );
}



function CVRow({ cv }) {
  return (
    <div className="flex flex-col gap-4 p-5 transition hover:bg-qorliqCream/30 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-qorliqGold/10 text-qorliqGoldDark">
          <FileText size={21} />
        </div>

        <div className="min-w-0">
          <h3 className="truncate font-bold text-qorliqDark">
            {cv.name}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-black/45">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {formatDate(cv.updatedAt)}
            </span>

            <span className="flex min-w-0 items-center gap-1.5">
              <LayoutTemplate size={14} className="shrink-0" />
              <span className="truncate">{cv.template}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span
          className={`mr-auto rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide lg:mr-1 ${
            cv.status === "completed"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {formatLabel(cv.status)}
        </span>

        <Link
      href={`/cv-builder/preview/${encodeURIComponent(cv.id)}`}
          aria-label={`Preview ${cv.name}`}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 text-qorliqDark transition hover:border-qorliqGold hover:bg-qorliqCream"
        >
          <Eye size={17} />
        </Link>

        <Link
          href={`/cv-builder?cvId=${encodeURIComponent(cv.id)}`}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-qorliqGold px-4 text-sm font-bold text-qorliqDark transition hover:bg-qorliqGoldDark hover:text-white"
        >
          Edit
        </Link>
      </div>
    </div>
  );
}

function SubscriptionCard({ access, loading, error, onRetry }) {
  const planName =
    textValue(access?.planName) ||
    formatLabel(access?.plan) ||
    "Plan details unavailable";

  const accessStatus =
    formatLabel(access?.subscriptionStatus) ||
    formatLabel(access?.oneTimeAccessStatus) ||
    "Status unavailable";

  const expiry =
    access?.accessExpiresAt || access?.subscriptionEndDate;

  const packageName =
    textValue(access?.planName) ||
    formatLabel(access?.planType) ||
    formatLabel(access?.plan) ||
    "Not available";

  return (
    <section className="min-w-0 rounded-3xl bg-qorliqDark p-6 text-white shadow-luxury sm:p-7">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-qorliqGold text-qorliqDark">
          <Crown size={24} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-white/45">
            Your subscription
          </p>
          <h3 className="mt-1 break-words font-bold">
            {loading ? "Loading plan..." : error ? "Plan unavailable" : planName}
          </h3>
        </div>
      </div>

      {loading ? (
        <div role="status" className="mt-7 space-y-4">
          <span className="sr-only">Loading subscription...</span>
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              aria-hidden="true"
              className="h-5 rounded bg-white/10 motion-safe:animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="mt-6 rounded-xl bg-white/5 p-4">
          <div className="flex items-start gap-2 text-sm text-red-200">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 text-sm font-bold text-qorliqGold"
          >
            Retry
          </button>
        </div>
      ) : (
        <dl className="mt-7 space-y-4 text-sm">
          <PlanDetail label="Package" value={packageName} />
          <PlanDetail label="Status" value={accessStatus} />
          <PlanDetail
            label="Access ends"
            value={expiry ? formatDate(expiry) : "Not provided"}
          />
        </dl>
      )}

      <Link
        href="/dashboard/billing"
        className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-qorliqGold px-4 py-3 text-sm font-bold text-qorliqDark transition hover:bg-qorliqGoldDark hover:text-white"
      >
        Manage Subscription
        <ArrowRight size={17} />
      </Link>
    </section>
  );
}

function PlanDetail({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3 last:border-0">
      <dt className="shrink-0 text-white/50">{label}</dt>
      <dd className="break-words text-right font-medium">{value}</dd>
    </div>
  );
}