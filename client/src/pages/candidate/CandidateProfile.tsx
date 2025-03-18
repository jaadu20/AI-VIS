import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "../../components/ui/Button";
import { Plus } from "lucide-react";

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
  education: {
    degree: string;
    institution: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  educationLevel: string;
  skills: string;
  experience: string;
  cv: FileList | null;
  coverLetter: FileList | null;
  image: FileList | null;
  aboutMe: string;
}

export function CandidateProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);

  const { register, handleSubmit, control, setValue, watch } =
    useForm<ProfileForm>({
      defaultValues: {
        name: "John Doe",
        email: "john@example.com",
        phone: "+1 234 567 890",
        education: [
          {
            degree: "BSc Computer Science",
            institution: "XYZ University",
            startDate: "09/2018",
            endDate: "06/2022",
            description: "Graduated with High Honors",
          },
        ],
        educationLevel: "Undergraduate",
        skills: "React, TypeScript, Node.js",
        experience: "3 years of frontend development",
        cv: null,
        coverLetter: null,
        image: null,
        aboutMe:
          "I am a passionate developer with a love for creating innovative solutions. I enjoy working with modern web technologies like React and Node.js. I am always looking for new challenges to improve my skills.",
      },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem("profile");
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      setValue("name", profileData.name);
      setValue("email", profileData.email);
      setValue("phone", profileData.phone);
      setValue("education", profileData.education);
      setValue("educationLevel", profileData.educationLevel);
      setValue("skills", profileData.skills);
      setValue("experience", profileData.experience);
      setValue("aboutMe", profileData.aboutMe);
      if (profileData.image) {
        setImageUrl(profileData.image);
      }
    }
  }, [setValue]);

  const onSubmit = (data: ProfileForm) => {
    console.log(data);
    localStorage.setItem("profile", JSON.stringify(data));
    setIsEditing(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setValue("image", e.target.files);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "cv" | "coverLetter"
  ) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      if (type === "cv") {
        setCvFile(file);
        setValue("cv", e.target.files);
      } else if (type === "coverLetter") {
        setCoverLetterFile(file);
        setValue("coverLetter", e.target.files);
      }
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-r from-blue-50 via-green-100 to-yellow-100"
      style={{
        backgroundImage:
          "url('https://t4.ftcdn.net/jpg/04/91/04/57/360_F_491045782_57jOG41DcPq4BxRwYqzLrhsddudrq2MM.jpg')",
        backgroundAttachment: "fixed",
      }}
    >
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-4xl font-extrabold text-gray-900">My Profile</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden p-6 space-y-8"
        >
          <div className="flex items-center space-x-6">
            <div className="w-40 h-40 relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={!isEditing}
                className="hidden"
                id="imageUpload"
              />
              <label htmlFor="imageUpload" className="cursor-pointer">
                <div className="w-full h-full rounded-full bg-gray-100 border-4 border-gray-300 shadow-lg flex items-center justify-center overflow-hidden relative">
                  <img
                    src={
                      imageUrl ||
                      "https://static.vecteezy.com/system/resources/thumbnails/036/594/092/small_2x/man-empty-avatar-photo-placeholder-for-social-networks-resumes-forums-and-dating-sites-male-and-female-no-photo-images-for-unfilled-user-profile-free-vector.jpg"
                    }
                    className="w-full h-full object-cover"
                  />
                  {isEditing && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 py-1 text-center text-white text-sm rounded-b-full">
                      <label htmlFor="imageUpload" className="cursor-pointer">
                        <span className="font-semibold text-lg">
                          Upload New Image
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>
          {!isEditing && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                {watch("name")}
              </h2>
              <p className="mt-2 text-gray-600">{watch("aboutMe")}</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              className="py-2 px-6 text-lg"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  {...register("name")}
                  disabled={!isEditing}
                  className="mt-2 block w-full px-4 py-3 rounded-md border-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  {...register("email")}
                  disabled={!isEditing}
                  className="mt-2 block w-full px-4 py-3 rounded-md border-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  {...register("phone")}
                  disabled={!isEditing}
                  className="mt-2 block w-full px-4 py-3 rounded-md border-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Education Level
                </label>
                <input
                  {...register("educationLevel")}
                  disabled={!isEditing}
                  className="mt-2 block w-full px-4 py-3 rounded-md border-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Education
              </label>
              <div className="space-y-6">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="bg-gray-50 p-6 rounded-lg shadow-sm space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-600">Degree</label>
                        <input
                          {...register(`education.${index}.degree`)}
                          disabled={!isEditing}
                          className="mt-2 block w-full px-4 py-3 rounded-md border-2 border-gray-300"
                        />
                      </div>

                      <div>
                        <label className="text-gray-600">Institution</label>
                        <input
                          {...register(`education.${index}.institution`)}
                          disabled={!isEditing}
                          className="mt-2 block w-full px-4 py-3 rounded-md border-2 border-gray-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-600">Description</label>
                      <textarea
                        {...register(`education.${index}.description`)}
                        disabled={!isEditing}
                        className="mt-2 block w-full px-4 py-3 rounded-md border-2 border-gray-300"
                      />
                    </div>

                    {isEditing && (
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          onClick={() => remove(index)}
                          className="bg-red-500 text-white px-4 py-2 rounded-md"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {isEditing && (
                  <div className="flex justify-start mt-4">
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
                      className="bg-green-500 text-white px-4 py-2 rounded-md"
                    >
                      <Plus className="h-5 w-5" />
                      Add Education
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Skills
              </label>
              <input
                {...register("skills")}
                disabled={!isEditing}
                className="mt-2 block w-full px-4 py-3 rounded-md border-2 border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Experience
              </label>
              <textarea
                {...register("experience")}
                disabled={!isEditing}
                className="mt-2 block w-full px-4 py-3 rounded-md border-2 border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Upload CV
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileChange(e, "cv")}
                disabled={!isEditing}
                className="mt-2 block w-full px-4 py-3 rounded-md border-2 border-gray-300"
              />
              {cvFile && (
                <p className="mt-2 text-sm text-gray-600">CV: {cvFile.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Upload Cover Letter
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileChange(e, "coverLetter")}
                disabled={!isEditing}
                className="mt-2 block w-full px-4 py-3 rounded-md border-2 border-gray-300"
              />
              {coverLetterFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Cover Letter: {coverLetterFile.name}
                </p>
              )}
            </div>

            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  About Me
                </label>
                <textarea
                  {...register("aboutMe")}
                  disabled={!isEditing}
                  className="mt-2 block w-full px-4 py-3 rounded-md border-2 border-gray-300"
                />
              </div>
            )}

            {isEditing && (
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-3 rounded-md"
                >
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
