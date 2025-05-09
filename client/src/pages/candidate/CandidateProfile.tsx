import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import {
  User,
  Plus,
  Trash,
  Camera,
  FileText,
  BookOpen,
  Award,
  Briefcase,
  Clock,
  ChevronLeft,
  CheckCircle,
  Shield,
  Settings,
  MapPin,
  Mail,
  Phone,
  Calendar,
  LogOut,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import api from "../../api";
import { toast } from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

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
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const { register, handleSubmit, control, setValue, reset, watch } =
    useForm<ProfileForm>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  // Get the skills as an array for display
  const skillsArray =
    watch("skills")
      ?.split(",")
      .map((skill) => skill.trim())
      .filter(Boolean) || [];

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

  const handleLogout = () => {
    api.post("/api/auth/logout/")
      .then(() => {
        // Remove tokens from storage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/");
      })
      .catch(error => {
        console.error("Logout error:", error);
      });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-blue-200 h-20 w-20 mb-4"></div>
            <div className="h-6 bg-blue-200 rounded w-48 mb-4"></div>
            <div className="h-4 bg-blue-100 rounded w-64"></div>
          </div>
          <p className="mt-6 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-x-hidden">
      {/* Fixed Header with glass effect */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="fixed w-full bg-white/95 backdrop-blur-md py-4 z-50 shadow-md border-b border-blue-100"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="flex items-center text-blue-600"
                onClick={() => navigate(-1)}
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back
              </Button>
              <div className="bg-blue-600 p-2 rounded-lg ml-2">
                <User className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                My Profile
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "default"}
                className={`px-6 ${
                  isEditing
                    ? "border-blue-300 text-blue-600"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200/50"
                }`}
              >
                {isEditing ? "Cancel Editing" : "Edit Profile"}
              </Button>

              <Button
                onClick={() => setShowLogoutDialog(true)}
                variant="outline"
                className="flex items-center border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Logout confirmation dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Logout
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to log out of your account?
            </p>

            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowLogoutDialog(false)}
                variant="outline"
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Logout
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <main className="pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Profile Card */}
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-xl shadow-md border border-gray-100 p-6 lg:col-span-1"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="relative group mb-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100">
                      <img
                        src={imageUrl || "/api/placeholder/120/120"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {isEditing && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <label
                          htmlFor="imageUpload"
                          className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Camera className="h-8 w-8 text-white" />
                        </label>
                        <input
                          type="file"
                          id="imageUpload"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {watch("name") || "Your Name"}
                  </h2>

                  {/* Highlight section */}
                  <div className="mb-6 mt-3 flex flex-col items-center">
                    <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full flex items-center mb-2">
                      <Shield className="h-3 w-3 mr-1" />
                      Professional Profile
                    </span>
                  </div>

                  {/* Contact info */}
                  <div className="w-full space-y-3 mb-6">
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm truncate">{watch("email")}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm">
                        {watch("phone") || "Add your phone number"}
                      </span>
                    </div>
                  </div>

                  {/* CV Upload section */}
                  <div className="w-full border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-blue-500" />
                      Resume / CV
                    </h3>

                    {isEditing ? (
                      <div className="mt-2">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {cvFile && (
                          <p className="mt-2 text-xs text-gray-500 truncate">
                            Current: {cvFile.name}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        {cvFile ? (
                          <div className="bg-blue-50 text-blue-700 py-2 px-4 rounded-full text-sm flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            <span className="truncate max-w-xs">
                              {cvFile.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">
                            No CV uploaded yet
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Main Content Section */}
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-xl shadow-md border border-gray-100 p-6 lg:col-span-2 flex flex-col h-full"
              >
                {/* About Me Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-600" />
                    About Me
                  </h3>
                  {isEditing ? (
                    <textarea
                      {...register("aboutMe")}
                      className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:ring focus:ring-blue-200 focus:border-blue-400 transition-all"
                      rows={5}
                      placeholder="Write a professional summary about yourself..."
                    />
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                      {watch("aboutMe") || "No information provided yet"}
                    </div>
                  )}
                </div>

                {/* Skills Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                    Skills
                  </h3>

                  {isEditing ? (
                    <textarea
                      {...register("skills")}
                      className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:ring focus:ring-blue-200 focus:border-blue-400 transition-all"
                      placeholder="Enter your skills separated by commas (e.g., React, TypeScript, UI Design)"
                      rows={3}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {skillsArray.length > 0 ? (
                        skillsArray.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-4 text-gray-700 w-full">
                          No skills listed yet
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Experience Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                    Professional Experience
                  </h3>

                  {isEditing ? (
                    <textarea
                      {...register("experience")}
                      className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:ring focus:ring-blue-200 focus:border-blue-400 transition-all"
                      placeholder="Describe your professional experience"
                      rows={5}
                    />
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                      {watch("experience") ||
                        "No experience information provided yet"}
                    </div>
                  )}
                </div>

                {/* Education Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                      Education
                    </h3>
                    {isEditing && (
                      <Button
                        type="button"
                        onClick={() =>
                          append({
                            degree: "",
                            institution: "",
                            startDate: "",
                            endDate: "",
                            description: "",
                          })
                        }
                        variant="outline"
                        className="text-sm border-blue-200 text-blue-600"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Education
                      </Button>
                    )}
                  </div>

                  {fields.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                      No education history added yet
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={field.id}
                          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                        >
                          {isEditing ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Degree
                                  </label>
                                  <input
                                    {...register(`education.${index}.degree`)}
                                    className="w-full px-3 py-2 rounded-md border border-blue-200 focus:ring focus:ring-blue-200 focus:border-blue-400"
                                    placeholder="Bachelor of Science"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Institution
                                  </label>
                                  <input
                                    {...register(
                                      `education.${index}.institution`
                                    )}
                                    className="w-full px-3 py-2 rounded-md border border-blue-200 focus:ring focus:ring-blue-200 focus:border-blue-400"
                                    placeholder="University Name"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Start Date
                                  </label>
                                  <input
                                    type="date"
                                    {...register(
                                      `education.${index}.startDate`
                                    )}
                                    className="w-full px-3 py-2 rounded-md border border-blue-200 focus:ring focus:ring-blue-200 focus:border-blue-400"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1">
                                    End Date
                                  </label>
                                  <input
                                    type="date"
                                    {...register(`education.${index}.endDate`)}
                                    className="w-full px-3 py-2 rounded-md border border-blue-200 focus:ring focus:ring-blue-200 focus:border-blue-400"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  Description
                                </label>
                                <textarea
                                  {...register(
                                    `education.${index}.description`
                                  )}
                                  className="w-full px-3 py-2 rounded-md border border-blue-200 focus:ring focus:ring-blue-200 focus:border-blue-400"
                                  rows={3}
                                  placeholder="Describe your education, achievements, etc."
                                />
                              </div>

                              <div className="flex justify-end">
                                <Button
                                  type="button"
                                  onClick={() => remove(index)}
                                  variant="ghost"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash className="h-4 w-4 mr-1" />
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex flex-wrap justify-between mb-2">
                                <h4 className="text-lg font-medium text-gray-900">
                                  {watch(`education.${index}.degree`) ||
                                    "Degree"}
                                </h4>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  <span>
                                    {watch(`education.${index}.startDate`) ||
                                      "Start Date"}
                                    {" - "}
                                    {watch(`education.${index}.endDate`) ||
                                      "End Date"}
                                  </span>
                                </div>
                              </div>
                              <p className="text-blue-600 font-medium mb-2">
                                {watch(`education.${index}.institution`) ||
                                  "Institution"}
                              </p>
                              <p className="text-gray-600 text-sm">
                                {watch(`education.${index}.description`) ||
                                  "No description provided"}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>

            {/* Save Button */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 flex justify-end"
              >
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 shadow-md shadow-blue-200/50"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Profile
                </Button>
              </motion.div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
