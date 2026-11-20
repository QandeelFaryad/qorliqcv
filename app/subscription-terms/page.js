import SubscriptionTermsContent from "./SubscriptionTermsContent";

export const metadata = {
  title: "Subscription Terms | QORLIQ CV",
  description:
    "Read QORLIQ CV subscription terms about access plans, billing, renewals, cancellations, download limits and refunds.",
  robots: { index: false, follow: true }, // Remove noindex only after legal and product review.
};

export default function SubscriptionTermsPage() {
  return <SubscriptionTermsContent />;
}
