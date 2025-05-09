import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Briefcase, 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Clock, 
  Award, 
  DollarSign, 
  FileText, 
  ListChecks, 
  Gift,
  Save,
  Send,
  Loader2
} from "lucide-react";

import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { toast } from "react-hot-toast";
import api from "../../api";
import { useAuthStore } from "../../store/authStore";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

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
  const [isDraft, setIsDraft] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<JobPostingForm>({
    defaultValues: {
      title: "",
      department: "",
      location: "",
      employment_type: "",
      experience_level: "",
      salary: "",
      description: "",
      requirements: "",
      benefits: "",
    }
  });

  const formValues = watch();
  const formCompletion = Object.entries(formValues).filter(([key, value]) => 
    value && typeof value === 'string' && value.trim() !== ''
  ).length;
  
  const formCompletionPercentage = Math.min(100, Math.round((formCompletion / 9) * 100));

  const onSubmit = async (data: JobPostingForm) => {
    try {
      setIsSubmitting(true);
      const response = await api.post("/jobs/", {
        ...data,
        employment_type: data.employment_type.toLowerCase().replace(" ", "-"),
        status: isDraft ? "draft" : "published",
      });
      
      if (response.status === 201) {
        toast.success(isDraft ? "Job saved as draft!" : "Job posted successfully!", {
          position: "bottom-right",
          duration: 2000,
        });
        reset();
        setTimeout(() => {
          navigate(`/jobs/company/${user?.id}`);
        }, 500);
      }
    } catch (error: any) {
      console.error(error);
      if (error.response && error.response.status !== 401) {
        toast.error(isDraft ? "Failed to save draft" : "Failed to post job");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveDraft = () => {
    setIsDraft(true);
    handleSubmit(onSubmit)();
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="sticky top-0 bg-white/95 backdrop-blur-md py-4 z-10 border-b border-gray-100 shadow-sm"
      >
        <div className="px-6 max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Post New Job</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="text-gray-500 border-gray-200 hover:bg-gray-50"
              onClick={() => navigate(`/jobs/company/${user?.id}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              All Job Postings
            </Button>
          </div>
        </div>
      </motion.header>

      <main className="py-6 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Banner */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="px-8 py-8 md:flex md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    Create a New Job Opportunity
                  </h2>
                  <p className="text-blue-100 mt-2 max-w-xl">
                    Fill in the details to attract the best talent for your team. Complete job postings receive 2x more qualified applicants.
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-white/10 border-4 border-white/30 flex items-center justify-center text-white text-2xl font-bold">
                    {formCompletionPercentage}%
                  </div>
                  <span className="text-blue-100 mt-2 text-sm">Form completion</span>
                </div>
              </div>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit((data) => {
            setIsDraft(false);
            onSubmit(data);
          })}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Form Content */}
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                className="lg:col-span-2"
              >
                <Card className="border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center">
                    <Briefcase className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Basic Information
                    </h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Job Title *
                        </label>
                        <div className="relative">
                          <Briefcase className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            {...register("title", {
                              required: "Title is required",
                            })}
                            className={`pl-10 block w-full rounded-lg border p-3 focus:ring-2 ${
                              errors.title
                                ? "border-red-500 focus:ring-red-200"
                                : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                            }`}
                            placeholder="e.g., Senior Frontend Developer"
                          />
                        </div>
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
                        <div className="relative">
                          <Building2 className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            {...register("department", {
                              required: "Department is required",
                            })}
                            className={`pl-10 block w-full rounded-lg border p-3 focus:ring-2 ${
                              errors.department
                                ? "border-red-500 focus:ring-red-200"
                                : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                            }`}
                            placeholder="e.g., Engineering"
                          />
                        </div>
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
                        <div className="relative">
                          <MapPin className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            {...register("location", {
                              required: "Location is required",
                            })}
                            className={`pl-10 block w-full rounded-lg border p-3 focus:ring-2 ${
                              errors.location
                                ? "border-red-500 focus:ring-red-200"
                                : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                            }`}
                            placeholder="e.g., New York, NY or Remote"
                          />
                        </div>
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
                        <div className="relative">
                          <Clock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <select
                            {...register("employment_type", {
                              required: "Employment type is required",
                            })}
                            className={`pl-10 block w-full rounded-lg border p-3 focus:ring-2 ${
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
                        </div>
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
                        <div className="relative">
                          <Award className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <select
                            {...register("experience_level", {
                              required: "Experience level is required",
                            })}
                            className={`pl-10 block w-full rounded-lg border p-3 focus:ring-2 ${
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
                        </div>
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
                        <div className="relative">
                          <DollarSign className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            {...register("salary")}
                            className="pl-10 block w-full rounded-lg border p-3 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            placeholder="e.g., $80,000 - $120,000"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Job Description Section */}
                <motion.div
                  variants={fadeInUp}
                  transition={{ delay: 0.1 }}
                  className="mt-8"
                >
                  <Card className="border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center">
                      <FileText className="w-5 h-5 text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Job Description
                      </h3>
                    </div>
                    <div className="p-6 space-y-6">
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
                          placeholder="Describe the role, responsibilities, and what success looks like in this position..."
                        />
                        {errors.description && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.description.message}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 italic">
                          Pro tip: Be specific about day-to-day responsibilities to attract the right candidates
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Requirements & Benefits Section */}
                <motion.div
                  variants={fadeInUp}
                  transition={{ delay: 0.2 }}
                  className="mt-8"
                >
                  <Card className="border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center">
                      <ListChecks className="w-5 h-5 text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Requirements & Benefits
                      </h3>
                    </div>
                    <div className="p-6 space-y-6">
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
                          placeholder="List the required skills, qualifications, and experience..."
                        />
                        {errors.requirements && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.requirements.message}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 italic">
                          Pro tip: Separate must-have skills from nice-to-have skills to expand your candidate pool
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                          <Gift className="w-4 h-4 mr-1 text-gray-500" />
                          Benefits
                        </label>
                        <textarea
                          {...register("benefits")}
                          rows={4}
                          className="mt-1 block w-full rounded-lg border p-3 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          placeholder="Describe the benefits package, perks, and company culture..."
                        />
                        <p className="text-xs text-gray-500 italic">
                          Pro tip: Highlighting unique benefits can help your job stand out from competitors
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>

              {/* Right Sidebar */}
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                transition={{ delay: 0.2 }}
                className="space-y-8"
              >
                {/* Job Preview */}
                <Card className="border border-gray-100 shadow-sm overflow-hidden sticky top-24">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Job Preview
                    </h3>
                  </div>
                  <div className="p-4 space-y-4">
                    {formValues.title ? (
                      <h4 className="font-bold text-lg text-gray-900">{formValues.title}</h4>
                    ) : (
                      <div className="h-6 bg-gray-100 rounded animate-pulse"></div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {formValues.department && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                          <Building2 className="w-3 h-3 mr-1" />
                          {formValues.department}
                        </span>
                      )}
                      
                      {formValues.location && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">
                          <MapPin className="w-3 h-3 mr-1" />
                          {formValues.location}
                        </span>
                      )}
                      
                      {formValues.employment_type && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                          <Clock className="w-3 h-3 mr-1" />
                          {formValues.employment_type}
                        </span>
                      )}
                    </div>
                    
                    {formValues.description ? (
                      <p className="text-sm text-gray-600 line-clamp-3">{formValues.description}</p>
                    ) : (
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-100 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-100 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4"></div>
                      </div>
                    )}
                    
                    {formValues.salary && (
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                        {formValues.salary}
                      </div>
                    )}
                  </div>
                  
                  {/* Form Progress */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Form Progress</h4>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${formCompletionPercentage}%` }}
                      ></div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      {formCompletionPercentage === 100 
                        ? "All set! Ready to post your job." 
                        : "Complete all fields for best results."}
                    </p>
                  </div>
                  
                  {/* Submit Buttons */}
                  <div className="p-4 bg-white border-t border-gray-100 space-y-3">
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
                      disabled={isSubmitting}
                    >
                      {isSubmitting && !isDraft ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Post Job Now
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                      onClick={saveDraft}
                      disabled={isSubmitting}
                    >
                      {isSubmitting && isDraft ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save as Draft
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </div>
          </form>
        </div>
      </main>
    </DashboardLayout>
  );
}