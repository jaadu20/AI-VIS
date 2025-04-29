import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  XCircle,
} from "lucide-react";
import api from "../../api";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { EligibilityResultModal } from "../../components/EligibilityResultModal";

interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary: string;
  description: string;
  requirements: string;
  department: string;
  benefits: string;
  created_at: string;
}

interface EligibilityResult {
  eligible: boolean;
  message?: string;
  match_score?: number;
  missing_skills?: string[];
}

export function JobApplicationPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await api.get(`/jobs/${jobId}/`);
        setJob(response.data);
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
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type) ){
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-xl text-gray-600">
          Loading job details...
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-500">Job not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              onClick={() => navigate("/candidate/dashboard")}
              variant="outline"
              className="flex items-center bg-white hover:bg-gray-50 border border-gray-200 text-indigo-700"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Button>

            <div className="flex items-center absolute left-1/2 transform -translate-x-1/2">
              <Camera className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">AI-VIS</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 animate-fade-in-up">
                  {job.title}
                </h1>
                <p className="text-xl font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  {job.company_name}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {[
                  { icon: MapPin, title: "Location", value: job.location, color: "bg-purple-100" },
                  { icon: Briefcase, title: "Employment Type", value: formatEmploymentType(job.employment_type), color: "bg-orange-100" },
                  { icon: DollarSign, title: "Salary", value: job.salary, color: "bg-blue-100" },
                  { icon: Clock, title: "Posted", value: `${formatDistanceToNow(new Date(job.created_at))} ago`, color: "bg-pink-100" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-3 ${item.color} rounded-lg transition-transform hover:scale-[1.02]`}
                  >
                    <item.icon className="h-5 w-5 text-gray-700 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">{item.title}</p>
                      <p className="font-medium text-gray-900">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <Section title="Job Description">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {job.description}
                  </p>
                </Section>

                <Section title="Requirements">
                  <ul className="space-y-3">
                    {job.requirements.split("\n").map((req, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                        </div>
                        <p className="ml-3 text-gray-600">{req}</p>
                      </li>
                    ))}
                  </ul>
                </Section>

                {job.benefits && (
                  <Section title="Benefits & Perks">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {job.benefits.split("\n").map((benefit, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg animate-pop-in"
                        >
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span className="text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}
              </div>
            </div>
          </div>

          <div className="lg:w-1/3 space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 animate-fade-in-up">
                Apply for this Position
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Upload CV (PDF, DOC, DOCX)
                  </label>
                  <div
                    className={`relative flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl group transition-colors 
                    ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-500"}`}
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
                        ${isDragging ? "text-blue-500" : "text-gray-400 group-hover:text-blue-500"}`}
                      />
                      <div className="flex flex-col items-center text-sm text-gray-600">
                        <span className="underline">Click to upload</span>
                        <p className="mt-2">or drag and drop files</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Max file size: 5MB
                      </p>
                    </div>
                    <div
                      className={`absolute inset-0 rounded-xl transition-opacity 
                      ${isDragging ? "opacity-100 bg-blue-500/10" : "opacity-0 group-hover:opacity-100 bg-blue-500/5"}`}
                    />
                  </div>
                  {cvFile && (
                    <div className="mt-3 flex items-center justify-between p-3 bg-blue-50 rounded-lg animate-pop-in">
                      <div className="flex items-center space-x-2">
                        <FileTextIcon className="h-5 w-5 text-blue-600 animate-spin-once" />
                        <span className="text-sm font-medium text-gray-700">
                          {cvFile.name}
                        </span>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-500 animate-pulse" />
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleStartInterview}
                  className="w-full py-4 text-base font-medium shadow-lg hover:shadow-none transition-all 
                  bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
                  text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!cvFile}
                >
                  Start Interview Now
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Interview Process
              </h3>
              <div className="flow-root">
                <ul className="-mb-8">
                  {[
                    { icon: FileTextIcon, title: "CV Screening", description: "Instant eligibility check", color: "bg-purple-100" },
                    { icon: Video, title: "Video Interview", description: "15 AI-powered questions", color: "bg-blue-100" },
                    { icon: Zap, title: "Real-time Analysis", description: "Behavioral & technical evaluation", color: "bg-green-100" },
                    { icon: FileBarChart, title: "Feedback Report", description: "Detailed performance insights", color: "bg-pink-100" },
                  ].map((step, index) => (
                    <li
                      key={index}
                      className="pb-8 animate-staggered-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center space-x-4 group">
                        <div className="flex-shrink-0">
                          <div
                            className={`flex items-center justify-center h-8 w-8 ${step.color} rounded-full transition-transform group-hover:scale-110`}
                          >
                            <step.icon className="h-4 w-4 text-gray-700" />
                          </div>
                        </div>
                        <div className="transition-transform group-hover:translate-x-2">
                          <p className="text-sm font-medium text-gray-900">{step.title}</p>
                          <p className="text-sm text-gray-500">{step.description}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EligibilityResultModal
        result={eligibilityResult}
        onClose={() => setEligibilityResult(null)}
        onRetry={() => setCvFile(null)}
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-gray-100 pt-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}