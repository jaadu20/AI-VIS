// components/CompanyJobList.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthContext';
import api from '../../api';
import { Job } from '../../types';
import EditJobModal from './EditJobModal';

const CompanyJobList: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/company/');
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) return <div>Loading jobs...</div>;
  if (!user?.is_company) return <div>Access denied</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Your Job Postings</h2>
      
      {jobs.length === 0 ? (
        <p className="text-gray-600">No jobs posted yet.</p>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job.id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{job.title}</h3>
                  <p className="text-gray-600">{job.department} • {job.location}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Posted: {new Date(job.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedJob && (
        <EditJobModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
};

export default CompanyJobList;