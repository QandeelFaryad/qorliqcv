"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/customer-dashboard/DashboardSidebar";
import DashboardHeader from "@/components/customer-dashboard/DashboardHeader";

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

export default function CustomerDashboardLayout({ children }) {
  const router = useRouter();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Dashboard logout error:", error);
    }
  };

  return (
    <div className="h-dvh dashboard-scrollbar overflow-hidden bg-qorliqCream text-qorliqDark">
      <DashboardSidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        user={demoUser}
        onLogout={handleLogout}
      />

      <div className="flex h-dvh min-w-0 flex-col overflow-hidden lg:ml-[290px]">
        <DashboardHeader
          onMobileMenuOpen={() => setIsMobileSidebarOpen(true)}
          user={demoUser}
          notifications={demoNotifications}
          onLogout={handleLogout}
        />
<main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
  <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
    {children}
  </div>
</main>
      </div>
    </div>
  );
}