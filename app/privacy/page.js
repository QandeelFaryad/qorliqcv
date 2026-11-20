import PrivacyPolicyContent from "./PrivacyPolicyContent";

export const metadata = {
  title: "Privacy Policy | QORLIQ CV",
  description:
    "Learn how QORLIQ CV handles personal information, CV content, account details, payments, cookies and privacy requests.",
  robots: { index: false, follow: true }, // Draft: remove noindex only after legal/factual review.
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyContent />;
}
