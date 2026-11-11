"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  Download,
  FilePenLine,
  FilePlus2,
  FileText,
  Palette,
  UserRound,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const activityTypes = {
  cv_created: {
    icon: FilePlus2,
    title: "CV created",
    iconClass: "bg-emerald-50 text-emerald-700",
  },
  cv_updated: {
    icon: FilePenLine,
    title: "CV updated",
    iconClass: "bg-blue-50 text-blue-700",
  },
  pdf_downloaded: {
    icon: Download,
    title: "PDF downloaded",
    iconClass: "bg-red-50 text-red-700",
  },
  word_downloaded: {
    icon: FileText,
    title: "Word file downloaded",
    iconClass: "bg-indigo-50 text-indigo-700",
  },
  download_record: {
    icon: Download,
    title: "Download activity",
    iconClass: "bg-blue-50 text-blue-700",
  },
  subscription_purchased: {
    icon: CreditCard,
    title: "Subscription purchased",
    iconClass: "bg-qorliqGold/15 text-qorliqGoldDark",
  },
  template_changed: {
    icon: Palette,
    title: "Template changed",
    iconClass: "bg-purple-50 text-purple-700",
  },
  profile_updated: {
    icon: UserRound,
    title: "Profile updated",
    iconClass: "bg-orange-50 text-orange-700",
  },
  payment_successful: {
    icon: CheckCircle2,
    title: "Payment successful",
    iconClass: "bg-emerald-50 text-emerald-700",
  },
};

function getTimestamp(value) {
  if (!value) return null;

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function formatActivityTime(timestamp) {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - timestamp) / 1000)
  );

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
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

function firstText(...values) {
  return (
    values.find(
      (value) => typeof value === "string" && value.trim()
    ) || ""
  );
}

function buildActivities(cvs, downloads) {
  const activities = [];
  const cvTitles = new Map();

  for (const cv of cvs) {
    const id = cv._id || cv.id;
    if (!id) continue;

    const documentName =
      firstText(
        cv.title,
        cv.jobTitle,
        cv.personalInfo?.jobTitle
      ) || "Untitled CV";

    cvTitles.set(String(id), documentName);

    const createdAt = getTimestamp(cv.createdAt);
    const updatedAt = getTimestamp(cv.updatedAt);

    if (createdAt !== null) {
      activities.push({
        id: `cv-created-${id}`,
        type: "cv_created",
        description: "You created a CV.",
        documentName,
        timestamp: createdAt,
      });
    }

    // updatedAt identifies the latest record update, not a full edit log.
    if (
      updatedAt !== null &&
      (createdAt === null || updatedAt > createdAt)
    ) {
      activities.push({
        id: `cv-updated-${id}`,
        type: "cv_updated",
        description: "Your CV record was updated.",
        documentName,
        timestamp: updatedAt,
      });
    }
  }

  for (const record of downloads) {
    const id = record._id || record.id;
    if (!id) continue;

    const timestamp = getTimestamp(
      record.downloadedAt || record.createdAt
    );
    if (timestamp === null) continue;

    const format = String(record.format || "").toLowerCase();
    const status = String(record.status || "").toLowerCase();
    const completed =
      status === "completed" || status === "successful";

    const cvId =
      typeof record.cvId === "object" && record.cvId !== null
        ? record.cvId._id
        : record.cvId;

    const documentName =
      firstText(
        record.cvTitle,
        cvTitles.get(String(cvId || ""))
      ) || "Untitled CV";

    let type = "download_record";
    let title = "Download activity";
    let description = "A download request was recorded.";

    if (completed) {
      if (format === "pdf") {
        type = "pdf_downloaded";
        title = "PDF downloaded";
        description: undefined;
        description = "Your CV PDF download was recorded as completed.";
      } else if (["docx", "doc", "word"].includes(format)) {
        type = "word_downloaded";
        title = "Word file downloaded";
        description =
          "Your CV Word download was recorded as completed.";
      } else {
        title = "CV downloaded";
        description = "Your CV download was recorded as completed.";
      }
    } else if (status === "failed") {
      title = "Download failed";
      description = "Your CV download was recorded as failed.";
    } else if (status === "pending") {
      title = "Download pending";
      description = "Your CV download request is pending.";
    } else if (status === "expired") {
      title = "Download expired";
      description = "Your CV download record is marked as expired.";
    }

    activities.push({
      id: `download-${id}`,
      type,
      title,
      description,
      documentName,
      status,
      timestamp,
    });
  }

  return activities.sort((a, b) => b.timestamp - a.timestamp);
}

async function fetchRecords(url, key, signal) {
  const response = await fetch(url, {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
    signal,
  });

  if (response.status === 401) {
    throw new Error("Please log in to view your recent activity.");
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

export default function RecentActivity({
  limit = 6,
  onViewAll,
}) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setReloadKey((previous) => previous + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let timedOut = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 15000);

    async function loadActivities() {
      setLoading(true);
      setError("");

      try {
        const [cvs, downloads] = await Promise.all([
          fetchRecords("/api/cv", "cvs", controller.signal),
          fetchRecords("/api/downloads", "downloads", controller.signal),
        ]);

        if (!active) return;

        setActivities(buildActivities(cvs, downloads));
      } catch (error) {
        if (!active) return;

        setError(
          timedOut
            ? "The request took too long. Please try again."
            : error.message || "Could not load recent activity."
        );
      } finally {
        clearTimeout(timeout);

        if (active) {
          setLoading(false);
        }
      }
    }

    void loadActivities();

    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [reloadKey]);

  const displayLimit =
    Number.isInteger(limit) && limit > 0 ? limit : 6;

  const visibleActivities = showAll
    ? activities
    : activities.slice(0, displayLimit);

  const handleViewAll = () => {
    if (typeof onViewAll === "function") {
      onViewAll();
    } else {
      setShowAll((previous) => !previous);
    }
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-black/5 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-qorliqDark sm:text-xl">
            Recent Activity
          </h2>

          <p className="mt-1 text-sm text-black/45">
            Your latest CV and download actions.
          </p>
        </div>

        {!loading && !error && activities.length > displayLimit && (
          <button
            type="button"
            onClick={handleViewAll}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-black/10 px-4 text-sm font-semibold text-qorliqDark transition-all duration-200 hover:border-qorliqGold hover:bg-qorliqCream"
          >
            {showAll ? "Show Less" : "View All Activity"}
          </button>
        )}
      </div>

      {loading ? (
        <ActivitySkeleton />
      ) : error ? (
        <div role="alert" className="px-6 py-12 text-center">
          <AlertCircle
            size={28}
            className="mx-auto text-red-600"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={reload}
            className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-black/10 px-4 text-sm font-semibold text-qorliqDark transition hover:border-qorliqGold hover:bg-qorliqCream"
          >
            <RefreshCw size={16} aria-hidden="true" />
            Retry
          </button>
        </div>
      ) : visibleActivities.length > 0 ? (
        <div className="divide-y divide-black/5">
          {visibleActivities.map((activity, index) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              isLast={index === visibleActivities.length - 1}
            />
          ))}
        </div>
      ) : (
        <EmptyActivityState />
      )}
    </section>
  );
}

function ActivityItem({ activity, isLast }) {
  const typeConfig =
    activityTypes[activity.type] || activityTypes.cv_updated;

  const Icon = typeConfig.icon;

  return (
    <article className="group relative flex gap-4 px-5 py-5 transition-colors hover:bg-qorliqCream/45 sm:px-6">
      <div className="relative flex shrink-0 flex-col items-center">
        <div
          className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-2xl ${typeConfig.iconClass}`}
        >
          <Icon size={19} strokeWidth={2.1} aria-hidden="true" />
        </div>

        {!isLast && (
          <span
            aria-hidden="true"
            className="absolute top-11 h-[calc(100%+20px)] w-px bg-black/8"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-bold text-qorliqDark">
              {activity.title || typeConfig.title}
            </p>

            <p className="mt-1 text-sm leading-6 text-black/55">
              {activity.description}
            </p>
          </div>

          <time
            dateTime={new Date(activity.timestamp).toISOString()}
            title={new Date(activity.timestamp).toLocaleString()}
            className="shrink-0 text-xs font-medium text-black/35"
          >
            {formatActivityTime(activity.timestamp)}
          </time>
        </div>

        {(activity.documentName || activity.status) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {activity.documentName && (
              <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-black/[0.035] px-2.5 py-1.5 text-xs font-medium text-black/60">
                <FileText
                  size={13}
                  className="shrink-0"
                  aria-hidden="true"
                />
                <span className="truncate">
                  {activity.documentName}
                </span>
              </span>
            )}

            {activity.status && (
              <ActivityStatus status={activity.status} />
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function ActivityStatus({ status }) {
  const normalizedStatus = String(status).toLowerCase();

  const statusClasses = {
    completed: "bg-emerald-50 text-emerald-700",
    successful: "bg-emerald-50 text-emerald-700",
    active: "bg-qorliqGold/15 text-qorliqGoldDark",
    pending: "bg-orange-50 text-orange-700",
    failed: "bg-red-50 text-red-700",
    expired: "bg-amber-50 text-amber-700",
  };

  const className =
    statusClasses[normalizedStatus] || "bg-black/5 text-black/55";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${className}`}
    >
      {status}
    </span>
  );
}

function ActivitySkeleton() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading recent activity...</span>

      <div aria-hidden="true" className="divide-y divide-black/5">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="flex gap-4 px-5 py-5 sm:px-6"
          >
            <div className="h-11 w-11 shrink-0 rounded-2xl bg-black/5 motion-safe:animate-pulse" />

            <div className="flex-1 space-y-3 motion-safe:animate-pulse">
              <div className="h-4 w-32 rounded bg-black/10" />
              <div className="h-3 w-3/4 rounded bg-black/5" />
              <div className="h-6 w-40 rounded-lg bg-black/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyActivityState() {
  return (
    <div className="px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-qorliqCream text-qorliqGoldDark">
        <FileText size={23} aria-hidden="true" />
      </div>

      <h3 className="mt-4 text-base font-bold text-qorliqDark">
        No recent activity
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-black/45">
        Your CV creations, updates, and downloads will appear here.
      </p>
    </div>
  );
}