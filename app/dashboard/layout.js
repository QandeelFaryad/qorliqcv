"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardSidebar from "@/components/customer-dashboard/DashboardSidebar";
import DashboardHeader from "@/components/customer-dashboard/DashboardHeader";

import "./dashboard.css";

/* =========================================
   CONFIGURATION
========================================= */

const THEME_STORAGE_KEY = "qorliq-dashboard-theme";

const demoUser = {
  name: "Qorliq Customer",
  email: "customer@example.com",
  avatar: "",
  planName: "6-Month Professional",
};

const demoNotifications = [
  {
    id: "notification-1",
    title: "CV updated successfully",
    message: "Your Senior Executive CV was updated and saved.",
    time: "10 minutes ago",
    read: false,
  },
  {
    id: "notification-2",
    title: "PDF download completed",
    message: "Your Professional CV PDF is ready and has been downloaded.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "notification-3",
    title: "Subscription active",
    message: "Your 6-month package is active and ready to use.",
    time: "Yesterday",
    read: true,
  },
];

/* =========================================
   DASHBOARD LAYOUT
========================================= */

export default function CustomerDashboardLayout({ children }) {
  const router = useRouter();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] =
    useState(false);

  const [theme, setTheme] = useState("light");

  const [themeReady, setThemeReady] = useState(false);

  /* =========================================
     LOAD SAVED THEME
  ========================================= */

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(
        THEME_STORAGE_KEY
      );

      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      const initialTheme =
        savedTheme === "light" || savedTheme === "dark"
          ? savedTheme
          : systemDark
            ? "dark"
            : "light";

      setTheme(initialTheme);
    } catch (error) {
      console.error("Dashboard theme error:", error);
      setTheme("light");
    } finally {
      setThemeReady(true);
    }
  }, []);

  /* =========================================
     SAVE THEME
  ========================================= */

  useEffect(() => {
    if (!themeReady) return;

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.error("Dashboard theme save error:", error);
    }
  }, [theme, themeReady]);

  /* =========================================
     TOGGLE THEME
  ========================================= */

  const toggleTheme = useCallback(() => {
    setTheme((current) =>
      current === "light" ? "dark" : "light"
    );
  }, []);

  /* =========================================
     MOBILE SIDEBAR
  ========================================= */

  const openMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(true);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout = async () => {
    try {
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Dashboard logout error:", error);
    }
  };

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div
      className="
        q-dashboard
        relative
        h-dvh
        w-full
        overflow-hidden
        font-sans
        antialiased
        transition-colors
        duration-300
      "
      data-theme={theme}
      style={{
        colorScheme: theme,
        backgroundColor: "var(--qd-background)",
        color: "var(--qd-text-primary)",
      }}
    >
      {/* SIDEBAR */}

      <DashboardSidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
        user={demoUser}
        onLogout={handleLogout}
      />

      {/* MAIN AREA */}

      <div
        className="
          flex
          h-dvh
          min-w-0
          flex-col
          overflow-hidden
          lg:ml-[290px]
        "
        style={{
          backgroundColor: "var(--qd-background-soft)",
        }}
      >
        {/* HEADER */}

        <DashboardHeader
          onMobileMenuOpen={openMobileSidebar}
          user={demoUser}
          notifications={demoNotifications}
          onLogout={handleLogout}
          theme={theme}
          onThemeToggle={toggleTheme}
          themeReady={themeReady}
        />

        {/* PAGE CONTENT */}

        <main
          id="dashboard-main-content"
          className="
            dashboard-scrollbar
            min-h-0
            flex-1
            overflow-x-hidden
            overflow-y-auto
            overscroll-contain
          "
          style={{
            backgroundColor: "var(--qd-background-soft)",
          }}
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[1600px]
              px-4
              py-5
              sm:px-6
              sm:py-7
              lg:px-8
              lg:py-8
            "
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}