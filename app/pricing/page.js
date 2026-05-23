import { Suspense } from "react";
import PricingContent from "./PricingContent";

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#050505] px-4 text-white">
          <p className="text-sm font-bold text-white/60">Loading pricing...</p>
        </main>
      }
    >
      <PricingContent />
    </Suspense>
  );
}