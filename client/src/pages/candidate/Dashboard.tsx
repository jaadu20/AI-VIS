import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Building2,
  Clock,
  MapPin,
  Search,
  User,
  DollarSign,
  CheckCircle,
  Bell,
  Settings,
  ChevronRight,
  Filter,
  Star,
  Calendar,
  Zap,
  AlertCircle,
  TrendingUp,
  Shield,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Skeleton } from "../../components/ui/Skeleton";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import api from "../../api";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";

interface Job {
  id: string;
  title: string;
  location: string;
  employment_type: string;
  salary: string;
  description: string;
  requirements: string[];
  created_at: string;
  company_name: string;
  match_percentage?: number;
}

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

// Categories for job filtering
const jobCategories = [
  "All Jobs",
  "Technology",
  "Finance",
  "Marketing",
  "Healthcare",
  "Education",
];

export function CandidateDashboard() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Jobs");
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for dashboard stats
  const dashboardStats = {
    applicationsSubmitted: 7,
    interviewsScheduled: 3,
    savedJobs: 12,
    profileViews: 24,
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      toast.error("Please login to access dashboard");
    } else if (user?.role !== "candidate") {
      navigate("/");
      toast.error("Unauthorized access");
    }
  }, [user, navigate]);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await api.get("/jobs/all/");

      const responseData = response.data.results || response.data;

      if (!responseData || !Array.isArray(responseData)) {
        throw new Error("Invalid response format");
      }

      const transformedJobs = responseData.map((job: any) => ({
        ...job,
        id: job.id.toString(),
        postedDate: formatDistanceToNow(new Date(job.created_at)),
        requirements: Array.isArray(job.requirements)
          ? job.requirements
          : job.requirements?.split("\n").filter(Boolean) || [],
        company_name: job.company_name || "Company",
        match_percentage: Math.floor(Math.random() * 51) + 50,
      }));

      setJobs(transformedJobs);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || err.message || "Failed to fetch jobs";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Memoize filtered jobs for better performance
  const filteredJobs = useMemo(() => {
    const searchQueryLower = searchQuery.toLowerCase();
    return jobs.filter(
      (job) =>
        (activeCategory === "All Jobs" ||
          job.employment_type.includes(activeCategory.toLowerCase())) &&
        (job.title.toLowerCase().includes(searchQueryLower) ||
          job.company_name.toLowerCase().includes(searchQueryLower) ||
          job.location.toLowerCase().includes(searchQueryLower))
    );
  }, [jobs, activeCategory, searchQuery]);

  const formatEmploymentType = (type: string) => {
    return type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const handleApplyNow = (jobId: string) => {
    navigate(`/jobs/${jobId}/apply`);
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-blue-600";
    return "text-orange-500";
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <nav className="fixed w-full bg-white/95 backdrop-blur-md py-4 z-50 shadow-md border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <div className="bg-white p-2 rounded-lg">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                  AI-VIS Jobs
                </span>
              </div>

              <div className="flex-1 max-w-2xl mx-8">
                <Input
                  leftIcon={<Search className="h-5 w-5" />}
                  placeholder="Search jobs by title, company, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
                >
                  <Bell className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2"
                  onClick={() => navigate(`/candidate/profile/${user?.id}`)}
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="pt-32 pb-16 px-4 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-lg mx-auto border border-red-100"
          >
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Error Loading Jobs
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button
              onClick={fetchJobs}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              Retry
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-x-hidden">
      {/* Fixed Header with glass effect */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="fixed w-full bg-white/95 backdrop-blur-md py-4 z-50 shadow-md border-b border-blue-100"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className=" p-2 rounded-lg">
                <Briefcase className="h-7 w-7 text-blue-600" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                AI-VIS Jobs
              </span>
            </div>

            <div className="flex-1 max-w-2xl mx-8">
              <Input
                leftIcon={<Search className="h-5 w-5" />}
                placeholder="Search jobs by title, company, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-blue-100 focus:border-blue-300 focus:ring-blue-200"
              />
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
              >
                <Bell className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
                onClick={() => navigate(`/candidate/profile/${user?.id}`)}
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200/50"
                onClick={() => navigate("/jobs/recommended")}
              >
                <Zap className="h-4 w-4 mr-2" />
                <span>Recommended</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      <main className="pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Your Dashboard
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  icon: Briefcase,
                  label: "Applications",
                  value: dashboardStats.applicationsSubmitted,
                  color: "blue",
                },
                {
                  icon: Calendar,
                  label: "Interviews",
                  value: dashboardStats.interviewsScheduled,
                  color: "green",
                },
                {
                  icon: Star,
                  label: "Saved Jobs",
                  value: dashboardStats.savedJobs,
                  color: "purple",
                },
                {
                  icon: TrendingUp,
                  label: "Profile Views",
                  value: dashboardStats.profileViews,
                  color: "orange",
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{
                    y: -5,
                    boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.15)",
                  }}
                  className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex items-center"
                >
                  <div className={`bg-${stat.color}-100 p-3 rounded-xl mr-4`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                  <div>
                    <h3 className="text-gray-500 text-sm">{stat.label}</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Category Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Explore Jobs</h2>
              <Button
                variant="outline"
                className="border-blue-200 text-blue-600 flex items-center space-x-1"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                <span>Filters</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
              {jobCategories.map((category, index) => (
                <motion.button
                  key={index}
                  // whileHover={{ y: -2 }}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap ${
                    activeCategory === category
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-blue-200"
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>

            {/* Advanced Filters Panel (hidden by default) */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-xl shadow-md p-6 mt-4 border border-blue-100"
              >
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salary Range
                    </label>
                    <div className="flex items-center gap-2">
                      <Input placeholder="Min" className="w-full" />
                      <span>-</span>
                      <Input placeholder="Max" className="w-full" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {["Entry", "Mid", "Senior", "Executive"].map((level) => (
                        <Button
                          key={level}
                          variant="outline"
                          className="text-sm py-1 px-3 border-gray-200"
                        >
                          {level}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Posted
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {["Today", "This Week", "This Month", "Any Time"].map(
                        (time) => (
                          <Button
                            key={time}
                            variant="outline"
                            className="text-sm py-1 px-3 border-gray-200"
                          >
                            {time}
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button className="bg-blue-600 text-white">
                    Apply Filters
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Results Section */}
          {isLoading ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {[...Array(6)].map((_, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-full space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>

                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>

                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-4 w-full" />
                      ))}
                    </div>

                    <div className="space-y-3 pt-4">
                      <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {filteredJobs.map((job) => (
                <motion.div
                  key={job.id}
                  variants={itemVariants}
                  whileHover={{
                    y: -8,
                    boxShadow:
                      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  }}
                  className="bg-white rounded-xl shadow-md border border-gray-100 hover:border-blue-200 transition-all duration-300 flex flex-col h-full overflow-hidden"
                >
                  <div className="p-6 space-y-4 flex flex-col h-full relative">
                    {/* Match indicator */}
                    {/* {job.match_percentage && (
                      <div className="absolute top-4 right-4">
                        <div className={`flex items-center ${getMatchColor(job.match_percentage)}`}>
                          <Shield className="h-4 w-4 mr-1" />
                          <span className="text-xs font-bold">{job.match_percentage}% Match</span>
                        </div>
                      </div>
                    )} */}

                    <div className="flex items-start pb-2">
                      <div className="bg-blue-100 p-3 rounded-xl mr-4">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-900 line-clamp-1">
                          {job.title}
                        </h2>
                        <div className="flex items-center mt-1 space-x-1">
                          <span className="text-sm text-gray-600 font-medium">
                            {job.company_name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full capitalize flex items-center">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {formatEmploymentType(job.employment_type)}
                      </span>
                      <span className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full capitalize flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {job.location}
                      </span>
                      <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full capitalize flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(job.created_at))}
                      </span>
                    </div>

                    {job.salary && (
                      <div className="flex items-center border-t border-b border-gray-100 py-3">
                        <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-gray-900 font-medium">
                          {job.salary}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 overflow-hidden">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Job Description
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {job.description}
                      </p>
                    </div>

                    {Array.isArray(job.requirements) &&
                      job.requirements.length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <CheckCircle className="h-4 w-4 text-blue-500 mr-1" />
                            Key Requirements
                          </h3>
                          <ul className="space-y-1">
                            {job.requirements
                              .slice(0, 2)
                              .map((req: string, index: number) => (
                                <li
                                  key={index}
                                  className="text-gray-600 text-sm flex items-start"
                                >
                                  <div className="h-5 w-5 flex items-center justify-center flex-shrink-0">
                                    <div className="h-1.5 w-1.5 bg-blue-500 rounded-full"></div>
                                  </div>
                                  <span className="line-clamp-1">{req}</span>
                                </li>
                              ))}
                            {job.requirements.length > 2 && (
                              <li className="text-blue-500 text-xs font-medium">
                                +{job.requirements.length - 2} more requirements
                              </li>
                            )}
                          </ul>
                        </div>
                      )}

                    <div className="pt-4 mt-auto flex gap-3">
                      <Button
                        onClick={() => handleApplyNow(job.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200/50"
                      >
                        Apply Now
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                      <Button
                        variant="outline"
                        className="p-2 border-blue-200 text-blue-600"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        <BookOpen className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {!isLoading && filteredJobs.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white rounded-2xl shadow-md border border-gray-100 my-8"
            >
              <Search className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-gray-900 text-xl font-medium">
                No jobs found matching "{searchQuery}"
              </h3>
              <p className="mt-2 text-gray-600 max-w-md mx-auto">
                Try adjusting your search terms or filters to find more
                opportunities
              </p>
              <Button
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All Jobs");
                }}
              >
                Clear Filters
              </Button>
            </motion.div>
          )}
        </div>
      </main>

      {/* Quick Action Fab */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-8 right-8"
      >
        <Button
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg flex items-center justify-center p-0"
          onClick={() => navigate("/jobs/saved")}
        >
          <Star className="h-6 w-6 text-white" />
        </Button>
      </motion.div>

      {/* Style for removing scrollbar but keeping functionality */}
      <style>{`
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;  /* Chrome, Safari and Opera */
        }
      `}</style>
    </div>
  );
}
