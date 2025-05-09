import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  BarChart3,
  MessageSquare,
  Video,
  Clock,
  CheckCircle,
  FileText,
  Award,
  Tag,
  Download,
  AlertCircle,
  ThumbsUp,
  ChevronDown,
  ChevronRight,
  Zap,
} from "lucide-react";
import { Button } from "../../components/ui/Button";

// Animation variants
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
  visible: { opacity: 1, y: 0 },
};

export function CandidateProfile() {
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSection, setExpandedSection] = useState("skills");

  // Mock data for the candidate
  const candidate = {
    id: "C-10492",
    name: "Alexander Thompson",
    photo: "/api/placeholder/200/200", // Placeholder image
    title: "Senior Full Stack Developer",
    location: "San Francisco, CA",
    email: "alex.thompson@example.com",
    phone: "(415) 555-9876",
    status: "Shortlisted",
    appliedDate: "March 15, 2024",
    lastInterviewDate: "April 10, 2024",
    education: [
      {
        degree: "M.S. Computer Science",
        institution: "Stanford University",
        year: "2018-2020",
      },
      {
        degree: "B.S. Computer Engineering",
        institution: "University of California, Berkeley",
        year: "2014-2018",
      },
    ],
    experience: [
      {
        role: "Full Stack Developer",
        company: "TechForward Solutions",
        duration: "2020-Present",
        description:
          "Led development of scalable web applications using React, Node.js, and AWS.",
      },
      {
        role: "Frontend Developer",
        company: "InnovateTech",
        duration: "2018-2020",
        description:
          "Developed responsive user interfaces using modern JavaScript frameworks.",
      },
    ],
    skills: {
      technical: [
        "JavaScript",
        "React",
        "Node.js",
        "Python",
        "AWS",
        "MongoDB",
        "Docker",
        "GraphQL",
      ],
      soft: [
        "Communication",
        "Problem Solving",
        "Team Leadership",
        "Project Management",
        "Adaptability",
      ],
    },
    interviews: [
      {
        position: "Senior Full Stack Developer",
        company: "TechVision Inc.",
        date: "April 10, 2024",
        status: "Completed",
        score: 87,
        duration: "45 minutes",
        interviewer: "John Doe",
        feedback:
          "Great technical skills but needs improvement in communication.",
        reportUrl: "#",
        recordingUrl: "#",
      },
      {
        position: "Lead Developer",
        company: "InnoSoft Solutions",
        date: "March 22, 2024",
        status: "Completed",
        score: 82,
        duration: "38 minutes",
        interviewer: "John Doe",
        feedback:
          "Great technical skills but needs improvement in communication.",
        reportUrl: "#",
        recordingUrl: "#",
      },
    ],
    assessment: {
      overall: 85,
      technical: 88,
      communication: 84,
      problemSolving: 90,
      teamwork: 82,
      cultural: 83,
      strengths: [
        "Technical knowledge",
        "Problem solving",
        "Communication clarity",
      ],
      improvement: ["Cultural alignment", "Team collaboration"],
    },
    sentiment: {
      confidence: 87,
      enthusiasm: 76,
      engagement: 90,
      stress: 25,
    },
  };

  // Helper function for score color
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-500";
    if (score >= 70) return "text-blue-500";
    return "text-yellow-500";
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null as unknown as string);
    } else {
      setExpandedSection(section);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      {/* Header with basic info */}
      <header className="bg-white border-b border-gray-200 mb-6 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold overflow-hidden">
                  <img
                    src={candidate.photo}
                    alt={candidate.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </motion.div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {candidate.name}
                  </h1>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    {candidate.status}
                  </span>
                </div>
                <p className="text-gray-600">{candidate.title}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{candidate.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Applied: {candidate.appliedDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>ID: {candidate.id}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
              <Button
                variant="outline"
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                <Video className="w-4 h-4 mr-2" />
                Schedule Interview
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mt-8">
            {["Overview", "Interviews", "Assessment", "Documents"].map(
              (tab) => {
                const tabId = tab.toLowerCase();
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tabId)}
                    className={`px-6 py-3 text-sm font-medium transition-colors ${
                      activeTab === tabId
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab}
                  </button>
                );
              }
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4">
        {/* Add your content here */}
      </main>
      {/* Add your content here */}
      {/* Overview Tab */}
      {activeTab === "overview" && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Left column - Bio & Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Information */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">
                  Contact Information
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-800">{candidate.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-800">{candidate.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-gray-800">{candidate.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Skills Section */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div
                className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection("skills")}
              >
                <h2 className="font-semibold text-gray-800">
                  Skills & Expertise
                </h2>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    expandedSection === "skills" ? "transform rotate-180" : ""
                  }`}
                />
              </div>
              {expandedSection === "skills" && (
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Technical Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.technical.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full flex items-center"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Soft Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.soft.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full flex items-center"
                        >
                          <User className="w-3 h-3 mr-1" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Education Section */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div
                className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection("education")}
              >
                <h2 className="font-semibold text-gray-800">Education</h2>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    expandedSection === "education"
                      ? "transform rotate-180"
                      : ""
                  }`}
                />
              </div>
              {expandedSection === "education" && (
                <div className="p-6">
                  <div className="space-y-6">
                    {candidate.education.map((edu, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <GraduationCap className="w-5 h-5" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">
                            {edu.degree}
                          </h3>
                          <p className="text-gray-600">{edu.institution}</p>
                          <p className="text-sm text-gray-500">{edu.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Experience Section */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div
                className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection("experience")}
              >
                <h2 className="font-semibold text-gray-800">Work Experience</h2>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    expandedSection === "experience"
                      ? "transform rotate-180"
                      : ""
                  }`}
                />
              </div>
              {expandedSection === "experience" && (
                <div className="p-6">
                  <div className="space-y-6">
                    {candidate.experience.map((exp, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <Briefcase className="w-5 h-5" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">
                            {exp.role}
                          </h3>
                          <p className="text-gray-600">{exp.company}</p>
                          <p className="text-sm text-gray-500 mb-2">
                            {exp.duration}
                          </p>
                          <p className="text-sm text-gray-600">
                            {exp.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right column - Assessment Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Candidate Summary */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">
                  Candidate Summary
                </h2>
              </div>
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-800 mb-1">
                        AI-Generated Summary
                      </h3>
                      <p className="text-blue-700">
                        Alexander is a highly qualified Senior Full Stack
                        Developer with 4+ years of experience in web application
                        development. He demonstrates strong technical skills in
                        modern JavaScript frameworks and cloud technologies,
                        with excellent problem-solving abilities and
                        communication skills. His interviews show high
                        confidence levels and engagement, making him well-suited
                        for technically challenging roles requiring leadership.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-800">
                      Performance Metrics
                    </h3>

                    {/* Overall Score */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">
                          Overall Assessment
                        </span>
                        <span
                          className={`font-bold text-lg ${getScoreColor(
                            candidate.assessment.overall
                          )}`}
                        >
                          {candidate.assessment.overall}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${candidate.assessment.overall}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <Award className="w-4 h-4" />
                          </div>
                          <span className="text-gray-700">
                            Technical Skills
                          </span>
                        </div>
                        <span
                          className={`font-medium ${getScoreColor(
                            candidate.assessment.technical
                          )}`}
                        >
                          {candidate.assessment.technical}%
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          <span className="text-gray-700">Communication</span>
                        </div>
                        <span
                          className={`font-medium ${getScoreColor(
                            candidate.assessment.communication
                          )}`}
                        >
                          {candidate.assessment.communication}%
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <ThumbsUp className="w-4 h-4" />
                          </div>
                          <span className="text-gray-700">Problem Solving</span>
                        </div>
                        <span
                          className={`font-medium ${getScoreColor(
                            candidate.assessment.problemSolving
                          )}`}
                        >
                          {candidate.assessment.problemSolving}%
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <User className="w-4 h-4" />
                          </div>
                          <span className="text-gray-700">Cultural Fit</span>
                        </div>
                        <span
                          className={`font-medium ${getScoreColor(
                            candidate.assessment.cultural
                          )}`}
                        >
                          {candidate.assessment.cultural}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sentiment Analysis */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-800">
                      Sentiment Analysis
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">
                            Confidence
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            {candidate.sentiment.confidence}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${candidate.sentiment.confidence}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">
                            Enthusiasm
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            {candidate.sentiment.enthusiasm}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${candidate.sentiment.enthusiasm}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">
                            Engagement
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            {candidate.sentiment.engagement}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{
                              width: `${candidate.sentiment.engagement}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">
                            Stress Level
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            {candidate.sentiment.stress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{ width: `${candidate.sentiment.stress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Strengths & Areas for Improvement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-800 mb-3">
                      Key Strengths
                    </h3>
                    <div className="space-y-2">
                      {candidate.assessment.strengths.map((strength, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-gray-700">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-800 mb-3">
                      Areas for Improvement
                    </h3>
                    <div className="space-y-2">
                      {candidate.assessment.improvement.map((area, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                          <span className="text-gray-700">{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recent Interviews */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">
                  Recent Interviews
                </h2>
                <Button
                  variant="outline"
                  className="text-xs px-3 py-1 h-auto"
                  onClick={() => setActiveTab("interviews")}
                >
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {candidate.interviews.map((interview, index) => (
                    <div
                      key={index}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <Video className="w-5 h-5" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">
                            {interview.position}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {interview.company}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{interview.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{interview.duration}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          {interview.status}
                        </div>
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span
                            className={`font-bold text-sm ${getScoreColor(
                              interview.score
                            )}`}
                          >
                            {interview.score}%
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          className="text-blue-600 text-xs px-3 py-1 h-auto"
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Interviews Tab */}
      {activeTab === "interviews" && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">Interview History</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {candidate.interviews.map((interview, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="p-5 bg-gray-50 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {interview.position}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {interview.company}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        {interview.date}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {interview.status}
                      </span>
                    </div>
                  </div>

                  {/* Interview Details */}
                  <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="text-gray-800">{interview.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <BarChart3 className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-sm text-gray-600">Score</p>
                          <p
                            className={`font-medium ${getScoreColor(
                              interview.score
                            )}`}
                          >
                            {interview.score}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-sm text-gray-600">Interviewer</p>
                          <p className="text-gray-800">
                            {interview.interviewer}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-sm text-gray-600">Date</p>
                          <p className="text-gray-800">{interview.date}</p>
                        </div>
                      </div>
                    </div>

                    {/* Feedback Section */}
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-800 mb-3">
                        Interview Feedback
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {interview.feedback}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex flex-wrap gap-3">
                      <a
                        className="inline-flex items-center px-4 py-2 border border-blue-100 text-blue-600 text-sm rounded hover:bg-blue-50"
                        href={interview.reportUrl}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Full Report
                      </a>
                      <a
                        className="inline-flex items-center px-4 py-2 border border-purple-100 text-purple-600 text-sm rounded hover:bg-purple-50"
                        href={interview.recordingUrl}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Watch Recording
                      </a>
                      <Button
                        variant="outline"
                        className="text-green-600 border-green-100 hover:bg-green-50 text-sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Transcript
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
