"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Cookie, ChevronRight, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  collapsed: boolean; // Desktop collapsed state
  mobileOpen: boolean; // Mobile open state
  setMobileOpen: (open: boolean) => void;
}

interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
  subItems?: { label: string; href: string }[];
  badge?: number;
}

const menuItems: MenuItem[] = [
  { label: "Blog", href: "/blog", icon: FileText },
  { label: "Cookiesbot", href: "/cookiesbots", icon: Cookie },
];

export default function DashboardSidebar({
  collapsed,
  mobileOpen,
  setMobileOpen,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleSubMenu = (label: string) => {
    if (collapsed && !mobileOpen) return;
    setExpandedMenus((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label],
    );
  };

  const SidebarContent = () => (
    <>
      {/* Logo Area */}
      <div className="flex items-center justify-between px-6 mb-6">
        <Link
          href="/blog"
          className="flex items-center gap-2 overflow-hidden"
          onClick={() => setMobileOpen(false)}
        >
          {collapsed && !mobileOpen ? (
            <img
              src="/images/piskovnaicon.svg"
              alt="P"
              className="h-8 w-auto object-contain"
            />
          ) : (
            <img
              src="/images/logo.svg"
              alt="Piskovna"
              className="h-8 w-auto object-contain"
            />
          )}
        </Link>
        {/* Mobile Close Button */}
        <button
          className="md:hidden p-1 text-gray-500 hover:text-gray-900"
          onClick={() => setMobileOpen(false)}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div
        className={cn(
          "flex-1 py-4 px-3 space-y-1",
          collapsed && !mobileOpen ? "overflow-visible" : "overflow-y-auto",
        )}
      >
        {(!collapsed || mobileOpen) && (
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
            Menu
          </div>
        )}

        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href) && item.href !== "#";
          const isExpanded = expandedMenus.includes(item.label);
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const showFullText = !collapsed || mobileOpen;

          return (
            <div key={item.label} className="relative group">
              <div
                onClick={() => hasSubItems && toggleSubMenu(item.label)}
                className={cn(
                  "relative flex items-center px-3 py-3 rounded-lg cursor-pointer transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-brand-bg hover:text-primary",
                  !showFullText && "justify-center",
                )}
              >
                {/* Link wrapper if no subitems */}
                {!hasSubItems ? (
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center w-full"
                  >
                    <item.icon
                      className={cn(
                        "w-6 h-6 shrink-0",
                        isActive && "text-primary",
                      )}
                      strokeWidth={1.5}
                    />
                    {showFullText && (
                      <span className="ml-3 font-medium flex-1">
                        {item.label}
                      </span>
                    )}
                    {item.badge !== undefined && showFullText && (
                      <span
                        className={cn(
                          "ml-auto px-2 py-0.5 rounded-full text-xs font-medium",
                          item.badge > 0
                            ? "bg-red-500 text-white"
                            : "bg-red-100 text-red-600",
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ) : (
                  <>
                    <item.icon
                      className={cn(
                        "w-6 h-6 shrink-0",
                        isActive && "text-primary",
                      )}
                      strokeWidth={1.5}
                    />
                    {showFullText && (
                      <>
                        <span className="ml-3 font-medium flex-1">
                          {item.label}
                        </span>
                        <span className="ml-auto">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </span>
                      </>
                    )}
                  </>
                )}

                {!showFullText &&
                  item.badge !== undefined &&
                  item.badge > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                  )}

                {/* Tooltip for collapsed state (Desktop only) */}
                {!showFullText && (
                  <div className="absolute left-full ml-2 top-0 z-50 hidden group-hover:flex items-center h-full bg-white px-4 rounded-md shadow-md border border-secondary/20 min-w-max whitespace-nowrap">
                    <span className="text-primary font-medium text-sm">
                      {item.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Submenu */}
              {showFullText && hasSubItems && isExpanded && (
                <div className="mt-1 ml-4 border-l border-primary/20 pl-2 space-y-1">
                  {item.subItems!.map((sub) => (
                    <Link
                      key={sub.label}
                      href={sub.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "block px-3 py-2 rounded-md text-sm transition-colors",
                        pathname === sub.href
                          ? "text-primary font-medium bg-primary/5"
                          : "text-gray-500 hover:text-primary hover:bg-brand-bg/50",
                      )}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer / Version if needed */}
      {(!collapsed || mobileOpen) && (
        <div className="text-xs text-gray-400 text-center pb-4">
          © {new Date().getFullYear()} Pískovna
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex bg-white shadow-md transition-all duration-300 py-6 flex-col sticky top-0 border-r border-secondary/20 h-screen",
          collapsed ? "w-20" : "w-64",
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl flex flex-col py-6 animate-in slide-in-from-left duration-300">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
