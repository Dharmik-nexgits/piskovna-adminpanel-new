"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("userdata");

    if (!token || !userData) {
      router.replace("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex bg-brand-bg min-h-screen font-sans text-foreground">
      <DashboardSidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <DashboardHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
