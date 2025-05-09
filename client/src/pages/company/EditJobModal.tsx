// components/EditJobModal.tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Job } from "../../types";
import api from "../../api";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../components/ui/Button";
import { 
  X, 
  Briefcase, 
  Building2, 
  MapPin, 
  Clock, 
  Award, 
  DollarSign,
  Save,
  AlertCircle,
  Loader2
} from "lucide-react";

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

const statusOptions = [
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
  { label: "Closed", value: "closed" },
];

export const EditJobModal = ({
  job,
  onClose,
  onSave,
}: {
  job: Job;
  onClose: () => void;
  onSave: (updatedJob: Job) => void;
}) => {
  const [activeTab, setActiveTab] = useState("details");
  const [charCount, setCharCount] = useState({
    description: job.description?.length || 0,
    requirements: job.requirements?.length || 0,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<Job>({
    defaultValues: {
      ...job,
      employment_type: job.employment_type
        ? job.employment_type
            .split("-")
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(" ")
        : "Full-time",
      status: job.status || "published"
    },
  });

  // Watch form values for character count
  const descriptionValue = watch("description");
  const requirementsValue = watch("requirements");

  useEffect(() => {
    setCharCount({
      description: descriptionValue?.length || 0,
      requirements: requirementsValue?.length || 0,
    });
  }, [descriptionValue, requirementsValue]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const onSubmit = async (data: Job) => {
    try {
      const formattedData = {
        ...data,
        employment_type: data.employment_type.toLowerCase().replace(/\s+/g, "-"),
      };

      const response = await api.put(`/jobs/update/${job.id}/`, formattedData);
      onSave(response.data);
      toast.success("Job updated successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to update job");
      console.error("Update error:", error);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative z-10 w-full max-w-3xl rounded-xl bg-white shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-blue-600 text-white flex justify-between items-center">
            <div className="flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              <h2 className="text-xl font-bold">Edit Job Posting</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-blue-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              className={`px-6 py-3 font-medium text-sm flex items-center transition-colors ${
                activeTab === "details"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
              onClick={() => setActiveTab("details")}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Basic Details
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm flex items-center transition-colors ${
                activeTab === "description"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
              onClick={() => setActiveTab("description")}
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Description & Requirements
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {activeTab === "details" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <Briefcase className="w-4 h-4 mr-1 text-gray-400" />
                        Job Title <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        {...register("title", { required: "Title is required" })}
                        className={`w-full rounded-lg border p-3 ${
                          errors.title
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        }`}
                        placeholder="e.g. Senior Frontend Developer"
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {errors.title.message}
                        </p>
                      )}
                    </div>

                    {/* Department */}
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <Building2 className="w-4 h-4 mr-1 text-gray-400" />
                        Department <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        {...register("department", {
                          required: "Department is required",
                        })}
                        className={`w-full rounded-lg border p-3 ${
                          errors.department
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        }`}
                        placeholder="e.g. Engineering"
                      />
                      {errors.department && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {errors.department.message}
                        </p>
                      )}
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        Location <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        {...register("location", {
                          required: "Location is required",
                        })}
                        className={`w-full rounded-lg border p-3 ${
                          errors.location
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        }`}
                        placeholder="e.g. San Francisco, CA (Remote)"
                      />
                      {errors.location && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {errors.location.message}
                        </p>
                      )}
                    </div>

                    {/* Employment Type */}
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                        Employment Type <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        {...register("employment_type", {
                          required: "Type is required",
                        })}
                        className={`w-full rounded-lg border p-3 ${
                          errors.employment_type
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        }`}
                      >
                        {employmentTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Experience Level */}
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <Award className="w-4 h-4 mr-1 text-gray-400" />
                        Experience Level <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        {...register("experience_level", {
                          required: "Experience is required",
                        })}
                        className={`w-full rounded-lg border p-3 ${
                          errors.experience_level
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        }`}
                      >
                        {experienceOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Salary */}
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                        Salary Range
                      </label>
                      <input
                        {...register("salary")}
                        className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder="e.g. $100,000 - $130,000"
                      />
                    </div>
                    
                    {/* Status */}
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        Job Status <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        {...register("status", {
                          required: "Status is required",
                        })}
                        className={`w-full rounded-lg border p-3 ${
                          errors.status
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        }`}
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      Benefits
                    </label>
                    <textarea
                      {...register("benefits")}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="List job benefits such as health insurance, PTO, etc."
                    />
                  </div>
                </div>
              )}

              {activeTab === "description" && (
                <div className="space-y-6">
                  {/* Description */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-700">
                        Job Description <span className="text-red-500">*</span>
                      </label>
                      <span className={`text-xs ${charCount.description < 50 ? "text-red-500" : "text-gray-500"}`}>
                        {charCount.description}/1000 characters (min: 50)
                      </span>
                    </div>
                    <textarea
                      {...register("description", {
                        required: "Description is required",
                        minLength: {
                          value: 50,
                          message: "Minimum 50 characters required",
                        },
                        maxLength: {
                          value: 1000,
                          message: "Maximum 1000 characters allowed",
                        },
                      })}
                      rows={6}
                      className={`w-full rounded-lg border p-3 ${
                        errors.description
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      }`}
                      placeholder="Provide a detailed description of the role, responsibilities, and what the job entails..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  {/* Requirements */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-700">
                        Requirements <span className="text-red-500">*</span>
                      </label>
                      <span className={`text-xs ${charCount.requirements < 50 ? "text-red-500" : "text-gray-500"}`}>
                        {charCount.requirements}/1000 characters (min: 50)
                      </span>
                    </div>
                    <textarea
                      {...register("requirements", {
                        required: "Requirements are required",
                        minLength: {
                          value: 50,
                          message: "Minimum 50 characters required",
                        },
                        maxLength: {
                          value: 1000,
                          message: "Maximum 1000 characters allowed",
                        },
                      })}
                      rows={6}
                      className={`w-full rounded-lg border p-3 ${
                        errors.requirements
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      }`}
                      placeholder="List skills, qualifications, education, and experience needed for the role..."
                    />
                    {errors.requirements && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.requirements.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {isDirty && "You have unsaved changes"}
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};