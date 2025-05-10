import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase,
  Edit,
  Trash,
  AlertTriangle,
  Building2,
  MapPin,
  Clock,
  Award,
  DollarSign,
  ArrowLeft,
  Search,
  Filter,
  CheckCircle,
  XCircle,
} from "lucide-react";
import api from "../../api";
import { Job } from "../../types";
import { EditJobModal } from "./EditJobModal";
import { useAuthStore } from "../../store/authStore";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { toast } from "react-hot-toast";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const DeleteConfirmationModal = ({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <Card className="p-6 max-w-md w-full mx-4 bg-white rounded-lg shadow-xl">
      <div className="flex flex-col items-center text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Delete Job Posting</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this job posting? This action cannot
          be undone.
        </p>
        <div className="flex gap-4 w-full">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            Delete Permanently
          </Button>
        </div>
      </div>
    </Card>
  </motion.div>
);

const JobStatusBadge = ({ status }: { status: string }) => {
  let badgeClass = "";
  let Icon = null;

  switch (status) {
    case "published":
      badgeClass = "bg-green-100 text-green-800";
      Icon = CheckCircle;
      break;
    case "draft":
      badgeClass = "bg-gray-100 text-gray-800";
      Icon = Clock;
      break;
    case "closed":
      badgeClass = "bg-red-100 text-red-800";
      Icon = XCircle;
      break;
    default:
      badgeClass = "bg-blue-100 text-blue-800";
      Icon = Briefcase;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${badgeClass}`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const CompanyJobList = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [deletingJobId, setDeletingJobId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchCompanyJobs = async () => {
      try {
        const response = await api.get(`/jobs/company/${user?.id}`);
        const responseData = response.data.results || response.data;
        setJobs(responseData);
        if (responseData.length > 0) {
          setCompanyName(responseData[0].company_name);
        }
      } catch (error) {
        console.error("Error fetching company jobs:", error);
        toast.error("Failed to load job postings");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyJobs();
  }, [companyId, user?.id]);

  const handleDelete = async (jobId: number) => {
    try {
      setIsDeleting(true);
      await api.delete(`/jobs/${jobId}/delete/`);
      setJobs(jobs.filter((job) => job.id !== jobId));
      toast.success("Job posting deleted successfully");
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed to delete job posting");
    } finally {
      setIsDeleting(false);
      setDeletingJobId(null);
    }
  };

  const handleUpdate = async (updatedJob: Job) => {
    try {
      await api.put(`/jobs/update/${updatedJob.id}/`, updatedJob);
      setJobs(jobs.map((job) => (job.id === updatedJob.id ? updatedJob : job)));
      setSelectedJob(null);
      toast.success("Job posting updated successfully");
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("Failed to update job posting");
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      job.status?.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesFilter;
  });

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
            <h1 className="text-xl font-bold text-gray-900">Job Postings</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="text-gray-500 border-gray-200 hover:bg-gray-50"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            {user?.id?.toString() === companyId && (
              <Button
                onClick={() => navigate("/company/post-job")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Post New Job
              </Button>
            )}
          </div>
        </div>
      </motion.header>

      <main className="py-6 px-6 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          {/* Banner */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="px-8 py-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  {companyName || user?.company_name || "Company"} Job Postings
                </h2>
                {/* <p className="text-blue-100 mt-2 max-w-xl">
                  Manage all your job listings in one place. Track applications, edit postings, or create new job opportunities.
                </p> */}

                {/* Stats row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-white/10 rounded-lg p-4">
                    <h3 className="text-white text-lg font-semibold">
                      Total Jobs
                    </h3>
                    <p className="text-3xl font-bold text-white">
                      {jobs.length}
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <h3 className="text-white text-lg font-semibold">Active</h3>
                    <p className="text-3xl font-bold text-white">
                      {jobs.length}
                      {/* filter(job => job.status === "published") */}
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <h3 className="text-white text-lg font-semibold">Drafts</h3>
                    <p className="text-3xl font-bold text-white">
                      {jobs.filter((job) => job.status === "draft").length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filter and Search */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Card className="p-4 border border-gray-100">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search jobs by title, department or location..."
                    className="pl-10 block w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <label htmlFor="filterStatus" className="sr-only">
                    Filter by status
                  </label>
                  <select
                    id="filterStatus"
                    className="rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Job Listings */}
          {loading ? (
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 bg-gray-100 rounded-lg" />
              ))}
            </motion.div>
          ) : filteredJobs.length === 0 ? (
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              className="text-center py-12"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Briefcase className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No job postings found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first job posting to attract top talent"}
              </p>
              {user?.id?.toString() === companyId && (
                <Button
                  onClick={() => navigate("/company/post-job")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Post New Job
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-6"
            >
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {job.title}
                            </h3>
                            <JobStatusBadge
                              status={job.status || "published"}
                            />
                          </div>

                          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                            {job.department && (
                              <span className="inline-flex items-center text-gray-600">
                                <Building2 className="w-4 h-4 mr-1 text-gray-400" />
                                {job.department}
                              </span>
                            )}

                            {job.location && (
                              <span className="inline-flex items-center text-gray-600">
                                <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                {job.location}
                              </span>
                            )}

                            {job.employment_type && (
                              <span className="inline-flex items-center text-gray-600">
                                <Clock className="w-4 h-4 mr-1 text-gray-400" />
                                {job.employment_type.replace(/-/g, " ")}
                              </span>
                            )}

                            {job.experience_level && (
                              <span className="inline-flex items-center text-gray-600">
                                <Award className="w-4 h-4 mr-1 text-gray-400" />
                                {job.experience_level.charAt(0).toUpperCase() +
                                  job.experience_level.slice(1)}
                              </span>
                            )}

                            {job.salary && (
                              <span className="inline-flex items-center text-gray-600">
                                <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                                {job.salary}
                              </span>
                            )}
                          </div>
                        </div>

                        {user?.id?.toString() === companyId && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setSelectedJob(job)}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setDeletingJobId(job.id)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <Trash className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Job Description
                        </h4>
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {job.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap justify-between items-center">
                        <div className="text-sm text-gray-500">
                          Posted:{" "}
                          {new Date(job.created_at).toLocaleDateString()}
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/jobs/${job.id}`)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div
            className="absolute inset-0"
            onClick={() => setSelectedJob(null)}
          />
          <div className="relative z-10 w-full max-w-2xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
            <EditJobModal
              job={selectedJob}
              onClose={() => setSelectedJob(null)}
              onSave={handleUpdate}
            />
          </div>
        </div>
      )}

      {deletingJobId && (
        <DeleteConfirmationModal
          onConfirm={() => handleDelete(deletingJobId)}
          onCancel={() => setDeletingJobId(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default CompanyJobList;
