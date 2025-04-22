// JobApplicationPage.tsx (New Page)
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Briefcase, Building2, Clock, MapPin, DollarSign } from "lucide-react";
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

export function JobApplicationPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await axios.get(`/api/jobs/${jobId}`);
        setJob(response.data);
      } catch (error) {
        toast.error("Failed to load job details");
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        setCvFile(file);
      } else {
        toast.error("Please upload a PDF file");
      }
    }
  };

  const handleStartInterview = async () => {
    if (!cvFile) {
      toast.error("Please upload your CV");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("cv", cvFile);
      formData.append("jobId", jobId!);

      const response = await axios.post("/api/check-eligibility", formData);

      if (response.data.eligible) {
        // Navigate to interview page with job ID in URL
        navigate(`/interview/${jobId}`);
      } else {
        toast.error("Your CV does not meet the requirements for this position");
      }
    } catch (error) {
      toast.error("Error processing your application");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Job not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">{job.title}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Building2 className="h-6 w-6 mr-2 text-blue-600" />
                  <span className="text-lg">{job.company}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-6 w-6 mr-2 text-blue-600" />
                  <span className="text-lg">{job.location}</span>
                </div>
                {job.salaryRange && (
                  <div className="flex items-center">
                    <DollarSign className="h-6 w-6 mr-2 text-blue-600" />
                    <span className="text-lg">{job.salaryRange}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Briefcase className="h-6 w-6 mr-2 text-blue-600" />
                  <span className="text-lg">{job.type}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Job Description</h2>
                <p className="text-gray-600">{job.description}</p>
              </div>

              {job.requirements && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Requirements</h2>
                  <ul className="list-disc list-inside space-y-2">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="text-gray-600">
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div className="bg-blue-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Apply for this Position
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Upload Your CV (PDF only)
                    </label>
                    <Input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileUpload}
                    />
                    {cvFile && (
                      <p className="mt-2 text-sm text-green-600">
                        {cvFile.name} uploaded successfully
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={handleStartInterview}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Start Interview
                  </Button>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">
                  Interview Process
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>15 questions total</li>
                  <li>First 2 questions are introductory</li>
                  <li>Subsequent questions based on your responses</li>
                  <li>Real-time AI analysis of your answers</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
