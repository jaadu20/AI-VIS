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
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../../lib/utils";

interface SidebarItem {
  icon: any;
  label: string;
  href: string;
}

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const sidebarItems: Record<string, SidebarItem[]> = {
    student: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/student/dashboard" },
      { icon: Briefcase, label: "Jobs", href: "/student/jobs" },
      { icon: MessageSquare, label: "Interviews", href: "/student/interviews" },
      { icon: FileText, label: "Applications", href: "/student/applications" },
      { icon: GraduationCap, label: "Profile", href: "/student/profile" },
    ],
    company: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/company/dashboard" },
      { icon: Briefcase, label: "Post Job", href: "/company/post-job" },
      {
        icon: Users,
        label: "Candidates Result",
        href: "/company/candidatesresults",
      },
      { icon: Building2, label: "Profile", href: "/company/profile" },
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
    logout();
    navigate("/");
  };

  return (
    <div
      className="h-screen w-64 flex flex-col"
      style={{
        background: "linear-gradient(to bottom,rgb(46, 54, 190), #2a4365)", // Gradient from purple to dark blue
        color: "#ffffff",
      }}
    >
      <div className="p-6">
        <h2 className="text-2xl font-bold">Recruiter</h2>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {items.map((item) => (
            <motion.li
              key={item.href}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={() => navigate(item.href)}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === item.href
                    ? "bg-blue-600 text-white"
                    : "text-white hover:bg-blue-700"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            </motion.li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-500">
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white hover:bg-blue-700"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </motion.button>
      </div>
    </div>
  );
}
