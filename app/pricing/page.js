import { Suspense } from "react";
import PricingContent from "./priceContent";

// useSearchParams in PricingContent requires a Suspense boundary for
// static prerendering with the Next.js App Router. No full-screen loader.
export default function PricingPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background" aria-busy="true" />}>
      <PricingContent />
    </Suspense>
  );
}
