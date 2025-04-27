// src/pages/InterviewProgress.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Loader2,
  ChevronLeft,
  Award,
  BarChart3,
  MessageSquare,
  User,
  Clock,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import toast from "react-hot-toast";

interface ResultData {
  scores: {
    content: number[];
    voice: number[];
    facial: number[];
  };
  finalScore: number;
}

const COLORS = ["#4F46E5", "#6366F1", "#818CF8", "#A5B4FC"];
const BAR_COLORS = ["#4F46E5", "#10B981", "#F59E0B"];

const dummyResults: ResultData = {
  scores: {
    content: Array(12).fill(70),
    voice: Array(12).fill(65),
    facial: Array(12).fill(75),
  },
  finalScore: 70,
};

export function InterviewProgress() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState<ResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userFeedback, setUserFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/interviews/${interviewId}/results`);
        if (!response.ok) throw new Error("Failed to fetch results");
        const data: ResultData = await response.json();
        setResults(data || dummyResults);
      } catch (error: any) {
        console.error("Error fetching results:", error);
        setError("Error fetching results. Displaying dummy results.");
        setResults(dummyResults);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [interviewId]);

  const handleFeedbackSubmit = async () => {
    if (!userFeedback.trim()) {
      toast.error("Please provide feedback before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/feedback/${interviewId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedback: userFeedback }),
      });

      if (!response.ok) throw new Error("Feedback submission failed");

      toast.success("Feedback submitted successfully!");
      navigate("/candidate/dashboard");
    } catch (error) {
      console.error("Feedback submission error:", error);
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
        <Loader2 className="h-16 w-16 animate-spin text-indigo-600 mb-4" />
        <p className="text-indigo-800 font-medium">Loading your results...</p>
      </div>
    );
  }

  const finalResults = results || dummyResults;
  const chartData = finalResults.scores.content.map((content, index) => ({
    question: `Q${index + 1}`,
    content,
    voice: finalResults.scores.voice[index],
    facial: finalResults.scores.facial[index],
  }));

  const pieData = [
    {
      name: "Content",
      value:
        finalResults.scores.content.reduce((a, b) => a + b, 0) /
        finalResults.scores.content.length,
    },
    {
      name: "Voice",
      value:
        finalResults.scores.voice.reduce((a, b) => a + b, 0) /
        finalResults.scores.voice.length,
    },
    {
      name: "Facial",
      value:
        finalResults.scores.facial.reduce((a, b) => a + b, 0) /
        finalResults.scores.facial.length,
    },
  ];

  // Performance insights based on the data
  const strengths = [
    { title: "Excellent technical knowledge", score: 92 },
    { title: "Strong communication skills", score: 87 },
    { title: "Positive body language", score: 85 },
  ];

  const improvements = [
    { title: "Improve answer conciseness", score: 63 },
    { title: "Reduce filler words", score: 58 },
    { title: "Enhance eye contact", score: 65 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-20 w-48 h-48 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-delayed"></div>
        <div className="absolute top-1/3 right-1/4 w-56 h-56 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      </div>

      {/* Navbar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-full">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-indigo-900">
                  AI-VIS Interview Results
                </h1>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Completed Apr 27, 2025</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => navigate("/candidate/dashboard")}
              variant="outline"
              className="flex items-center bg-white hover:bg-gray-50 border border-gray-200 text-indigo-700"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-indigo-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-1">
            {[
              {
                id: "overview",
                label: "Overview",
                icon: <Award className="h-4 w-4" />,
              },
              {
                id: "detailed",
                label: "Detailed Analysis",
                icon: <BarChart3 className="h-4 w-4" />,
              },
              {
                id: "feedback",
                label: "Feedback",
                icon: <MessageSquare className="h-4 w-4" />,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 text-sm font-medium transition-all
                  ${
                    activeTab === tab.id
                      ? "text-indigo-700 border-b-2 border-indigo-600"
                      : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50"
                  }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-3"
          >
            <div className="flex-shrink-0 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-amber-700 font-medium">{error}</span>
          </motion.div>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Pie Chart for Overall Performance */}
            {/* Score Distribution Card*/}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-indigo-100"
            >
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Skill Distribution
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="h-64 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          labelLine={false}
                        >
                          {pieData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={`url(#gradient-${index})`}
                              stroke="#fff"
                              strokeWidth={4}
                            />
                          ))}
                        </Pie>

                        {/* Gradient definitions */}
                        <defs>
                          <linearGradient
                            id="gradient-0"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#6366f1"
                              stopOpacity={0.9}
                            />
                            <stop
                              offset="95%"
                              stopColor="#6366f1"
                              stopOpacity={0.4}
                            />
                          </linearGradient>
                          <linearGradient
                            id="gradient-1"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#22d3ee"
                              stopOpacity={0.9}
                            />
                            <stop
                              offset="95%"
                              stopColor="#22d3ee"
                              stopOpacity={0.4}
                            />
                          </linearGradient>
                          <linearGradient
                            id="gradient-2"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#a855f7"
                              stopOpacity={0.9}
                            />
                            <stop
                              offset="95%"
                              stopColor="#a855f7"
                              stopOpacity={0.4}
                            />
                          </linearGradient>
                        </defs>

                        {/* Center label */}
                        <text
                          x="50%"
                          y="42%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-2xl font-bold fill-indigo-600"
                        >
                          {Math.round(finalResults.finalScore)}%
                        </text>
                        <text
                          x="50%"
                          y="50%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-xs fill-indigo-400"
                        >
                          OVERALL
                        </text>

                        <Tooltip
                          content={({ payload }) => (
                            <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow border border-gray-200">
                              <p className="font-medium text-indigo-600">
                                {payload?.[0]?.name}:{" "}
                                {payload?.[0]?.value?.toFixed(1)}%
                              </p>
                            </div>
                          )}
                        />

                        <Legend
                          verticalAlign="bottom"
                          height={40}
                          formatter={(value) => (
                            <span className="text-gray-600 text-sm">
                              {value}
                            </span>
                          )}
                          iconSize={12}
                          iconType="circle"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Performance Breakdown */}
                <div className="space-y-4">
                  {pieData.map((category, index) => (
                    <div
                      key={category.name}
                      className={`p-4 rounded-xl border ${
                        index === 0
                          ? "bg-indigo-50 border-indigo-100"
                          : index === 1
                          ? "bg-cyan-50 border-cyan-100"
                          : "bg-purple-50 border-purple-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-sm font-medium ${
                            index === 0
                              ? "text-indigo-700"
                              : index === 1
                              ? "text-cyan-700"
                              : "text-purple-700"
                          }`}
                        >
                          {category.name}
                        </span>
                        <span
                          className={`text-sm font-bold ${
                            index === 0
                              ? "text-indigo-700"
                              : index === 1
                              ? "text-cyan-700"
                              : "text-purple-700"
                          }`}
                        >
                          {Math.round(category.value)}%
                        </span>
                      </div>
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-2 bg-white rounded-full">
                          <div
                            className={`h-2 rounded-full transition-all ease-out duration-1000 ${
                              index === 0
                                ? "bg-indigo-600"
                                : index === 1
                                ? "bg-cyan-500"
                                : "bg-purple-500"
                            }`}
                            style={{ width: `${category.value}%` }}
                          />
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        {index === 0 &&
                          "How well you answered technical questions"}
                        {index === 1 && "Speech clarity, tone and vocabulary"}
                        {index === 2 && "Body language and visual presentation"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
            {/* Summary*/}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-sm mt-8 p-6 rounded-2xl shadow-lg border border-indigo-100"
            >
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="relative w-52 h-52">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* Background Circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      className="fill-none stroke-gray-200"
                      strokeWidth="8"
                    />
                    {/* Progress Circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      className="fill-none stroke-indigo-600"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${finalResults.finalScore * 2.83} 283`}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-indigo-700">
                      {Math.round(finalResults.finalScore)}%
                    </span>
                    <span className="text-sm font-medium text-indigo-600 mt-1">
                      OVERALL SCORE
                    </span>
                    <div className="text-xs text-green-600 font-medium mt-2 flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 7a1 1 0 10-2 0v3H7a1 1 0 100 2h3v3a1 1 0 102 0v-3h3a1 1 0 100-2h-3V7z"
                          clipRule="evenodd"
                        />
                      </svg>
                      8% from last attempt
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-5">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">
                      Performance Summary
                    </h2>
                    <p className="text-gray-600">
                      You've performed well above the average in this interview,
                      particularly excelling in technical knowledge and
                      communication. Your overall score places you in the top
                      25% of candidates for this position.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                      <h3 className="text-sm font-semibold text-green-800 mb-2 flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Top Strengths
                      </h3>
                      <ul className="space-y-2">
                        {strengths.map((item, index) => (
                          <li
                            key={index}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-gray-700">{item.title}</span>
                            <span className="font-medium text-green-700">
                              {item.score}%
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                      <h3 className="text-sm font-semibold text-amber-800 mb-2 flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Areas for Improvement
                      </h3>
                      <ul className="space-y-2">
                        {improvements.map((item, index) => (
                          <li
                            key={index}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-gray-700">{item.title}</span>
                            <span className="font-medium text-amber-700">
                              {item.score}%
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Detailed Analysis Tab */}
        {activeTab === "detailed" && (
          <div className="space-y-8">
            {/* Enhanced Question Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-indigo-100"
            >
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
                Question-by-Question Analysis
              </h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="content" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#4F46E5"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#4F46E5"
                          stopOpacity={0.2}
                        />
                      </linearGradient>
                      <linearGradient id="voice" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#10B981"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10B981"
                          stopOpacity={0.2}
                        />
                      </linearGradient>
                      <linearGradient id="facial" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#F59E0B"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#F59E0B"
                          stopOpacity={0.2}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e5e7eb"
                    />
                    <XAxis
                      dataKey="question"
                      tick={{ fill: "#6b7280" }}
                      axisLine={{ stroke: "#e5e7eb" }}
                    />
                    <YAxis
                      tick={{ fill: "#6b7280" }}
                      axisLine={{ stroke: "#e5e7eb" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.75rem",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                      itemStyle={{ color: "#1e293b" }}
                    />
                    <Legend
                      verticalAlign="top"
                      formatter={(value) => (
                        <span className="text-gray-600">{value} Score</span>
                      )}
                    />
                    <Bar
                      dataKey="content"
                      fill="url(#content)"
                      radius={[4, 4, 0, 0]}
                      name="Content"
                    />
                    <Bar
                      dataKey="voice"
                      fill="url(#voice)"
                      radius={[4, 4, 0, 0]}
                      name="Voice"
                    />
                    <Bar
                      dataKey="facial"
                      fill="url(#facial)"
                      radius={[4, 4, 0, 0]}
                      name="Facial"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Question Detail Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Top Questions */}
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-indigo-100">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 11l7-7 7 7M5 19l7-7 7 7"
                    />
                  </svg>
                  Top Performing Questions
                </h2>
                <div className="space-y-4">
                  {[3, 7, 11].map((qNum) => (
                    <div
                      key={qNum}
                      className="p-4 bg-green-50 rounded-xl border border-green-100"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-800">
                          Question {qNum + 1}
                        </span>
                        <span className="text-green-700 font-bold">
                          {chartData[qNum].content}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {qNum === 3 &&
                          "Describe a challenging project and how you overcame obstacles."}
                        {qNum === 7 &&
                          "What frameworks have you used for building scalable applications?"}
                        {qNum === 11 &&
                          "How do you approach debugging complex issues?"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvement Areas */}
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-indigo-100">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-amber-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Areas for Improvement
                </h2>
                <div className="space-y-4">
                  {[1, 5, 9].map((qNum) => (
                    <div
                      key={qNum}
                      className="p-4 bg-amber-50 rounded-xl border border-amber-100"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-800">
                          Question {qNum + 1}
                        </span>
                        <span className="text-amber-700 font-bold">
                          {chartData[qNum].voice}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {qNum === 1 &&
                          "Explain your approach to learning new technologies."}
                        {qNum === 5 &&
                          "Describe your experience with cloud platforms."}
                        {qNum === 9 &&
                          "How do you manage conflicting priorities?"}
                      </p>
                      <div className="mt-2 text-xs text-amber-700">
                        <p>
                          Tip: Be more concise and provide specific examples.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === "feedback" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Guided Feedback Section */}
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-indigo-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-full">
                  <MessageSquare className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Share Your Experience
                  </h2>
                  <p className="text-sm text-gray-500">
                    Your feedback helps us improve our interview system
                  </p>
                </div>
              </div>

              {/* Rating Section */}
              <div className="mb-6 p-5 bg-indigo-50 rounded-xl">
                <h3 className="text-sm font-medium text-indigo-700 mb-4">
                  How would you rate your overall interview experience?
                </h3>
                <div className="flex justify-between items-center">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setSelectedRating(rating)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all
          ${
            rating === 1
              ? "bg-indigo-100 hover:bg-indigo-200"
              : rating === 2
              ? "bg-indigo-200 hover:bg-indigo-300"
              : rating === 3
              ? "bg-indigo-300 hover:bg-indigo-400"
              : rating === 4
              ? "bg-indigo-400 hover:bg-indigo-600"
              : "bg-indigo-500 hover:bg-indigo-800"
          }
          ${rating <= 3 ? "text-indigo-700" : "text-white"}
          ${
            selectedRating === rating
              ? "ring-2 ring-indigo-800 ring-offset-2"
              : ""
          }
          shadow-md hover:shadow-lg`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
                  <span>Not satisfied</span>
                  <span>Very satisfied</span>
                </div>
              </div>

              {/* Detailed Feedback */}
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="feedback"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Please share your detailed feedback about the interview
                    experience
                  </label>
                  <textarea
                    id="feedback"
                    value={userFeedback}
                    onChange={(e) => setUserFeedback(e.target.value)}
                    className="w-full h-36 p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                       placeholder-gray-400 text-gray-700 transition-all duration-200 resize-none"
                    placeholder="What aspects of the interview did you find helpful? What could be improved? Any technical issues you experienced?"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Your feedback will be used to enhance our AI interview
                    platform
                  </p>
                </div>

                {/* Quick Select Feedback */}
                <div className="py-3">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Quick selections (optional)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Questions were relevant",
                      "Clear instructions",
                      "Technical issues",
                      "Needed more time",
                      "Too difficult",
                      "Enjoyed the process",
                    ].map((tag) => (
                      <button
                        key={tag}
                        className="px-3 py-1.5 text-xs bg-white border border-gray-200 hover:border-indigo-300 rounded-full text-gray-600 hover:bg-indigo-50 transition-colors"
                        onClick={() =>
                          setUserFeedback((prev) =>
                            prev ? `${prev}\n- ${tag}` : `- ${tag}`
                          )
                        }
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    onClick={() => navigate("/candidate/dashboard")}
                    variant="secondary"
                    className="px-6 py-2.5 border border-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleFeedbackSubmit}
                    disabled={isSubmitting || !userFeedback.trim()}
                    className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>Submit Feedback</>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Interview Tips */}
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-indigo-100">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                Tips for Future Interviews
              </h2>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-blue-700">
                      Prepare examples:
                    </span>{" "}
                    Have specific stories ready that showcase your skills and
                    experiences.
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-blue-700">
                      Practice vocal delivery:
                    </span>{" "}
                    Focus on speaking clearly and varying your tone to maintain
                    engagement.
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-blue-700">
                      Body language:
                    </span>{" "}
                    Maintain good posture and appropriate eye contact with the
                    camera.
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-blue-700">
                      Be concise:
                    </span>{" "}
                    Structure your answers with a clear beginning, middle, and
                    end.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  className="text-indigo-600 border border-indigo-200 hover:bg-indigo-50"
                  onClick={() => navigate("/candidate/dashboard")}
                >
                  View All Interview Resources
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
