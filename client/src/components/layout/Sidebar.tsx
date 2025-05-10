import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Settings,
  LogOut,
  Building2,
  GraduationCap,
  FileText,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../../lib/utils";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import api from "../../api";

interface SidebarItem {
  icon: any;
  label: string;
  href: string;
}

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const sidebarItems: Record<string, SidebarItem[]> = {
    student: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/student/dashboard" },
      { icon: Briefcase, label: "Jobs", href: "/student/jobs" },
      { icon: MessageSquare, label: "Interviews", href: "/student/interviews" },
      { icon: FileText, label: "Applications", href: "/student/applications" },
      { icon: GraduationCap, label: "Profile", href: "/student/profile" },
    ],
    company: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        href: `/company/${user?.id}/dashboard`,
      },
      { icon: Briefcase, label: "Post Job", href: `/company/post-job/${user?.id}` },
      {
        icon: FileText,
        label: "Job postings",
        href: `/jobs/company/${user?.id}`,
      },
      {
        icon: Users,
        label: "Candidates Result",
        href: `/company/candidatesresults/${user?.id}`,
      },
      {
        icon: Building2,
        label: "Profile",
        href: `/company/profile/${user?.id}`,
      },
    ],
    admin: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
      { icon: Users, label: "Users", href: "/admin/users" },
      { icon: Building2, label: "Companies", href: "/admin/companies" },
      { icon: Briefcase, label: "Jobs", href: "/admin/jobs" },
      { icon: Settings, label: "Settings", href: "/admin/settings" },
    ],
  };

  const items = user ? sidebarItems[user.role] : [];

  const handleLogout = () => {
    api
      .post("/api/auth/logout/")
      .then(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/");
      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
  };
  const getMenuSections = () => {
    const mainItems = items.slice(0, 1);
    const midItems = items.slice(1, -1);
    const profileItems = items.slice(-1);
    return { mainItems, midItems, profileItems };
  };

  const { mainItems, midItems, profileItems } = getMenuSections();

  return (
    <div
      className={cn(
        "h-screen flex flex-col transition-all ease-in-out duration-300 relative",
        isCollapsed ? "w-20" : "w-64"
      )}
      style={{
        background: "linear-gradient(135deg, #2563eb, #1e40af)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      }}
    >
      {/* Logo and title section */}
      <div className="flex items-center justify-between p-4 border-b border-blue-600">
        <div className="flex items-center">
          <div className="bg-white rounded-lg p-2 shadow-md">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                fill="#2563eb"
                stroke="#2563eb"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="#2563eb"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="#2563eb"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {!isCollapsed && (
            <h2 className="ml-3 text-xl font-bold text-white">AI VIS</h2>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-blue-200 hover:text-white transition-colors"
        >
          <ChevronRight
            className={cn(
              "h-5 w-5 transition-transform",
              isCollapsed ? "rotate-180" : ""
            )}
          />
        </button>
      </div>

      {/* User info section */}
      {!isCollapsed && user && (
        <div className="px-4 py-3 bg-blue-800 bg-opacity-30">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-semibold">
              {user.name?.charAt(0) || user.role?.charAt(0) || "U"}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white truncate">
                {user.name || "User"}
              </p>
              <p className="text-xs text-blue-200 capitalize">
                {user.role || "User"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation sections */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-700 scrollbar-track-transparent">
        {/* Main section */}
        <div className="px-3 mb-2">
          {!isCollapsed && (
            <p className="px-4 text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2">
              Main
            </p>
          )}
          <ul>
            {mainItems.map((item) => (
              <SidebarMenuItem
                key={item.href}
                item={item}
                isActive={location.pathname === item.href}
                isCollapsed={isCollapsed}
                onClick={() => navigate(item.href)}
              />
            ))}
          </ul>
        </div>

        {/* Features section */}
        <div className="px-3 mb-2">
          {!isCollapsed && (
            <p className="px-4 text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2 mt-4">
              Features
            </p>
          )}
          <ul>
            {midItems.map((item) => (
              <SidebarMenuItem
                key={item.href}
                item={item}
                isActive={location.pathname === item.href}
                isCollapsed={isCollapsed}
                onClick={() => navigate(item.href)}
              />
            ))}
          </ul>
        </div>

        {/* Profile section */}
        <div className="px-3">
          {!isCollapsed && (
            <p className="px-4 text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2 mt-4">
              Account
            </p>
          )}
          <ul>
            {profileItems.map((item) => (
              <SidebarMenuItem
                key={item.href}
                item={item}
                isActive={location.pathname === item.href}
                isCollapsed={isCollapsed}
                onClick={() => navigate(item.href)}
              />
            ))}
          </ul>
        </div>
      </nav>

      {/* Logout section */}
      <div className="p-3 border-t border-blue-700">
        <motion.button
          whileHover={{ x: isCollapsed ? 0 : 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowLogoutDialog(true)}
          className={cn(
            "w-full flex items-center rounded-lg font-medium text-white hover:bg-blue-700",
            isCollapsed
              ? "justify-center py-3"
              : "space-x-3 px-4 py-2.5 text-sm"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Logout</span>}
        </motion.button>
      </div>

      {/* Logout confirmation dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Logout
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to log out of your account?
            </p>

            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowLogoutDialog(false)}
                variant="outline"
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Logout
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Sidebar menu item component
function SidebarMenuItem({
  item,
  isActive,
  isCollapsed,
  onClick,
}: {
  item: SidebarItem;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}) {
  return (
    <motion.li
      whileHover={{ x: isCollapsed ? 0 : 2 }}
      whileTap={{ scale: 0.98 }}
    >
      <button
        onClick={onClick}
        className={cn(
          "w-full flex items-center rounded-lg transition-colors mb-1",
          isCollapsed ? "justify-center py-3" : "space-x-3 px-4 py-2.5 text-sm",
          isActive
            ? "bg-blue-600 text-white font-medium shadow-md"
            : "text-blue-100 hover:bg-blue-700/50"
        )}
      >
        <item.icon className={cn("h-5 w-5", isActive ? "" : "text-blue-200")} />
        {!isCollapsed && <span>{item.label}</span>}
      </button>
    </motion.li>
  );
}
