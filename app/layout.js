import "./globals.css";

import Providers from "./providers";
import ClientLayout from "@/components/ClientLayout";
import CvOfferCountdownBanner from "@/components/CvOfferCountdownBanner";

export const metadata = {
  title: "Qorliq Digital",
  description:
    "Premium digital agency for websites, applications, lead generation and CV builder services.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <CvOfferCountdownBanner />
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}