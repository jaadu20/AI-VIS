import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Building2,
  Clock,
  MapPin,
  Search,
  User,
  DollarSign,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Skeleton } from "../../components/ui/Skeleton";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  postedDate: string;
  description: string;
  salaryRange?: string;
  requirements?: string[];
}

const mockJobs: Job[] = [
  {
    id: "1",
    title: "Senior React Developer",
    company: "Tech Innovators",
    location: "New York, NY",
    type: "Full-time",
    postedDate: "1d ago",
    description:
      "Join our team of expert developers working on cutting-edge web applications...",
    salaryRange: "$120k - $150k",
    requirements: [
      "5+ years React experience",
      "TypeScript proficiency",
      "REST APIs",
    ],
  },
  {
    id: "2",
    title: "UX Designer",
    company: "Digital Creations",
    location: "Remote",
    type: "Contract",
    postedDate: "3h ago",
    description: "Seeking a talented designer to revamp our user interfaces...",
    salaryRange: "$80 - $120/hr",
    requirements: ["Figma expertise", "User research", "Prototyping"],
  },
];

export function CandidateDashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const useMockData = true;
        if (useMockData) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          setJobs(mockJobs);
        } else {
          const response = await axios.get("/api/jobs");
          setJobs(response.data);
        }
      } catch (err) {
        setError("Failed to fetch jobs. Showing mock data...");
        setJobs(mockJobs);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApplyNow = (jobId: string) => {
    navigate(`/jobs/${jobId}/apply`);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-red-500 text-lg text-center">
          {error}
          <Button onClick={() => window.location.reload()} className="mt-4">
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
              onClick={() => navigate("/profile")}
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
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 truncate">
                        {job.title}
                      </h2>
                      <div className="flex items-center mt-1">
                        <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-gray-600">{job.company}</span>
                      </div>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                      {job.type}
                    </span>
                  </div>

                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span>Posted {job.postedDate}</span>
                    </div>
                    {job.salaryRange && (
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 flex-shrink-0" />
                        <span>{job.salaryRange}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 line-clamp-3">
                    {job.description}
                  </p>

                  {job.requirements && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        Requirements:
                      </h3>
                      <ul className="list-disc list-inside space-y-1">
                        {job.requirements.map((req, index) => (
                          <li key={index} className="text-gray-600 text-sm">
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-4">
                    <Button
                      onClick={() => handleApplyNow(job.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
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
