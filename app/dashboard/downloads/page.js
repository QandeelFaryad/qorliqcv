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
  Download,
  FileText,
  FileType2,
  Image as ImageIcon,
  Search,
  ChevronDown,
  CalendarDays,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Eye,
  RefreshCw,
  Plus,
  HardDriveDownload,
  WifiOff,
  Trash2,
  Loader2,
} from "lucide-react";

const DOWNLOADS_API = "/api/downloads";

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function normalizeDownload(item) {
  if (
    !item ||
    typeof item !== "object" ||
    !(item.id || item._id)
  ) {
    throw new Error("Invalid download record.");
  }

  return {
    id: String(item.id || item._id),
    cvId:
      typeof item.cvId === "string"
        ? item.cvId
        : item.cvId?._id
          ? String(item.cvId._id)
          : null,
    cvTitle:
      typeof item.cvTitle === "string"
        ? item.cvTitle
        : "Untitled CV",
    template:
      typeof item.template === "string" ? item.template : "—",
    format:
      typeof item.format === "string"
        ? item.format.toUpperCase()
        : "—",
    fileSize:
      typeof item.fileSize === "string" && item.fileSize
        ? item.fileSize
        : "—",
    status:
      typeof item.status === "string"
        ? item.status.toLowerCase()
        : "unknown",
    downloadedAt: item.downloadedAt || null,
    createdAt: item.createdAt || null,
  };
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [formatFilter, setFormatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  const activeRequest = useRef(null);
  const deleteInProgress = useRef(false);

  const fetchDownloads = useCallback(async () => {
    // Avoid refreshing the list while a deletion is pending.
    if (deleteInProgress.current) return;

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
        response = await fetch(DOWNLOADS_API, {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal,
        });
      } catch (fetchError) {
        if (controller.signal.aborted) throw fetchError;
        if (activeRequest.current !== controller) return;

        setError({
          type: "network",
          message:
            "Could not reach the server. Check your internet connection and try again.",
        });
        return;
      }

      if (activeRequest.current !== controller) return;

      if (response.status === 401) {
        setDownloads([]);
        setError({
          type: "auth",
          message: "Please log in to view your download history.",
        });
        return;
      }

      if (!response.ok) {
        setError({
          type: "server",
          message: "Could not load your downloads. Please try again.",
        });
        return;
      }

      const data = await response.json();

      if (activeRequest.current !== controller) return;

      if (
        data.success !== true ||
        !Array.isArray(data.downloads)
      ) {
        throw new Error("Invalid downloads response.");
      }

      setDownloads(data.downloads.map(normalizeDownload));
    } catch {
      if (activeRequest.current !== controller) return;
      if (controller.signal.aborted && !timedOut) return;

      setError({
        type: "server",
        message: timedOut
          ? "The request took too long. Check your connection and try again."
          : "Could not load your downloads. Please try again.",
      });
    } finally {
      clearTimeout(timeout);

      if (activeRequest.current === controller) {
        activeRequest.current = null;
        setLoading(false);
      }
    }
  }, []);

  const handleDeleteDownload = async (item) => {
    if (deleteInProgress.current) return;

    const confirmed = window.confirm(
      `Delete download record for "${item.cvTitle}"? Your original CV will remain saved.`
    );

    if (!confirmed) return;

    deleteInProgress.current = true;
    setDeletingId(item.id);
    setDeleteError("");

    // Prevent an older list response from restoring this record.
    activeRequest.current?.abort();
    activeRequest.current = null;
    setLoading(false);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(DOWNLOADS_API, {
        method: "DELETE",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          downloadId: item.id,
        }),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || data?.success !== true) {
        throw new Error(
          data?.message || "Unable to delete download record."
        );
      }

      setDownloads((previous) =>
        previous.filter((record) => record.id !== item.id)
      );
    } catch (error) {
      setDeleteError(
        error.name === "AbortError"
          ? "The delete request timed out. Refresh the history to check whether the record was deleted."
          : error.message || "Unable to delete download record."
      );
    } finally {
      clearTimeout(timeout);
      deleteInProgress.current = false;
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      void fetchDownloads();
    };

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

    void fetchDownloads();

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      activeRequest.current?.abort();
      activeRequest.current = null;
    };
  }, [fetchDownloads]);

  const filteredDownloads = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return downloads.filter((item) => {
      const matchesSearch =
        item.cvTitle.toLowerCase().includes(query) ||
        item.template.toLowerCase().includes(query);

      const matchesFormat =
        formatFilter === "all" ||
        item.format.toLowerCase() === formatFilter;

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesFormat && matchesStatus;
    });
  }, [downloads, searchTerm, formatFilter, statusFilter]);

  const totalDownloads = downloads.length;

  const completedDownloads = downloads.filter(
    (item) => item.status === "completed"
  ).length;
  const successPercentage =
  totalDownloads > 0
    ? Math.round((completedDownloads / totalDownloads) * 100)
    : 0;

  const hasFilters =
    searchTerm.trim() !== "" ||
    formatFilter !== "all" ||
    statusFilter !== "all";

  const resetFilters = () => {
    setSearchTerm("");
    setFormatFilter("all");
    setStatusFilter("all");
  };

  return (
    <div className="w-full min-w-0 space-y-6 lg:space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-qorliqDark via-qorliqCharcoal to-black p-7 text-white shadow-luxury sm:p-8 lg:p-10">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-qorliqGold/15 px-4 py-2 text-sm font-semibold text-qorliqGold">
              <HardDriveDownload size={16} />
              Download Centre
            </div>

            <h1 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">
              Your CV Downloads
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
              View your CV download history, file formats and download
              status.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/dashboard/cvs"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-qorliqGold px-5 py-3 text-sm font-bold text-qorliqDark shadow-gold transition hover:bg-qorliqGoldDark hover:text-white"
              >
                <FileText size={18} />
                View My CVs
              </Link>

              <Link
                href="/cv-builder"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-qorliqGold hover:bg-white/5"
              >
                <Plus size={18} />
                Create New CV
              </Link>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-qorliqGold text-qorliqDark">
              <Download size={27} />
            </div>

            <div>
              {loading ? (
                <div
                  aria-label="Loading count"
                  className="h-9 w-16 rounded-lg bg-white/15 motion-safe:animate-pulse"
                />
              ) : (
                <p className="text-3xl font-black">
                  {error ? "—" : totalDownloads}
                </p>
              )}

              <p className="mt-1 text-sm text-white/55">
                Download records
              </p>
            </div>
          </div>
        </div>
      </section>

      {deleteError && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {deleteError}
        </div>
      )}

      {loading ? (
        <DownloadsSkeleton />
      ) : error ? (
        <DownloadsError
          error={error}
          onRetry={fetchDownloads}
          retryDisabled={deletingId !== null}
        />
      ) : (
        <>
     <section className="grid gap-5 md:grid-cols-2">
<DownloadStatCard
  title="Total Records"
  value={totalDownloads}
  icon={<Download size={20} />}
  color="#B88A2C"
  background="#FAF5E9"
  unlimited
  description={`${totalDownloads} total download records`}
/>

  <DownloadStatCard
    title="Successful"
    value={completedDownloads}
    icon={<CheckCircle2 size={20} />}
    color="#059669"
    background="#ECFDF5"
    percentage={successPercentage}
    percentageLabel="Success rate"
    description={
      totalDownloads > 0
        ? `${totalDownloads - completedDownloads} records not completed`
        : "No download records yet"
    }
  />
</section>

          <section className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative w-full xl:max-w-md">
                <Search
                  size={18}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/35"
                />

                <input
                  type="search"
                  aria-label="Search download history"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Search by CV or template..."
                  className="h-12 w-full rounded-xl border border-black/10 bg-qorliqIvory pl-11 pr-4 text-sm text-qorliqDark outline-none transition placeholder:text-black/35 focus:border-qorliqGold focus:ring-4 focus:ring-qorliqGold/10"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <FilterSelect
                  label="Filter by format"
                  value={formatFilter}
                  onChange={setFormatFilter}
                  options={[
                    { value: "all", label: "All Formats" },
                    { value: "pdf", label: "PDF" },
                    { value: "docx", label: "Word Document" },
                    { value: "jpeg", label: "JPEG Image" },
                  ]}
                />

                <FilterSelect
                  label="Filter by status"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: "all", label: "All Statuses" },
                    { value: "pending", label: "Pending" },
                    { value: "completed", label: "Completed" },
                    { value: "expired", label: "Expired" },
                    { value: "failed", label: "Failed" },
                  ]}
                />

                <button
                  type="button"
                  onClick={() => void fetchDownloads()}
                  disabled={deletingId !== null}
                  aria-label="Refresh download history"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-black/10 px-4 text-sm font-semibold text-qorliqDark transition hover:border-qorliqGold hover:bg-qorliqCream disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw size={17} />
                  Refresh
                </button>
              </div>
            </div>
          </section>

          {filteredDownloads.length > 0 ? (
            <section className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm">
              <div className="border-b border-black/5 p-5 sm:p-6">
                <h2 className="text-xl font-black text-qorliqDark">
                  Download History
                </h2>

                <p className="mt-1 text-sm text-black/45">
                  {filteredDownloads.length} record
                  {filteredDownloads.length !== 1 ? "s" : ""} found
                </p>
              </div>

              <div className="hidden overflow-x-auto xl:block">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-black/5 bg-qorliqCream/50">
                      <TableHeader>CV File</TableHeader>
                      <TableHeader>Format</TableHeader>
                      <TableHeader>File Size</TableHeader>
                      <TableHeader>Date</TableHeader>
                      <TableHeader>Status</TableHeader>
                      <TableHeader>Actions</TableHeader>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-black/5">
                    {filteredDownloads.map((item) => (
                      <DownloadTableRow
                        key={item.id}
                        item={item}
                        onDelete={handleDeleteDownload}
                        deleting={deletingId === item.id}
                        deleteDisabled={deletingId !== null}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-black/5 xl:hidden">
                {filteredDownloads.map((item) => (
                  <DownloadMobileCard
                    key={item.id}
                    item={item}
                    onDelete={handleDeleteDownload}
                    deleting={deletingId === item.id}
                    deleteDisabled={deletingId !== null}
                  />
                ))}
              </div>
            </section>
          ) : (
            <EmptyDownloads
              isFiltered={hasFilters}
              onReset={resetFilters}
            />
          )}
        </>
      )}
    </div>
  );
}

function DownloadTableRow({
  item,
  onDelete,
  deleting,
  deleteDisabled,
}) {
  return (
    <tr className="transition hover:bg-qorliqCream/35">
      <td className="px-6 py-5">
        <div className="flex min-w-0 items-center gap-4">
          <FormatIcon format={item.format} />

          <div className="min-w-0">
            <p className="max-w-[270px] truncate text-sm font-bold text-qorliqDark">
              {item.cvTitle}
            </p>
            <p className="mt-1 max-w-[270px] truncate text-xs text-black/40">
              {item.template}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-5">
        <span className="rounded-lg bg-black/5 px-2.5 py-1.5 text-xs font-bold text-black/55">
          {item.format}
        </span>
      </td>

      <td className="whitespace-nowrap px-6 py-5 text-sm text-black/50">
        {item.fileSize}
      </td>

      <td className="px-6 py-5 text-sm text-black/50">
        <DownloadDate item={item} />
      </td>

      <td className="px-6 py-5">
        <StatusBadge status={item.status} />
      </td>

      <td className="px-6 py-5">
        <DownloadActions
          item={item}
          onDelete={onDelete}
          deleting={deleting}
          deleteDisabled={deleteDisabled}
        />
      </td>
    </tr>
  );
}

function DownloadMobileCard({
  item,
  onDelete,
  deleting,
  deleteDisabled,
}) {
  return (
    <article className="p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <FormatIcon format={item.format} />

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold text-qorliqDark">
            {item.cvTitle}
          </h3>

          <p className="mt-1 truncate text-xs text-black/40">
            {item.template}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-black/5 px-2.5 py-1 text-xs font-semibold text-black/55">
              {item.format}
            </span>
            <StatusBadge status={item.status} />
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <MobileInfo label="File size" value={item.fileSize} />
        <MobileInfo
          label={item.downloadedAt ? "Downloaded" : "Requested"}
          value={formatDate(item.downloadedAt || item.createdAt)}
        />
      </div>

      <div className="mt-5">
        <DownloadActions
          item={item}
          onDelete={onDelete}
          deleting={deleting}
          deleteDisabled={deleteDisabled}
        />
      </div>
    </article>
  );
}

function DownloadActions({
  item,
  onDelete,
  deleting,
  deleteDisabled,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
    

      <button
        type="button"
        onClick={() => onDelete(item)}
        disabled={deleteDisabled}
        aria-label={
          deleting
            ? "Deleting download record"
            : `Delete download record for ${item.cvTitle}`
        }
        aria-busy={deleting}
        title="Delete download record"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition hover:border-red-600 hover:bg-red-600 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {deleting ? (
          <Loader2
            size={18}
            className="animate-spin"
            aria-hidden="true"
          />
        ) : (
          <Trash2 size={18} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

function ViewCVLink({ cvId }) {
  if (!cvId) {
    return (
      <span className="text-xs text-black/40">
        CV unavailable
      </span>
    );
  }

  return (
    <Link
      href={`/cv-builder/preview/${encodeURIComponent(cvId)}`}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold text-qorliqDark transition hover:border-qorliqGold hover:bg-qorliqCream"
    >
      <Eye size={17} />
      View CV
    </Link>
  );
}

function DownloadDate({ item }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <CalendarDays size={15} className="shrink-0" />
        <span>
          {formatDate(item.downloadedAt || item.createdAt)}
        </span>
      </div>

      {!item.downloadedAt && item.createdAt && (
        <p className="mt-1 text-xs text-black/35">
          Request date
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const config = getDownloadStatus(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${config.className}`}
    >
      <Icon size={13} aria-hidden="true" />
      {config.label}
    </span>
  );
}

function FormatIcon({ format }) {
  const formats = {
    PDF: {
      icon: FileText,
      className: "bg-red-50 text-red-600",
    },
    DOCX: {
      icon: FileType2,
      className: "bg-blue-50 text-blue-600",
    },
    JPEG: {
      icon: ImageIcon,
      className: "bg-purple-50 text-purple-600",
    },
  };

  const config = formats[format] || {
    icon: FileText,
    className: "bg-gray-100 text-gray-600",
  };
  const Icon = config.icon;

  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${config.className}`}
    >
      <Icon size={22} aria-hidden="true" />
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="relative min-w-0">
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full appearance-none rounded-xl border border-black/10 bg-white pl-4 pr-10 text-sm font-medium text-qorliqDark outline-none transition focus:border-qorliqGold focus:ring-4 focus:ring-qorliqGold/10 sm:min-w-[170px]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={17}
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/40"
      />
    </div>
  );
}

function DownloadStatCard({
  title,
  value,
  icon,
  color,
  background,
  percentage = 0,
  percentageLabel = "Completed",
  description,
  unlimited = false,
}) {
  const progress = Math.min(
    100,
    Math.max(0, Number(percentage) || 0)
  );

  const radius = 43;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="min-w-0 overflow-hidden rounded-3xl border border-black/[0.06] bg-white p-5 shadow-sm transition duration-300 hover:shadow-lg sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ color, backgroundColor: background }}
          aria-hidden="true"
        >
          {icon}
        </div>

        <h3 className="text-sm font-semibold text-black/60">
          {title}
        </h3>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-4xl font-black tracking-tight text-qorliqDark">
            {value}
          </p>
          <p className="mt-2 text-xs text-black/40">
            {unlimited ? "Download records" : "Completed downloads"}
          </p>
        </div>

        <div
          className="relative flex h-28 w-28 shrink-0 items-center justify-center"
          role={unlimited ? undefined : "progressbar"}
          aria-label={unlimited ? undefined : percentageLabel}
          aria-valuemin={unlimited ? undefined : 0}
          aria-valuemax={unlimited ? undefined : 100}
          aria-valuenow={unlimited ? undefined : progress}
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
              stroke={color}
              strokeOpacity="0.15"
              strokeWidth="8"
            />

            {!unlimited && (
              <circle
                cx="56"
                cy="56"
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth="8"
                strokeLinecap={progress > 0 ? "round" : "butt"}
                strokeDasharray={circumference}
                strokeDashoffset={
                  circumference * (1 - progress / 100)
                }
                className="motion-safe:transition-[stroke-dashoffset] motion-safe:duration-700"
              />
            )}
          </svg>

          <div className="max-w-[76px] text-center">
            <p
              className="break-all text-2xl font-black tracking-tight"
              style={{ color }}
            >
              {unlimited ? value : `${progress}%`}
            </p>

            <p className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-black/40">
              {unlimited ? "Unlimited" : percentageLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-black/5 pt-4">
        <p className="text-xs leading-5 text-black/45">
          {description}
        </p>
      </div>
    </div>
  );
}

function TableHeader({ children }) {
  return (
    <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] text-black/40">
      {children}
    </th>
  );
}

function MobileInfo({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl bg-qorliqCream/60 p-3">
      <p className="text-xs text-black/40">{label}</p>
      <p className="mt-1 break-words text-xs font-semibold text-qorliqDark">
        {value}
      </p>
    </div>
  );
}

function DownloadsSkeleton() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <span className="sr-only">
        Loading your download history...
      </span>

      <div
        aria-hidden="true"
        className="grid gap-5 md:grid-cols-2"
      >
        {[0, 1].map((item) => (
          <div
            key={item}
            className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between motion-safe:animate-pulse">
              <div className="space-y-3">
                <div className="h-4 w-28 rounded bg-black/10" />
                <div className="h-9 w-16 rounded bg-black/10" />
              </div>
              <div className="h-12 w-12 rounded-2xl bg-black/10" />
            </div>
          </div>
        ))}
      </div>

      <div
        aria-hidden="true"
        className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-col gap-4 motion-safe:animate-pulse sm:flex-row">
          <div className="h-12 flex-1 rounded-xl bg-black/5" />
          <div className="h-12 rounded-xl bg-black/5 sm:w-44" />
          <div className="h-12 rounded-xl bg-black/5 sm:w-44" />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm"
      >
        <div className="border-b border-black/5 p-6">
          <div className="h-6 w-44 rounded bg-black/10 motion-safe:animate-pulse" />
        </div>

        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="border-b border-black/5 p-5 last:border-0 sm:p-6"
          >
            <div className="flex items-center gap-4 motion-safe:animate-pulse">
              <div className="h-12 w-12 shrink-0 rounded-2xl bg-black/10" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-3/4 max-w-64 rounded bg-black/10" />
                <div className="h-3 w-1/2 max-w-40 rounded bg-black/5" />
              </div>
              <div className="hidden h-8 w-20 rounded-full bg-black/10 sm:block" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DownloadsError({
  error,
  onRetry,
  retryDisabled = false,
}) {
  const isNetwork = error.type === "network";
  const isAuth = error.type === "auth";
  const Icon = isNetwork ? WifiOff : AlertCircle;

  return (
    <section
      role="alert"
      className="rounded-3xl border border-red-100 bg-white px-6 py-16 text-center shadow-sm"
    >
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-600">
        <Icon size={36} aria-hidden="true" />
      </div>

      <h2 className="mt-6 text-2xl font-black text-red-600">
        {isNetwork
          ? "Connection unavailable"
          : isAuth
            ? "Please log in"
            : "Could not load downloads"}
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-red-600">
        {error.message}
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        {isAuth && (
          <Link
            href="/login"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-qorliqGold px-5 py-3 text-sm font-bold text-qorliqDark"
          >
            Log in
          </Link>
        )}

        <button
          type="button"
          onClick={() => void onRetry()}
          disabled={retryDisabled}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw size={18} aria-hidden="true" />
          Reload
        </button>
      </div>
    </section>
  );
}

function EmptyDownloads({ isFiltered, onReset }) {
  return (
    <section className="rounded-3xl border border-dashed border-black/15 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-qorliqGold/10 text-qorliqGoldDark">
        <Download size={35} />
      </div>

      <h2 className="mt-6 text-2xl font-black text-qorliqDark">
        {isFiltered ? "No matching downloads" : "No downloads yet"}
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/50">
        {isFiltered
          ? "Try changing your search or filters."
          : "Your CV download records will appear here."}
      </p>

      {isFiltered ? (
        <button
          type="button"
          onClick={onReset}
          className="mt-7 rounded-xl bg-qorliqGold px-5 py-3 text-sm font-bold text-qorliqDark transition hover:bg-qorliqGoldDark hover:text-white"
        >
          Reset Filters
        </button>
      ) : (
        <Link
          href="/dashboard/cvs"
          className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-qorliqGold px-5 py-3 text-sm font-bold text-qorliqDark transition hover:bg-qorliqGoldDark hover:text-white"
        >
          <FileText size={18} />
          View My CVs
        </Link>
      )}
    </section>
  );
}

function getDownloadStatus(status) {
  const statuses = {
    pending: {
      label: "Pending",
      icon: Clock3,
      className: "bg-blue-50 text-blue-700",
    },
    completed: {
      label: "Completed",
      icon: CheckCircle2,
      className: "bg-emerald-50 text-emerald-700",
    },
    expired: {
      label: "Expired",
      icon: Clock3,
      className: "bg-amber-50 text-amber-700",
    },
    failed: {
      label: "Failed",
      icon: AlertCircle,
      className: "bg-red-50 text-red-700",
    },
  };

  return (
    statuses[status] || {
      label: "Unknown",
      icon: AlertCircle,
      className: "bg-gray-100 text-gray-600",
    }
  );
}