import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Building2, Clock, MapPin } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  postedDate: string;
  description: string;
}

const mockJobs: Job[] = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "Tech Corp",
    location: "San Francisco, CA",
    type: "Full-time",
    postedDate: "2d ago",
    description: "We are looking for an experienced frontend developer...",
  },

];

export function CandidateDashboard() {
  const navigate = useNavigate();
  const [jobs] = useState<Job[]>(mockJobs);
  const [startDateTime, setStartDateTime] = useState<string | null>(null);
  const [isDateRangeVisible, setIsDateRangeVisible] = useState(false);

  const daterange = () => {
    setIsDateRangeVisible(true);
  };

  const handleScheduleInterview = () => {
    if (startDateTime) {
      alert(`Interview scheduled for ${startDateTime}`);
    } else {
      alert("Please select a start date and time.");
    }
    setIsDateRangeVisible(false); 
  };

  const handleApply = (jobId: string) => {
    navigate(`/interview?jobId=${jobId}`);
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        backgroundImage:
          "url('https://t4.ftcdn.net/jpg/04/91/04/57/360_F_491045782_57jOG41DcPq4BxRwYqzLrhsddudrq2MM.jpg')",
        backgroundAttachment: "fixed",
      }}
    >
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Job Listings</h1>
            <Button
              onClick={() => navigate("/student/profile")}
              variant="outline"
            >
              View Profile
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {jobs.map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white shadow rounded-lg p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {job.title}
                  </h2>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Building2 className="h-5 w-5 mr-2" />
                      {job.company}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-2" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Briefcase className="h-5 w-5 mr-2" />
                      {job.type}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-5 w-5 mr-2" />
                      {job.postedDate}
                    </div>
                  </div>
                </div>
                <Button onClick={() => handleApply(job.id)}>Apply Now</Button>
              </div>
              <p className="mt-4 text-gray-600">{job.description}</p>
              <br />
              <div className="container mx-auto p-4">
                <Button onClick={daterange} className="bg-blue-600 text-white">
                  Interview Schedule
                </Button>

                {isDateRangeVisible && (
                  <div className="mt-4">
                    <div className="mb-4">
                      <label className="block text-gray-700">
                        Start Date and Time
                      </label>
                      <input
                        type="datetime-local"
                        value={startDateTime || ""}
                        onChange={(e) => setStartDateTime(e.target.value)}
                        className="p-2 border rounded"
                      />
                    </div>

                    <Button
                      onClick={handleScheduleInterview}
                      className="bg-green-600 text-white"
                    >
                      Schedule Interview
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
