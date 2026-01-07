import { useState, useEffect } from "react";
import { Menu, User, LogOut, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

interface DashboardHeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function DashboardHeader({
  collapsed,
  setCollapsed,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("userdata");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUserEmail(parsed.email || "User");
      } catch (e) {
        setUserEmail("User");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("userdata");
    router.replace("/login");
  };

  const getPageTitle = (path: string) => {
    if (path.startsWith("/blog/")) return "Blog Details";
    switch (path) {
      case "/blog":
        return "Blog";
      case "/cookiesbots":
        return "Cookiesbot";
      default:
        return "Home";
    }
  };

  const title = getPageTitle(pathname);

  const getBreadcrumbs = (path: string) => {
    // Simple logic for now, can be expanded
    const items = [];
    if (path === "/blog") {
      items.push({ label: "Blog" });
    } else if (path.startsWith("/blog/")) {
      items.push({ label: "Blog", href: "/blog" });
      items.push({ label: "Details" });
    } else if (path === "/cookiesbots") {
      items.push({ label: "Cookiesbot" });
    } else {
      items.push({ label: "Home" });
    }
    return items;
  };

  return (
    <header className="bg-white h-16 border-b border-secondary/20 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md text-gray-500 hover:bg-brand-bg hover:text-primary transition-colors focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Dynamic Breadcrumb/Title */}
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-gray-800 leading-tight">
            {title}
          </h1>
          <Breadcrumb items={getBreadcrumbs(pathname)} />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* User Profile */}
        <div
          className="relative py-4" /* Added padding for better hover target area */
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <button className="flex items-center gap-2 pl-4 border-l border-gray-100 cursor-pointer focus:outline-none">
            <div className="w-9 h-9 rounded-full bg-brand-bg flex items-center justify-center text-primary border border-primary/20">
              <User className="w-5 h-5" />
            </div>
            <div className="hidden md:flex items-center gap-1 text-sm text-gray-600 font-medium">
              <span>{userEmail}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </button>

          {/* Dropdown Menu */}
          <div
            className={cn(
              "absolute lg:left-10 right-0 top-14 w-48 pt-2 transition-all duration-200 z-50",
              isDropdownOpen
                ? "opacity-100 visible translate-y-0"
                : "opacity-0 invisible -translate-y-2",
            )}
          >
            <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-1">
              <div className="px-4 py-2 border-b border-gray-50 md:hidden">
                <p className="text-sm font-medium text-gray-700">{userEmail}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-secondary/30 rounded-md cursor-pointer flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
