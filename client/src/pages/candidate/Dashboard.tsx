import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Building2,
  Clock,
  MapPin,
  Search,
  User,
  // DollarSign,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Skeleton } from "../../components/ui/Skeleton";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import api from "../../api";
import { toast } from "react-hot-toast";

interface Job {
  id: string;
  title: string;
  location: string;
  employment_type: string;
  salary: string;
  description: string;
  requirements: string;
  created_at: string;
  company_name: string;
}

export function CandidateDashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
        requirements: job.requirements?.split("\n").filter(Boolean) || [],
        company_name: job.company_name || "Company",
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

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatEmploymentType = (type: string) => {
    return type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const handleApplyNow = (jobId: string) => {
    navigate(`/jobs/${jobId}/apply`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-blue-600 mr-2" />
                <span className="text-xl font-bold text-gray-900">
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

              <Button
                variant="ghost"
                className="flex items-center space-x-2"
                onClick={() => navigate("/candidate/profile")}
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </div>
          </div>
        </nav>
        <div className="text-red-500 text-lg text-center">
          {error}
          <Button onClick={fetchJobs} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">
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

            <Button
              variant="ghost"
              className="flex items-center space-x-2"
              onClick={() => navigate("/candidate/profile")}
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md overflow-hidden"
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
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col h-92"
              >
                <div className="p-6 space-y-4 flex flex-col h-full">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-gray-900 truncate">
                        {job.title}
                      </h2>
                      <div className="flex items-center mt-1 space-x-2">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-600 truncate">
                          {job.company_name}
                        </span>
                      </div>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full capitalize shrink-0">
                      {formatEmploymentType(job.employment_type)}
                    </span>
                  </div>

                  <div className="space-y-2 text-gray-600 text-sm">
                    <div className="flex items-center truncate">
                      <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1.5 flex-shrink-0" />
                      <span className="text-xs">
                        {formatDistanceToNow(new Date(job.created_at))}
                      </span>
                    </div>
                    {job.salary && (
                      <div className="flex items-center truncate">
                        <span className="text-lg mr-2">💵</span>
                        {/* <DollarSign className="h-4 w-4 mr-1.5 flex-shrink-0" /> */}
                        <span className="text-sm font-medium truncate">
                          {job.salary}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 mb-4 overflow-hidden">
                    <h3 className="text-s font-medium text-gray-900 mb-1">
                      Description:
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-4">
                      {job.description}
                    </p>
                  </div>

                  {/* {job.requirements.length > 0 && (
                    <div className="mt-auto">
                      <div className="border-t pt-3">
                        <h3 className="text-xs font-medium text-gray-900 mb-1">
                          Key Requirements:
                        </h3>
                        <ul className="list-disc list-inside space-y-0.5">
                          {job.requirements
                            .slice(0, 2)
                            .map((req: string, index: number) => (
                              <li
                                key={index}
                                className="text-gray-600 text-xs line-clamp-1"
                              >
                                {req}
                              </li>
                            ))}
                          {job.requirements.length > 2 && (
                            <li className="text-gray-400 text-xs">
                              +{job.requirements.length - 2} more
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )} */}

                  <div className="pt-4 mt-auto">
                    <Button
                      onClick={() => handleApplyNow(job.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-sm py-2"
                    >
                      Apply Now
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-gray-900 text-lg font-medium">
              No jobs found matching "{searchQuery}"
            </h3>
            <p className="mt-1 text-gray-600">
              Try adjusting your search terms
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
