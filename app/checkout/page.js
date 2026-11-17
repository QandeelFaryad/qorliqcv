import { Suspense } from "react";
import CheckoutContent from "./checkoutContent";

// Next.js requires a boundary for the useSearchParams() call in CheckoutContent
// during static prerendering. Keep the fallback inside the checkout content area.
export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background px-4 pt-10 text-text-primary">
          <div className="mx-auto max-w-[1200px]">
            <div className="h-8 w-60 animate-pulse rounded-xl bg-background-muted" />
            <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_350px]">
              <div className="h-64 animate-pulse rounded-2xl border border-border bg-surface" />
              <div className="h-64 animate-pulse rounded-2xl border border-border bg-surface" />
            </div>
          </div>
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
