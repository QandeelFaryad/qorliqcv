import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "./providers";

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
          <Header />
        {children}
        <Footer />
        </Providers>
      </body>
    </html>
  );
}