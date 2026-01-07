"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Cookie, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  collapsed: boolean;
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

export default function DashboardSidebar({ collapsed }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleSubMenu = (label: string) => {
    if (collapsed) return;
    setExpandedMenus((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label],
    );
  };

  return (
    <aside
      className={cn(
        "h-screen bg-white shadow-md transition-all duration-300 py-6 flex flex-col sticky top-0 border-r border-secondary/20",
        collapsed ? "w-20" : "w-64",
      )}
    >
      {/* Logo Area */}
      <Link
        href="/blog"
        className="flex items-center gap-2 overflow-hidden px-4"
      >
        {collapsed ? (
          <img
            src="/images/piskovnaicon.svg"
            alt="P"
            className="h-8 w-auto object-contain"
          />
        ) : (
          <img
            src="/images/logo.svg"
            alt="Piskovna"
            className="h-10 w-auto object-contain"
          />
        )}
      </Link>

      <div
        className={cn(
          "flex-1 py-4 px-3 space-y-1",
          collapsed ? "overflow-visible" : "overflow-y-auto",
        )}
      >
        {!collapsed && (
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
            Menu
          </div>
        )}

        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href) && item.href !== "#";
          const isExpanded = expandedMenus.includes(item.label);
          const hasSubItems = item.subItems && item.subItems.length > 0;

          return (
            <div key={item.label} className="relative group">
              <div
                onClick={() => hasSubItems && toggleSubMenu(item.label)}
                className={cn(
                  "relative flex items-center px-3 py-3 rounded-lg cursor-pointer transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-brand-bg hover:text-primary",
                  collapsed && "justify-center",
                )}
              >
                <item.icon
                  className={cn("w-6 h-6 shrink-0", isActive && "text-primary")}
                  strokeWidth={1.5}
                />
                {!collapsed && (
                  <>
                    <span className="ml-3 font-medium flex-1">
                      {item.label}
                    </span>
                    {hasSubItems && (
                      <span className="ml-auto">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </span>
                    )}
                    {item.badge !== undefined && (
                      <span
                        className={cn(
                          "ml-2 px-2 py-0.5 rounded-full text-xs font-medium",
                          item.badge > 0
                            ? "bg-red-500 text-white"
                            : "bg-red-100 text-red-600",
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-2 top-0 z-50 hidden group-hover:flex items-center h-full bg-white px-4 rounded-md shadow-md border border-secondary/20 min-w-max whitespace-nowrap">
                    <span className="text-primary font-medium text-sm">
                      {item.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Submenu */}
              {!collapsed && hasSubItems && isExpanded && (
                <div className="mt-1 ml-4 border-l border-primary/20 pl-2 space-y-1">
                  {item.subItems!.map((sub) => (
                    <Link
                      key={sub.label}
                      href={sub.href}
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
      {!collapsed && (
        <div className="text-xs text-gray-400 text-center">
          © {new Date().getFullYear()} Piskovna
        </div>
      )}
    </aside>
  );
}
