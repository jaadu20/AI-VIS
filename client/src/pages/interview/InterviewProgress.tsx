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
  Clock,
  TrendingUp,
  BadgeCheck,
  AlertTriangle,
  BookOpen,
  CheckCircle,
  Lightbulb,
  FileCheck,
  Mic,
  Video,
  Briefcase,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";

interface ResultData {
  scores: {
    content: number[];
    voice: number[];
    facial: number[];
  };
  finalScore: number;
}

const COLORS = ["#4338CA", "#8B5CF6", "#3B82F6"];
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
  const { user } = useAuthStore((state) => state);
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
        <div className="p-8 bg-white/80 backdrop-blur-md rounded-xl shadow-lg flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
          <p className="text-indigo-800 font-medium">
            Processing your interview results...
          </p>
          <p className="text-indigo-500 text-sm mt-2">This may take a moment</p>
        </div>
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

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { label: "Exceptional", color: "text-green-600" };
    if (score >= 80) return { label: "Excellent", color: "text-emerald-600" };
    if (score >= 70) return { label: "Good", color: "text-blue-600" };
    if (score >= 60) return { label: "Satisfactory", color: "text-amber-600" };
    return { label: "Needs Improvement", color: "text-red-600" };
  };

  const scoreGrade = getScoreGrade(Math.round(finalResults.finalScore));

  const getPieChartGradient = (index: number) => {
    const gradients = [
      ["#4338CA", "#6366F1"],
      ["#0EA5E9", "#22D3EE"],
      ["#8B5CF6", "#A855F7"],
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-20 w-48 h-48 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float-delayed"></div>
        <div className="absolute top-1/3 right-1/4 w-56 h-56 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float"></div>
      </div>

      <header className="bg-white/90 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-2 rounded-lg shadow-sm">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-blue-700">
                  AI-VIS Interview Results
                </h1>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Completed Apr 27, 2025</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => navigate(`/candidate/${user?.id}/dashboard`)}
              variant="outline"
              className="flex items-center bg-white hover:bg-gray-50 border border-gray-200 text-blue-700 shadow-sm"
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
                      ? "text-blue-700 border-b-2 border-blur-700"
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

        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Score Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 border-b border-indigo-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Performance Overview
                  </h2>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-white text-sm font-medium">
                    Interview ID: {interviewId}
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row p-16">
                <div className="elative w-52 h-52 mx-auto md:mx-0 mb-6 md:mb-0">
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
                          strokeWidth={3}
                        >
                          {pieData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={`url(#gradient-${index})`}
                              stroke="#fff"
                            />
                          ))}
                        </Pie>

                        <defs>
                          {pieData.map((_, index) => {
                            const [startColor, endColor] =
                              getPieChartGradient(index);
                            return (
                              <linearGradient
                                key={`gradient-${index}`}
                                id={`gradient-${index}`}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor={startColor}
                                  stopOpacity={0.9}
                                />
                                <stop
                                  offset="95%"
                                  stopColor={endColor}
                                  stopOpacity={0.7}
                                />
                              </linearGradient>
                            );
                          })}
                        </defs>

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
                          y="52%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-xs fill-indigo-400"
                        >
                          OVERALL
                        </text>

                        <Tooltip
                          content={({ payload }) => (
                            <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
                              <p className="font-medium text-indigo-600">
                                {payload?.[0]?.name}:{" "}
                                {(Number(payload?.[0]?.value) || 0).toFixed(1)}%
                              </p>
                            </div>
                          )}
                        />

                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          formatter={(value) => (
                            <span className="text-gray-600 text-sm">
                              {value}
                            </span>
                          )}
                          iconSize={10}
                          iconType="circle"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="md:ml-8 flex-1 space-y-4">
                  <div className="flex items-baseline">
                    <h3 className="text-2xl font-bold text-gray-800">
                      {scoreGrade.label}
                    </h3>
                    <span
                      className={`ml-2 ${scoreGrade.color} text-sm font-medium`}
                    >
                      Performance Level
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed">
                    Your interview performance was{" "}
                    <span className="font-medium">above average</span>, placing
                    you in the <span className="font-medium">top 25%</span> of
                    candidates for this position. You demonstrated strong
                    technical knowledge and communication skills, with notable
                    strengths in problem-solving and analytical thinking.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                    {pieData.map((category, index) => {
                      const [gradStart, gradEnd] = getPieChartGradient(index);
                      return (
                        <div
                          key={category.name}
                          className="p-4 rounded-xl bg-white border shadow-sm"
                          style={{ borderColor: gradStart + "40" }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className="text-sm font-medium"
                              style={{ color: gradStart }}
                            >
                              {category.name}
                            </span>
                            <span
                              className="text-sm font-bold"
                              style={{ color: gradStart }}
                            >
                              {Math.round(category.value)}%
                            </span>
                          </div>
                          <div className="relative pt-1">
                            <div className="overflow-hidden h-2 bg-gray-100 rounded-full">
                              <div
                                className="h-2 rounded-full transition-all ease-out duration-1000"
                                style={{
                                  width: `${category.value}%`,
                                  background: `linear-gradient(to right, ${gradStart}, ${gradEnd})`,
                                }}
                              />
                            </div>
                          </div>
                          <p className="mt-2 text-xs text-gray-500">
                            {index === 0 &&
                              "Quality of technical answers and problem-solving"}
                            {index === 1 &&
                              "Speech clarity, tone variation and vocabulary"}
                            {index === 2 &&
                              "Body language, eye contact and gestures"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Strengths & Improvements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-green-500 px-6 py-3 flex items-center">
                  <BadgeCheck className="h-5 w-5 text-white mr-2" />
                  <h3 className="text-white font-semibold">Key Strengths</h3>
                </div>
                <div className="p-5">
                  <ul className="space-y-3">
                    {strengths.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-sm text-gray-700">
                            {item.title}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-semibold text-green-600">
                            {item.score}%
                          </span>
                          <div className="ml-2 w-12 h-1.5 bg-gray-100 rounded-full">
                            <div
                              className="h-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    These are your top performing areas based on the interview
                    assessment.
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-3 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-white mr-2" />
                  <h3 className="text-white font-semibold">Areas for Growth</h3>
                </div>
                <div className="p-5">
                  <ul className="space-y-3">
                    {improvements.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></div>
                          <span className="text-sm text-gray-700">
                            {item.title}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-semibold text-amber-600">
                            {item.score}%
                          </span>
                          <div className="ml-2 w-12 h-1.5 bg-gray-100 rounded-full">
                            <div
                              className="h-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    Focus on these areas to improve your overall interview
                    performance.
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Detailed Analysis Tab */}
        {activeTab === "detailed" && (
          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-indigo-100"
            >
              <div className="flex items-center justify-between mb-7">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <BarChart3 className="h-6 w-6 mr-3 text-indigo-600" />
                  Question-by-Question Analysis
                </h2>
                <div className="bg-indigo-50 px-4 py-2 rounded-full text-sm font-medium text-indigo-700">
                  Performance Score: {Math.round(finalResults.finalScore)}%
                </div>
              </div>
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
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="95%"
                          stopColor="#4F46E5"
                          stopOpacity={0.3}
                        />
                      </linearGradient>
                      <linearGradient id="voice" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#10B981"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10B981"
                          stopOpacity={0.3}
                        />
                      </linearGradient>
                      <linearGradient id="facial" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#F59E0B"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="95%"
                          stopColor="#F59E0B"
                          stopOpacity={0.3}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e5e7eb"
                      opacity={0.4}
                    />
                    <XAxis
                      dataKey="question"
                      tick={{ fill: "#4B5563", fontSize: 12 }}
                      axisLine={{ stroke: "#e5e7eb" }}
                      tickLine={{ stroke: "#e5e7eb" }}
                    />
                    <YAxis
                      tick={{ fill: "#4B5563", fontSize: 12 }}
                      axisLine={{ stroke: "#e5e7eb" }}
                      tickLine={{ stroke: "#e5e7eb" }}
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(255, 255, 255, 0.98)",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.75rem",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                        padding: "12px 16px",
                      }}
                      itemStyle={{ color: "#1e293b", fontSize: "13px" }}
                      labelStyle={{
                        color: "#4B5563",
                        fontWeight: "600",
                        fontSize: "14px",
                        marginBottom: "6px",
                      }}
                      formatter={(value) => [`${value}%`, null]}
                    />
                    <Legend
                      verticalAlign="top"
                      height={50}
                      iconType="circle"
                      iconSize={10}
                      formatter={(value) => (
                        <span className="text-gray-700 text-sm font-medium">
                          {value} Score
                        </span>
                      )}
                    />
                    <Bar
                      dataKey="content"
                      fill="url(#content)"
                      radius={[6, 6, 0, 0]}
                      name="Content"
                      barSize={24}
                    />
                    <Bar
                      dataKey="voice"
                      fill="url(#voice)"
                      radius={[6, 6, 0, 0]}
                      name="Voice"
                      barSize={24}
                    />
                    <Bar
                      dataKey="facial"
                      fill="url(#facial)"
                      radius={[6, 6, 0, 0]}
                      name="Facial"
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              <div className="bg-white/95 backdrop-blur-md p-7 rounded-3xl shadow-xl border border-indigo-100">
                <h2 className="text-xl font-bold mb-5 text-gray-800 flex items-center">
                  <svg
                    className="w-6 h-6 mr-3 text-emerald-600"
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
                <div className="space-y-5">
                  {[3, 7, 11].map((qNum) => (
                    <div
                      key={qNum}
                      className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-gray-800 text-lg">
                          Question {qNum + 1}
                        </span>
                        <div className="bg-emerald-100 text-emerald-800 font-bold px-4 py-1.5 rounded-full text-sm">
                          {chartData[qNum].content}%
                        </div>
                      </div>
                      <p className="text-gray-700">
                        {qNum === 3 &&
                          "Describe a challenging project and how you overcame obstacles."}
                        {qNum === 7 &&
                          "What frameworks have you used for building scalable applications?"}
                        {qNum === 11 &&
                          "How do you approach debugging complex issues?"}
                      </p>
                      <div className="mt-3 flex items-center text-emerald-700 text-sm">
                        <CheckCircle className="h-4 w-4 mr-1.5" />
                        <span>
                          Strong, detailed response with clear examples
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-md p-7 rounded-3xl shadow-xl border border-indigo-100">
                <h2 className="text-xl font-bold mb-5 text-gray-800 flex items-center">
                  <svg
                    className="w-6 h-6 mr-3 text-amber-600"
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
                <div className="space-y-5">
                  {[1, 5, 9].map((qNum) => (
                    <div
                      key={qNum}
                      className="p-5 bg-amber-50 rounded-2xl border border-amber-100 hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-gray-800 text-lg">
                          Question {qNum + 1}
                        </span>
                        <div className="bg-amber-100 text-amber-800 font-bold px-4 py-1.5 rounded-full text-sm">
                          {chartData[qNum].voice}%
                        </div>
                      </div>
                      <p className="text-gray-700">
                        {qNum === 1 &&
                          "Explain your approach to learning new technologies."}
                        {qNum === 5 &&
                          "Describe your experience with cloud platforms."}
                        {qNum === 9 &&
                          "How do you manage conflicting priorities?"}
                      </p>
                      <div className="mt-3 pt-3 border-t border-amber-200">
                        <div className="flex items-start text-amber-800">
                          <Lightbulb className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium mb-1">Improvement Tip:</p>
                            <p className="text-sm">
                              Be more concise and provide specific real-world
                              examples that highlight your skills.
                            </p>
                          </div>
                        </div>
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
            className="space-y-10"
          >
            <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-indigo-100">
              <div className="flex items-center gap-4 mb-7">
                <div className="p-3 bg-indigo-100 rounded-full">
                  <MessageSquare className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Share Your Experience
                  </h2>
                  <p className="text-gray-500">
                    Your valuable feedback helps us improve our interview system
                    for future candidates
                  </p>
                </div>
              </div>

              <div className="mb-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                <h3 className="text-base font-semibold text-indigo-800 mb-5">
                  How would you rate your overall interview experience?
                </h3>
                <div className="flex justify-between items-center max-w-md mx-auto ">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setSelectedRating(rating)}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all
                ${
                  rating === 1
                    ? "bg-indigo-100 hover:bg-indigo-200"
                    : rating === 2
                    ? "bg-indigo-200 hover:bg-indigo-300"
                    : rating === 3
                    ? "bg-indigo-300 hover:bg-indigo-400"
                    : rating === 4
                    ? "bg-indigo-400 hover:bg-indigo-500"
                    : "bg-indigo-500 hover:bg-indigo-600"
                }
                ${rating <= 3 ? "text-indigo-800" : "text-white"}
                ${
                  selectedRating === rating
                    ? "ring-4 ring-indigo-300 ring-offset-2 scale-110"
                    : ""
                }
                shadow-md hover:shadow-lg text-lg font-bold`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-4 max-w-md mx-auto px-3">
                  <span>Not satisfied</span>
                  <span>Very satisfied</span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="feedback"
                    className="block text-base font-semibold text-gray-700 mb-2"
                  >
                    Please share your detailed feedback about the interview
                    experience
                  </label>
                  <textarea
                    id="feedback"
                    value={userFeedback}
                    onChange={(e) => setUserFeedback(e.target.value)}
                    className="w-full h-40 p-5 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
               placeholder-gray-400 text-gray-700 transition-all duration-200 resize-none shadow-sm"
                    placeholder="What aspects of the interview did you find helpful? What could be improved? Any technical issues you experienced?"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Your feedback will be used to enhance our AI interview
                    platform for future candidates
                  </p>
                </div>

                <div className="py-4">
                  <h3 className="text-base font-semibold text-gray-700 mb-3">
                    Quick selections (optional)
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {[
                      "Questions were relevant",
                      "Clear instructions",
                      "Technical issues",
                      "Needed more time",
                      "Too difficult",
                      "Enjoyed the process",
                      "Good pacing",
                      "Questions too vague",
                    ].map((tag) => (
                      <button
                        key={tag}
                        className="px-4 py-2 text-sm bg-white border border-gray-200 hover:border-indigo-300 rounded-full text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-all shadow-sm"
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

                <div className="flex justify-end gap-4 pt-6">
                  <Button
                    onClick={() => navigate("/candidate/dashboard")}
                    variant="secondary"
                    className="px-6 py-3 border border-gray-300 font-medium text-gray-700 rounded-xl hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleFeedbackSubmit}
                    disabled={isSubmitting || !userFeedback.trim()}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center rounded-xl font-medium shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>Submit Feedback</>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-indigo-100">
              <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
                <svg
                  className="w-6 h-6 mr-3 text-indigo-600"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <FileCheck className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-800 mb-1">
                        Prepare examples
                      </h3>
                      <p className="text-gray-700">
                        Have specific stories ready that showcase your skills
                        and experiences with measurable outcomes.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <Mic className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-800 mb-1">
                        Practice vocal delivery
                      </h3>
                      <p className="text-gray-700">
                        Focus on speaking clearly and varying your tone to
                        maintain engagement throughout your responses.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <Video className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-800 mb-1">
                        Body language
                      </h3>
                      <p className="text-gray-700">
                        Maintain good posture, appropriate eye contact with the
                        camera, and project confident body language.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <MessageSquare className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-800 mb-1">
                        Be concise
                      </h3>
                      <p className="text-gray-700">
                        Structure your answers with a clear beginning, middle,
                        and end to communicate efficiently.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <Button
                  variant="outline"
                  className="bg-white text-indigo-700 border-2 border-indigo-200 hover:bg-indigo-50 py-3 px-6 rounded-xl font-medium shadow-sm hover:shadow-md transition-all"
                  onClick={() => navigate("/candidate/dashboard")}
                >
                  <BookOpen className="h-5 w-5 mr-2" />
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
