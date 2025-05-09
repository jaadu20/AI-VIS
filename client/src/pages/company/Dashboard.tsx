// src/pages/company/CompanyDashboard.tsx

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Briefcase,
  MessageSquare,
  TrendingUp,
  Search,
  Bell,
  ChevronDown,
  Filter,
  Calendar,
  Download,
  Plus,
  MoreHorizontal,
  Video,
  Building2,
  PieChart,
  FileText,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart,
} from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function CompanyDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Sample data
  const stats = [
    {
      label: "Total Applications",
      value: "156",
      icon: Users,
      change: "+12%",
      color: "bg-blue-600",
      trend: "up",
    },
    {
      label: "Active Jobs",
      value: "23",
      icon: Briefcase,
      change: "+5%",
      color: "bg-green-500",
      trend: "up",
    },
    {
      label: "Interviews Scheduled",
      value: "8",
      icon: MessageSquare,
      change: "+2",
      color: "bg-purple-500",
      trend: "up",
    },
    {
      label: "Hiring Rate",
      value: "68%",
      icon: TrendingUp,
      change: "+3%",
      color: "bg-yellow-500",
      trend: "up",
    },
  ];

  const recentApplications = [
    {
      id: "1",
      name: "John Doe",
      position: "Senior Frontend Developer",
      status: "Pending Review",
      date: "2h ago",
      avatar: "JD",
      skills: ["React", "TypeScript", "Tailwind CSS"],
      match: "92%",
    },
    {
      id: "2",
      name: "Jane Smith",
      position: "UX Designer",
      status: "Interview Scheduled",
      date: "5h ago",
      avatar: "JS",
      skills: ["Figma", "User Research", "Prototyping"],
      match: "88%",
    },
    {
      id: "3",
      name: "Mike Johnson",
      position: "Backend Developer",
      status: "Under Consideration",
      date: "1d ago",
      avatar: "MJ",
      skills: ["Node.js", "Express", "MongoDB"],
      match: "85%",
    },
    {
      id: "4",
      name: "Sarah Williams",
      position: "Product Manager",
      status: "Offer Sent",
      date: "2d ago",
      avatar: "SW",
      skills: ["Agile", "Roadmapping", "User Stories"],
      match: "95%",
    },
    {
      id: "5",
      name: "David Brown",
      position: "Data Scientist",
      status: "Technical Assessment",
      date: "3d ago",
      avatar: "DB",
      skills: ["Python", "ML", "Data Analysis"],
      match: "89%",
    },
  ];

  const activeJobs = [
    {
      id: "1",
      title: "Senior Frontend Developer",
      applications: 45,
      deadline: "May 20, 2025",
      department: "Engineering",
      location: "Remote",
      posted: "May 1, 2025",
    },
    {
      id: "2",
      title: "UX Designer",
      applications: 32,
      deadline: "May 25, 2025",
      department: "Design",
      location: "New York, NY",
      posted: "May 3, 2025",
    },
    {
      id: "3",
      title: "Backend Engineer",
      applications: 28,
      deadline: "May 18, 2025",
      department: "Engineering",
      location: "Hybrid",
      posted: "May 2, 2025",
    },
  ];

  const todayInterviews = [
    {
      id: "1",
      name: "Jane Smith",
      position: "UX Designer",
      time: "10:30 AM - 11:15 AM",
      type: "Video Call",
      status: "Upcoming",
    },
    {
      id: "2",
      name: "Mike Johnson",
      position: "Backend Developer",
      time: "2:00 PM - 2:45 PM",
      type: "In-Person",
      status: "Upcoming",
    },
    {
      id: "3",
      name: "David Brown",
      position: "Data Scientist",
      time: "9:00 AM - 9:45 AM",
      type: "Video Call",
      status: "Completed",
    },
  ];

  // const dashboardTabs = [
  //   { id: "overview", label: "Overview" },
  //   { id: "applications", label: "Applications" },
  //   { id: "jobs", label: "Jobs" },
  //   { id: "interviews", label: "Interviews" },
  //   { id: "reports", label: "Reports" }
  // ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending Review":
        return "bg-yellow-100 text-yellow-800";
      case "Interview Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Under Consideration":
        return "bg-purple-100 text-purple-800";
      case "Offer Sent":
        return "bg-green-100 text-green-800";
      case "Technical Assessment":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderInterviewIcon = (type) => {
    if (type === "Video Call") {
      return <Video className="w-5 h-5 text-blue-500" />;
    }
    return <Users className="w-5 h-5 text-green-500" />;
  };

  const renderInterviewStatus = (status) => {
    if (status === "Completed") {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
    return <Clock className="w-4 h-4 text-blue-500" />;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="h-screen w-full flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="sticky top-0 bg-white/95 backdrop-blur-md py-4 z-10 border-b border-gray-100 shadow-sm"
      >
        <div className="px-6 max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
              />
            </div>

            <button className="p-2 rounded-full hover:bg-gray-100 relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-2 ml-4 cursor-pointer">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {user?.name?.charAt(0) || "C"}
              </div>
              <span className="text-sm font-medium hidden md:block">
                {user?.name || "Company"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
            </div>
          </div>
        </div>
      </motion.header>

      <main className="py-6 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Welcome Banner */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="px-8 py-8 md:py-10 md:flex md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    Welcome back, {user?.name || "Company"}!
                  </h2>
                  <p className="text-blue-100 mt-2 max-w-xl">
                    Your recruitment dashboard is showing positive trends. You
                    have 8 interviews scheduled today and 156 new applications
                    this week.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="text-white border-white/30 hover:bg-white/10 hover:border-white"
                    onClick={() => navigate("/company/reports")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button
                    className="bg-white text-blue-600 hover:bg-blue-50"
                    onClick={() => navigate("/company/post-job")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Post New Job
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`${stat.color} p-3 rounded-lg`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      <span
                        className={`font-medium ${
                          stat.trend === "up"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-gray-500 ml-2">
                        from last month
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Applications */}
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              className="lg:col-span-2"
            >
              <Card className="border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Recent Applications
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-blue-600"
                    >
                      <Filter className="w-4 h-4 mr-1" />
                      Filter
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:bg-blue-50"
                      onClick={() =>
                        navigate(`/company/${user?.id}/applications`)
                      }
                    >
                      View All
                    </Button>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {recentApplications.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 hover:bg-blue-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/company/application/${app.id}`)}
                    >
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-medium mr-4 shadow-sm">
                          {app.avatar}
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between">
                            <h4 className="font-medium text-gray-900">
                              {app.name}
                            </h4>
                            <div className="flex items-center">
                              <span className="text-sm text-gray-500 mr-3">
                                {app.date}
                              </span>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  app.status
                                )}`}
                              >
                                {app.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between mt-1">
                            <p className="text-sm text-gray-600">
                              {app.position}
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              {app.match} Match
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {app.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-4 bg-gray-50 flex justify-center">
                  <Button
                    variant="link"
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                    onClick={() =>
                      navigate(`/company/${user?.id}/applications`)
                    }
                  >
                    View All Applications
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>

              {/* Additional Card - Analytics Overview */}
              <motion.div
                variants={fadeInUp}
                transition={{ delay: 0.3 }}
                className="mt-8"
              >
                <Card className="border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center">
                      <BarChart className="w-5 h-5 text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Recruitment Analytics
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      <select className="text-sm border border-gray-200 rounded-md px-2 py-1">
                        <option>Last 30 days</option>
                        <option>Last 90 days</option>
                        <option>This year</option>
                      </select>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex flex-col">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Time to Hire
                        </h4>
                        <div className="flex items-end">
                          <span className="text-2xl font-semibold text-gray-900">
                            18
                          </span>
                          <span className="text-gray-600 ml-1">days</span>
                        </div>
                        <span className="text-xs text-green-500 mt-1">
                          ↓ 2 days from last month
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Application Completion
                        </h4>
                        <div className="flex items-end">
                          <span className="text-2xl font-semibold text-gray-900">
                            82%
                          </span>
                        </div>
                        <span className="text-xs text-green-500 mt-1">
                          ↑ 5% from last month
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Interview Success
                        </h4>
                        <div className="flex items-end">
                          <span className="text-2xl font-semibold text-gray-900">
                            68%
                          </span>
                        </div>
                        <span className="text-xs text-green-500 mt-1">
                          ↑ 7% from last month
                        </span>
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-500 mb-3">
                        Application Sources
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Company Website</span>
                            <span className="font-medium">45%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: "45%" }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>LinkedIn</span>
                            <span className="font-medium">28%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: "28%" }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Indeed</span>
                            <span className="font-medium">17%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: "17%" }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Referrals</span>
                            <span className="font-medium">10%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: "10%" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-3 bg-gray-50 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:bg-blue-50"
                      onClick={() => navigate("/company/analytics")}
                    >
                      View Detailed Analytics
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </motion.div>

            {/* Right Column */}
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              {/* Active Jobs */}
              <Card className="border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center">
                    <Briefcase className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Active Job Listings
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:bg-blue-50"
                    onClick={() => navigate(`/jobs/company/${user?.id}`)}
                  >
                    View All
                  </Button>
                </div>
                <div className="divide-y divide-gray-100">
                  {activeJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-4 hover:bg-blue-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/company/job/${job.id}`)}
                    >
                      <div className="flex justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {job.title}
                        </h4>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center text-gray-600">
                          <Building2 className="w-4 h-4 mr-1" />
                          {job.department}
                        </div>
                        <span className="inline-flex items-center text-blue-600">
                          <Users className="w-4 h-4 mr-1" />
                          {job.applications} applicants
                        </span>
                      </div>
                      <div className="flex justify-between mt-3">
                        <div className="flex text-xs text-gray-500 items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>Deadline: {job.deadline}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Posted: {job.posted}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-4 bg-gray-50 text-center">
                  <Button
                    variant="link"
                    className="text-blue-600 hover:text-blue-800 flex items-center justify-center"
                    onClick={() => navigate("/company/post-job")}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Post New Job
                  </Button>
                </div>
              </Card>

              {/* Upcoming Interviews Card */}
              <Card className="border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center">
                    <MessageSquare className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Today's Interviews
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:bg-blue-50"
                    onClick={() => navigate("/company/interviews")}
                  >
                    Calendar
                  </Button>
                </div>
                <div className="divide-y divide-gray-100">
                  {todayInterviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="p-4 hover:bg-blue-50 transition-colors cursor-pointer"
                      onClick={() =>
                        navigate(`/company/interview/${interview.id}`)
                      }
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          {renderInterviewIcon(interview.type)}
                          <div className="ml-3">
                            <h4 className="font-medium text-gray-900">
                              {interview.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {interview.position}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {renderInterviewStatus(interview.status)}
                          <span className="text-xs ml-1 text-gray-500">
                            {interview.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {interview.time}
                        </span>
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                          {interview.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-blue-600">
                      Next interview in 45 minutes
                    </p>
                    <p className="text-xs text-blue-500">
                      Jane Smith - UX Designer
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-600 hover:bg-blue-200 hover:border-blue-400"
                  >
                    Join
                  </Button>
                </div>
              </Card>
              {/* Quick Actions Card */}
              <Card className="border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Quick Actions
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="h-auto p-4 text-left hover:bg-blue-50 border-blue-100"
                      onClick={() => navigate("/company/post-job")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Plus className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Post New Job
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Create a new job listing
                          </p>
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto p-4 text-left hover:bg-green-50 border-green-100"
                      onClick={() => navigate("/company/reports")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Generate Report
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Export recruitment analytics
                          </p>
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto p-4 text-left hover:bg-purple-50 border-purple-100"
                      onClick={() => navigate("/company/interviews/schedule")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Schedule Interview
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Set up a new interview
                          </p>
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto p-4 text-left hover:bg-orange-50 border-orange-100"
                      onClick={() => navigate("/company/templates")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Briefcase className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Job Templates
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Use pre-made templates
                          </p>
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                  <p className="text-sm text-gray-600">
                    Need help?{" "}
                    <button
                      onClick={() => navigate("/company/support")}
                      className="text-blue-600 hover:underline"
                    >
                      Contact support
                    </button>
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
