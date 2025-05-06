import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Edit, Trash } from 'lucide-react';
import api from '../../api';
import { Job } from '../../types';
import EditJobModal from './EditJobModal';
import { useAuthStore } from "../../store/authStore";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";

const CompanyJobList: React.FC = () => {
  const { companyId } = useParams();
  const { user } = useAuthStore(state => state);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    const fetchCompanyJobs = async () => {
      try {
        const response = await api.get(`/jobs/company/${user?.id}`);
        const responseData = response.data.results || response.data;
        setJobs(responseData);
        if (response.data.length > 0) {
          setCompanyName(response.data[0].company_name);
        }
      } catch (error) {
        console.error('Error fetching company jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyJobs();
  }, [companyId]);

  const handleDelete = async (jobId: number) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await api.delete(`/jobs/${jobId}/delete/`);
        setJobs(jobs.filter(job => job.id !== jobId));
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  const handleUpdate = async (updatedJob: Job) => {
    try {
      await api.put(`/jobs/${updatedJob.id}/`, updatedJob);
      setJobs(jobs.map(job => job.id === updatedJob.id ? updatedJob : job));
      setSelectedJob(null);
    } catch (error) {
      console.error('Error updating job:', error);
    }
  };

  return (
    <DashboardLayout>
       <header
        className="top-0 left-64 w-full bg-black bg-opacity-80 py-3 z-10 shadow-md"
      >
        <div className="max-w-7xl mx-auto px-4 flex justify-center">
          <h1 className="text-3xl font-extrabold text-yellow-300 tracking-wide">
            AI VIS
          </h1>
        </div>
      </header>
      <div
        className="p-8 min-h-screen"
        style={{
          backgroundImage:
            "url('https://t4.ftcdn.net/jpg/04/91/04/57/360_F_491045782_57jOG41DcPq4BxRwYqzLrhsddudrq2MM.jpg')",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-yellow-400"
          >
            {companyName || 'Company'} Job Postings
          </motion.h1>
          {user?.id?.toString() === companyId && (
            <Button onClick={() => window.location.href = '/company/post-job'}>
              <Briefcase className="w-4 h-4 mr-2" />
              Post New Job
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 bg-gray-200 rounded-lg" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-600 text-lg">No current job openings</p>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4"
          >
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {job.title}
                      </h3>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <p><span className="font-medium">Department:</span> {job.department}</p>
                        <p><span className="font-medium">Location:</span> {job.location}</p>
                        <p><span className="font-medium">Type:</span> {job.employment_type}</p>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <p><span className="font-medium">Experience:</span> {job.experience_level}</p>
                        {job.salary && <p><span className="font-medium">Salary:</span> {job.salary}</p>}
                      </div>
                    </div>
                    
                    {user?.id?.toString() === companyId && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => setSelectedJob(job)}
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleDelete(job.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-2">Job Description</h4>
                    <p className="text-gray-600 text-sm">{job.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {selectedJob && (
          <EditJobModal
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
            onSave={handleUpdate}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default CompanyJobList;