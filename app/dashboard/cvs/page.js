"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import {
  FileText,
  Plus,
  Search,
  SlidersHorizontal,
  Eye,
  Pencil,
  Download,
  CalendarDays,
  LayoutTemplate,
  CheckCircle2,
  Clock3,
  AlertCircle,
  ChevronDown,
  WifiOff,
  RefreshCw,
  Trash2,
  Loader2,
  X,
  AlertTriangle,
  MoreVertical,
} from "lucide-react";

import DownloadPDF from "@/app/cv-builder/success/DownloadPDF";
import { DownloadProvider } from "@/app/cv-builder/success/DownloadPDF";
import { DownloadWord } from "@/app/cv-builder/success/DownloadPDF";
/* =========================================================
   CONFIGURATION
========================================================= */

const CVS_API = "/api/cv";

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

function normalizeCV(cv) {
  if (
    !cv ||
    typeof cv !== "object" ||
    !(cv._id || cv.id)
  ) {
    throw new Error("Invalid CV record");
  }

  return {
    ...cv,

    id: String(cv._id || cv.id),

    title:
      firstText(
        cv.title,
        cv.jobTitle,
        cv.personalInfo?.jobTitle
      ) || "Untitled CV",

    template:
      firstText(
        cv.templateName,
        cv.template?.name,
        cv.template
      ) || "Not selected",

    status: (
      firstText(cv.status) || "draft"
    ).toLowerCase(),

    completion:
      typeof cv.completion === "number" &&
      Number.isFinite(cv.completion)
        ? Math.min(
            100,
            Math.max(0, cv.completion)
          )
        : null,

    downloads:
      typeof cv.downloads === "number"
        ? cv.downloads
        : "—",

    createdAt: formatDate(cv.createdAt),

    updatedAt: formatDate(cv.updatedAt),
  };
}

/* =========================================================
   MAIN PAGE WITH DOWNLOAD PROVIDER
========================================================= */

export default function MyCVsPage() {
  return (
    <DownloadProvider>
      <MyCVsContent />
    </DownloadProvider>
  );
}

/* =========================================================
   MAIN CONTENT
========================================================= */

function MyCVsContent() {
  const [cvs, setCVs] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [deletingId, setDeletingId] =
    useState(null);

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const [notification, setNotification] =
    useState(null);

  const activeRequest = useRef(null);

  const deleteInProgress = useRef(false);

  const deletedIds = useRef(new Set());

  /* =========================================================
     NOTIFICATION
  ========================================================= */

  const showNotification = useCallback(
    (message, tone = "success") => {
      setNotification({
        id: Date.now(),
        message,
        tone,
      });
    },
    []
  );

  /* =========================================================
     FETCH USER CVS
  ========================================================= */

  const fetchCVs = useCallback(async () => {
    activeRequest.current?.abort();

    const controller = new AbortController();

    activeRequest.current = controller;

    setLoading(true);
    setError(null);

    let timedOut = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 15000);

    try {
      if (!navigator.onLine) {
        setError({
          type: "network",
          message:
            "Could not reach internet. Check your connection and reload.",
        });

        return;
      }

      let response;

      try {
        response = await fetch(CVS_API, {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal,
        });
      } catch (fetchError) {
        if (controller.signal.aborted) {
          throw fetchError;
        }

        if (
          activeRequest.current !== controller
        ) {
          return;
        }

        setError({
          type: "network",
          message:
            "Could not reach internet or the server. Check your connection and reload.",
        });

        return;
      }

      if (
        activeRequest.current !== controller
      ) {
        return;
      }

      if (!response.ok) {
        setError({
          type:
            response.status === 401
              ? "auth"
              : "server",

          message:
            response.status === 401
              ? "Please log in to view your CVs."
              : "Could not load your CVs. Please try again.",
        });

        return;
      }

      const data = await response.json();

      if (
        activeRequest.current !== controller
      ) {
        return;
      }

      if (
        data.success === false ||
        !Array.isArray(data.cvs)
      ) {
        throw new Error(
          "Invalid CV response"
        );
      }

      const normalizedCVs = data.cvs
        .map(normalizeCV)
        .filter(
          (cv) =>
            !deletedIds.current.has(cv.id)
        );

      setCVs(normalizedCVs);
    } catch {
      if (
        activeRequest.current !== controller
      ) {
        return;
      }

      if (
        controller.signal.aborted &&
        !timedOut
      ) {
        return;
      }

      setError({
        type: "server",

        message: timedOut
          ? "The request took too long. Check your connection and try again."
          : "Could not load your CVs. Please try again.",
      });
    } finally {
      clearTimeout(timeout);

      if (
        activeRequest.current === controller
      ) {
        activeRequest.current = null;
        setLoading(false);
      }
    }
  }, []);

  /* =========================================================
     NETWORK STATUS
  ========================================================= */

  useEffect(() => {
    const handleOffline = () => {
      activeRequest.current?.abort();

      activeRequest.current = null;

      setLoading(false);

      setError({
        type: "network",

        message:
          "Could not reach internet. Check your connection and reload.",
      });
    };

    const handleOnline = () => {
      void fetchCVs();
    };

    void fetchCVs();

    window.addEventListener(
      "online",
      handleOnline
    );

    window.addEventListener(
      "offline",
      handleOffline
    );

    return () => {
      window.removeEventListener(
        "online",
        handleOnline
      );

      window.removeEventListener(
        "offline",
        handleOffline
      );

      activeRequest.current?.abort();

      activeRequest.current = null;
    };
  }, [fetchCVs]);

  /* =========================================================
     DELETE CV
  ========================================================= */

  const handleDeleteCV = (cv) => {
    if (deleteInProgress.current) {
      return;
    }

    setDeleteTarget(cv);
  };

  const confirmDeleteCV = async () => {
    if (
      !deleteTarget ||
      deleteInProgress.current
    ) {
      return;
    }

    const cv = deleteTarget;

    deleteInProgress.current = true;

    setDeletingId(cv.id);

    try {
      const response = await fetch(
        CVS_API,
        {
          method: "DELETE",

          credentials: "same-origin",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            cvId: cv.id,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (
        !response.ok ||
        data?.success !== true
      ) {
        throw new Error(
          data?.message ||
            "Unable to delete CV."
        );
      }

      // Prevent stale GET results from
      // restoring the deleted CV.

      deletedIds.current.add(cv.id);

      activeRequest.current?.abort();

      activeRequest.current = null;

      setLoading(false);

      setCVs((previous) =>
        previous.filter(
          (item) => item.id !== cv.id
        )
      );

      setDeleteTarget(null);

      showNotification(
        "Your CV has been deleted successfully.",
        "success"
      );
    } catch (error) {
      showNotification(
        error.message ||
          "Unable to delete CV.",
        "error"
      );
    } finally {
      deleteInProgress.current = false;

      setDeletingId(null);
    }
  };

  /* =========================================================
     FILTER CVS
  ========================================================= */

  const filteredCVs = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return cvs.filter((cv) => {
      const matchesSearch =
        cv.title
          .toLowerCase()
          .includes(search) ||
        cv.template
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        cv.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    cvs,
    searchTerm,
    statusFilter,
  ]);

  /* =========================================================
     PAGE UI
  ========================================================= */

  return (
    <div className="w-full min-w-0 space-y-6 lg:space-y-8">

      {/* ================================================
          PAGE HEADER
      ================================================= */}

      <section className="overflow-hidden rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">

        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

          <div>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-qorliqGold/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-qorliqGoldDark">

              <FileText size={15} />

              CV Workspace

            </div>

            <h1 className="text-3xl font-black text-qorliqDark sm:text-4xl">
              My CVs
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/50 sm:text-base">
              Manage, edit, preview and download
              your professional CVs from one
              place.
            </p>

          </div>

          <Link
            href="/cv-builder"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-qorliqGold px-5 py-3 text-sm font-bold text-qorliqDark shadow-gold transition hover:bg-qorliqGoldDark hover:text-white"
          >

            <Plus size={19} />

            Create New CV

          </Link>

        </div>

      </section>

      {/* ================================================
          SEARCH AND FILTER
      ================================================= */}

      <section className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          {/* Search */}

          <div className="relative w-full lg:max-w-md">

            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/35"
            />

            <input
              type="search"

              aria-label="Search your CVs"

              value={searchTerm}

              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }

              placeholder="Search by CV name or template..."

              disabled={
                loading ||
                Boolean(error)
              }

              className="h-12 w-full rounded-xl border border-black/10 bg-qorliqIvory pl-11 pr-4 text-sm text-qorliqDark outline-none transition placeholder:text-black/35 focus:border-qorliqGold focus:ring-4 focus:ring-qorliqGold/10 disabled:opacity-50"
            />

          </div>

          {/* Status Filter */}

          <div className="relative">

            <SlidersHorizontal
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/40"
            />

            <select
              aria-label="Filter CVs by status"

              value={statusFilter}

              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }

              disabled={
                loading ||
                Boolean(error)
              }

              className="h-12 w-full min-w-[190px] appearance-none rounded-xl border border-black/10 bg-white pl-11 pr-10 text-sm font-medium text-qorliqDark outline-none transition focus:border-qorliqGold focus:ring-4 focus:ring-qorliqGold/10 disabled:opacity-50"
            >

              <option value="all">
                All CVs
              </option>

              <option value="completed">
                Completed
              </option>

              <option value="draft">
                Draft
              </option>

              <option value="incomplete">
                Incomplete
              </option>

            </select>

            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/40"
            />

          </div>

        </div>

      </section>

      {/* ================================================
          CV CONTENT
      ================================================= */}

      {loading ? (

        <CVSkeleton />

      ) : error ? (

        <CVError
          error={error}
          onRetry={fetchCVs}
        />

      ) : filteredCVs.length > 0 ? (

        <section className="grid gap-5 xl:grid-cols-2">

          {filteredCVs.map((cv) => (

            <CVCard
              key={cv.id}

              cv={cv}

              onDelete={handleDeleteCV}

              deleting={
                deletingId === cv.id
              }

              deleteDisabled={
                deletingId !== null
              }
            />

          ))}

        </section>

      ) : (

        <EmptyState
          searchTerm={searchTerm}

          statusFilter={statusFilter}

          onReset={() => {
            setSearchTerm("");

            setStatusFilter("all");
          }}
        />

      )}

      {/* ================================================
          DELETE CONFIRMATION MODAL
      ================================================= */}

      {deleteTarget && (

        <DeleteConfirmationModal
          cv={deleteTarget}

          deleting={
            deletingId ===
            deleteTarget.id
          }

          onCancel={() => {
            if (
              !deleteInProgress.current
            ) {
              setDeleteTarget(null);
            }
          }}

          onConfirm={confirmDeleteCV}
        />

      )}

      {/* ================================================
          NOTIFICATION
      ================================================= */}

      {notification && (

        <CVNotification
          key={notification.id}

          notification={notification}

          onDismiss={() =>
            setNotification(null)
          }
        />

      )}

    </div>
  );
}

/* =========================================================
   CV CARD
========================================================= */

function CVCard({
  cv,
  onDelete,
  deleting,
  deleteDisabled,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const status = getStatusConfig(cv.status);
  const StatusIcon = status.icon;

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  return (
    <article className="relative min-w-0 rounded-3xl border border-black/5 bg-white p-4 shadow-sm transition hover:border-qorliqGold/30 hover:shadow-luxury sm:p-6">

      {/* HEADER */}

      <div className="flex min-w-0 items-start gap-3 sm:gap-4">

        {/* CV ICON */}

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-qorliqGold/10 text-qorliqGoldDark sm:h-14 sm:w-14">
          <FileText size={25} />
        </div>

        {/* CV DETAILS */}

        <div className="min-w-0 flex-1">

          <h2 className="truncate pr-1 text-base font-bold text-qorliqDark sm:text-lg">
            {cv.title}
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-2">

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:text-xs ${status.className}`}
            >
              <StatusIcon size={13} />
              {status.label}
            </span>

            {cv.completion !== null && (
              <span className="text-xs text-black/40">
                {cv.completion}% complete
              </span>
            )}

          </div>

        </div>

        {/* THREE-DOT MENU */}

        <div ref={menuRef} className="relative shrink-0">

          <button
            type="button"
            onClick={() => setMenuOpen((previous) => !previous)}
            disabled={deleting || deleteDisabled}
            aria-label={`More options for ${cv.title}`}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            title="More options"
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-qorliqGold disabled:cursor-not-allowed disabled:opacity-50 ${
              menuOpen
                ? "border-qorliqGold/30 bg-qorliqGold/10 text-qorliqGoldDark"
                : "border-transparent bg-black/[0.03] text-black/50 hover:bg-qorliqCream hover:text-qorliqDark"
            }`}
          >
            <MoreVertical size={19} />
          </button>

          {/* DROPDOWN */}

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-30 mt-2 w-44 overflow-hidden rounded-2xl border border-black/10 bg-white p-1.5 shadow-xl"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(cv);
                }}
                disabled={deleting || deleteDisabled}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Trash2 size={17} />
                )}

                Delete CV
              </button>
            </div>
          )}

        </div>

      </div>

      {/* COMPLETION PROGRESS */}

      {cv.completion !== null && (
        <div
          role="progressbar"
          aria-label="CV completion"
          aria-valuenow={cv.completion}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-5 h-2 overflow-hidden rounded-full bg-black/5 sm:mt-6"
        >
          <div
            className="h-full rounded-full bg-qorliqGold transition-all duration-500"
            style={{ width: `${cv.completion}%` }}
          />
        </div>
      )}

      {/* CV INFORMATION */}

      <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3">

        <InfoItem
          icon={<LayoutTemplate size={16} />}
          label="Template"
          value={cv.template}
        />

        <InfoItem
          icon={<CalendarDays size={16} />}
          label="Last updated"
          value={cv.updatedAt}
        />

        <InfoItem
          icon={<Clock3 size={16} />}
          label="Created"
          value={cv.createdAt}
        />

      </div>

      {/* ACTION BUTTONS */}

      <div className="mt-5 grid grid-cols-3 gap-2 sm:mt-6 sm:grid-cols-[1fr_1fr_auto] sm:gap-3">

        {/* PREVIEW */}

        <Link
          href={`/cv-builder/preview/${encodeURIComponent(cv.id)}`}
          aria-label={`Preview ${cv.title}`}
          title="Preview CV"
          className="inline-flex h-11 min-w-0 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white text-qorliqDark transition hover:border-qorliqGold hover:bg-qorliqCream sm:px-4 sm:text-sm sm:font-semibold"
        >
          <Eye size={18} className="shrink-0" />

          <span className="hidden sm:inline">
            Preview
          </span>
        </Link>

        {/* EDIT */}

        <Link
          href={`/cv-builder?cvId=${encodeURIComponent(cv.id)}`}
          aria-label={`Edit ${cv.title}`}
          title="Edit CV"
          className="inline-flex h-11 min-w-0 items-center justify-center gap-2 rounded-xl bg-qorliqGold text-qorliqDark transition hover:bg-qorliqGoldDark hover:text-white sm:px-4 sm:text-sm sm:font-bold"
        >
          <Pencil size={18} className="shrink-0" />

          <span className="hidden sm:inline">
            Edit CV
          </span>
        </Link>

        {/* DOWNLOAD PDF - ICON ONLY */}

        <DownloadPDF
          cvId={cv.id}
          title="Download PDF"
          aria-label={`Download ${cv.title} as PDF`}
          className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-qorliqGold/30 bg-qorliqGold/10 text-qorliqGoldDark transition hover:border-qorliqGold hover:bg-qorliqGold hover:text-qorliqDark disabled:cursor-not-allowed disabled:opacity-50 sm:w-11"
        >
          <Download size={19} aria-hidden="true" />
        </DownloadPDF>

      </div>

    </article>
  );
}

/* =========================================================
   CV INFO ITEM
========================================================= */

function InfoItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="min-w-0 rounded-2xl bg-qorliqCream/70 p-3.5">

      <div className="flex items-center gap-2 text-xs text-black/40">

        <span className="text-qorliqGoldDark">

          {icon}

        </span>

        {label}

      </div>

      <p className="mt-1.5 truncate text-sm font-semibold text-qorliqDark">

        {value}

      </p>

    </div>
  );
}

/* =========================================================
   DELETE CONFIRMATION MODAL
========================================================= */

function DeleteConfirmationModal({
  cv,
  deleting,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    const handleEscape = (event) => {
      if (
        event.key === "Escape" &&
        !deleting
      ) {
        onCancel();
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
  }, [
    deleting,
    onCancel,
  ]);

  return (
    <div
      role="presentation"

      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !deleting
        ) {
          onCancel();
        }
      }}

      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >

      <div
        role="alertdialog"

        aria-modal="true"

        aria-labelledby="delete-cv-title"

        aria-describedby="delete-cv-description"

        className="w-full max-w-md overflow-hidden rounded-3xl border border-black/5 bg-white p-6 shadow-2xl sm:p-8"
      >

        {/* Header */}

        <div className="flex items-start justify-between">

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">

            <AlertTriangle size={30} />

          </div>

          <button
            type="button"

            onClick={onCancel}

            disabled={deleting}

            aria-label="Close confirmation"

            className="flex h-9 w-9 items-center justify-center rounded-xl text-black/40 transition hover:bg-black/5 hover:text-black disabled:opacity-50"
          >

            <X size={20} />

          </button>

        </div>

        {/* Content */}

        <h2
          id="delete-cv-title"

          className="mt-6 text-2xl font-black text-qorliqDark"
        >

          Delete CV?

        </h2>

        <p
          id="delete-cv-description"

          className="mt-3 text-sm leading-6 text-black/55"
        >

          Are you sure you want to delete

          {" "}

          <span className="font-bold text-qorliqDark">

            {cv.title}

          </span>

          ? This action cannot be undone.

        </p>

        {/* Actions */}

        <div className="mt-8 grid grid-cols-2 gap-3">

          <button
            type="button"

            onClick={onCancel}

            disabled={deleting}

            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-black/10 bg-white px-4 text-sm font-bold text-qorliqDark transition hover:bg-black/5 disabled:opacity-50"
          >

            Cancel

          </button>

          <button
            type="button"

            onClick={onConfirm}

            disabled={deleting}

            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {deleting ? (

              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />

                Deleting...
              </>

            ) : (

              <>
                <Trash2 size={17} />

                Delete CV
              </>

            )}

          </button>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   NOTIFICATION
========================================================= */

function CVNotification({
  notification,
  onDismiss,
}) {
  const [closing, setClosing] =
    useState(false);

  useEffect(() => {
    if (
      notification.tone !== "success"
    ) {
      return;
    }

    const timer = setTimeout(() => {
      setClosing(true);
    }, 4500);

    return () => {
      clearTimeout(timer);
    };
  }, [
    notification.id,
    notification.tone,
  ]);

  useEffect(() => {
    if (!closing) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [
    closing,
    onDismiss,
  ]);

  const isSuccess =
    notification.tone === "success";

  const Icon = isSuccess
    ? CheckCircle2
    : AlertCircle;

  return (
    <div
      role={
        isSuccess
          ? "status"
          : "alert"
      }

      aria-live={
        isSuccess
          ? "polite"
          : "assertive"
      }

      className={`fixed bottom-5 left-1/2 z-[110] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 transition-all duration-300 sm:bottom-auto sm:left-auto sm:right-6 sm:top-6 sm:translate-x-0 ${
        closing
          ? "translate-y-4 opacity-0"
          : "translate-y-0 opacity-100"
      }`}
    >

      <div className="flex items-start gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-2xl">

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            isSuccess
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >

          <Icon size={21} />

        </div>

        <div className="min-w-0 flex-1">

          <h3 className="text-sm font-bold text-qorliqDark">

            {isSuccess
              ? "Success"
              : "Something went wrong"}

          </h3>

          <p className="mt-1 break-words text-xs leading-5 text-black/55">

            {notification.message}

          </p>

        </div>

        <button
          type="button"

          aria-label="Dismiss notification"

          onClick={() =>
            setClosing(true)
          }

          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-black/40 transition hover:bg-black/5 hover:text-black"
        >

          <X size={17} />

        </button>

      </div>

    </div>
  );
}

/* =========================================================
   LOADING SKELETON
========================================================= */

function CVSkeleton() {
  return (
    <section
      role="status"

      aria-label="Loading your CVs"

      aria-busy="true"

      className="grid gap-5 xl:grid-cols-2"
    >

      <span className="sr-only">
        Loading your CVs...
      </span>

      {Array.from(
        { length: 4 },
        (_, index) => (

          <div
            key={index}

            aria-hidden="true"

            className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-6"
          >

            <div className="motion-safe:animate-pulse">

              {/* Header */}

              <div className="flex items-center gap-4">

                <div className="h-14 w-14 shrink-0 rounded-2xl bg-black/10" />

                <div className="flex-1 space-y-3">

                  <div className="h-5 w-3/4 rounded bg-black/10" />

                  <div className="h-4 w-1/2 rounded bg-black/5" />

                </div>

              </div>

              {/* Progress */}

              <div className="mt-6 h-2 rounded-full bg-black/5" />

              {/* Information */}

              <div className="mt-6 grid grid-cols-2 gap-3">

                {[0, 1, 2].map(
                  (item) => (

                    <div
                      key={item}

                      className="h-20 rounded-2xl bg-black/5"
                    />

                  )
                )}

              </div>

              {/* Preview / Edit */}

              <div className="mt-6 flex gap-3">

                <div className="h-11 flex-1 rounded-xl bg-black/10" />

                <div className="h-11 flex-1 rounded-xl bg-black/10" />

                <div className="h-11 w-11 rounded-xl bg-black/5" />

              </div>

              {/* Download Buttons */}

              <div className="mt-3 flex gap-3">

                <div className="h-11 flex-1 rounded-xl bg-black/5" />

                <div className="h-11 flex-1 rounded-xl bg-black/5" />

              </div>

            </div>

          </div>

        )
      )}

    </section>
  );
}

/* =========================================================
   ERROR STATE
========================================================= */

function CVError({
  error,
  onRetry,
}) {
  const isNetworkError =
    error.type === "network";

  const isAuthError =
    error.type === "auth";

  const Icon = isNetworkError
    ? WifiOff
    : AlertCircle;

  return (
    <section
      role="alert"

      className="rounded-3xl border border-red-100 bg-white px-6 py-16 text-center shadow-sm"
    >

      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-600">

        <Icon
          size={36}
          aria-hidden="true"
        />

      </div>

      <h2 className="mt-6 text-2xl font-bold text-red-600">

        {isNetworkError
          ? "Could not reach internet"
          : isAuthError
            ? "Please log in"
            : "Could not load CVs"}

      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-red-600">

        {error.message}

      </p>

      {isAuthError ? (

        <Link
          href="/login"

          className="mt-7 inline-flex items-center justify-center rounded-xl bg-qorliqGold px-5 py-3 text-sm font-bold text-qorliqDark transition hover:bg-qorliqGoldDark hover:text-white"
        >

          Log in

        </Link>

      ) : (

        <button
          type="button"

          onClick={onRetry}

          className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600"
        >

          <RefreshCw
            size={18}
            aria-hidden="true"
          />

          Reload

        </button>

      )}

    </section>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  searchTerm,
  statusFilter,
  onReset,
}) {
  const isFiltered =
    searchTerm.trim() !== "" ||
    statusFilter !== "all";

  return (
    <section className="rounded-3xl border border-dashed border-black/15 bg-white px-6 py-16 text-center shadow-sm">

      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-qorliqGold/10 text-qorliqGoldDark">

        <FileText size={36} />

      </div>

      <h2 className="mt-6 text-2xl font-black text-qorliqDark">

        {isFiltered
          ? "No matching CVs found"
          : "No CVs created yet"}

      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/50">

        {isFiltered
          ? "Try changing your search text or status filter."
          : "Create your first professional CV using one of our ATS-friendly templates."}

      </p>

      {isFiltered ? (

        <button
          type="button"

          onClick={onReset}

          className="mt-7 inline-flex items-center justify-center rounded-xl bg-qorliqGold px-5 py-3 text-sm font-bold text-qorliqDark transition hover:bg-qorliqGoldDark hover:text-white"
        >

          Reset Filters

        </button>

      ) : (

        <Link
          href="/cv-builder"

          className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-qorliqGold px-5 py-3 text-sm font-bold text-qorliqDark transition hover:bg-qorliqGoldDark hover:text-white"
        >

          <Plus size={18} />

          Create New CV

        </Link>

      )}

    </section>
  );
}

/* =========================================================
   STATUS CONFIGURATION
========================================================= */

function getStatusConfig(status) {
  const statusMap = {
    completed: {
      label: "Completed",

      icon: CheckCircle2,

      className:
        "bg-emerald-50 text-emerald-700",
    },

    draft: {
      label: "Draft",

      icon: Clock3,

      className:
        "bg-amber-50 text-amber-700",
    },

    incomplete: {
      label: "Incomplete",

      icon: AlertCircle,

      className:
        "bg-red-50 text-red-700",
    },
  };

  return (
    statusMap[status] ||
    statusMap.draft
  );
}