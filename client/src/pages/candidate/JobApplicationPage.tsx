import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/Button";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Video,
  FileText as FileTextIcon,
  Zap,
  FileBarChart,
  CheckCircle2,
  UploadCloud,
  Camera,
  ChevronLeft,
  Building2,
  Star,
  Shield,
  ArrowLeft,
  Send,
  Calendar,
  BookOpen,
  User,
} from "lucide-react";
import api from "../../api";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { EligibilityResultModal } from "../../components/EligibilityResultModal";
import { useAuthStore } from "../../store/authStore";
import { Skeleton } from "../../components/ui/Skeleton";

interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary: string;
  description: string;
  requirements: string[];
  department: string;
  benefits: string[];
  created_at: string;
  match_percentage?: number;
}

interface EligibilityResult {
  eligible: boolean;
  message?: string;
  match_score?: number;
  missing_skills?: string[];
}

// Animation variants
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

export function JobApplicationPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [job, setJob] = useState<Job | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [eligibilityResult, setEligibilityResult] =
    useState<EligibilityResult | null>(null);
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/jobs/current/${jobId}`);
        const responseData = response.data.results || response.data;

        // Process the job data
        const processedJob = {
          ...responseData,
          requirements: Array.isArray(responseData.requirements)
            ? responseData.requirements
            : responseData.requirements?.split("\n").filter(Boolean) || [],
          benefits: Array.isArray(responseData.benefits)
            ? responseData.benefits
            : responseData.benefits?.split("\n").filter(Boolean) || [],
          match_percentage: Math.floor(Math.random() * 31) + 70, // Mock match percentage (70-100%)
        };

        setJob(processedJob);

        // Mock similar jobs
        generateSimilarJobs(processedJob);
      } catch (error) {
        toast.error("Failed to load job details");
        navigate("/candidate/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId, navigate]);

  // Generate mock similar jobs based on the current job
  const generateSimilarJobs = (currentJob: Job) => {
    if (!currentJob) return;

    const mockSimilarJobs = [
      {
        id: "sim-job-1",
        title: `Senior ${currentJob.title
          .replace("Senior", "")
          .replace("Junior", "")}`,
        company_name: "TechCorp Inc.",
        location: currentJob.location,
        employment_type: currentJob.employment_type,
        salary: currentJob.salary,
        experience_level: "Senior",
        description:
          "Similar position with additional leadership responsibilities...",
        requirements: currentJob.requirements,
        department: currentJob.department,
        benefits: currentJob.benefits,
        created_at: new Date(
          Date.now() - 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
        match_percentage: Math.floor(Math.random() * 15) + 75,
      },
      {
        id: "sim-job-2",
        title: currentJob.title.replace("Senior", "").replace("Junior", ""),
        company_name: "InnovateTech",
        location: "Remote",
        employment_type: currentJob.employment_type,
        salary: currentJob.salary,
        experience_level: "Mid-level",
        description: "Similar role in a fast-growing startup environment...",
        requirements: currentJob.requirements,
        department: currentJob.department,
        benefits: currentJob.benefits,
        created_at: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000
        ).toISOString(),
        match_percentage: Math.floor(Math.random() * 15) + 65,
      },
    ];

    setSimilarJobs(mockSimilarJobs);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileValidation(files[0]);
    }
  };

  const handleFileValidation = (file: File) => {
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF, DOC, or DOCX file");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 5MB limit");
      return;
    }

    setCvFile(file);
    toast.success("CV uploaded successfully");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileValidation(file);
  };

  const formatEmploymentType = (type: string) => {
    return type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const handleStartInterview = async () => {
    navigate(`/interview`);
    // Commented out for now as it's commented in the original code
    // if (!cvFile || !jobId) {
    //   toast.error("Please upload your CV");
    //   return;
    // }

    // try {
    //   const formData = new FormData();
    //   formData.append("cv", cvFile);
    //   formData.append("job", jobId);

    //   const response = await api.post(
    //     "/applications/check-eligibility/",
    //     formData,
    //     { headers: { "Content-Type": "multipart/form-data" } }
    //   );

    //   if (response.data.eligible) {
    //     navigate(`/interview/${response.data.interview_id}`);
    //   } else {
    //     setEligibilityResult({
    //       eligible: false,
    //       message: response.data.message,
    //       match_score: response.data.match_score,
    //       missing_skills: response.data.missing_skills
    //     });
    //   }
    // } catch (error: any) {
    //   toast.error(error.response?.data?.error || "Application failed");
    // }
  };

  // const getMatchColor = (percentage: number) => {
  //   if (percentage >= 80) return "text-green-600";
  //   if (percentage >= 60) return "text-blue-600";
  //   return "text-orange-500";
  // };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <motion.nav
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className="fixed w-full bg-white/95 backdrop-blur-md py-4 z-50 shadow-md border-b border-blue-100"
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Button
                onClick={() => navigate("/candidate/dashboard")}
                variant="outline"
                className="flex items-center space-x-2 border-blue-200 text-blue-600"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>

              <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                  AI-VIS Jobs
                </span>
              </div>

              <Button
                variant="ghost"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
                onClick={() => navigate(`/candidate/profile/${user?.id}`)}
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </div>
          </div>
        </motion.nav>

        <div className="pt-32 pb-16 px-4 max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <Skeleton className="h-16 w-16 rounded-xl" />
                  <div className="space-y-3 flex-1">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>

                <div className="space-y-6">
                  <div>
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="space-y-2">
                      {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-4 w-full" />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-start space-x-2">
                          <Skeleton className="h-3 w-3 rounded-full mt-1" />
                          <Skeleton className="h-4 w-full flex-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 p-8">
                <Skeleton className="h-6 w-32 mb-6" />
                <Skeleton className="h-40 w-full rounded-lg mb-6" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-xl shadow-xl border border-red-100 max-w-md mx-auto text-center"
        >
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Job Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't find the job you're looking for. It may have been
            removed or is no longer available.
          </p>
          <Button
            onClick={() => navigate(`/candidate/${user?.id}/dashboard`)}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full"
          >
            Return to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Fixed Header with glass effect */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="fixed w-full bg-white/95 backdrop-blur-md py-4 z-50 shadow-md border-b border-blue-100"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Button
              onClick={() => navigate(`/candidate/${user?.id}/dashboard`)}
              variant="outline"
              className="flex items-center space-x-2 border-blue-200 text-blue-600"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Jobs</span>
            </Button>

            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                AI-VIS Jobs
              </span>
            </div>

            <Button
              variant="ghost"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
              onClick={() => navigate(`/candidate/profile/${user?.id}`)}
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
          </div>
        </div>
      </motion.nav>

      <main className="pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 space-y-6"
            >
              {/* Job Details Card */}
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 p-4 rounded-xl">
                        <Building2 className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                          {job.title}
                        </h1>
                        <p className="text-lg font-semibold text-blue-600">
                          {job.company_name}
                        </p>
                      </div>
                    </div>

                    {/* {job.match_percentage && (
                      <div className="mt-4 md:mt-0 flex items-center justify-center px-4 py-2 bg-green-50 rounded-full">
                        <Shield className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-semibold text-green-700">
                          {job.match_percentage}% Match
                        </span>
                      </div>
                    )} */}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {[
                      {
                        icon: MapPin,
                        title: "Location",
                        value: job.location,
                        color: "bg-indigo-50",
                      },
                      {
                        icon: Briefcase,
                        title: "Employment Type",
                        value: formatEmploymentType(job.employment_type),
                        color: "bg-amber-50",
                      },
                      {
                        icon: DollarSign,
                        title: "Salary",
                        value: job.salary,
                        color: "bg-blue-50",
                      },
                      {
                        icon: Clock,
                        title: "Posted",
                        value: `${formatDistanceToNow(
                          new Date(job.created_at)
                        )} ago`,
                        color: "bg-green-50",
                      },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.03 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 10,
                        }}
                        className={`flex items-center space-x-3 p-4 ${item.color} rounded-xl`}
                      >
                        <div className="bg-white p-2 rounded-full">
                          <item.icon className="h-5 w-5 text-gray-700" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">{item.title}</p>
                          <p className="font-medium text-gray-900">
                            {item.value}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="space-y-8">
                    <Section title="Job Description">
                      <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {job.description}
                      </p>
                    </Section>

                    <Section title="Requirements">
                      <ul className="space-y-3">
                        {job.requirements.map((req, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="flex items-start"
                          >
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-2 h-2 bg-blue-600 rounded-full" />
                            </div>
                            <p className="ml-3 text-gray-600">{req}</p>
                          </motion.li>
                        ))}
                      </ul>
                    </Section>

                    {job.benefits && job.benefits.length > 0 && (
                      <Section title="Benefits & Perks">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {job.benefits.map((benefit, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.05 * index }}
                              whileHover={{ scale: 1.03 }}
                              className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg"
                            >
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                              <span className="text-gray-700">{benefit}</span>
                            </motion.div>
                          ))}
                        </div>
                      </Section>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Similar Jobs Section */}
              {/* {similarJobs.length > 0 && (
                <motion.div variants={itemVariants} className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 pl-2">
                    Similar Positions
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {similarJobs.map((simJob, index) => (
                      <motion.div
                        key={index}
                        whileHover={{
                          y: -5,
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        }}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 p-5"
                      >
                        <div className="flex justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {simJob.title}
                            </h3>
                            <p className="text-sm text-blue-600">
                              {simJob.company_name}
                            </p>
                          </div>
                          {simJob.match_percentage && (
                            <div
                              className={`flex items-center ${getMatchColor(
                                simJob.match_percentage
                              )}`}
                            >
                              <Shield className="h-4 w-4 mr-1" />
                              <span className="text-xs font-medium">
                                {simJob.match_percentage}% Match
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {simJob.location}
                          </span>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
                            <Briefcase className="h-3 w-3 mr-1" />
                            {formatEmploymentType(simJob.employment_type)}
                          </span>
                        </div>

                        <div className="flex justify-between mt-4">
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDistanceToNow(
                              new Date(simJob.created_at)
                            )}{" "}
                            ago
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => navigate(`/jobs/${simJob.id}`)}
                          >
                            View Job
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )} */}
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
              {/* Application Card */}
              <motion.div
                whileHover={{ y: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Apply for this Position
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Upload CV/Resume
                      </label>
                      <div
                        className={`relative flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl group transition-colors 
                        ${
                          isDragging
                            ? "border-blue-500 bg-blue-50"
                            : "border-blue-200 hover:border-blue-500"
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <label
                          htmlFor="cv-upload"
                          className="absolute inset-0 cursor-pointer z-10"
                        >
                          <input
                            id="cv-upload"
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileUpload}
                            className="sr-only"
                          />
                        </label>

                        <div className="space-y-1 text-center relative z-0">
                          <UploadCloud
                            className={`mx-auto h-12 w-12 transition-colors 
                            ${
                              isDragging
                                ? "text-blue-500"
                                : "text-blue-400 group-hover:text-blue-500"
                            }`}
                          />
                          <div className="flex flex-col items-center text-sm text-gray-600">
                            <span className="font-medium text-blue-600 underline">
                              Click to upload
                            </span>
                            <p className="mt-2">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            PDF, DOC, DOCX (Max 5MB)
                          </p>
                        </div>
                        <div
                          className={`absolute inset-0 rounded-xl transition-opacity 
                          ${
                            isDragging
                              ? "opacity-100 bg-blue-500/10"
                              : "opacity-0 group-hover:opacity-100 bg-blue-500/5"
                          }`}
                        />
                      </div>
                      {cvFile && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-2">
                            <FileTextIcon className="h-5 w-5 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                              {cvFile.name}
                            </span>
                          </div>
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </motion.div>
                      )}
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={handleStartInterview}
                        className={`w-full py-4 text-base font-medium shadow-lg transition-all
                        ${
                          cvFile
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                        disabled={!cvFile}
                      >
                        <Zap className="h-5 w-5 mr-2" />
                        Start AI Interview
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Interview Process Card */}
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Video className="h-5 w-5 text-blue-600 mr-2" />
                    Interview Process
                  </h3>
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {[
                        {
                          icon: FileTextIcon,
                          title: "CV Screening",
                          description: "Instant AI-powered resume analysis",
                          color: "bg-purple-100",
                        },
                        {
                          icon: Video,
                          title: "Video Interview",
                          description: "15 AI-evaluated questions",
                          color: "bg-blue-100",
                        },
                        {
                          icon: Zap,
                          title: "Real-time Analysis",
                          description: "Skills & personality evaluation",
                          color: "bg-green-100",
                        },
                        {
                          icon: FileBarChart,
                          title: "Detailed Report",
                          description: "Comprehensive performance insights",
                          color: "bg-pink-100",
                        },
                      ].map((step, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="pb-8"
                        >
                          <div className="flex items-start space-x-4 group">
                            <div className="flex-shrink-0">
                              <div
                                className={`flex items-center justify-center h-8 w-8 ${step.color} rounded-full transition-transform group-hover:scale-110`}
                              >
                                <step.icon className="h-4 w-4 text-gray-700" />
                              </div>
                            </div>
                            <div className="transition-transform group-hover:translate-x-2">
                              <p className="text-sm font-medium text-gray-900">
                                {step.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Company Insights Card */}
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:border-blue-200 p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                  Company Insights
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-600">Founded: 2015</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      501-1000 employees
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      4.8/5 Glassdoor rating
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <EligibilityResultModal
        result={eligibilityResult}
        onClose={() => setEligibilityResult(null)}
        onRetry={() => setCvFile(null)}
      />

      {/* Quick Navigation FAB */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-8 right-8 flex gap-2"
      >
        <Button
          className="rounded-full p-3 shadow-lg bg-blue-600 hover:bg-blue-700"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <ChevronLeft className="h-5 w-5 transform rotate-90" />
        </Button>
        {/* <Button
          className="rounded-full p-3 shadow-lg bg-green-600 hover:bg-green-700"
          onClick={() => navigate(`/candidate/${user?.id}/saved-jobs`)}
        >
          <Star className="h-5 w-5" />
        </Button> */}
      </motion.div>
    </div>
  );
}

// Reusable Section Component
const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="border-t border-gray-100 pt-8">
    <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
);
