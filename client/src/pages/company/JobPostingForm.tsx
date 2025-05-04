import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { toast } from "react-hot-toast";
import { useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
interface JobPostingForm {
  title: string;
  department: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary: string;
  description: string;
  requirements: string;
  benefits: string;
}

const experienceOptions = [
  { label: "Entry Level", value: "entry" },
  { label: "Mid Level", value: "mid" },
  { label: "Senior Level", value: "senior" },
  { label: "Lead", value: "lead" },
  { label: "Director", value: "director" },
];

const employmentTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Temporary",
];

export function JobPostingForm() {
  const navigate = useNavigate();
  const { user } = useAuthStore(); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<JobPostingForm>();

  const onSubmit = async (data: JobPostingForm) => {
    try {
      setIsSubmitting(true);
      const response = await api.post("/jobs/", {
        ...data,
        employment_type: data.employment_type.toLowerCase().replace(" ", "-"),
      });
      console.log(response);
      if (response.status === 201) {
        toast.success("Job posted successfully!", {
          position: "bottom-right",
          duration: 2000,
        });
        reset();
        setTimeout(() => {
          navigate(`/company/${user?.id}/dashboard`);
        }, 500);
      }
    } catch (error: any) {
      console.error(error);
      if (error.response && error.response.status !== 401) {
        toast.error("Job posted Fail!");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="max-w-4xl mx-auto">
            <div className="p-6 space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-bold text-blue-600">
                  Create New Job Posting
                </h1>
                <p className="text-gray-600 mt-2">
                  Fill in the details below to create a new job opportunity
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Job Title *
                      </label>
                      <input
                        {...register("title", {
                          required: "Title is required",
                        })}
                        className={`mt-1 block w-full rounded-lg border p-3 focus:ring-2 ${
                          errors.title
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                        }`}
                        placeholder="e.g., Senior Software Engineer"
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.title.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Department *
                      </label>
                      <input
                        {...register("department", {
                          required: "Department is required",
                        })}
                        className={`mt-1 block w-full rounded-lg border p-3 focus:ring-2 ${
                          errors.department
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                        }`}
                        placeholder="e.g., Engineering"
                      />
                      {errors.department && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.department.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Location *
                      </label>
                      <input
                        {...register("location", {
                          required: "Location is required",
                        })}
                        className={`mt-1 block w-full rounded-lg border p-3 focus:ring-2 ${
                          errors.location
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                        }`}
                        placeholder="e.g., New York, NY"
                      />
                      {errors.location && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.location.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Employment Type *
                      </label>
                      <select
                        {...register("employment_type", {
                          required: "Type is required",
                        })}
                        className={`mt-1 block w-full rounded-lg border p-3 focus:ring-2 ${
                          errors.employment_type
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                        }`}
                      >
                        <option value="">Select employment type</option>
                        {employmentTypes.map((type) => (
                          <option key={type} value={type.toLowerCase()}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {errors.employment_type && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.employment_type.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Experience Level *
                      </label>
                      <select
                        {...register("experience_level", {
                          required: "Experience is required",
                        })}
                        className={`mt-1 block w-full rounded-lg border p-3 focus:ring-2 ${
                          errors.experience_level
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                        }`}
                      >
                        <option value="">Select experience level</option>
                        {experienceOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.experience_level && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.experience_level.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Salary Range
                      </label>
                      <input
                        {...register("salary")}
                        className="mt-1 block w-full rounded-lg border p-3 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder="e.g., $80,000 - $120,000"
                      />
                    </div>
                  </div>

                  {/* Rich Text Sections */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Job Description *
                      </label>
                      <textarea
                        {...register("description", {
                          required: "Description is required",
                          minLength: {
                            value: 30,
                            message:
                              "Description must be at least 30 characters",
                          },
                        })}
                        rows={5}
                        className={`mt-1 block w-full rounded-lg border p-3 focus:ring-2 ${
                          errors.description
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                        }`}
                        placeholder="Describe the role and responsibilities..."
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.description.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Requirements *
                      </label>
                      <textarea
                        {...register("requirements", {
                          required: "Requirements are required",
                          minLength: {
                            value: 50,
                            message:
                              "Requirements must be at least 50 characters",
                          },
                        })}
                        rows={5}
                        className={`mt-1 block w-full rounded-lg border p-3 focus:ring-2 ${
                          errors.requirements
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                        }`}
                        placeholder="List the required skills and qualifications..."
                      />
                      {errors.requirements && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.requirements.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Benefits
                      </label>
                      <textarea
                        {...register("benefits")}
                        rows={3}
                        className="mt-1 block w-full rounded-lg border p-3 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder="Describe the benefits package..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    className="px-6 py-3"
                    onClick={() => reset()}
                  >
                    Clear Form
                  </Button>
                  <Button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Posting...
                      </span>
                    ) : (
                      "Post Job"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
