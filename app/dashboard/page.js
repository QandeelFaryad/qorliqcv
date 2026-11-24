"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  Crown,
  Download,
  Eye,
  FilePlus2,
  FileText,
  LayoutTemplate,
  Pencil,
  Plus,
  RefreshCw,
  CheckCircle2
} from "lucide-react";

import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "motion/react";

import RecentActivity from "@/components/customer-dashboard/RecentActivity";

/* ============================================================
   QORLIQ CV — CUSTOMER DASHBOARD
   Design direction: Editorial SaaS Workspace

   Existing APIs, routes, authentication, and business logic
   are preserved.

   Styling: Tailwind CSS + existing --qd-* variables
   Animation: motion/react
============================================================ */

/* ============================================================
   MOTION CONFIGURATION
============================================================ */

const EASE = [0.22, 1, 0.36, 1];

const ENTER = {
  opacity: 0,
  y: 14,
};

const VISIBLE = {
  opacity: 1,
  y: 0,
};

function useDashboardMotion() {
  const reducedMotion = useReducedMotion();

  return {
    reducedMotion,

    initial: reducedMotion ? false : ENTER,

    animate: VISIBLE,

    transition: {
      duration: reducedMotion ? 0 : 0.52,
      ease: EASE,
    },
  };
}

/* ============================================================
   ORIGINAL DATA STATE
============================================================ */

const emptyState = {
  owner: "",
  loading: true,
  cvs: [],
  downloads: [],
  access: null,
  errors: {},
};

/* ============================================================
   EXISTING HELPERS
============================================================ */

function textValue(...values) {
  return (
    values.find(
      (value) =>
        typeof value === "string" &&
        value.trim()
    ) || ""
  );
}

function timestamp(value) {
  if (!value) return 0;

  const result = new Date(value).getTime();

  return Number.isFinite(result) ? result : 0;
}

function formatDate(value) {
  if (!timestamp(value)) {
    return "Not available";
  }

  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatLabel(value) {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return "";
  }

  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

/* ============================================================
   ORIGINAL API FETCH FUNCTION
============================================================ */

async function fetchData(url, signal) {
  const response = await fetch(url, {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
    signal,
  });

  const data = await response
    .json()
    .catch(() => null);

  if (response.status === 401) {
    throw new Error("Please log in again.");
  }

  if (
    !response.ok ||
    !data ||
    data.success === false
  ) {
    throw new Error(
      "Could not load data. Please try again."
    );
  }

  return data;
}

/* ============================================================
   ORIGINAL CV NORMALIZATION
============================================================ */

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

    templateId:
      textValue(
        cv.templateId,
        cv.template?.id,
        cv.templateName
      ) || "",

    accent:
      textValue(
        cv.accent,
        cv.accentColor,
        cv.color
      ) || "",

    status: String(cv.status || "draft").toLowerCase(),

    updatedAt: cv.updatedAt || cv.createdAt,
  };
}
/* ============================================================
   SHARED STYLES
============================================================ */

const styles = {
  panel: `
    min-w-0
    overflow-hidden
    rounded-[16px]
    border
    border-[var(--qd-border)]
    bg-[var(--qd-surface)]
  `,

  muted: `
    text-[var(--qd-text-secondary)]
  `,

  primaryButton: `
    inline-flex
    min-h-[44px]
    items-center
    justify-center
    gap-2
    rounded-[10px]
    bg-[var(--qd-primary)]
    px-4
    text-[13px]
    font-semibold
    tracking-[-0.01em]
    transition-[background-color,transform,box-shadow]
    duration-200
    hover:bg-[var(--qd-primary-hover)]
    focus-visible:outline-2
    focus-visible:outline-offset-2
    focus-visible:outline-[var(--qd-accent)]
  `,

  secondaryButton: `
    inline-flex
    min-h-[44px]
    items-center
    justify-center
    gap-2
    rounded-[10px]
    border
    border-[var(--qd-border-strong)]
    bg-[var(--qd-surface)]
    px-4
    text-[13px]
    font-medium
    text-[var(--qd-text-primary)]
    transition-colors
    duration-200
    hover:bg-[var(--qd-background-soft)]
    focus-visible:outline-2
    focus-visible:outline-offset-2
    focus-visible:outline-[var(--qd-accent)]
  `,

  sectionTitle: `
    text-[15px]
    font-semibold
    tracking-[-0.025em]
    text-[var(--qd-text-primary)]
    sm:text-[16px]
  `,
};

/*
  IMPORTANT:
  --qd-background is white in light mode and navy in dark mode.

  Using it as the foreground on a --qd-primary button gives:
  Light: navy background / white text
  Dark:  cyan background / navy text

  This avoids the conflicting theme selectors encountered earlier.
*/

const primaryButtonText = {
  color: "var(--qd-background)",
};

/* ============================================================
   SMALL REUSABLE COMPONENTS
============================================================ */

function Skeleton({
  className = "",
}) {
  return (
    <div
      aria-hidden="true"
      className={`
        rounded-md
        bg-[var(--qd-background-muted)]
        motion-safe:animate-pulse
        ${className}
      `}
    />
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
  action,
}) {
  return (
    <div
      className="
        flex
        min-w-0
        flex-col
        justify-between
        gap-3
        sm:flex-row
        sm:items-end
      "
    >
      <div className="min-w-0">
        {eyebrow && (
          <p
            className="
              mb-2
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-[var(--qd-text-muted)]
            "
          >
            {eyebrow}
          </p>
        )}

        <h2 className={styles.sectionTitle}>
          {title}
        </h2>

        {description && (
          <p
            className="
              mt-1
              text-[12px]
              leading-5
              text-[var(--qd-text-secondary)]
            "
          >
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

/* ============================================================
   PRIMARY ACTION
============================================================ */

function PrimaryAction({
  href,
  children,
  icon: Icon,
  className = "",
}) {
  const reducedMotion = useReducedMotion();

  return (
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
      transition={{
        duration: 0.18,
      }}
      className={className}
    >
      <Link
        href={href}
        className={styles.primaryButton}
        style={primaryButtonText}
      >
        {Icon && (
          <Icon
            size={17}
            strokeWidth={1.9}
            aria-hidden="true"
          />
        )}

        {children}
      </Link>
    </motion.div>
  );
}

/* ============================================================
   SECONDARY ACTION
============================================================ */

function SecondaryAction({
  href,
  children,
  icon: Icon,
}) {
  const reducedMotion = useReducedMotion();

  return (
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
      transition={{
        duration: 0.18,
      }}
    >
      <Link
        href={href}
        className={styles.secondaryButton}
      >
        {Icon && (
          <Icon
            size={17}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        )}

        {children}
      </Link>
    </motion.div>
  );
}

/* ============================================================
   QUIET TEXT LINK
============================================================ */

function TextAction({
  href,
  children,
}) {
  return (
    <Link
      href={href}
      className="
        group
        inline-flex
        min-h-[40px]
        shrink-0
        items-center
        gap-1.5
        rounded-lg
        px-2
        text-[12px]
        font-semibold
        text-[var(--qd-text-secondary)]
        transition-colors
        duration-200
        hover:bg-[var(--qd-background-soft)]
        hover:text-[var(--qd-text-primary)]
        focus-visible:outline-2
        focus-visible:outline-[var(--qd-accent)]
      "
    >
      {children}

      <ArrowRight
        size={15}
        strokeWidth={1.8}
        className="
          transition-transform
          duration-200
          group-hover:translate-x-0.5
        "
        aria-hidden="true"
      />
    </Link>
  );
}

/* ============================================================
   SMALL ANIMATED PROGRESS BAR
============================================================ */

function ProgressBar({
  value,
  loading = false,
  error = false,
}) {
  const reducedMotion = useReducedMotion();

  const percentage = Math.max(
    0,
    Math.min(100, Number(value) || 0)
  );

  return (
    <div
      className="
        h-[5px]
        w-full
        overflow-hidden
        rounded-full
        bg-[var(--qd-background-muted)]
      "
      role={
        !loading && !error
          ? "progressbar"
          : undefined
      }
      aria-valuemin={
        !loading && !error ? 0 : undefined
      }
      aria-valuemax={
        !loading && !error ? 100 : undefined
      }
      aria-valuenow={
        !loading && !error
          ? percentage
          : undefined
      }
      aria-label="Completion progress"
    >
      <motion.div
        initial={
          reducedMotion
            ? false
            : { width: 0 }
        }
        animate={{
          width: `${
            loading || error ? 0 : percentage
          }%`,
        }}
        transition={{
          duration: reducedMotion ? 0 : 0.85,
          ease: EASE,
          delay: reducedMotion ? 0 : 0.12,
        }}
        className="
          h-full
          rounded-full
          bg-[var(--qd-accent)]
        "
      />
    </div>
  );
}

/* ============================================================
   SUMMARY METRIC
============================================================ */

function Metric({
  label,
  value,
  detail,
  percentage,
  href,
  loading,
  error,
  index = 0,
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={
        reducedMotion
          ? false
          : {
              opacity: 0,
              y: 12,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: reducedMotion ? 0 : 0.45,
        delay:
          reducedMotion
            ? 0
            : 0.12 + index * 0.07,
        ease: EASE,
      }}
      className="
        min-w-0
        md:border-r
        md:border-[var(--qd-border)]
        md:last:border-r-0
      "
    >
      <Link
        href={href}
        className="
          group
          flex
          h-full
          flex-col
          rounded-[10px]
          p-4
          outline-none
          transition-colors
          duration-200
          hover:bg-[var(--qd-background-soft)]
          focus-visible:ring-2
          focus-visible:ring-[var(--qd-accent)]
          sm:p-5
        "
      >
        {/* METRIC LABEL */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-2
          "
        >
          <span
            className="
              text-[12px]
              font-medium
              text-[var(--qd-text-secondary)]
            "
          >
            {label}
          </span>

          <ArrowUpRight
            size={16}
            strokeWidth={1.7}
            className="
              shrink-0
              text-[var(--qd-text-muted)]
              opacity-60
              transition-all
              duration-200
              group-hover:-translate-y-0.5
              group-hover:translate-x-0.5
              group-hover:opacity-100
            "
            aria-hidden="true"
          />
        </div>

        {/* VALUE */}

        <div className="mt-4 min-h-[49px]">
          {loading ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <motion.p
              key={`metric-${label}-${value}-${Boolean(error)}`}
              initial={
                reducedMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 6,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: reducedMotion ? 0 : 0.3,
              }}
              className="
                text-[34px]
                font-semibold
                leading-none
                tracking-[-0.065em]
                text-[var(--qd-text-primary)]
                sm:text-[38px]
              "
            >
              {error ? "—" : value}
            </motion.p>
          )}
        </div>

        {/* DESCRIPTION */}

        <p
          className={`
            mt-2
            min-h-[34px]
            text-[11px]
            leading-[1.6]

            ${
              error
                ? "text-red-500"
                : "text-[var(--qd-text-muted)]"
            }
          `}
        >
          {loading
            ? "Loading data..."
            : error || detail}
        </p>

        {/* PROGRESS */}

        <div className="mt-auto pt-4">
          <ProgressBar
            value={percentage}
            loading={loading}
            error={Boolean(error)}
          />
        </div>
      </Link>
    </motion.div>
  );
}

/* ============================================================
   UNIFIED OVERVIEW
============================================================ */

function DashboardOverview({
  loading,
  cvs,
  downloads,
  completedCVs,
  successfulDownloads,
  completionRate,
  downloadSuccessRate,
  errors,
}) {
  const metrics = [
    {
      label: "Total CVs",
      value: cvs.length,
      detail: `${completedCVs} of ${cvs.length} CVs completed`,
      percentage: completionRate,
      href: "/dashboard/cvs",
      error: errors.cvs,
    },

    {
      label: "Downloads",
      value: downloads.length,
      detail: `${successfulDownloads} successful download records`,
      percentage: downloadSuccessRate,
      href: "/dashboard/downloads",
      error: errors.downloads,
    },

    {
      label: "Completed CVs",
      value: completedCVs,
      detail: `${
        cvs.length - completedCVs
      } CVs remaining`,
      percentage: completionRate,
      href: "/dashboard/cvs",
      error: errors.cvs,
    },
  ];

  return (
    <section
      aria-labelledby="dashboard-overview-heading"
      className="min-w-0"
    >
      <SectionIntro
        eyebrow="Overview"
        title="Your activity"
        description="A clear view of your CV workspace."
      />

      <div
        className={`
          ${styles.panel}
          mt-4
          grid
          grid-cols-1
          p-2
          sm:grid-cols-3
        `}
      >
        {metrics.map((metric, index) => (
          <Metric
            key={metric.label}
            {...metric}
            index={index}
            loading={loading}
          />
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   CV STATUS
============================================================ */

function CVStatus({
  status,
}) {
  const completed = status === "completed";

  const tone = completed
    ? `
        border-emerald-500/20
        bg-emerald-500/10
        text-emerald-600
      `
    : status === "incomplete"
      ? `
          border-orange-500/20
          bg-orange-500/10
          text-orange-600
        `
      : `
          border-[var(--qd-border)]
          bg-[var(--qd-background-soft)]
          text-[var(--qd-text-secondary)]
        `;

  return (
    <span
      className={`
        inline-flex
        min-h-[26px]
        items-center
        gap-1.5
        rounded-md
        border
        px-2
        text-[10px]
        font-medium
        ${tone}
      `}
    >
      {completed && (
        <Check
          size={12}
          strokeWidth={2}
          aria-hidden="true"
        />
      )}

      {formatLabel(status) || "Draft"}
    </span>
  );
}

/* ============================================================
   RECENT CV ROW
============================================================ */

function CVRow({
  cv,
  index,
}) {
  const reducedMotion = useReducedMotion();
  const editHref =
  `/cv-builder/create?edit=${encodeURIComponent(cv.id)}` +
  `&template=${encodeURIComponent(cv.templateId)}` +
  `&color=${encodeURIComponent(cv.accent)}`;

  return (
    <motion.article
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
        delay:
          reducedMotion
            ? 0
            : index * 0.06,
        ease: EASE,
      }}
      className="
        group
        flex
        min-w-0
        flex-col
        gap-3
        px-4
        py-4
        transition-colors
        duration-200
        hover:bg-[var(--qd-background-soft)]
        sm:flex-row
        sm:items-center
        sm:justify-between
        sm:gap-4
        sm:px-5
      "
    >
      {/* DOCUMENT INFORMATION */}

      <div
        className="
          flex
          min-w-0
          flex-1
          items-start
          gap-3
          sm:items-center
        "
      >
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-[10px]
            border
            border-[var(--qd-border)]
            bg-[var(--qd-surface)]
            text-[var(--qd-text-secondary)]
          "
        >
          <FileText
            size={19}
            strokeWidth={1.6}
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3
            title={cv.name}
            className="
              truncate
              text-[13px]
              font-semibold
              tracking-[-0.015em]
              text-[var(--qd-text-primary)]
            "
          >
            {cv.name}
          </h3>

          <div
            className="
              mt-1.5
              flex
              min-w-0
              flex-wrap
              items-center
              gap-x-3
              gap-y-1
              text-[11px]
              text-[var(--qd-text-muted)]
            "
          >
            <span
              className="
                inline-flex
                min-w-0
                items-center
                gap-1.5
              "
            >
              <LayoutTemplate
                size={12}
                strokeWidth={1.7}
                className="shrink-0"
              />

              <span className="max-w-[150px] truncate">
                {cv.template}
              </span>
            </span>

            <span
              className="
                inline-flex
                items-center
                gap-1.5
              "
            >
              <CalendarDays
                size={12}
                strokeWidth={1.7}
                aria-hidden="true"
              />

              {formatDate(cv.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* DOCUMENT ACTIONS */}

      <div
        className="
          flex
          shrink-0
          items-center
          justify-between
          gap-2
          pl-[52px]
          sm:justify-end
          sm:pl-0
        "
      >
        <CVStatus status={cv.status} />

        <div className="flex items-center gap-2">
          {/* PREVIEW */}

          <Link
            href={`/cv-builder/preview/${encodeURIComponent(
              cv.id
            )}`}
            title={`Preview ${cv.name}`}
            aria-label={`Preview ${cv.name}`}
            className="
              inline-flex
              h-9
              w-9
              items-center
              justify-center
              rounded-[9px]
              border
              border-[var(--qd-border)]
              text-[var(--qd-text-secondary)]
              transition-colors
              duration-200
              hover:border-[var(--qd-border-strong)]
              hover:bg-[var(--qd-surface)]
              hover:text-[var(--qd-text-primary)]
              focus-visible:outline-2
              focus-visible:outline-[var(--qd-accent)]
            "
          >
            <Eye
              size={16}
              strokeWidth={1.8}
            />
          </Link>

          {/* EDIT */}
<Link
  href={editHref}
  aria-label={`Edit ${cv.name}`}
  className="
    inline-flex
    min-h-9
    items-center
    justify-center
    gap-1.5
    rounded-[9px]
    border
    border-[var(--qd-border-strong)]
    bg-[var(--qd-surface)]
    px-3
    text-[11px]
    font-semibold
    text-[var(--qd-text-primary)]
    transition-colors
    duration-200
    hover:bg-[var(--qd-background-muted)]
    focus-visible:outline-2
    focus-visible:outline-[var(--qd-accent)]
  "
>
  <Pencil
    size={13}
    strokeWidth={1.8}
    aria-hidden="true"
  />

  Edit
</Link>
        </div>
      </div>
    </motion.article>
  );
}

/* ============================================================
   RECENT CV EMPTY STATE
============================================================ */

function CVEmptyState() {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={
        reducedMotion
          ? false
          : {
              opacity: 0,
              y: 12,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: reducedMotion ? 0 : 0.45,
        ease: EASE,
      }}
      className="
        flex
        flex-col
        items-center
        px-6
        py-12
        text-center
        sm:py-14
      "
    >
      <div
        className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-[12px]
          border
          border-[var(--qd-border)]
          bg-[var(--qd-background-soft)]
          text-[var(--qd-text-secondary)]
        "
      >
        <FilePlus2
          size={21}
          strokeWidth={1.6}
        />
      </div>

      <h3
        className="
          mt-4
          text-[15px]
          font-semibold
          tracking-[-0.025em]
          text-[var(--qd-text-primary)]
        "
      >
        No CVs yet
      </h3>

      <p
        className="
          mt-2
          max-w-[290px]
          text-[12px]
          leading-6
          text-[var(--qd-text-secondary)]
        "
      >
        Create your first CV to start building
        and managing your professional profile.
      </p>

      <div className="mt-5">
        <PrimaryAction
          href="/cv-builder"
          icon={Plus}
        >
          Create your first CV
        </PrimaryAction>
      </div>
    </motion.div>
  );
}

/* ============================================================
   RECENT CVS PANEL
============================================================ */

function RecentCVsPanel({
  recentCVs,
  loading,
  error,
  onRetry,
}) {
  return (
    <section
      aria-labelledby="recent-cvs-title"
      className={styles.panel}
    >
      {/* PANEL HEADER */}

      <div
        className="
          flex
          min-w-0
          items-center
          justify-between
          gap-3
          border-b
          border-[var(--qd-border)]
          px-4
          py-4
          sm:px-5
        "
      >
        <div className="min-w-0">
          <h2
            id="recent-cvs-title"
            className={styles.sectionTitle}
          >
            Recent CVs
          </h2>

          <p
            className="
              mt-1
              text-[11px]
              text-[var(--qd-text-secondary)]
            "
          >
            Your latest saved documents
          </p>
        </div>

        <TextAction href="/dashboard/cvs">
          View all
        </TextAction>
      </div>

      {/* PANEL BODY */}

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="status"
            className="space-y-4 px-5 py-6"
          >
            <span className="sr-only">
              Loading CVs...
            </span>

            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3"
              >
                <Skeleton className="h-10 w-10 shrink-0" />

                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-2/5" />

                  <Skeleton className="h-3 w-3/5" />
                </div>
              </div>
            ))}
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="alert"
            className="
              flex
              flex-col
              items-center
              px-6
              py-10
              text-center
            "
          >
            <CircleAlert
              size={22}
              className="text-red-500"
            />

            <p
              className="
                mt-3
                text-[12px]
                leading-5
                text-red-500
              "
            >
              {error}
            </p>

            <button
              type="button"
              onClick={onRetry}
              className="
                mt-4
                inline-flex
                min-h-10
                items-center
                gap-2
                rounded-lg
                px-3
                text-[12px]
                font-semibold
                text-[var(--qd-text-primary)]
                hover:bg-[var(--qd-background-soft)]
              "
            >
              <RefreshCw size={14} />

              Try again
            </button>
          </motion.div>
        ) : recentCVs.length ? (
          <motion.div
            key="cv-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="
              divide-y
              divide-[var(--qd-border)]
            "
          >
            {recentCVs.map((cv, index) => (
              <CVRow
                key={cv.id}
                cv={cv}
                index={index}
              />
            ))}
          </motion.div>
        ) : (
          <CVEmptyState key="empty" />
        )}
      </AnimatePresence>
    </section>
  );
}

/* ============================================================
   ACCOUNT DETAIL
============================================================ */

function AccountDetail({
  label,
  value,
  last = false,
}) {
  return (
    <div
      className={`
        flex
        min-w-0
        items-start
        justify-between
        gap-3
        py-3

        ${
          last
            ? ""
            : "border-b border-[var(--qd-border)]"
        }
      `}
    >
      <dt
        className="
          shrink-0
          text-[12px]
          text-[var(--qd-text-muted)]
        "
      >
        {label}
      </dt>

      <dd
        className="
          min-w-0
          max-w-[60%]
          break-words
          text-right
          text-[12px]
          font-medium
          text-[var(--qd-text-primary)]
        "
      >
        {value}
      </dd>
    </div>
  );
}

/* ============================================================
   SUBSCRIPTION PANEL
============================================================ */

function SubscriptionPanel({
  access,
  loading,
  error,
  onRetry,
}) {
  const reducedMotion = useReducedMotion();

  const planName =
    textValue(access?.planName) ||
    formatLabel(access?.plan) ||
    "Plan details unavailable";

  const accessStatus =
    formatLabel(access?.subscriptionStatus) ||
    formatLabel(access?.oneTimeAccessStatus) ||
    "Status unavailable";

  const expiry =
    access?.accessExpiresAt ||
    access?.subscriptionEndDate;

  const packageName =
    textValue(access?.planName) ||
    formatLabel(access?.planType) ||
    formatLabel(access?.plan) ||
    "Not available";

  return (
    <section
      aria-labelledby="subscription-title"
      className={styles.panel}
    >
      {/* HEADER */}

      <div
        className="
          flex
          items-center
          justify-between
          gap-3
          border-b
          border-[var(--qd-border)]
          px-4
          py-4
          sm:px-5
        "
      >
        <div>
          <h2
            id="subscription-title"
            className={styles.sectionTitle}
          >
            Subscription
          </h2>

          <p
            className="
              mt-1
              text-[11px]
              text-[var(--qd-text-secondary)]
            "
          >
            Your current plan and access
          </p>
        </div>

        <Crown
          size={18}
          strokeWidth={1.7}
          className="text-[var(--qd-text-muted)]"
          aria-hidden="true"
        />
      </div>

      {/* BODY */}

      <div className="px-4 pb-4 pt-5 sm:px-5 sm:pb-5">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="subscription-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              role="status"
              className="space-y-4"
            >
              <span className="sr-only">
                Loading subscription...
              </span>

              <Skeleton className="h-7 w-2/3" />

              <Skeleton className="h-4 w-full" />

              <Skeleton className="h-4 w-4/5" />
            </motion.div>
          ) : error ? (
            <motion.div
              key="subscription-error"
              initial={{
                opacity: 0,
                y: reducedMotion ? 0 : 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{ opacity: 0 }}
              role="alert"
              className="
                rounded-[10px]
                border
                border-red-500/15
                bg-red-500/5
                p-4
              "
            >
              <p className="text-[12px] text-red-500">
                {error}
              </p>

              <button
                type="button"
                onClick={onRetry}
                className="
                  mt-3
                  text-[12px]
                  font-semibold
                  text-[var(--qd-text-primary)]
                  underline
                  underline-offset-4
                "
              >
                Retry
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="subscription-details"
              initial={{
                opacity: 0,
                y: reducedMotion ? 0 : 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: reducedMotion ? 0 : 0.35,
                ease: EASE,
              }}
            >
              {/* PLAN NAME */}

              <div className="pb-4">
                <p
                  className="
                    text-[10px]
                    font-medium
                    uppercase
                    tracking-[0.1em]
                    text-[var(--qd-text-muted)]
                  "
                >
                  Current plan
                </p>

                <p
                  className="
                    mt-2
                    break-words
                    text-[21px]
                    font-semibold
                    leading-tight
                    tracking-[-0.045em]
                    text-[var(--qd-text-primary)]
                  "
                >
                  {planName}
                </p>
              </div>

              {/* DETAILS */}

              <dl
                className="
                  border-t
                  border-[var(--qd-border)]
                "
              >
                <AccountDetail
                  label="Package"
                  value={packageName}
                />

                <AccountDetail
                  label="Status"
                  value={accessStatus}
                />

                <AccountDetail
                  label="Access ends"
                  value={
                    expiry
                      ? formatDate(expiry)
                      : "Not provided"
                  }
                  last
                />
              </dl>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MANAGE ACTION */}

        <Link
          href="/dashboard/billing"
          className="
            group
            mt-5
            flex
            min-h-[42px]
            w-full
            items-center
            justify-between
            gap-3
            rounded-[9px]
            border
            border-[var(--qd-border-strong)]
            bg-[var(--qd-surface)]
            px-3
            text-[12px]
            font-semibold
            text-[var(--qd-text-primary)]
            transition-colors
            duration-200
            hover:bg-[var(--qd-background-soft)]
            focus-visible:outline-2
            focus-visible:outline-[var(--qd-accent)]
          "
        >
          Manage subscription

          <ArrowRight
            size={15}
            strokeWidth={1.8}
            className="
              transition-transform
              duration-200
              group-hover:translate-x-0.5
            "
          />
        </Link>
      </div>
    </section>
  );
}

/* ============================================================
   WORKSPACE INTRODUCTION
============================================================ */

/* ============================================================
   QORLIQ CV — PREMIUM ANIMATED WORKSPACE HERO
   Left: Content and actions
   Right: Animated professional resume composition

   Dependencies:
   motion/react
   lucide-react
   Tailwind CSS

   Existing authentication, routes, and APIs unchanged.
============================================================ */

/* ============================================================
   ANIMATION SETTINGS
============================================================ */

const HERO_EASE = [0.22, 1, 0.36, 1];

const HERO_SPRING = {
  type: "spring",
  stiffness: 180,
  damping: 24,
};

/* ============================================================
   ANIMATED RESUME PREVIEW
============================================================ */

function AnimatedResumePreview() {
  const reducedMotion = useReducedMotion();

  const entrance = (delay = 0) => ({
    initial: reducedMotion
      ? false
      : {
          opacity: 0,
          y: 14,
        },

    animate: {
      opacity: 1,
      y: 0,
    },

    transition: {
      duration: reducedMotion ? 0 : 0.65,
      delay: reducedMotion ? 0 : delay,
      ease: HERO_EASE,
    },
  });

  const skills = [
    { name: "Product Strategy", width: "88%" },
    { name: "User Experience", width: "94%" },
    { name: "Leadership", width: "78%" },
  ];

  return (
    <div
      aria-hidden="true"
      className="
        relative
        mx-auto
        flex
        h-[320px]
        w-full
        max-w-[460px]
        items-center
        justify-center

        sm:h-[380px]
        lg:h-[400px]
      "
    >
      {/* ==========================================
          SOFT BACKGROUND VISUAL
      ========================================== */}

      <motion.div
        initial={
          reducedMotion
            ? false
            : {
                opacity: 0,
                scale: 0.85,
              }
        }
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          duration: reducedMotion ? 0 : 1,
          ease: HERO_EASE,
        }}
        className="
          pointer-events-none
          absolute
          inset-x-[12%]
          inset-y-[9%]
          rounded-[40px]

          bg-[var(--qd-background-muted)]

          opacity-75
        "
      />

      {/* BACKGROUND GRID */}

      <div
        className="
          pointer-events-none
          absolute
          inset-[8%]
          rounded-[36px]

          opacity-[0.2]

          [background-image:linear-gradient(var(--qd-border)_1px,transparent_1px),linear-gradient(90deg,var(--qd-border)_1px,transparent_1px)]
          [background-size:24px_24px]

          [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]
        "
      />

      {/* ==========================================
          BACK DOCUMENT LAYER
      ========================================== */}

      <motion.div
        initial={
          reducedMotion
            ? false
            : {
                opacity: 0,
                y: 45,
                rotate: 0,
              }
        }
        animate={{
          opacity: 1,
          y: 0,
          rotate: -10,
        }}
        transition={{
          duration: reducedMotion ? 0 : 0.8,
          delay: reducedMotion ? 0 : 0.15,
          ease: HERO_EASE,
        }}
        className="
          absolute
          left-[18%]
          top-[12%]

          h-[255px]
          w-[185px]

          rounded-[10px]
          border
          border-[var(--qd-border)]

          bg-[var(--qd-surface)]

          shadow-[0_18px_45px_rgba(7,24,63,0.08)]

          sm:h-[295px]
          sm:w-[215px]
        "
      >
        <div className="space-y-3 p-5 opacity-35">
          <div className="h-4 w-24 rounded bg-[var(--qd-background-muted)]" />
          <div className="h-2 w-16 rounded bg-[var(--qd-background-muted)]" />

          <div className="mt-6 space-y-2">
            <div className="h-2 w-full rounded bg-[var(--qd-background-muted)]" />
            <div className="h-2 w-5/6 rounded bg-[var(--qd-background-muted)]" />
            <div className="h-2 w-4/6 rounded bg-[var(--qd-background-muted)]" />
          </div>
        </div>
      </motion.div>

      {/* ==========================================
          SECOND DOCUMENT LAYER
      ========================================== */}

      <motion.div
        initial={
          reducedMotion
            ? false
            : {
                opacity: 0,
                y: 35,
                rotate: 0,
              }
        }
        animate={{
          opacity: 1,
          y: 0,
          rotate: 8,
        }}
        transition={{
          duration: reducedMotion ? 0 : 0.8,
          delay: reducedMotion ? 0 : 0.25,
          ease: HERO_EASE,
        }}
        className="
          absolute
          right-[15%]
          top-[12%]

          h-[255px]
          w-[185px]

          rounded-[10px]
          border
          border-[var(--qd-border)]

          bg-[var(--qd-surface)]

          shadow-[0_18px_45px_rgba(7,24,63,0.08)]

          sm:h-[295px]
          sm:w-[215px]
        "
      >
        <div className="space-y-3 p-5 opacity-30">
          <div className="h-4 w-20 rounded bg-[var(--qd-background-muted)]" />
          <div className="h-2 w-28 rounded bg-[var(--qd-background-muted)]" />

          <div className="mt-6 space-y-2">
            <div className="h-2 w-full rounded bg-[var(--qd-background-muted)]" />
            <div className="h-2 w-4/5 rounded bg-[var(--qd-background-muted)]" />
            <div className="h-2 w-3/5 rounded bg-[var(--qd-background-muted)]" />
          </div>
        </div>
      </motion.div>

      {/* ==========================================
          MAIN FLOATING RESUME DOCUMENT
      ========================================== */}

      <motion.div
        initial={
          reducedMotion
            ? false
            : {
                opacity: 0,
                y: 55,
                rotate: -4,
                scale: 0.92,
              }
        }
        animate={{
          opacity: 1,
          y: 0,
          rotate: -3,
          scale: 1,
        }}
        transition={{
          duration: reducedMotion ? 0 : 0.9,
          delay: reducedMotion ? 0 : 0.35,
          ease: HERO_EASE,
        }}
        className="
          relative
          z-10
        "
      >
        <motion.div
          animate={
            reducedMotion
              ? undefined
              : {
                  y: [0, -10, 0],
                }
          }
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            relative

            h-[285px]
            w-[205px]

            overflow-hidden

            rounded-[11px]

            border
            border-[#e3e8f1]

            bg-white

            shadow-[0_25px_65px_rgba(7,24,63,0.17),0_6px_18px_rgba(7,24,63,0.07)]

            sm:h-[340px]
            sm:w-[245px]
          "
        >
          {/* DOCUMENT TOP BORDER */}

          <div className="h-[4px] w-full bg-[#061747]" />

          {/* RESUME CONTENT */}

          <div className="p-5 sm:p-6">
            {/* PERSONAL INFORMATION */}

            <motion.div {...entrance(0.65)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3
                    className="
                      text-[13px]
                      font-bold
                      tracking-[-0.045em]
                      text-[#07183f]

                      sm:text-[16px]
                    "
                  >
                    Alex Morgan
                  </h3>

                  <p
                    className="
                      mt-1
                      text-[8px]
                      font-medium
                      tracking-[0.025em]
                      text-[#52617a]

                      sm:text-[9px]
                    "
                  >
                    Senior Product Designer
                  </p>
                </div>

                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center

                    rounded-full

                    bg-[#eaf2ff]

                    text-[10px]
                    font-bold
                    text-[#061747]

                    sm:h-11
                    sm:w-11
                  "
                >
                  AM
                </div>
              </div>

              {/* CONTACT DETAILS */}

              <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1">
                <span className="text-[6px] text-[#8490a5] sm:text-[7px]">
                  alex@example.com
                </span>

                <span className="text-[6px] text-[#8490a5] sm:text-[7px]">
                  London, UK
                </span>
              </div>
            </motion.div>

            {/* DIVIDER */}

            <motion.div
              initial={
                reducedMotion
                  ? false
                  : { scaleX: 0 }
              }
              animate={{ scaleX: 1 }}
              transition={{
                duration: reducedMotion ? 0 : 0.65,
                delay: reducedMotion ? 0 : 0.85,
                ease: HERO_EASE,
              }}
              style={{ transformOrigin: "left" }}
              className="my-3 h-px bg-[#e2eaf5]"
            />

            {/* PROFILE SECTION */}

            <motion.div {...entrance(0.9)}>
              <p
                className="
                  text-[7px]
                  font-bold
                  uppercase
                  tracking-[0.13em]
                  text-[#061747]

                  sm:text-[8px]
                "
              >
                Professional Profile
              </p>

              <div className="mt-2 space-y-1.5">
                <div className="h-[4px] w-full rounded bg-[#e8edf5]" />
                <div className="h-[4px] w-[94%] rounded bg-[#e8edf5]" />
                <div className="h-[4px] w-[76%] rounded bg-[#e8edf5]" />
              </div>
            </motion.div>

            {/* EXPERIENCE */}

            <motion.div
              {...entrance(1.1)}
              className="mt-4"
            >
              <p
                className="
                  text-[7px]
                  font-bold
                  uppercase
                  tracking-[0.13em]
                  text-[#061747]

                  sm:text-[8px]
                "
              >
                Experience
              </p>

              <div className="mt-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[7px] font-semibold text-[#07183f] sm:text-[8px]">
                    Lead Product Designer
                  </p>

                  <span className="text-[6px] text-[#8490a5]">
                    2022–Now
                  </span>
                </div>

                <p className="mt-1 text-[6px] text-[#52617a] sm:text-[7px]">
                  Studio North
                </p>

                <div className="mt-2 space-y-1.5">
                  <div className="h-[4px] w-full rounded bg-[#e8edf5]" />
                  <div className="h-[4px] w-[90%] rounded bg-[#e8edf5]" />
                  <div className="h-[4px] w-[65%] rounded bg-[#e8edf5]" />
                </div>
              </div>
            </motion.div>

            {/* SKILLS */}

            <motion.div
              {...entrance(1.3)}
              className="mt-4"
            >
              <p
                className="
                  text-[7px]
                  font-bold
                  uppercase
                  tracking-[0.13em]
                  text-[#061747]

                  sm:text-[8px]
                "
              >
                Core Skills
              </p>

              <div className="mt-2.5 space-y-2">
                {skills.map((skill, index) => (
                  <div key={skill.name}>
                    <p className="mb-1 text-[6px] text-[#52617a] sm:text-[7px]">
                      {skill.name}
                    </p>

                    <div className="h-[3px] w-full overflow-hidden rounded-full bg-[#e8edf5]">
                      <motion.div
                        initial={
                          reducedMotion
                            ? false
                            : { width: 0 }
                        }
                        animate={{
                          width: skill.width,
                        }}
                        transition={{
                          duration: reducedMotion ? 0 : 1,
                          delay:
                            reducedMotion
                              ? 0
                              : 1.45 + index * 0.12,
                          ease: HERO_EASE,
                        }}
                        className="h-full rounded-full bg-[#061747]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* DOCUMENT FOOTER */}

          <div
            className="
              absolute
              inset-x-5
              bottom-3

              flex
              items-center
              justify-between

              border-t
              border-[#e2eaf5]
              pt-2

              sm:inset-x-6
            "
          >
            <span className="text-[6px] font-semibold tracking-[0.04em] text-[#8490a5]">
              PROFESSIONAL RESUME
            </span>

            <span className="text-[6px] text-[#8490a5]">
              01
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* ==========================================
          FLOATING COMPLETION BADGE
      ========================================== */}

      <motion.div
        initial={
          reducedMotion
            ? false
            : {
                opacity: 0,
                x: 24,
                y: 12,
                scale: 0.8,
              }
        }
        animate={{
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: reducedMotion ? 0 : 0.65,
          delay: reducedMotion ? 0 : 1.2,
          ease: HERO_EASE,
        }}
        className="
          absolute
          bottom-[15%]
          right-[0%]
          z-20

          sm:right-[2%]
        "
      >
        <motion.div
          animate={
            reducedMotion
              ? undefined
              : {
                  y: [0, -5, 0],
                }
          }
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.8,
          }}
          className="
            flex
            items-center
            gap-2.5

            rounded-[12px]

            border
            border-[var(--qd-border)]

            bg-[var(--qd-surface)]

            px-3
            py-2.5

            shadow-[0_12px_35px_rgba(7,24,63,0.12)]

            sm:px-4
            sm:py-3
          "
        >
          <span
            className="
              flex
              h-8
              w-8
              items-center
              justify-center

              rounded-[9px]

              bg-emerald-500/10
              text-emerald-600
            "
          >
            <CheckCircle2
              size={18}
              strokeWidth={1.9}
            />
          </span>

          <div>
            <p className="text-[11px] font-semibold text-[var(--qd-text-primary)]">
              Resume ready
            </p>

            <p className="mt-0.5 text-[9px] text-[var(--qd-text-muted)]">
              Professionally structured
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* ==========================================
          FLOATING TEMPLATE LABEL
      ========================================== */}

      <motion.div
        initial={
          reducedMotion
            ? false
            : {
                opacity: 0,
                x: -20,
                y: 10,
              }
        }
        animate={{
          opacity: 1,
          x: 0,
          y: 0,
        }}
        transition={{
          duration: reducedMotion ? 0 : 0.6,
          delay: reducedMotion ? 0 : 1.05,
          ease: HERO_EASE,
        }}
        className="
          absolute
          left-[1%]
          top-[18%]
          z-20

          sm:left-[2%]
        "
      >
        <div
          className="
            flex
            items-center
            gap-2

            rounded-[10px]

            border
            border-[var(--qd-border)]

            bg-[var(--qd-surface)]

            px-3
            py-2

            shadow-[0_10px_30px_rgba(7,24,63,0.09)]
          "
        >
          <LayoutTemplate
            size={15}
            strokeWidth={1.8}
            className="text-[var(--qd-text-primary)]"
          />

          <span className="text-[10px] font-medium text-[var(--qd-text-primary)]">
            Premium template
          </span>
        </div>
      </motion.div>
    </div>
  );
}

/* ============================================================
   PREMIUM WORKSPACE HERO
============================================================ */

function WorkspaceIntro({
  userName,
  totalCVs = 0,
  completedCVs = 0,
}) {
  const reducedMotion = useReducedMotion();

  const firstName =
    typeof userName === "string"
      ? userName.trim().split(/\s+/)[0]
      : "";

  const hasCVs = totalCVs > 0;

  const description = hasCVs
    ? "Everything you need to create, refine, and manage your professional CVs — beautifully organized in one workspace."
    : "Create a CV that represents your experience with confidence. Choose a professional template, tell your story, and take the next step in your career.";

  const textVariants = {
    hidden: {
      opacity: 0,
      y: 18,
    },

    visible: {
      opacity: 1,
      y: 0,

      transition: {
        duration: 0.65,
        ease: HERO_EASE,
      },
    },
  };

  return (
    <section
      aria-labelledby="workspace-title"
      className="
        relative
        isolate
        w-full
        min-w-0
        overflow-hidden

        rounded-[24px]

        border
        border-[var(--qd-border)]

        bg-[var(--qd-surface)]

        transition-colors
        duration-300
      "
    >
      <div
        className="
          grid
          min-w-0
          grid-cols-1
          items-center

          gap-3

          lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]
          lg:gap-4
        "
      >
        {/* ==========================================
            LEFT — PREMIUM CONTENT
        ========================================== */}

        <motion.div
          initial={
            reducedMotion
              ? false
              : "hidden"
          }
          animate="visible"
          variants={{
            hidden: {},

            visible: {
              transition: {
                staggerChildren: reducedMotion ? 0 : 0.09,
                delayChildren: reducedMotion ? 0 : 0.12,
              },
            },
          }}
          className="
            relative
            z-10

            min-w-0

            px-6
            pb-4
            pt-9

            sm:px-9
            sm:pt-11

            lg:py-12
            lg:pl-11
            lg:pr-3

            xl:py-14
            xl:pl-14
          "
        >
          {/* EYEBROW */}

          <motion.div
            variants={textVariants}
            className="
              mb-5
              inline-flex
              items-center
              gap-2.5
            "
          >
            <span
              className="
                relative
                flex
                h-2
                w-2
                items-center
                justify-center
              "
              aria-hidden="true"
            >
              <span
                className="
                  h-2
                  w-2
                  rounded-full
                  bg-[var(--qd-accent)]
                "
              />
            </span>

            <span
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.15em]

                text-[var(--qd-text-secondary)]
              "
            >
              QORLIQ CV WORKSPACE
            </span>
          </motion.div>

          {/* HEADING */}

          <motion.h1
            id="workspace-title"
            variants={textVariants}
            className="
              max-w-[600px]

              text-[clamp(28px,3vw,43px)]

              font-semibold
              leading-[1.14]

              tracking-[-0.058em]

              text-[var(--qd-text-primary)]
            "
          >
            {firstName ? (
              <>
                Welcome back,
                <br />
                <span className="text-[var(--qd-text-primary)]">
                  {firstName}.
                </span>
              </>
            ) : (
              <>
                Your next opportunity
                <br />
                starts here.
              </>
            )}
          </motion.h1>

          {/* DESCRIPTION */}

          <motion.p
            variants={textVariants}
            className="
              mt-5

              max-w-[490px]

              text-[13px]
              leading-[1.85]

              text-[var(--qd-text-secondary)]

              sm:text-[14px]
            "
          >
            {description}
          </motion.p>

          {/* ACTION BUTTONS */}

          <motion.div
            variants={textVariants}
            className="
              mt-7

              flex
              flex-wrap
              items-center
              gap-3
            "
          >
            {/* CREATE CV */}

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
            >
              <Link
                href="/cv-builder"
                className="
                  group

                  inline-flex
                  min-h-[47px]
                  items-center
                  justify-center
                  gap-2.5

                  rounded-[11px]

                  bg-[var(--qd-primary)]

                  px-5

                  text-[13px]
                  font-semibold

                  transition-colors
                  duration-200

                  hover:bg-[var(--qd-primary-hover)]

                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-[var(--qd-accent)]
                "
                style={{
                  color: "var(--qd-background)",
                }}
              >
                <Plus
                  size={18}
                  strokeWidth={2}
                  style={{
                    color: "inherit",
                  }}
                />

                <span style={{ color: "inherit" }}>
                  Create New CV
                </span>

                <ArrowUpRight
                  size={16}
                  strokeWidth={1.8}
                  className="
                    ml-1
                    transition-transform
                    duration-200
                    group-hover:-translate-y-0.5
                    group-hover:translate-x-0.5
                  "
                  style={{
                    color: "inherit",
                  }}
                />
              </Link>
            </motion.div>

            {/* MY CVS */}

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
            >
              <Link
                href="/dashboard/cvs"
                className="
                  group

                  inline-flex
                  min-h-[47px]
                  items-center
                  justify-center
                  gap-2.5

                  rounded-[11px]

                  border
                  border-[var(--qd-border-strong)]

                  bg-[var(--qd-surface)]

                  px-5

                  text-[13px]
                  font-semibold

                  text-[var(--qd-text-primary)]

                  transition-colors
                  duration-200

                  hover:bg-[var(--qd-background-soft)]

                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-[var(--qd-accent)]
                "
              >
                <FileText
                  size={17}
                  strokeWidth={1.8}
                />

                My CVs

                <ArrowRight
                  size={16}
                  strokeWidth={1.8}
                  className="
                    transition-transform
                    duration-200
                    group-hover:translate-x-1
                  "
                />
              </Link>
            </motion.div>
          </motion.div>

          {/* USER WORKSPACE CONTEXT */}

          {hasCVs && (
            <motion.div
              variants={textVariants}
              className="
                mt-8

                flex
                flex-wrap
                items-center

                gap-x-5
                gap-y-2

                border-t
                border-[var(--qd-border)]

                pt-5
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2

                  text-[11px]
                  text-[var(--qd-text-secondary)]
                "
              >
                <FileText
                  size={15}
                  strokeWidth={1.7}
                />

                <span>
                  <strong className="font-semibold text-[var(--qd-text-primary)]">
                    {totalCVs}
                  </strong>{" "}
                  Saved CVs
                </span>
              </div>

              <span
                className="
                  hidden
                  h-3
                  w-px
                  bg-[var(--qd-border-strong)]
                  sm:block
                "
              />

              <div
                className="
                  flex
                  items-center
                  gap-2

                  text-[11px]
                  text-[var(--qd-text-secondary)]
                "
              >
                <CheckCircle2
                  size={15}
                  strokeWidth={1.7}
                />

                <span>
                  <strong className="font-semibold text-[var(--qd-text-primary)]">
                    {completedCVs}
                  </strong>{" "}
                  Completed
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* ==========================================
            RIGHT — ANIMATED RESUME COMPOSITION
        ========================================== */}

        <div
          className="
            relative
            min-w-0

            px-4
            pb-5

            sm:px-6
            sm:pb-8

            lg:h-full
            lg:px-5
            lg:py-5
          "
        >
          <AnimatedResumePreview />
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   UNAUTHENTICATED STATE
============================================================ */

function LoginRequired() {
  return (
    <section
      className={`
        ${styles.panel}
        flex
        min-h-[340px]
        flex-col
        items-center
        justify-center
        px-6
        py-12
        text-center
      `}
    >
      <div
        className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-xl
          bg-[var(--qd-background-soft)]
          text-[var(--qd-text-primary)]
        "
      >
        <FileText size={22} />
      </div>

      <h1
        className="
          mt-5
          text-xl
          font-semibold
          tracking-tight
          text-[var(--qd-text-primary)]
        "
      >
        Please log in
      </h1>

      <p
        className="
          mt-2
          text-[13px]
          text-[var(--qd-text-secondary)]
        "
      >
        Log in to view your dashboard.
      </p>

      <div className="mt-6">
        <PrimaryAction href="/login">
          Log in
        </PrimaryAction>
      </div>
    </section>
  );
}

/* ============================================================
   MAIN CUSTOMER DASHBOARD
============================================================ */

export default function DashboardPage() {
  const { data: session, status } = useSession();

  const reducedMotion = useReducedMotion();

  const [state, setState] = useState(emptyState);

  const [reloadKey, setReloadKey] = useState(0);

  /* ========================================================
     AUTHENTICATED USER
  ======================================================== */

  const accountKey =
    status === "authenticated"
      ? String(
          session?.user?.id ||
            session?.user?.email ||
            ""
        )
      : "";

  /* ========================================================
     ORIGINAL API INTEGRATIONS — PRESERVED
  ======================================================== */

  useEffect(() => {
    const controller = new AbortController();

    let active = true;
    let timedOut = false;

    if (
      status !== "authenticated" ||
      !accountKey
    ) {
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
        fetchData(
          "/api/cv",
          controller.signal
        ).then((data) => {
          if (!Array.isArray(data.cvs)) {
            throw new Error(
              "Invalid CV response."
            );
          }

          return data.cvs
            .filter(
              (cv) =>
                cv &&
                (cv._id || cv.id)
            )
            .map(normalizeCV);
        }),

        fetchData(
          "/api/downloads",
          controller.signal
        ).then((data) => {
          if (!Array.isArray(data.downloads)) {
            throw new Error(
              "Invalid downloads response."
            );
          }

          return data.downloads.filter(
            (record) =>
              record &&
              typeof record === "object"
          );
        }),

        fetchData(
          "/api/user/access",
          controller.signal
        ).then((data) => {
          const access =
            data.access ?? data;

          if (
            !access ||
            typeof access !== "object"
          ) {
            throw new Error(
              "Invalid access response."
            );
          }

          return access;
        }),
      ]);

      clearTimeout(timeout);

      if (!active) return;

      const [
        cvResult,
        downloadResult,
        accessResult,
      ] = results;

      const errors = {};

      for (const [key, result] of [
        ["cvs", cvResult],
        ["downloads", downloadResult],
        ["access", accessResult],
      ]) {
        if (result.status === "rejected") {
          errors[key] = timedOut
            ? "Request timed out. Please retry."
            : result.reason?.message ||
              "Could not load data.";
        }
      }

      setState({
        owner: accountKey,
        loading: false,

        cvs:
          cvResult.status === "fulfilled"
            ? cvResult.value
            : [],

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
  }, [
    accountKey,
    status,
    reloadKey,
  ]);

  /* ========================================================
     ORIGINAL ACCOUNT DATA ISOLATION
  ======================================================== */

  const ownsData =
    Boolean(accountKey) &&
    state.owner === accountKey;

  const loading =
    status === "loading" ||
    (status === "authenticated" &&
      (!ownsData || state.loading));

  const cvs = ownsData
    ? state.cvs
    : [];

  const downloads = ownsData
    ? state.downloads
    : [];

  const access = ownsData
    ? state.access
    : null;

  const errors = ownsData
    ? state.errors
    : {};

  /* ========================================================
     ORIGINAL STATISTICS
  ======================================================== */

  const completedCVs = cvs.filter(
    (cv) => cv.status === "completed"
  ).length;

  const successfulDownloads =
    downloads.filter((record) =>
      ["completed", "successful"].includes(
        String(
          record.status || ""
        ).toLowerCase()
      )
    ).length;

  const completionRate = cvs.length
    ? Math.round(
        (completedCVs / cvs.length) * 100
      )
    : 0;

  const downloadSuccessRate =
    downloads.length
      ? Math.round(
          (successfulDownloads /
            downloads.length) *
            100
        )
      : 0;

  /* ========================================================
     RECENT DOCUMENTS
  ======================================================== */

  const recentCVs = useMemo(
    () =>
      [...cvs]
        .sort(
          (a, b) =>
            timestamp(b.updatedAt) -
            timestamp(a.updatedAt)
        )
        .slice(0, 3),
    [cvs]
  );

  const retry = () => {
    setReloadKey((value) => value + 1);
  };

  const userName =
    session?.user?.name || "";

  /* ========================================================
     AUTHENTICATION STATE
  ======================================================== */

  if (status === "unauthenticated") {
    return <LoginRequired />;
  }

  /* ========================================================
     MAIN PAGE
  ======================================================== */

  return (
    <main
      className="
        dashboard-scrollbar
        h-full
        w-full
        min-w-0
        overflow-x-hidden
        overflow-y-auto
        pb-8
        text-[var(--qd-text-primary)]
      "
    >
      <div
        className="
          mx-auto
          flex
          w-full
          max-w-[1440px]
          flex-col
          gap-8
          pr-1
          sm:gap-9
          sm:pr-2
          lg:gap-10
        "
      >
        {/* ===============================================
            WORKSPACE INTRODUCTION
        =============================================== */}

        <WorkspaceIntro userName={userName} />

        {/* ===============================================
            UNIFIED DASHBOARD STATISTICS
        =============================================== */}

        <motion.div
          initial={
            reducedMotion
              ? false
              : ENTER
          }
          animate={VISIBLE}
          transition={{
            duration: reducedMotion ? 0 : 0.5,
            delay: reducedMotion ? 0 : 0.08,
            ease: EASE,
          }}
        >
          <DashboardOverview
            loading={loading}
            cvs={cvs}
            downloads={downloads}
            completedCVs={completedCVs}
            successfulDownloads={
              successfulDownloads
            }
            completionRate={completionRate}
            downloadSuccessRate={
              downloadSuccessRate
            }
            errors={errors}
          />
        </motion.div>

        {/* ===============================================
            DOCUMENT WORKSPACE
        =============================================== */}

        <section
          aria-labelledby="documents-heading"
          className="min-w-0"
        >
          <SectionIntro
            eyebrow="Workspace"
            title="Your documents"
            description="Continue working on your recent CVs or manage your account."
          />

          <div
            className="
              mt-4
              grid
              min-w-0
              items-start
              gap-5
              xl:grid-cols-[minmax(0,1.75fr)_minmax(280px,1fr)]
            "
          >
            {/* LEFT: RECENT CVS */}

            <motion.div
              initial={
                reducedMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 16,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: reducedMotion ? 0 : 0.5,
                delay: reducedMotion ? 0 : 0.16,
                ease: EASE,
              }}
              className="min-w-0"
            >
              <RecentCVsPanel
                recentCVs={recentCVs}
                loading={loading}
                error={errors.cvs}
                onRetry={retry}
              />
            </motion.div>

            {/* RIGHT: SUBSCRIPTION */}

            <motion.div
              initial={
                reducedMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 16,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: reducedMotion ? 0 : 0.5,
                delay: reducedMotion ? 0 : 0.23,
                ease: EASE,
              }}
              className="min-w-0"
            >
              <SubscriptionPanel
                access={access}
                loading={loading}
                error={errors.access}
                onRetry={retry}
              />
            </motion.div>
          </div>
        </section>

        {/* ===============================================
            EXISTING RECENT ACTIVITY COMPONENT
        =============================================== */}

        {status === "authenticated" && (
          <motion.section
            aria-label="Recent account activity"
            initial={
              reducedMotion
                ? false
                : {
                    opacity: 0,
                    y: 15,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: reducedMotion ? 0 : 0.5,
              delay: reducedMotion ? 0 : 0.28,
              ease: EASE,
            }}
            className="min-w-0"
          >
            <RecentActivity
              key={`${accountKey}-${reloadKey}`}
              limit={6}
            />
          </motion.section>
        )}
      </div>
    </main>
  );
}