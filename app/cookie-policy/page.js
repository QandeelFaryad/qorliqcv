import CookiePolicyContent from "./CookiePolicyContent";

export const metadata = {
  title: "Cookie Policy | QORLIQ CV",
  description: "Learn how QORLIQ CV uses cookies and similar technologies and how to manage browser privacy settings.",
  robots: { index: false, follow: true }, // Review cookie inventory, disclosures and consent before indexing.
};

export default function CookiePolicyPage() {
  return <CookiePolicyContent />;
}
