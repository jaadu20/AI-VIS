import { XCircle } from "lucide-react";
import { Button } from "./ui/Button";

interface EligibilityResultModalProps {
  result: {
    eligible: boolean;
    message?: string;
    match_score?: number;
    missing_skills?: string[];
  } | null;
  onClose: () => void;
  onRetry: () => void;
}

export function EligibilityResultModal({ result, onClose, onRetry }: EligibilityResultModalProps) {
  if (!result) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-pop-in">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {result.eligible ? "Eligibility Approved" : "Application Review"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          {!result.eligible && (
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="font-medium">{result.message}</span>
            </div>
          )}

          {result.match_score !== undefined && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm font-medium">
                CV Match Score: {Math.round(result.match_score * 100)}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-yellow-500 rounded-full h-2"
                  style={{ width: `${Math.round(result.match_score * 100)}%` }}
                />
              </div>
            </div>
          )}

          {result.missing_skills && result.missing_skills.length > 0 && (
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Recommended Skills to Add:</p>
              <ul className="list-disc list-inside space-y-1">
                {result.missing_skills.map((skill, index) => (
                  <li key={index} className="text-sm text-red-700">
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {!result.eligible && (
              <Button
                onClick={onRetry}
                variant="outline"
                className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                Upload New CV
              </Button>
            )}
            <Button
              onClick={onClose}
              className={`flex-1 ${result.eligible ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {result.eligible ? "Start Interview" : "Close"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}