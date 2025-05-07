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










// src/pages/company/CompanyDashboard.tsx

// import { motion } from "framer-motion";
// import { Users, Briefcase, MessageSquare, TrendingUp, Bell, Search, Settings } from "lucide-react";
// import { DashboardLayout } from "../../components/layout/DashboardLayout";
// import { Card } from "../../components/ui/Card";
// import { Button } from "../../components/ui/Button";
// import { useNavigate } from "react-router-dom";

// export function CompanyDashboard() {
//   const navigate = useNavigate();

//   const stats = [
//     { label: "Total Applications", value: "156", icon: Users, change: "+12%", color: "bg-indigo-600" },
//     { label: "Active Jobs", value: "23", icon: Briefcase, change: "+5%", color: "bg-emerald-600" },
//     { label: "Interviews Today", value: "8", icon: MessageSquare, change: "+2", color: "bg-violet-600" },
//     { label: "Hiring Rate", value: "68%", icon: TrendingUp, change: "+3%", color: "bg-amber-500" },
//   ];

//   const recentApplications = [
//     { id: "1", name: "John Doe", position: "Senior Frontend Developer", status: "Pending Review", date: "2h ago", avatar: "/api/placeholder/40/40" },
//     { id: "2", name: "Jane Smith", position: "UX Designer", status: "Interview Scheduled", date: "5h ago", avatar: "/api/placeholder/40/40" },
//     { id: "3", name: "Mike Johnson", position: "Backend Developer", status: "Under Consideration", date: "1d ago", avatar: "/api/placeholder/40/40" },
//   ];

//   const fadeIn = {
//     hidden: { opacity: 0, y: 20 },
//     visible: (i: number) => ({
//       opacity: 1,
//       y: 0,
//       transition: {
//         delay: i * 0.1,
//         duration: 0.5,
//         ease: "easeOut"
//       }
//     })
//   };

//   return (
//     <DashboardLayout>
//       {/* Enhanced Header with better styling and profile/notification features */}
//       <header className="fixed top-0 left-64 right-0 bg-gradient-to-r from-gray-900 to-black border-b border-gray-800 py-4 px-6 z-10 shadow-lg">
//         <div className="max-w-7xl mx-auto flex justify-between items-center">
//           <div className="flex items-center">
//             <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 tracking-wide mr-8">
//               AI VIS
//             </h1>
            
//             <div className="hidden md:flex relative ml-6">
//               <input
//                 type="text"
//                 placeholder="Search..."
//                 className="bg-gray-800 text-gray-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 w-64"
//               />
//               <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
//             </div>
//           </div>
          
//           <div className="flex items-center space-x-4">
//             <Button
//               variant="outline"
//               size="sm"
//               className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-gray-900 transition-all"
//               onClick={() => navigate("/company/post-job")}
//             >
//               <Briefcase className="w-4 h-4 mr-2" />
//               Post New Job
//             </Button>
            
//             <div className="relative">
//               <button className="text-gray-300 hover:text-yellow-400 transition-colors">
//                 <Bell className="w-5 h-5" />
//                 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
//                   3
//                 </span>
//               </button>
//             </div>
            
//             <div className="flex items-center">
//               <img
//                 src="/api/placeholder/40/40" 
//                 alt="Company Profile"
//                 className="w-8 h-8 rounded-full border-2 border-yellow-400"
//               />
//               <div className="ml-2 hidden md:block">
//                 <p className="text-sm font-medium text-gray-200">Tech Corp</p>
//                 <p className="text-xs text-gray-400">Administrator</p>
//               </div>
//             </div>
            
//             <button className="text-gray-300 hover:text-yellow-400 transition-colors">
//               <Settings className="w-5 h-5" />
//             </button>
//           </div>
//         </div>
//       </header>

//       <main
//         className="pt-24 p-6 md:p-8 min-h-screen bg-cover bg-fixed bg-center mt-16"
//         style={{
//           backgroundImage:
//             "linear-gradient(to bottom, rgba(17, 24, 39, 0.9), rgba(17, 24, 39, 0.95)), url('https://t4.ftcdn.net/jpg/04/91/04/57/360_F_491045782_57jOG41DcPq4BxRwYqzLrhsddudrq2MM.jpg')",
//           backgroundColor: "#111827",
//         }}
//       >
//         <div className="max-w-7xl mx-auto">
//           {/* Welcome Section */}
//           <motion.div 
//             className="mb-8"
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 shadow-xl">
//               <div className="p-6">
//                 <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
//                   Welcome back, Tech Corp!
//                 </h2>
//                 <p className="text-gray-300 mt-2">
//                   Here's what's happening with your recruitment pipeline today.
//                 </p>
//               </div>
//             </Card>
//           </motion.div>

//           {/* Stats Cards with enhanced styling */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             {stats.map((stat, i) => (
//               <motion.div
//                 key={stat.label}
//                 custom={i}
//                 initial="hidden"
//                 animate="visible"
//                 variants={fadeIn}
//               >
//                 <Card className="overflow-hidden bg-gray-800 border border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
//                   <div className="p-6">
//                     <div className="flex justify-between items-center">
//                       <div>
//                         <p className="text-sm font-medium text-gray-400">{stat.label}</p>
//                         <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
//                       </div>
//                       <div className={`${stat.color} p-3 rounded-xl shadow-lg`}>
//                         <stat.icon className="w-6 h-6 text-white" />
//                       </div>
//                     </div>
//                     <div className="mt-4 flex items-center text-sm">
//                       <span className="text-green-400 font-medium">{stat.change}</span>
//                       <span className="text-gray-400 ml-2">from last month</span>
//                     </div>
//                   </div>
//                 </Card>
//               </motion.div>
//             ))}
//           </div>

//           {/* Recent Applications Card with enhanced styling */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.4, duration: 0.5 }}
//           >
//             <Card className="bg-gray-800 border border-gray-700 shadow-xl overflow-hidden">
//               <div className="p-6">
//                 <div className="flex justify-between items-center mb-6">
//                   <h3 className="text-xl font-bold text-white">
//                     Recent Applications
//                   </h3>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className="text-yellow-400 hover:text-yellow-300"
//                     onClick={() => navigate("/company/applications")}
//                   >
//                     View All
//                   </Button>
//                 </div>
//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead>
//                       <tr className="text-left border-b border-gray-700">
//                         <th className="pb-3 text-sm font-medium text-gray-400">Candidate</th>
//                         <th className="pb-3 text-sm font-medium text-gray-400">Position</th>
//                         <th className="pb-3 text-sm font-medium text-gray-400">Status</th>
//                         <th className="pb-3 text-sm font-medium text-gray-400">Applied</th>
//                         <th className="pb-3 text-sm font-medium text-gray-400">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-700">
//                       {recentApplications.map((app) => (
//                         <tr key={app.id} className="hover:bg-gray-700 transition-colors">
//                           <td className="py-4">
//                             <div className="flex items-center">
//                               <img
//                                 src={app.avatar}
//                                 alt={app.name}
//                                 className="w-8 h-8 rounded-full mr-3"
//                               />
//                               <span className="font-medium text-white">{app.name}</span>
//                             </div>
//                           </td>
//                           <td className="py-4 text-gray-300">{app.position}</td>
//                           <td className="py-4">
//                             <span className={`
//                               inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
//                               ${app.status === "Interview Scheduled" 
//                                 ? "bg-green-900 text-green-300" 
//                                 : app.status === "Pending Review" 
//                                   ? "bg-yellow-900 text-yellow-300"
//                                   : "bg-blue-900 text-blue-300"
//                               }
//                             `}>
//                               {app.status}
//                             </span>
//                           </td>
//                           <td className="py-4 text-gray-400">{app.date}</td>
//                           <td className="py-4">
//                             <div className="flex space-x-2">
//                               <button className="text-yellow-400 hover:text-yellow-300 transition-colors">
//                                 <MessageSquare className="w-4 h-4" />
//                               </button>
//                               <button className="text-blue-400 hover:text-blue-300 transition-colors">
//                                 <Users className="w-4 h-4" />
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </Card>
//           </motion.div>
          
//           {/* Quick Actions Section */}
//           <motion.div
//             className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.6, duration: 0.5 }}
//           >
//             {/* Upcoming Interviews */}
//             <Card className="bg-gray-800 border border-gray-700 shadow-lg overflow-hidden">
//               <div className="p-6">
//                 <h3 className="text-xl font-bold text-white mb-4">
//                   Upcoming Interviews
//                 </h3>
//                 <ul className="space-y-3">
//                   <li className="bg-gray-700 rounded-lg p-3">
//                     <div className="flex justify-between">
//                       <p className="font-medium text-white">Jane Smith</p>
//                       <p className="text-yellow-400 text-sm">Today, 2:00 PM</p>
//                     </div>
//                     <p className="text-gray-300 text-sm">UX Designer - Technical Interview</p>
//                   </li>
//                   <li className="bg-gray-700 rounded-lg p-3">
//                     <div className="flex justify-between">
//                       <p className="font-medium text-white">Alex Wong</p>
//                       <p className="text-yellow-400 text-sm">Today, 4:30 PM</p>
//                     </div>
//                     <p className="text-gray-300 text-sm">DevOps Engineer - First Round</p>
//                   </li>
//                 </ul>
//                 <Button
//                   variant="ghost"
//                   className="w-full mt-4 text-yellow-400 hover:text-yellow-300 hover:bg-gray-700"
//                   onClick={() => navigate("/company/schedule")}
//                 >
//                   View Full Schedule
//                 </Button>
//               </div>
//             </Card>
            
//             {/* Quick Actions */}
//             <Card className="bg-gray-800 border border-gray-700 shadow-lg overflow-hidden">
//               <div className="p-6">
//                 <h3 className="text-xl font-bold text-white mb-4">
//                   Quick Actions
//                 </h3>
//                 <div className="grid grid-cols-2 gap-3">
//                   <Button 
//                     className="bg-indigo-600 hover:bg-indigo-700 text-white"
//                     onClick={() => navigate("/company/post-job")}
//                   >
//                     <Briefcase className="w-4 h-4 mr-2" />
//                     Post Job
//                   </Button>
//                   <Button 
//                     className="bg-violet-600 hover:bg-violet-700 text-white"
//                     onClick={() => navigate("/company/candidates")}
//                   >
//                     <Users className="w-4 h-4 mr-2" />
//                     Search Candidates
//                   </Button>
//                   <Button 
//                     className="bg-emerald-600 hover:bg-emerald-700 text-white"
//                     onClick={() => navigate("/company/interviews")}
//                   >
//                     <MessageSquare className="w-4 h-4 mr-2" />
//                     Schedule Interview
//                   </Button>
//                   <Button 
//                     className="bg-amber-500 hover:bg-amber-600 text-white"
//                     onClick={() => navigate("/company/reports")}
//                   >
//                     <TrendingUp className="w-4 h-4 mr-2" />
//                     View Reports
//                   </Button>
//                 </div>
//               </div>
//             </Card>
//           </motion.div>
//         </div>
//       </main>
//     </DashboardLayout>
//   );
// }