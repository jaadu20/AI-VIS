import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../components/ui/Button";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Video,
  FileText as FileTextIcon,
  Zap,
  CheckCircle2,
  UploadCloud,
  Building2,
  ArrowLeft,
  User,
  X,
  Calendar as CalendarIcon,
  BookOpen,
  Calendar,
  Star,
  FileBarChart,
} from "lucide-react";
import api from "../../api";
import { ReactNode } from "react";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
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

interface Application {
  id: string;
}

interface InterviewOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (date: string, time: string) => void;
  onTakeNow: () => void;
  jobTitle: string;
  isProcessing: boolean;
}

const InterviewOptionsModal = ({
  isOpen,
  onClose,
  onSchedule,
  onTakeNow,
  jobTitle,
  isProcessing,
}: InterviewOptionsModalProps) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + i);
      days.push({
        value: nextDay.toISOString().split("T")[0],
        label: nextDay.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
      });
    }
    return days;
  };

  const timeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
  ];

  const handleSchedule = () => {
    if (selectedDate && selectedTime) {
      onSchedule(selectedDate, selectedTime);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white w-full max-w-lg rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                Interview Options - {jobTitle}
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <motion.div
                whileHover={!isProcessing ? { y: -2 } : undefined}
                className={`bg-blue-50 p-4 rounded-xl border border-blue-100 ${
                  !isProcessing
                    ? "hover:border-blue-300 cursor-pointer"
                    : "opacity-75 cursor-not-allowed"
                } transition-colors`}
                onClick={!isProcessing ? onTakeNow : undefined}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-600 p-3 rounded-full">
                    <Video className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      Start Instant Interview
                    </h4>
                    <p className="text-gray-600">
                      {isProcessing
                        ? "Preparing interview..."
                        : "Begin your AI-powered interview immediately"}
                    </p>
                  </div>
                </div>
              </motion.div>

              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-green-600 p-3 rounded-full">
                    <CalendarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      Schedule for Later
                    </h4>
                    <p className="text-gray-600">
                      Book your interview at a convenient time
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Date
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {getNextDays().map((day) => (
                        <motion.button
                          key={day.value}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className={`p-2 rounded-lg text-center text-xs ${
                            selectedDate === day.value
                              ? "bg-green-600 text-white"
                              : "bg-white border border-gray-200 text-gray-700 hover:border-green-400"
                          }`}
                          onClick={() => setSelectedDate(day.value)}
                          disabled={isProcessing}
                        >
                          {day.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {selectedDate && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Time
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {timeSlots.map((time) => (
                          <motion.button
                            key={time}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className={`p-2 rounded-lg text-center ${
                              selectedTime === time
                                ? "bg-green-600 text-white"
                                : "bg-white border border-gray-200 text-gray-700 hover:border-green-400"
                            }`}
                            onClick={() => setSelectedTime(time)}
                            disabled={isProcessing}
                          >
                            {time}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-between">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-200 text-gray-700"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSchedule}
                disabled={!selectedDate || !selectedTime || isProcessing}
                className={`${
                  selectedDate && selectedTime && !isProcessing
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-200 cursor-not-allowed text-gray-500"
                }`}
              >
                {isProcessing ? "Scheduling..." : "Schedule Interview"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

export function JobApplicationPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [job, setJob] = useState<Job | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInterviewOptions, setShowInterviewOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [eligibilityResult, setEligibilityResult] =
    useState<EligibilityResult | null>(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/jobs/current/${jobId}/`);
        const processedJob = {
          ...response.data,
          requirements:
            response.data.requirements?.split("\n").filter(Boolean) || [],
          benefits: response.data.benefits?.split("\n").filter(Boolean) || [],
        };
        setJob(processedJob);
      } catch (error) {
        toast.error("Failed to load job details");
        navigate(`/candidate/${user?.id}/dashboard`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId, navigate, user?.id]);

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
    setEligibilityResult(null);
    toast.success("CV uploaded successfully");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileValidation(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileValidation(files[0]);
  };

  const handleCheckEligibility = async () => {
    if (!cvFile || !jobId) {
      toast.error("Please upload your CV");
      return;
    }

    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append("cv", cvFile);
      formData.append("job", jobId);

      const response = await api.post<EligibilityResult>(
        "/applications/check-eligibility/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setEligibilityResult(response.data);
      if (!response.data.eligible) {
        toast.error("Not eligible for this job");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Eligibility check failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartInterviewNow = async () => {
    if (!cvFile || !jobId) return;

    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append("cv", cvFile);
      formData.append("job", jobId);

      const response = await api.post<Application>(
        "/applications/create/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data?.id) {
        navigate(`/interview/${response.data.id}`);
        toast.success("Starting your interview...");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to start interview");
    } finally {
      setIsProcessing(false);
      setShowInterviewOptions(false);
    }
  };

  const handleScheduleInterview = async (date: string, time: string) => {
    if (!cvFile || !jobId) return;

    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append("cv", cvFile);
      formData.append("job", jobId);
      formData.append("interview_date", date);
      formData.append("interview_time", time);

      await api.post("/applications/schedule-interview/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(
        `Interview scheduled for ${new Date(
          date
        ).toLocaleDateString()} at ${time}`
      );
      navigate(`/candidate/${user?.id}/dashboard`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Scheduling failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <nav className="fixed w-full bg-white/95 backdrop-blur-md py-4 z-50 shadow-md border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Skeleton className="h-9 w-24 rounded-lg" />
              <Skeleton className="h-9 w-32 rounded-lg" />
              <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
          </div>
        </nav>
        <div className="pt-32 pb-16 px-4 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl p-8 space-y-6">
                <div className="flex items-start space-x-4">
                  <Skeleton className="h-16 w-16 rounded-xl" />
                  <div className="space-y-3 flex-1">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                  ))}
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 space-y-6">
                <Skeleton className="h-9 w-full rounded-lg" />
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
          </div>
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
            The job you're looking for may have been removed or is no longer
            available.
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
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
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

      <main className="pt-32 pb-16 px-4 max-w-7xl mx-auto">
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
            <motion.div
              whileHover={{ y: -5 }}
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 ">
                  {[
                    {
                      icon: MapPin,
                      title: "Location",
                      value: job.location,
                      color: "bg-amber-50",
                  
                    },
                    {
                      icon: Briefcase,
                      title: "Employment Type",
                      value: job.employment_type.replace(/-/g, " "),
                      color: "bg-indigo-50",
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
                      whileHover={{ scale: 1.01 }}
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

                  {job.benefits.length > 0 && (
                    <Section title="Benefits & Perks">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {job.benefits.map((benefit, index) => (
                          <motion.div
                            key={index}
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
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6">
            <motion.div
              whileHover={{ y: 0 }}
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
                    <label
                      htmlFor="cv-upload"
                      className={`relative flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl group transition-colors cursor-pointer ${
                        cvFile
                          ? "border-green-500 bg-green-50"
                          : "border-blue-200 hover:border-blue-500"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="space-y-2 text-center">
                        <div className="flex flex-col items-center">
                          {cvFile ? (
                            <>
                              <FileTextIcon className="mx-auto h-12 w-12 text-green-500" />
                              <p className="text-sm text-gray-600 mt-2">
                                <span className="font-medium">
                                  {cvFile.name}
                                </span>
                              </p>
                              <p className="text-xs text-gray-500">
                                {(cvFile.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCvFile(null);
                                }}
                                className="mt-2 text-xs text-red-600 hover:text-red-800"
                              >
                                Remove file
                              </button>
                            </>
                          ) : (
                            <>
                              <UploadCloud
                                className="mx-auto h-12 w-12 text-blue-400 group-hover:text-blue-500"
                                strokeWidth={1.5}
                              />
                              <p className="text-sm text-gray-600 mt-2">
                                <span className="font-medium text-blue-600 hover:text-blue-700">
                                  Upload a file
                                </span>{" "}
                                or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">
                                PDF, DOC, DOCX up to 5MB
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </label>
                    <input
                      id="cv-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="sr-only"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                  </div>

                  {eligibilityResult && (
                    <div
                      className={`p-4 rounded-lg border ${
                        eligibilityResult.eligible
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <h3 className="text-sm font-medium mb-2">
                        Eligibility Score:{" "}
                        <span
                          className={`${
                            eligibilityResult.eligible
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          {eligibilityResult.match_score}%
                        </span>
                      </h3>
                      <p
                        className={`text-sm ${
                          eligibilityResult.eligible
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {eligibilityResult.message}
                      </p>
                      {eligibilityResult.missing_skills &&
                        eligibilityResult.missing_skills.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-900">
                              Missing Skills:
                            </p>
                            <ul className="list-disc pl-5 mt-1">
                              {eligibilityResult.missing_skills?.map(
                                (skill, index) => (
                                  <li
                                    key={index}
                                    className="text-sm text-red-700"
                                  >
                                    {skill}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                    </div>
                  )}

                  {eligibilityResult?.eligible ? (
                    <Button
                      onClick={() => setShowInterviewOptions(true)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Zap className="mr-2 h-5 w-5" />
                      Give Interview
                    </Button>
                  ) : (
                    <Button
                      onClick={handleCheckEligibility}
                      disabled={!cvFile || isProcessing}
                      className={`w-full ${
                        cvFile && !isProcessing
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-blue-400 cursor-not-allowed"
                      } text-white`}
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Checking Eligibility...
                        </div>
                      ) : (
                        <>
                          <Zap className="mr-2 h-5 w-5" />
                          Check Eligibility
                        </>
                      )}
                    </Button>
                  )}

                  {cvFile && (
                    <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            How it works
                          </h3>
                          <p className="mt-1 text-sm text-gray-600">
                            Our AI will analyze your CV against job requirements
                            to determine your eligibility score. If you're a
                            good match, you'll be able to schedule or start your
                            interview immediately.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 p-6"
            >
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
                    <li key={index} className="pb-8">
                      <div className="flex items-start space-x-4 group">
                        <div className="flex-shrink-0">
                          <div
                            className={`flex items-center justify-center h-8 w-8 ${step.color} rounded-full`}
                          >
                            <step.icon className="h-4 w-4 text-gray-700" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {step.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                About {job.company_name}
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

        <InterviewOptionsModal
          isOpen={showInterviewOptions}
          onClose={() => setShowInterviewOptions(false)}
          onSchedule={handleScheduleInterview}
          onTakeNow={handleStartInterviewNow}
          jobTitle={job.title}
          isProcessing={isProcessing}
        />
      </main>
    </div>
  );
}

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
      <span className="bg-blue-100 p-2 rounded-lg mr-3">
        <BookOpen className="h-5 w-5 text-blue-600" />
      </span>
      {title}
    </h3>
    {children}
  </div>
);
