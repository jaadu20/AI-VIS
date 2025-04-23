import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "../../components/ui/Button";
import { Plus, Trash, User } from "lucide-react";
import api from "../../api";
import { toast } from "react-hot-toast";

interface EducationEntry {
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
  education: EducationEntry[];
  skills: string;
  experience: string;
  cv: FileList | null;
  image: FileList | null;
  aboutMe: string;
}

export function CandidateProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, control, setValue, reset } =
    useForm<ProfileForm>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/api/candidate/profile/");
        const data = response.data;

        reset({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          education: data.education || [],
          skills: data.skills || "",
          experience: data.experience || "",
          aboutMe: data.about_me || "",
        });

        if (data.image) {
          setImageUrl(`${api.defaults.baseURL}${data.image}?t=${Date.now()}`);
        }
        if (data.cv) {
          setCvFile(new File([], data.cv.split("/").pop() || "CV.pdf"));
        }
      } catch (error) {
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: ProfileForm) => {
    try {
      const formData = new FormData();

      // Validate file sizes
      if (data.image?.[0] && data.image[0].size > 5_000_000) {
        toast.error("Profile image must be smaller than 5MB");
        return;
      }

      if (data.cv?.[0] && data.cv[0].size > 10_000_000) {
        toast.error("CV must be smaller than 10MB");
        return;
      }

      // Append form data
      formData.append("skills", data.skills);
      formData.append("experience", data.experience);
      formData.append("about_me", data.aboutMe);
      formData.append("education", JSON.stringify(data.education));

      if (data.image?.[0]) formData.append("image", data.image[0]);
      if (data.cv?.[0]) formData.append("cv", data.cv[0]);

      await api.patch("/api/candidate/profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Refresh data
      const response = await api.get("/api/candidate/profile/");
      const newData = response.data;

      reset({
        name: newData.user.name,
        email: newData.user.email,
        phone: newData.user.phone,
        education: newData.education || [],
        skills: newData.skills || "",
        experience: newData.experience || "",
        aboutMe: newData.about_me || "",
      });

      if (newData.image) {
        setImageUrl(`${api.defaults.baseURL}${newData.image}?t=${Date.now()}`);
      }
      setCvFile(new File([], newData.cv?.split("/").pop() || "CV.pdf"));

      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5_000_000) {
        toast.error("Image must be smaller than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setValue("image", e.target.files);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10_000_000) {
        toast.error("CV must be smaller than 10MB");
        return;
      }
      setCvFile(file);
      setValue("cv", e.target.files);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {/* Candidate Profile on the left */}
            <div className="flex items-center">
              <User className="h-6 w-6 mr-2 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            </div>

            {/* Button on the right */}
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
              className="px-6"
            >
              {isEditing ? "Cancel Editing" : "Edit Profile"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-8">
            {/* Profile Section */}
            <div className="flex items-start gap-8">
              {/* Image upload */}
              <div className="w-32 h-32 relative group mt-14">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={!isEditing}
                  className="hidden"
                  id="imageUpload"
                />
                <label
                  htmlFor="imageUpload"
                  className={`cursor-pointer ${
                    !isEditing ? "pointer-events-none" : ""
                  }`}
                >
                  <div className="relative rounded-full overflow-hidden border-4 border-gray-100">
                    <img
                      src={imageUrl || "/default-avatar.png"}
                      className="w-32 h-32 object-cover"
                      alt="Profile"
                    />
                    {isEditing && (
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm font-medium">
                          Change Photo
                        </span>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Read-only Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    {...register("name")}
                    disabled
                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    {...register("email")}
                    disabled
                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    {...register("phone")}
                    disabled
                    className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Editable Sections */}
            <section className="space-y-6">
              {/* Education Section */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  Education
                </h3>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                    >
                      {/* Education fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-sm text-gray-600">
                            Degree
                          </label>
                          <input
                            {...register(`education.${index}.degree`)}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 mt-1 rounded-md border border-gray-300"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">
                            Institution
                          </label>
                          <input
                            {...register(`education.${index}.institution`)}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 mt-1 rounded-md border border-gray-300"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">
                          Description
                        </label>
                        <textarea
                          {...register(`education.${index}.description`)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 mt-1 rounded-md border border-gray-300"
                          rows={3}
                        />
                      </div>
                      {isEditing && (
                        <div className="mt-4 flex justify-end">
                          <Button
                            type="button"
                            onClick={() => remove(index)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {isEditing && (
                  <Button
                    type="button"
                    onClick={() =>
                      append({
                        degree: "",
                        institution: "",
                        description: "",
                        startDate: "",
                        endDate: "",
                      })
                    }
                    variant="ghost"
                    className="mt-4"
                  >
                    <Plus className="h-5 w-5 mr-2" /> Add Education
                  </Button>
                )}
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  Professional Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills
                    </label>
                    <textarea
                      {...register("skills")}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="List your key skills (comma separated)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Professional Experience
                    </label>
                    <textarea
                      {...register("experience")}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Describe your professional experience"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  Attachments
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload CV (PDF only)
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      disabled={!isEditing}
                      className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {cvFile && (
                      <p className="mt-2 text-sm text-gray-600">
                        Current CV: {cvFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  About Me
                </h3>
                <textarea
                  {...register("aboutMe")}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Describe yourself professionally"
                />
              </div>
            </section>

            {isEditing && (
              <div className="flex justify-end border-t border-gray-200 pt-8">
                <Button type="submit" className="px-8">
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </motion.div>
      </main>
    </div>
  );
}
