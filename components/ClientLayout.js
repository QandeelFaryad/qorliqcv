"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  const hideNavbarFooterRoutes = [
    "/cv-builder/create",
    "/cv-builder/preview",
    "/cv-builder/success",
  ];

  const shouldHideNavbarFooter = hideNavbarFooterRoutes.some((route) =>
    pathname.startsWith(route)
  );

  return (
    <>
      {!shouldHideNavbarFooter && <Header />}

      <main className={shouldHideNavbarFooter ? "min-h-screen" : "min-h-screen"}>
        {children}
      </main>

      {!shouldHideNavbarFooter && <Footer />}
    </>
  );
}