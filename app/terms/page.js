import TermsConditionsContent from "./TermsConditionsContent";

export const metadata = {
  title: "Terms & Conditions | QORLIQ CV",
  description: "Read QORLIQ CV terms covering CV building, paid plans, subscription cancellation, refunds and download access.",
  robots: { index: false, follow: true }, // Remove after legal and product review.
};

export default function TermsConditionsPage() {
  return <TermsConditionsContent />;
}
