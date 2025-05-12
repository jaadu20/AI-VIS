import { useState, useEffect } from "react";
import {
  User,
  Plus,
  Trash,
  Camera,
  FileText,
  BookOpen,
  Award,
  Briefcase,
  ChevronLeft,
  CheckCircle,
  Shield,
  Mail,
  Phone,
  Calendar,
  LogOut,
  X,
  Upload,
  AlertCircle,
  Clock,
  Edit3,
  ExternalLink,
  Save,
  Loader,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import api from "../../api"; 

// Motion components for animations
const MotionDiv: React.FC<{
  children: React.ReactNode;
  className?: string;
  initial?: any;
  animate?: any;
  variants?: any;
  transition?: any;
  [key: string]: any;
}> = ({
  children,
  className,
  initial,
  animate,
  variants,
  transition,
  ...props
}) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

// Button component that respects the design system
const Button: React.FC<{
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost" | "destructive" | "subtle" | "link";
  className?: string;
  [key: string]: any;
}> = ({
  children,
  variant = "default",
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-50",
    ghost: "bg-transparent hover:bg-gray-100",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    subtle: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    link: "text-blue-600 hover:underline",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Badge component for skills display
const Badge: React.FC<{ children: React.ReactNode; onRemove?: () => void; className?: string }> = ({ children, onRemove, className = "" }) => {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 ${className}`}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-blue-200"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
};

// Spinner component for loading states
const Spinner = ({ className = "" }) => (
  <div
    className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 h-5 w-5 ${className}`}
  ></div>
);

// Input error message component
const ErrorMessage: React.FC<{ message?: string }> = ({ message }) =>
  message ? (
    <p className="mt-1 text-sm text-red-600 flex items-center">
      <AlertCircle className="h-3 w-3 mr-1" />
      {message}
    </p>
  ) : null;

// Form input component
const FormInput: React.FC<{ label?: string; error?: string; [key: string]: any }> = ({ label, error, ...props }) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
    )}
    <input
      className={`w-full px-4 py-2.5 rounded-lg border transition-colors focus:ring focus:ring-blue-200 focus:border-blue-500 ${
        error ? "border-red-300 bg-red-50" : "border-gray-300"
      }`}
      {...props}
    />
    <ErrorMessage message={error} />
  </div>
);

// Form textarea component
const FormTextarea: React.FC<{ label?: string; error?: string; [key: string]: any }> = ({ label, error, ...props }) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
    )}
    <textarea
      className={`w-full px-4 py-2.5 rounded-lg border transition-colors focus:ring focus:ring-blue-200 focus:border-blue-500 ${
        error ? "border-red-300 bg-red-50" : "border-gray-300"
      }`}
      {...props}
    />
    <ErrorMessage message={error} />
  </div>
);

// Education entry component
const EducationEntry = ({
  education,
  index,
  register,
  errors,
  remove,
  isEditing,
}: {
  education: {
    degree?: string;
    institution?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  };
  index: number;
  register: (name: string, options?: any) => { name: string; value: any; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void };
  errors?: Record<string, any>;
  remove: (index: number) => void;
  isEditing: boolean;
}) => {
  if (isEditing) {
    return (
      <MotionDiv className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Degree / Certification"
              placeholder="Bachelor of Science, Certification name, etc."
              {...register(`education.${index}.degree`, {
                required: "Degree is required",
              })}
              error={errors?.education?.[index]?.degree?.message}
            />
            <FormInput
              label="Institution"
              placeholder="University, College, or Organization name"
              {...register(`education.${index}.institution`, {
                required: "Institution is required",
              })}
              error={errors?.education?.[index]?.institution?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              type="date"
              label="Start Date"
              {...register(`education.${index}.startDate`, {
                required: "Start date is required",
              })}
              error={errors?.education?.[index]?.startDate?.message}
            />
            <FormInput
              type="date"
              label="End Date (or Expected)"
              {...register(`education.${index}.endDate`)}
              error={errors?.education?.[index]?.endDate?.message}
            />
          </div>

          <FormTextarea
            label="Description"
            rows={3}
            placeholder="Describe your academic achievements, relevant coursework, etc."
            {...register(`education.${index}.description`)}
            error={errors?.education?.[index]?.description?.message}
          />

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => remove(index)}
              variant="ghost"
              className="text-red-500 hover:text-red-700 hover:bg-red-50 text-sm py-1.5"
            >
              <Trash className="h-4 w-4 mr-1.5" />
              Remove Entry
            </Button>
          </div>
        </div>
      </MotionDiv>
    );
  }

  // View mode
  return (
    <MotionDiv className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex flex-wrap items-start justify-between mb-2">
        <h4 className="text-lg font-medium text-gray-900 mb-1">
          {education.degree || "Degree"}
        </h4>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-3.5 w-3.5 mr-1.5" />
          <span>
            {education.startDate
              ? new Date(education.startDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                })
              : "Start Date"}
            {" – "}
            {education.endDate
              ? new Date(education.endDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                })
              : "Present"}
          </span>
        </div>
      </div>
      <p className="text-blue-600 font-medium mb-2">
        {education.institution || "Institution"}
      </p>
      <p className="text-gray-600 text-sm whitespace-pre-line">
        {education.description || "No description provided"}
      </p>
    </MotionDiv>
  );
};

// Skills input component
const SkillsInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  errors?: { skills?: { message?: string } };
}> = ({ value, onChange, errors }) => {
  const [inputValue, setInputValue] = useState("");

  // Convert string to array
  const skillsArray = value
    ? value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    // Add skill on Enter or comma
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  };

  const addSkill = () => {
    const skill = inputValue.trim();
    if (skill && !skillsArray.includes(skill)) {
      const newSkills = [...skillsArray, skill].join(",");
      onChange(newSkills);
      setInputValue("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const newSkills = skillsArray
      .filter((skill) => skill !== skillToRemove)
      .join(",");
    onChange(newSkills);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 mb-2">
        {skillsArray.map((skill, i) => (
          <Badge key={i} onRemove={() => removeSkill(skill)}>
            {skill}
          </Badge>
        ))}
      </div>

      <div className="flex">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a skill and press Enter"
          className="flex-1 px-4 py-2.5 rounded-l-lg border-y border-l border-gray-300 focus:ring focus:ring-blue-200 focus:border-blue-500 focus:z-10"
        />
        <Button
          type="button"
          onClick={addSkill}
          className="rounded-l-none px-4 py-2.5"
        >
          Add
        </Button>
      </div>
      <ErrorMessage message={errors?.skills?.message} />
      <input type="hidden" value={value || ""} />
    </div>
  );
};

// File upload component
const FileUpload: React.FC<{
  label: string;
  accept: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentFile: File | null;
  errorMessage?: string;
}> = ({ label, accept, onChange, currentFile, errorMessage }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
        <input
          type="file"
          accept={accept}
          onChange={onChange}
          className="hidden"
          id={`file-${label.replace(/\s+/g, "-").toLowerCase()}`}
        />
        <label
          htmlFor={`file-${label.replace(/\s+/g, "-").toLowerCase()}`}
          className="cursor-pointer"
        >
          <div className="flex flex-col items-center">
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-blue-600">
              Click to upload
            </span>
            <span className="text-xs text-gray-500 mt-1">
              {currentFile
                ? `Current file: ${currentFile.name}`
                : "No file selected"}
            </span>
          </div>
        </label>
      </div>
      <ErrorMessage message={errorMessage} />
    </div>
  );
};

// Confirmation dialog component
const ConfirmDialog: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex items-center justify-center z-50">
      <MotionDiv className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>

        <div className="flex justify-end space-x-3">
          <Button
            onClick={onCancel}
            variant="outline"
            className="border-gray-300 px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
          >
            Confirm
          </Button>
        </div>
      </MotionDiv>
    </div>
  );
};

export function CandidateProfile() {
  const { userId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  interface EducationEntry {
    degree: string;
    institution: string;
    startDate: string;
    endDate: string;
    description: string;
  }
  
  interface FormData {
    name: string;
    email: string;
    phone: string;
    education: EducationEntry[];
    skills: string;
    experience: string;
    aboutMe: string;
    image?: File; // Added image property
    cv?: File; // Added cv property
  }
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    education: [],
    skills: "",
    experience: "",
    aboutMe: "",
  });
  const [formErrors, setFormErrors] = useState<{
    experience?: string;
    skills?: string;
    education?: Record<number, { degree?: string; institution?: string; startDate?: string }>;
    [key: string]: any;
  }>({});

  // Fetch profile data
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/candidate/profile/");
      const data = response.data;

      setFormData({
        name: data.user?.name || "",
        email: data.user?.email || "",
        phone: data.user?.phone || "",
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
      toast.error("Failed to load profile data");
      console.error("Profile fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

    if (file.size > 5_000_000) {
      setFormErrors((prev) => ({
        ...prev,
        image: "Image must be smaller than 5MB",
      }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setImageUrl(reader.result);
      }
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Handle CV upload
  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10_000_000) {
      setFormErrors((prev) => ({
        ...prev,
        cv: "CV must be smaller than 10MB",
      }));
      return;
    }

    setCvFile(file);
    setFormData((prev) => ({
      ...prev,
      cv: file,
    }));
  };

  // Handle education management
  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          degree: "",
          institution: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    }));
  };

  const removeEducation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const updateEducation = (index: number, field: keyof EducationEntry, value: string) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  // Form validation
  const validateForm = () => {
    const errors: {
      skills?: string;
      education?: Record<number, { degree?: string; institution?: string; startDate?: string }>;
      [key: string]: any;
    } = {};

    // Validate skills
    if (formData.skills && formData.skills.split(",").length > 15) {
      errors.skills = "Maximum 15 skills allowed";
    }

    // Validate education
    if (formData.education?.length) {
      const eduErrors: Record<number, { degree?: string; institution?: string; startDate?: string }>[] = [];
      formData.education.forEach((edu: EducationEntry, index) => {
        const entryErrors: { degree?: string; institution?: string; startDate?: string } = {};
        if (!edu.degree?.trim()) entryErrors.degree = "Degree is required";
        if (!edu.institution?.trim())
          entryErrors.institution = "Institution is required";
        if (!edu.startDate) entryErrors.startDate = "Start date is required";

        if (Object.keys(entryErrors).length) {
          eduErrors[index] = entryErrors;
        }
      });

      if (eduErrors.length) {
        errors.education = eduErrors;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    setIsSaving(true);
    try {
      const submitData = new FormData();

      // Append form data
      submitData.append("skills", formData.skills || "");
      submitData.append("experience", formData.experience || "");
      submitData.append("about_me", formData.aboutMe || "");
      submitData.append("education", JSON.stringify(formData.education || []));

      // Add files if present
      if (formData.image instanceof File) {
        submitData.append("image", formData.image);
      }

      if (formData.cv instanceof File) {
        submitData.append("cv", formData.cv);
      }

      // Submit to API
      await api.patch("/api/candidate/profile/", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Refresh data to ensure consistency
      await fetchProfile();

      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout/");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  // Convert skills string to array for display
  const skillsArray = formData.skills
    ? formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    : [];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="flex flex-col items-center">
            <Loader className="h-10 w-10 text-blue-500 animate-spin mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Loading Profile
            </h3>
            <p className="text-gray-600">
              Please wait while we retrieve your information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-x-hidden">
      {/* Fixed Header */}
      <header className="fixed w-full bg-white/95 backdrop-blur-md py-3 z-50 shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                className="flex items-center text-blue-600 py-2 p-4"
                onClick={() => navigate(-1)}
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back
              </Button>
              <div className="bg-blue-600 p-2 rounded-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                My Profile
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "default"}
                className={`px-4 py-2 ${
                  isEditing
                    ? "border-blue-300 text-blue-600"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200/50"
                }`}
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4" />
                    Edit Profile
                  </>
                )}
              </Button>

              <Button
                onClick={() => setShowLogoutDialog(true)}
                variant="outline"
                className="flex items-center border-red-200 text-red-600 hover:bg-red-50 py-2 pr-2"
              >
                <LogOut className="h-4 w-8" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Logout confirmation dialog */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutDialog(false)}
      />

      <main className="pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 lg:col-span-1">
                <div className="flex flex-col items-center text-center">
                  {/* Profile Image */}
                  <div className="relative group mb-6">
                    <div className=" w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100">
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

                  {/* Name */}
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {formData.name || user?.name || "Your Name"}
                  </h2>

                  {/* Profile Badge */}
                  <div className="mb-6 mt-2 flex flex-col items-center">
                    <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full flex items-center">
                      <Shield className="h-3 w-3 mr-1.5" />
                      Professional Profile
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="w-full space-y-3 mb-6">
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm truncate">
                        {formData.email || user?.email || "Email"}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm">
                        {formData.phone ||
                          user?.phone ||
                          "Add your phone number"}
                      </span>
                    </div>
                  </div>

                  {/* CV Upload Section */}
                  <div className="w-full border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-blue-500" />
                      Resume / CV
                    </h3>

                    {isEditing ? (
                      <FileUpload
                        label="Upload CV (PDF)"
                        accept=".pdf"
                        onChange={handleCvChange}
                        currentFile={cvFile}
                        errorMessage={formErrors.cv}
                      />
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
              </div>

              {/* Main Content Section */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 lg:col-span-2 flex flex-col h-full">
                {/* About Me Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-600" />
                    About Me
                  </h3>

                  {isEditing ? (
                    <FormTextarea
                      name="aboutMe"
                      value={formData.aboutMe || ""}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder="Write a professional summary about yourself..."
                      error={formErrors.aboutMe}
                    />
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-line">
                      {formData.aboutMe || "No information provided yet"}
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
                    <SkillsInput
                      value={formData.skills}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, skills: value }))
                      }
                      errors={{ skills: formErrors.skills ? { message: formErrors.skills } : undefined }}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {skillsArray.length > 0 ? (
                        skillsArray.map((skill, index) => (
                          <Badge key={index}>{skill}</Badge>
                        ))
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-4 w-full text-gray-500 text-center">
                          No skills added yet
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Experience Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                    Experience
                  </h3>

                  {isEditing ? (
                    <FormTextarea
                      name="experience"
                      value={formData.experience || ""}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder="Describe your professional experience..."
                      error={formErrors.experience}
                    />
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-line">
                      {formData.experience ||
                        "No experience information provided yet"}
                    </div>
                  )}
                </div>
                {/* Education Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                      Education
                    </h3>

                    {isEditing && (
                      <Button
                        type="button"
                        onClick={addEducation}
                        variant="subtle"
                        className="flex items-center text-sm py-1.5"
                      >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Add Education
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {formData.education && formData.education.length > 0 ? (
                      formData.education.map((edu, index) => (
                        <EducationEntry
                          key={index}
                          education={edu}
                          index={index}
                          register={(name, options) => ({
                            name,
                            value: edu[name.split(".")[2] as keyof EducationEntry],
                            onChange: (e) =>
                              updateEducation(
                                index,
                                name.split(".")[2] as keyof EducationEntry,
                                e.target.value
                              ),
                            ...options,
                          })}
                          errors={formErrors}
                          remove={removeEducation}
                          isEditing={isEditing}
                        />
                      ))
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-6 text-gray-500 text-center">
                        No education entries added yet
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                {isEditing && (
                  <div className="mt-auto pt-6 border-t border-gray-100">
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="flex items-center px-6 py-2.5"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Spinner className="mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Profile
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
