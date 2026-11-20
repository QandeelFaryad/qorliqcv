"use client";

import { usePathname } from "next/navigation";
import WebsiteHeader from "./WebsiteHeader";
import Footer from "@/components/Footer";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  const hideNavbarFooterRoutes = [
    "/cv-builder/create",
    "/cv-builder/preview",
    "/cv-builder/success",
    "/cv-builder",
    "/pricing",
    "/checkout",
    "/login",
    '/adfront',
    '/dashboard',
  ];

  const shouldHideNavbarFooter = hideNavbarFooterRoutes.some((route) =>
    pathname.startsWith(route)
  );

  return (
    <>
      {!shouldHideNavbarFooter && <WebsiteHeader />}

      <main className={shouldHideNavbarFooter ? "min-h-screen" : "min-h-screen"}>
        {children}
      </main>

      {!shouldHideNavbarFooter && <Footer />}
    </>
  );
}