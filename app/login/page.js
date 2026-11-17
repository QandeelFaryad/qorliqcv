import { Suspense } from "react";
import LoginContent from "./LoginContent";

// Required: LoginContent reads search params via useSearchParams().
// On prerendered App Router pages, the hook must be below a Suspense boundary.
// This is scoped to the form, without an unnecessary full-page spinner.
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[calc(100dvh-76px)] bg-background px-4 py-10 lg:min-h-[calc(100dvh-84px)]">
          <div className="mx-auto w-full max-w-[490px] rounded-[22px] border border-border bg-surface p-6 sm:p-9" role="status" aria-label="Loading login form">
            <div className="h-8 w-28 animate-pulse rounded-lg bg-background-muted" />
            <div className="mt-8 h-8 w-2/3 animate-pulse rounded-lg bg-background-muted" />
            <div className="mt-7 h-12 w-full animate-pulse rounded-xl bg-background-muted" />
            <div className="mt-5 h-12 w-full animate-pulse rounded-xl bg-background-muted" />
            <div className="mt-5 h-12 w-full animate-pulse rounded-xl bg-background-muted" />
          </div>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
