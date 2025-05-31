// src/pages/company/CompanyProfile.tsx

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  ChevronDown,
  Search,
  Bell,
  Edit3,
  Save,
  X,
  Camera,
  Globe,
  Briefcase,
  Users,
  Clock,
} from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useNavigate, useParams } from "react-router-dom";
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

export function CompanyProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState({
    companyName: "Tech Innovators Ltd.",
    email: "contact@techinnovators.com",
    phone: "+1 (555) 123-4567",
    address: "123 Silicon Valley, California, USA",
    website: "www.techinnovators.com",
    industry: "Information Technology",
    size: "50-100 employees",
    founded: "2015",
    description:
      "We are a leading tech company specializing in AI-powered solutions for recruitment and talent acquisition. Our innovative platform helps businesses find the right talent quickly and efficiently, using advanced algorithms to match candidates with job requirements.",
    socialMedia: {
      linkedin: "linkedin.com/company/techinnovators",
      twitter: "twitter.com/techinnovators",
      facebook: "facebook.com/techinnovators",
    },
  });

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    console.log("Profile updated:", profile);
    // Here you would typically send the updated profile to your backend
  };

  // Company Stats (sample data)
  const companyStats = [
    {
      label: "Active Jobs",
      value: "2",
      icon: Briefcase,
    },
    {
      label: "Total Applications",
      value: "3",
      icon: Users,
    },
    {
      label: "Avg. Time to Hire",
      value: "7 days",
      icon: Clock,
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="h-screen w-full flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

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
            <h1 className="text-xl font-bold text-gray-900">Company Profile</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
              />
            </div>

            <button className="p-2 rounded-full hover:bg-gray-100 relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-2 ml-4 cursor-pointer">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {user?.name?.charAt(0) || "C"}
              </div>
              <span className="text-sm font-medium hidden md:block">
                {user?.name || "Company"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
            </div>
          </div>
        </div>
      </motion.header>

      <main className="py-6 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Profile Header */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-lg overflow-hidden relative">
              <div className="px-8 py-8 md:py-10 md:flex md:items-center md:justify-between">
                <div className="mb-4 md:mb-0 flex items-center">
                  <div className="h-20 w-20 bg-white rounded-xl shadow-md flex items-center justify-center mr-6">
                    <Building2 className="h-10 w-10 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      {user?.name || "Company Name"}
                    </h2>
                    <p className="text-blue-100 mt-2">{profile.industry}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="text-white border-white/30 hover:bg-white/10 hover:border-white"
                    onClick={() =>
                      window.open(`https://${profile.website}`, "_blank")
                    }
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Visit Website
                  </Button>
                  <Button
                    className="bg-white text-blue-600 hover:bg-blue-50"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {companyStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {stat.value}
                        </p>
                      </div>
                      <div className="bg-blue-600 p-3 rounded-lg">
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Details */}
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              className="lg:col-span-2"
            >
              <Card className="border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Company Information
                    </h3>
                  </div>
                  {isEditing && (
                    <Button
                      onClick={handleSave}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  )}
                </div>
                <div className="p-6 divide-y divide-gray-100">
                  {/* Description */}
                  <div className="py-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      About Company
                    </h4>
                    {isEditing ? (
                      <textarea
                        name="description"
                        value={profile.description}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3"
                        rows={5}
                      ></textarea>
                    ) : (
                      <p className="text-gray-700">{profile.description}</p>
                    )}
                  </div>

                  {/* Contact Information */}
                  <div className="py-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-4">
                      Contact Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start">
                        <Mail className="w-5 h-5 text-blue-500 mr-3 mt-1" />
                        <div>
                          <span className="block text-sm text-gray-500">
                            Email
                          </span>
                          {isEditing ? (
                            <input
                              type="email"
                              name="email"
                              value={profile.email}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                            />
                          ) : (
                            <span className="text-gray-900">
                              {profile.email}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Phone className="w-5 h-5 text-blue-500 mr-3 mt-1" />
                        <div>
                          <span className="block text-sm text-gray-500">
                            Phone
                          </span>
                          {isEditing ? (
                            <input
                              type="text"
                              name="phone"
                              value={profile.phone}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                            />
                          ) : (
                            <span className="text-gray-900">
                              {profile.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Globe className="w-5 h-5 text-blue-500 mr-3 mt-1" />
                        <div>
                          <span className="block text-sm text-gray-500">
                            Website
                          </span>
                          {isEditing ? (
                            <input
                              type="text"
                              name="website"
                              value={profile.website}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                            />
                          ) : (
                            <a
                              href={`https://${profile.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {profile.website}
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start">
                        <MapPin className="w-5 h-5 text-blue-500 mr-3 mt-1" />
                        <div>
                          <span className="block text-sm text-gray-500">
                            Address
                          </span>
                          {isEditing ? (
                            <input
                              type="text"
                              name="address"
                              value={profile.address}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                            />
                          ) : (
                            <span className="text-gray-900">
                              {profile.address}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Company Details */}
                  <div className="py-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-4">
                      Company Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="block text-sm text-gray-500">
                          Company Name
                        </span>
                        {isEditing ? (
                          <input
                            type="text"
                            name="companyName"
                            value={profile.companyName}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                          />
                        ) : (
                          <span className="text-gray-900">
                            {profile.companyName}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="block text-sm text-gray-500">
                          Industry
                        </span>
                        {isEditing ? (
                          <input
                            type="text"
                            name="industry"
                            value={profile.industry}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                          />
                        ) : (
                          <span className="text-gray-900">
                            {profile.industry}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="block text-sm text-gray-500">
                          Company Size
                        </span>
                        {isEditing ? (
                          <input
                            type="text"
                            name="size"
                            value={profile.size}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                          />
                        ) : (
                          <span className="text-gray-900">{profile.size}</span>
                        )}
                      </div>
                      <div>
                        <span className="block text-sm text-gray-500">
                          Founded
                        </span>
                        {isEditing ? (
                          <input
                            type="text"
                            name="founded"
                            value={profile.founded}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                          />
                        ) : (
                          <span className="text-gray-900">
                            {profile.founded}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Right Column */}
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              {/* Profile Image */}
              <Card className="border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Company Logo
                  </h3>
                </div>
                <div className="p-6 flex flex-col items-center">
                  <div className="h-32 w-32 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <Building2 className="h-16 w-16 text-gray-400" />
                  </div>
                  {isEditing && (
                    <Button
                      variant="outline"
                      className="mt-2 text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Change Logo
                    </Button>
                  )}
                </div>
              </Card>

              {/* Social Media */}
              <Card className="border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Social Media
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <span className="block text-sm text-gray-500 mb-1">
                      LinkedIn
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        name="linkedin"
                        value={profile.socialMedia.linkedin}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            socialMedia: {
                              ...profile.socialMedia,
                              linkedin: e.target.value,
                            },
                          })
                        }
                        className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                      />
                    ) : (
                      <a
                        href={`https://${profile.socialMedia.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {profile.socialMedia.linkedin}
                      </a>
                    )}
                  </div>
                  <div>
                    <span className="block text-sm text-gray-500 mb-1">
                      Twitter
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        name="twitter"
                        value={profile.socialMedia.twitter}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            socialMedia: {
                              ...profile.socialMedia,
                              twitter: e.target.value,
                            },
                          })
                        }
                        className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                      />
                    ) : (
                      <a
                        href={`https://${profile.socialMedia.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {profile.socialMedia.twitter}
                      </a>
                    )}
                  </div>
                  <div>
                    <span className="block text-sm text-gray-500 mb-1">
                      Facebook
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        name="facebook"
                        value={profile.socialMedia.facebook}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            socialMedia: {
                              ...profile.socialMedia,
                              facebook: e.target.value,
                            },
                          })
                        }
                        className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                      />
                    ) : (
                      <a
                        href={`https://${profile.socialMedia.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {profile.socialMedia.facebook}
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
