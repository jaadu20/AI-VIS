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
      <h2 className="text-2xl font-bold mb-6">Edit Job Posting</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Title *</label>
            <input
              {...register("title", { required: "Title is required" })}
              className={`input ${errors.title ? "input-error" : ""}`}
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>

          {/* Department */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Department *</label>
            <input
              {...register("department", {
                required: "Department is required",
              })}
              className={`input ${errors.department ? "input-error" : ""}`}
            />
            {errors.department && (
              <p className="text-red-500 text-sm">
                {errors.department.message}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Location *</label>
            <input
              {...register("location", {
                required: "Location is required",
              })}
              className={`input ${errors.location ? "input-error" : ""}`}
            />
            {errors.location && (
              <p className="text-red-500 text-sm">{errors.location.message}</p>
            )}
          </div>

          {/* Employment Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Employment Type *
            </label>
            <select
              {...register("employment_type", {
                required: "Type is required",
              })}
              className={`input ${errors.employment_type ? "input-error" : ""}`}
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
            <label className="block text-sm font-medium">
              Experience Level *
            </label>
            <select
              {...register("experience_level", {
                required: "Experience is required",
              })}
              className={`input ${
                errors.experience_level ? "input-error" : ""
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
            <label className="block text-sm font-medium">Salary</label>
            <input {...register("salary")} className="input" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Description *</label>
          <textarea
            {...register("description", {
              required: "Description is required",
              minLength: { value: 50, message: "Minimum 50 characters" },
            })}
            rows={4}
            className={`input ${errors.description ? "input-error" : ""}`}
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description.message}</p>
          )}
        </div>

        {/* Requirements */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Requirements *</label>
          <textarea
            {...register("requirements", {
              required: "Requirements are required",
              minLength: { value: 50, message: "Minimum 50 characters" },
            })}
            rows={4}
            className={`input ${errors.requirements ? "input-error" : ""}`}
          />
          {errors.requirements && (
            <p className="text-red-500 text-sm">
              {errors.requirements.message}
            </p>
          )}
        </div>

        {/* Benefits */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Benefits</label>
          <textarea {...register("benefits")} rows={3} className="input" />
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </CustomModal>
  );
};
