import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Job } from "../../types";
import api from "../../api";
import { Button } from "../../components/ui/Button";
import { CustomModal } from "../../components/ui/CustomModal";

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
  } = useForm<Job>({
    defaultValues: {
      ...job,
      employment_type: job.employment_type
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" "),
    },
  });

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
    <CustomModal isOpen={true} onClose={onClose}>
      <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Edit Job Posting
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title *
              </label>
              <input
                {...register("title", { required: "Title is required" })}
                className={`w-full input input-bordered ${
                  errors.title ? "border-red-500" : ""
                }`}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Department *
              </label>
              <input
                {...register("department", {
                  required: "Department is required",
                })}
                className={`w-full input input-bordered ${
                  errors.department ? "border-red-500" : ""
                }`}
              />
              {errors.department && (
                <p className="text-sm text-red-500">
                  {errors.department.message}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location *
              </label>
              <input
                {...register("location", { required: "Location is required" })}
                className={`w-full input input-bordered ${
                  errors.location ? "border-red-500" : ""
                }`}
              />
              {errors.location && (
                <p className="text-sm text-red-500">
                  {errors.location.message}
                </p>
              )}
            </div>

            {/* Employment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Employment Type *
              </label>
              <select
                {...register("employment_type", {
                  required: "Type is required",
                })}
                className={`w-full input input-bordered ${
                  errors.employment_type ? "border-red-500" : ""
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
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Experience Level *
              </label>
              <select
                {...register("experience_level", {
                  required: "Experience is required",
                })}
                className={`w-full input input-bordered ${
                  errors.experience_level ? "border-red-500" : ""
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
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Salary
              </label>
              <input
                {...register("salary")}
                className="w-full input input-bordered"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              {...register("description", {
                required: "Description is required",
                minLength: { value: 50, message: "Minimum 50 characters" },
              })}
              rows={4}
              className={`w-full input input-bordered ${
                errors.description ? "border-red-500" : ""
              }`}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Requirements *
            </label>
            <textarea
              {...register("requirements", {
                required: "Requirements are required",
                minLength: { value: 50, message: "Minimum 50 characters" },
              })}
              rows={4}
              className={`w-full input input-bordered ${
                errors.requirements ? "border-red-500" : ""
              }`}
            />
            {errors.requirements && (
              <p className="text-sm text-red-500">
                {errors.requirements.message}
              </p>
            )}
          </div>

          {/* Benefits */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Benefits
            </label>
            <textarea
              {...register("benefits")}
              rows={3}
              className="w-full input input-bordered"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </CustomModal>
  );
};
