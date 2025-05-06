// src/pages/company/CompanyDashboard.tsx

import { motion } from "framer-motion";
import { Users, Briefcase, MessageSquare, TrendingUp } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";

export function CompanyDashboard() {
  const navigate = useNavigate();

  const stats = [
    { label: "Total Applications", value: "156", icon: Users, change: "+12%", color: "bg-blue-500" },
    { label: "Active Jobs",       value: "23",  icon: Briefcase, change: "+5%",  color: "bg-green-500" },
    { label: "Interviews Today",   value: "8",   icon: MessageSquare, change: "+2",   color: "bg-purple-500" },
    { label: "Hiring Rate",        value: "68%", icon: TrendingUp, change: "+3%",  color: "bg-yellow-500" },
  ];

  const recentApplications = [
    { id: "1", name: "John Doe",      position: "Senior Frontend Developer", status: "Pending Review",      date: "2h ago" },
    { id: "2", name: "Jane Smith",    position: "UX Designer",                status: "Interview Scheduled", date: "5h ago" },
    { id: "3", name: "Mike Johnson",  position: "Backend Developer",         status: "Under Consideration", date: "1d ago" },
  ];

  return (
    <DashboardLayout>
      <header
        className="top-0 left-64 w-full bg-black bg-opacity-80 py-3 z-10 shadow-md"
      >
        <div className="max-w-7xl mx-auto px-4 flex justify-center">
          <h1 className="text-3xl font-extrabold text-yellow-300 tracking-wide">
            AI VIS
          </h1>
        </div>
      </header>

      <main
        className=" p-6 md:p-8 min-h-screen bg-cover bg-fixed bg-center"
        style={{
          backgroundImage:
            "url('https://t4.ftcdn.net/jpg/04/91/04/57/360_F_491045782_57jOG41DcPq4BxRwYqzLrhsddudrq2MM.jpg')",
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-yellow-400 mb-4 md:mb-0">
            Dashboard
          </h2>
          <Button onClick={() => navigate("/company/post-job")}>
            Post New Job
          </Button>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="overflow-hidden">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-500 font-medium">{stat.change}</span>
                  <span className="text-gray-600 ml-2">from last month</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto">
          <Card>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Recent Applications
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm font-medium text-gray-500">
                    <th className="pb-3">Candidate</th>
                    <th className="pb-3">Position</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Applied</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentApplications.map((app) => (
                    <tr key={app.id}>
                      <td className="py-3 font-medium text-gray-900">{app.name}</td>
                      <td className="py-3 text-gray-600">{app.position}</td>
                      <td className="py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3 text-gray-600">{app.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
    </DashboardLayout>
  );
}
