// src/pages/InterviewProgress.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "recharts";
import { Loader2 } from "lucide-react";
import { Button } from "../../components/ui/Button";

interface ResultData {
  scores: {
    content: number[];
    voice: number[];
    facial: number[];
  };
  finalScore: number;
  feedback: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

// Dummy results will be shown if fetching results fails or returns empty.
const dummyResults: ResultData = {
  scores: {
    // Here we assume 12 questions with dummy scores.
    content: Array(12).fill(70),
    voice: Array(12).fill(65),
    facial: Array(12).fill(75),
  },
  finalScore: 70,
  feedback:
    "This is dummy feedback for demonstration purposes.\nPlease review your answers and try again.",
};

export function InterviewProgress() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState<ResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/interviews/${interviewId}/results`);
        if (!response.ok) {
          throw new Error("Failed to fetch results");
        }
        const data: ResultData = await response.json();
        // Optional: validate data here; if incomplete, fallback to dummy
        if (!data || !data.scores) {
          throw new Error("No data returned");
        }
        setResults(data);
      } catch (error: any) {
        console.error("Error fetching results:", error);
        setError("Error fetching results. Displaying dummy results.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [interviewId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  // If there's an error or if results are null, use dummy data.
  const finalResults = results || dummyResults;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Interview Results
          </h1>
          <Button onClick={() => navigate("/candidate/dashboard")}>
            Return to Dashboard
          </Button>
        </div>

        {/* Display error notice if any */}
        {error && (
          <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-md">
            {error}
          </div>
        )}

        {/* Final Score and Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Final Score */}
          <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">Final Score</h2>
            <div className="flex items-center justify-center">
              <div
                className="radial-progress text-blue-600"
                style={
                  { "--value": finalResults.finalScore } as React.CSSProperties
                }
              >
                {Math.round(finalResults.finalScore)}%
              </div>
            </div>
          </div>

          {/* Score Distribution Pie Chart */}
          <div className="bg-white p-6 rounded-xl shadow flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Score Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
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
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {["Content", "Voice", "Facial"].map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Question-wise Breakdown Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Question-wise Breakdown
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={finalResults.scores.content.map((content, index) => ({
                question: index + 1,
                content,
                voice: finalResults.scores.voice[index],
                facial: finalResults.scores.facial[index],
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="question" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="content" fill="#0088FE" />
              <Bar dataKey="voice" fill="#00C49F" />
              <Bar dataKey="facial" fill="#FFBB28" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Feedback Summary */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Feedback Summary</h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {finalResults.feedback}
          </p>
        </div>
      </div>
    </div>
  );
}
