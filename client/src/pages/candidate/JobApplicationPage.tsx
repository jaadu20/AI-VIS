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

interface InterviewOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (date: string, time: string) => void;
  onTakeNow: () => void;
  jobTitle: string;
}

const InterviewOptionsModal = ({
  isOpen,
  onClose,
  onSchedule,
  onTakeNow,
  jobTitle,
}: InterviewOptionsModalProps) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + i);
      const formattedDate = nextDay.toISOString().split("T")[0];
      const dayName = nextDay.toLocaleDateString("en-US", { weekday: "short" });
      const dayNumber = nextDay.getDate();
      const month = nextDay.toLocaleDateString("en-US", { month: "short" });
      days.push({
        value: formattedDate,
        label: `${dayName}, ${month} ${dayNumber}`,
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
            transition={{ type: "spring", damping: 20 }}
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
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <Zap className="h-6 w-6 text-blue-600" />
                <h4 className="text-lg font-semibold text-gray-900">
                  AI-Powered Interview
                </h4>
              </div>
              <p className="text-sm text-green-700 font-medium ml-4">
                Congratulations! You are eligible for this interview. Please
                select an option to proceed ⬇️
              </p>
            </div>
            <div className="p-6 space-y-6">
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-blue-50 p-4 rounded-xl border border-blue-100 hover:border-blue-300 cursor-pointer transition-colors"
                onClick={onTakeNow}
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
                      Begin your AI-powered interview immediately
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

                <div className="space-y-4 mt-6">
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
                        >
                          <div className="font-medium">
                            {day.label.split(",")[0]}
                          </div>
                          <div>
                            {day.label.split(" ")[1]} {day.label.split(" ")[2]}
                          </div>
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
              >
                Cancel
              </Button>
              <Button
                onClick={handleSchedule}
                disabled={!selectedDate || !selectedTime}
                className={`${
                  selectedDate && selectedTime
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-200 cursor-not-allowed text-gray-500"
                }`}
              >
                Schedule Interview
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
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [showInterviewOptions, setShowInterviewOptions] = useState(false);
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
        const processedJob = {
          ...responseData,
          requirements: Array.isArray(responseData.requirements)
            ? responseData.requirements
            : responseData.requirements?.split("\n").filter(Boolean) || [],
          benefits: Array.isArray(responseData.benefits)
            ? responseData.benefits
            : responseData.benefits?.split("\n").filter(Boolean) || [],
        };

        setJob(processedJob);
      } catch (error) {
        toast.error("Failed to load job details");
        navigate("/candidate/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId, navigate]);

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

  const handleCheckEligibility = async () => {
    if (!cvFile || !jobId) {
      toast.error("Please upload your CV");
      return;
    }
    setShowInterviewOptions(true);

    // try {
    //   setIsCheckingEligibility(true);
    //   const formData = new FormData();
    //   formData.append("cv", cvFile);
    //   formData.append("job", jobId);

    //   const response = await api.post(
    //     "/applications/check-eligibility",
    //     formData,
    //     {
    //       headers: { "Content-Type": "multipart/form-data" },
    //     }
    //   );

    //   if (response.data.match_score >= 70) {
    //     setShowInterviewOptions(true);
    //   } else {
    //     setEligibilityResult({
    //       eligible: false,
    //       message: "Your skills don't match the job requirements",
    //       match_score: response.data.match_score,
    //       missing_skills: response.data.missing_skills?.split(", ") || [],
    //     });
    //   }
    // } catch (error: any) {
    //   toast.error(error.response?.data?.error || "Eligibility check failed");
    // } finally {
    //   setIsCheckingEligibility(false);
    // }
  };

  const handleStartInterviewNow = async () => {
    navigate("/interview");
    // if (!cvFile || !jobId) return;

    // try {
    //   const formData = new FormData();
    //   formData.append("cv", cvFile);
    //   formData.append("job", jobId);

    //   const response = await api.post("/applications/", formData, {
    //     headers: { "Content-Type": "multipart/form-data" },
    //   });

    //   navigate(`/interview/${response.data.id}`);
    //   toast.success("Application successful! Starting interview...");
    // } catch (error: any) {
    //   toast.error(error.response?.data?.error || "Application failed");
    // } finally {
    //   setShowInterviewOptions(false);
    // }
  };

  const handleScheduleInterview = (date: string, time: string) => {
    navigate(`/candidate/${user?.id}/dashboard`);
    // if (!cvFile || !jobId) return;
    // const formData = new FormData();
    // formData.append("cv", cvFile);
    // formData.append("job", jobId);
    // formData.append("interview_date", date);
    // formData.append("interview_time", time);
    // api
    //   .post("/applications/schedule-interview", formData, {
    //     headers: { "Content-Type": "multipart/form-data" },
    //   })
    //   .then(() => {
    //     toast.success(
    //       `Interview scheduled for ${new Date(
    //         date
    //       ).toLocaleDateString()} at ${time}`
    //     );
    //     navigate("/candidate/dashboard");
    //   })
    //   .catch((error) => {
    //     toast.error(error.response?.data?.error || "Scheduling failed");
    //   });
  };

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
                onClick={() => navigate(`/candidate/${user?.id}/dashboard`)}
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
                onClick={() => navigate(`/candidate/${user?.id}/dashboard`)}
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
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
              <motion.div
                whileHover={{ y: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Apply for this Position
                  </h2>

                  
                </div>
              </motion.div>
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
        </div>

        <InterviewOptionsModal
          isOpen={showInterviewOptions}
          onClose={() => setShowInterviewOptions(false)}
          onSchedule={handleScheduleInterview}
          onTakeNow={handleStartInterviewNow}
          jobTitle={job?.title || ""}
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
