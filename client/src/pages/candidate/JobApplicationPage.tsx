import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Briefcase, Building2, MapPin, DollarSign, Clock } from "lucide-react";
import api from "../../api";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

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

export function JobApplicationPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        setCvFile(file);
        toast.success("CV uploaded successfully");
      } else {
        toast.error("Please upload a PDF file");
      }
    }
  };

  const formatEmploymentType = (type: string) => {
    return type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const handleStartInterview = async () => {
    if (!cvFile || !job) {
      toast.error("Please upload your CV");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("cv", cvFile);
      formData.append("job", job.id);

      // Create application and check eligibility
      const response = await api.post(
        "/jobapplications/applications/check-eligibility/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.eligible) {
        navigate(`/interview/${response.data.application_id}`);
      } else {
        toast.error(response.data.message || "Not eligible for this position");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Application failed");
    }
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">{job.title}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Building2 className="h-6 w-6 mr-2 text-blue-600" />
                  <span className="text-lg text-gray-700">
                    {job.company_name}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-6 w-6 mr-2 text-blue-600" />
                  <span className="text-lg text-gray-700">{job.location}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-6 w-6 mr-2 text-blue-600" />
                  <span className="text-lg text-gray-700">{job.salary}</span>
                </div>
                <div className="flex items-center">
                  <Briefcase className="h-6 w-6 mr-2 text-blue-600" />
                  <span className="text-lg text-gray-700">
                    {formatEmploymentType(job.employment_type)}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-6 w-6 mr-2 text-blue-600" />
                  <span className="text-sm text-gray-500">
                    Posted {formatDistanceToNow(new Date(job.created_at))} ago
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Job Description
                </h2>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Requirements
                </h2>
                <ul className="list-disc list-inside space-y-2">
                  {job.requirements.split("\n").map((req, index) => (
                    <li key={index} className="text-gray-600">
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-blue-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                  Apply for this Position
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Upload Your CV (PDF only)
                    </label>
                    <Input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileUpload}
                      className="border-gray-300 rounded-lg"
                    />
                    {cvFile && (
                      <p className="mt-2 text-sm text-green-600">
                        {cvFile.name} uploaded
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={handleStartInterview}
                    className="w-full bg-blue-600 hover:bg-blue-700 py-3 text-lg"
                  >
                    Start Interview
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">
                  Interview Process
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>15 questions total</li>
                  <li>First 2 questions are introductory</li>
                  <li>AI-powered real-time analysis</li>
                  <li>Behavioral and technical questions</li>
                  <li>Instant feedback report</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
