import { motion } from "framer-motion";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

export function CandidatesResult() {
  const results = [
    {
      id: "1",
      name: "John Doe",
      position: "Senior Frontend Developer",
      score: "85%",
      strengths: ["React", "JavaScript", "CSS"],
      weaknesses: ["Testing"],
      feedback: "Strong technical skills but needs improvement in unit testing.",
    },
    {
      id: "2",
      name: "Jane Smith",
      position: "UX Designer",
      score: "92%",
      strengths: ["Wireframing", "Figma", "User Research"],
      weaknesses: ["JavaScript"],
      feedback: "Excellent design skills but lacks JavaScript knowledge.",
    },
    {
      id: "3",
      name: "Mike Johnson",
      position: "Backend Developer",
      score: "78%",
      strengths: ["Node.js", "MongoDB", "API Design"],
      weaknesses: ["Scalability"],
      feedback: "Good backend knowledge but needs to focus on scalable architecture.",
    },
  ];

  return (
    <DashboardLayout>
      <div
        className="p-8 min-h-screen"
        style={{
          backgroundImage:
            "url('https://t4.ftcdn.net/jpg/04/91/04/57/360_F_491045782_57jOG41DcPq4BxRwYqzLrhsddudrq2MM.jpg')",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="flex justify-between items-center mb-8" >
          <h1 className="text-3xl font-bold text-yellow-400">Candidates Results</h1>
          <Button onClick={() => {}} className="bg-blue-500 text-white">
            Download Report
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {results.map((result, index) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {result.name} - {result.position}
              </h2>
              <p className="text-gray-700">
                <strong>Score:</strong> {result.score}
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Strengths:</strong> {result.strengths.join(", ")}
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Weaknesses:</strong> {result.weaknesses.join(", ")}
              </p>
              <p className="text-gray-700 mt-4">
                <strong>Feedback:</strong> {result.feedback}
              </p>
              <div className="mt-4">
                <Button variant="outline" size="sm">
                  View Detailed Report
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
