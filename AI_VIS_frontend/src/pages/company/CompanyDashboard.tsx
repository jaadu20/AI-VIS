import { motion } from "framer-motion";
import { Users, Briefcase, MessageSquare, TrendingUp } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";

export function CompanyDashboard() {
  const navigate = useNavigate();
  const stats = [
    {
      label: "Total Applications",
      value: "156",
      icon: Users,
      change: "+12%",
      color: "bg-blue-500",
    },
    {
      label: "Active Jobs",
      value: "23",
      icon: Briefcase,
      change: "+5%",
      color: "bg-green-500",
    },
    {
      label: "Interviews Today",
      value: "8",
      icon: MessageSquare,
      change: "+2",
      color: "bg-purple-500",
    },
    {
      label: "Hiring Rate",
      value: "68%",
      icon: TrendingUp,
      change: "+3%",
      color: "bg-yellow-500",
    },
  ];

  const recentApplications = [
    {
      id: "1",
      name: "John Doe",
      position: "Senior Frontend Developer",
      status: "Pending Review",
      date: "2h ago",
    },
    {
      id: "2",
      name: "Jane Smith",
      position: "UX Designer",
      status: "Interview Scheduled",
      date: "5h ago",
    },
    {
      id: "3",
      name: "Mike Johnson",
      position: "Backend Developer",
      status: "Under Consideration",
      date: "1d ago",
    },
  ];

  return (
    <DashboardLayout>
      <div
        className="p-8 min-h-screen"
        style={{
          backgroundImage:
            "url('https://t4.ftcdn.net/jpg/04/91/04/57/360_F_491045782_57jOG41DcPq4BxRwYqzLrhsddudrq2MM.jpg')",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-400">Dashboard</h1>
          <Button onClick={() => navigate("/company/post-job")}>
            Post New Job
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-500 font-medium">
                    {stat.change}
                  </span>
                  <span className="text-gray-600 ml-2">from last month</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Applications
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm font-medium text-gray-500">
                  <th className="pb-4">Candidate</th>
                  <th className="pb-4">Position</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentApplications.map((application) => (
                  <tr key={application.id}>
                    <td className="py-4">
                      <div className="font-medium text-gray-900">
                        {application.name}
                      </div>
                    </td>
                    <td className="py-4 text-gray-600">
                      {application.position}
                    </td>
                    <td className="py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {application.status}
                      </span>
                    </td>
                    <td className="py-4 text-gray-600">{application.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
