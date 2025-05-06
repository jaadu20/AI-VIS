// components/EditJobModal.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Job } from "../../types";
import api from "../../api";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../components/ui/Button";
import { X } from "lucide-react";

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

export const EditJobModal = ({
  job,
  onClose,
  onSave,
}: {
  job: Job;
  onClose: () => void;
  onSave: (updatedJob: Job) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<Job>({
    defaultValues: {
      ...job,
      employment_type: job.employment_type
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" "),
    },
  });

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
        employment_type: data.employment_type.toLowerCase().replace(" ", "-"),
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
          className="fixed inset-0 bg-black/30"
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
          className="relative z-10 w-full max-w-2xl rounded-xl bg-white p-8 shadow-xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>

          <h2 className="text-2xl font-bold mb-6">Edit Job Posting</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  {...register("title", { required: "Title is required" })}
                  className={`w-full rounded-lg border p-3 ${
                    errors.title
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Department */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Department *
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
                />
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.department.message}
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Location *
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
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.location.message}
                  </p>
                )}
              </div>

              {/* Employment Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Employment Type *
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
                <label className="block text-sm font-medium text-gray-700">
                  Experience Level *
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
                <label className="block text-sm font-medium text-gray-700">
                  Salary
                </label>
                <input
                  {...register("salary")}
                  className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                {...register("description", {
                  required: "Description is required",
                  minLength: {
                    value: 50,
                    message: "Minimum 50 characters required",
                  },
                })}
                rows={4}
                className={`w-full rounded-lg border p-3 ${
                  errors.description
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Requirements */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Requirements *
              </label>
              <textarea
                {...register("requirements", {
                  required: "Requirements are required",
                  minLength: {
                    value: 50,
                    message: "Minimum 50 characters required",
                  },
                })}
                rows={4}
                className={`w-full rounded-lg border p-3 ${
                  errors.requirements
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                }`}
              />
              {errors.requirements && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.requirements.message}
                </p>
              )}
            </div>

            {/* Benefits */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Benefits
              </label>
              <textarea
                {...register("benefits")}
                rows={3}
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-6 py-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};