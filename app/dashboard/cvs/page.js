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
} from "lucide-react";

const CVS_API = "/api/cv";

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
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

function normalizeCV(cv) {
  if (!cv || typeof cv !== "object" || !(cv._id || cv.id)) {
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
    status: firstText(cv.status) || "draft",
    completion:
      typeof cv.completion === "number" &&
      Number.isFinite(cv.completion)
        ? Math.min(100, Math.max(0, cv.completion))
        : null,
    downloads:
      typeof cv.downloads === "number" ? cv.downloads : "—",
    createdAt: formatDate(cv.createdAt),
    updatedAt: formatDate(cv.updatedAt),
  };
}

export default function MyCVsPage() {
  const [cvs, setCVs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const activeRequest = useRef(null);
  const [deletingId, setDeletingId] = useState(null);
const deleteInProgress = useRef(false);

const handleDeleteCV = async (cv) => {
  if (deleteInProgress.current) return;

  const confirmed = window.confirm(
    `Delete "${cv.title}"? This cannot be undone.`
  );

  if (!confirmed) return;

  deleteInProgress.current = true;
  setDeletingId(cv.id);

  try {
  const response = await fetch("/api/cv", {
  method: "DELETE",
  credentials: "same-origin",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    cvId: cv.id,
  }),
});

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.success !== true) {
      throw new Error(data?.message || "Unable to delete CV.");
    }

    // Prevent an older GET response from restoring the deleted card.
    activeRequest.current?.abort();
    activeRequest.current = null;
    setLoading(false);

    setCVs((previous) =>
      previous.filter((item) => item.id !== cv.id)
    );
  } catch (error) {
    alert(error.message || "Unable to delete CV.");
  } finally {
    deleteInProgress.current = false;
    setDeletingId(null);
  }
};

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
        if (controller.signal.aborted) throw fetchError;
        if (activeRequest.current !== controller) return;

        setError({
          type: "network",
          message:
            "Could not reach internet or the server. Check your connection and reload.",
        });
        return;
      }

      if (activeRequest.current !== controller) return;

      if (!response.ok) {
        setError({
          type: response.status === 401 ? "auth" : "server",
          message:
            response.status === 401
              ? "Please log in to view your CVs."
              : "Could not load your CVs. Please try again.",
        });
        return;
      }

      const data = await response.json();

      if (activeRequest.current !== controller) return;

      if (data.success === false || !Array.isArray(data.cvs)) {
        throw new Error("Invalid CV response");
      }

      setCVs(data.cvs.map(normalizeCV));
    } catch {
      if (activeRequest.current !== controller) return;

      if (controller.signal.aborted && !timedOut) return;

      setError({
        type: "server",
        message: timedOut
          ? "The request took too long. Check your connection and try again."
          : "Could not load your CVs. Please try again.",
      });
    } finally {
      clearTimeout(timeout);

      if (activeRequest.current === controller) {
        activeRequest.current = null;
        setLoading(false);
      }
    }
  }, []);

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

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);

      activeRequest.current?.abort();
      activeRequest.current = null;
    };
  }, [fetchCVs]);

  const filteredCVs = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return cvs.filter((cv) => {
      const matchesSearch =
        cv.title.toLowerCase().includes(search) ||
        cv.template.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "all" || cv.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [cvs, searchTerm, statusFilter]);

  return (
    <div className="w-full min-w-0 space-y-6 lg:space-y-8">
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
              Manage, edit and preview your professional CVs
              from one place.
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

      <section className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
                setSearchTerm(event.target.value)
              }
              placeholder="Search by CV name or template..."
              disabled={loading || Boolean(error)}
              className="h-12 w-full rounded-xl border border-black/10 bg-qorliqIvory pl-11 pr-4 text-sm text-qorliqDark outline-none transition placeholder:text-black/35 focus:border-qorliqGold focus:ring-4 focus:ring-qorliqGold/10 disabled:opacity-50"
            />
          </div>

          <div className="relative">
            <SlidersHorizontal
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/40"
            />

            <select
              aria-label="Filter CVs by status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              disabled={loading || Boolean(error)}
              className="h-12 w-full min-w-[190px] appearance-none rounded-xl border border-black/10 bg-white pl-11 pr-10 text-sm font-medium text-qorliqDark outline-none transition focus:border-qorliqGold focus:ring-4 focus:ring-qorliqGold/10 disabled:opacity-50"
            >
              <option value="all">All CVs</option>
              <option value="completed">Completed</option>
              <option value="draft">Draft</option>
              <option value="incomplete">Incomplete</option>
            </select>

            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/40"
            />
          </div>
        </div>
      </section>

      {loading ? (
        <CVSkeleton />
      ) : error ? (
        <CVError error={error} onRetry={fetchCVs} />
      ) : filteredCVs.length > 0 ? (
        <section className="grid gap-5 xl:grid-cols-2">
         {filteredCVs.map((cv) => (
  <CVCard
    key={cv.id}
    cv={cv}
    onDelete={handleDeleteCV}
    deleting={deletingId === cv.id}
    deleteDisabled={deletingId !== null}
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
    </div>
  );
}

function CVCard({ cv, onDelete, deleting, deleteDisabled }) {
  const status = getStatusConfig(cv.status);
  const StatusIcon = status.icon;

  return (
    <article className="min-w-0 rounded-3xl border border-black/5 bg-white p-5 shadow-sm transition hover:border-qorliqGold/30 hover:shadow-luxury sm:p-6">
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-qorliqGold/10 text-qorliqGoldDark">
          <FileText size={25} />
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-qorliqDark">
            {cv.title}
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
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
      </div>

      {cv.completion !== null && (
        <div
          role="progressbar"
          aria-label="CV completion"
          aria-valuenow={cv.completion}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-6 h-2 overflow-hidden rounded-full bg-black/5"
        >
          <div
            className="h-full rounded-full bg-qorliqGold transition-all duration-500"
            style={{ width: `${cv.completion}%` }}
          />
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
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

    <div className="mt-6 grid grid-cols-[1fr_1fr_auto] gap-2 sm:gap-3">
  <Link
    href={`/cv-builder/preview/${encodeURIComponent(cv.id)}`}
    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-black/10 px-2 py-2.5 text-sm font-semibold text-qorliqDark transition hover:border-qorliqGold hover:bg-qorliqCream"
  >
    <Eye size={17} />
    Preview
  </Link>

  <Link
    href={`/cv-builder?cvId=${encodeURIComponent(cv.id)}`}
    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-qorliqGold px-2 py-2.5 text-sm font-bold text-qorliqDark transition hover:bg-qorliqGoldDark hover:text-white"
  >
    <Pencil size={17} />
    Edit CV
  </Link>

  <button
    type="button"
    onClick={() => onDelete(cv)}
    disabled={deleteDisabled}
    aria-label={deleting ? "Deleting CV" : `Delete ${cv.title}`}
    aria-busy={deleting}
    title="Delete CV"
    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition hover:border-red-600 hover:bg-red-600 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {deleting ? (
      <Loader2 size={18} className="animate-spin" aria-hidden="true" />
    ) : (
      <Trash2 size={18} aria-hidden="true" />
    )}
  </button>
</div>
    </article>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="min-w-0 rounded-2xl bg-qorliqCream/70 p-3.5">
      <div className="flex items-center gap-2 text-xs text-black/40">
        <span className="text-qorliqGoldDark">{icon}</span>
        {label}
      </div>

      <p className="mt-1.5 truncate text-sm font-semibold text-qorliqDark">
        {value}
      </p>
    </div>
  );
}

function CVSkeleton() {
  return (
    <section
      role="status"
      aria-label="Loading your CVs"
      aria-busy="true"
      className="grid gap-5 xl:grid-cols-2"
    >
      <span className="sr-only">Loading your CVs...</span>

      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="motion-safe:animate-pulse">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 shrink-0 rounded-2xl bg-black/10" />

              <div className="flex-1 space-y-3">
                <div className="h-5 w-3/4 rounded bg-black/10" />
                <div className="h-4 w-1/2 rounded bg-black/5" />
              </div>
            </div>

            <div className="mt-6 h-2 rounded-full bg-black/5" />

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-20 rounded-2xl bg-black/5"
                />
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <div className="h-11 flex-1 rounded-xl bg-black/10" />
              <div className="h-11 flex-1 rounded-xl bg-black/10" />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

function CVError({ error, onRetry }) {
  const isNetworkError = error.type === "network";
  const isAuthError = error.type === "auth";
  const Icon = isNetworkError ? WifiOff : AlertCircle;

  return (
    <section
      role="alert"
      className="rounded-3xl border border-red-100 bg-white px-6 py-16 text-center shadow-sm"
    >
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-600">
        <Icon size={36} aria-hidden="true" />
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
          <RefreshCw size={18} aria-hidden="true" />
          Reload
        </button>
      )}
    </section>
  );
}

function EmptyState({ searchTerm, statusFilter, onReset }) {
  const isFiltered =
    searchTerm.trim() !== "" || statusFilter !== "all";

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

function getStatusConfig(status) {
  const statusMap = {
    completed: {
      label: "Completed",
      icon: CheckCircle2,
      className: "bg-emerald-50 text-emerald-700",
    },
    draft: {
      label: "Draft",
      icon: Clock3,
      className: "bg-amber-50 text-amber-700",
    },
    incomplete: {
      label: "Incomplete",
      icon: AlertCircle,
      className: "bg-red-50 text-red-700",
    },
  };

  return statusMap[status] || statusMap.draft;
}