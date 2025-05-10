import { XCircle, CheckCircle2 } from "lucide-react";
import { Button } from "../../components/ui/Button";

interface EligibilityResult {
  result: {
    eligible: boolean;
    message?: string;
    match_score?: number;
    missing_skills?: string[];
  } | null;
  onClose: () => void;
  onRetry: () => void;
}

export function EligibilityResultModal({ result, onClose, onRetry }: EligibilityResult) {
  if (!result) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="text-center">
          {result.eligible ? (
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          ) : (
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          )}
          
          <h3 className="text-xl font-bold mb-2">
            {result.eligible ? "Application Successful!" : "Not Eligible"}
          </h3>
          
          <div className="flex justify-center items-center mb-4">
            <span className="text-2xl font-bold">
              {result.match_score}% Match
            </span>
          </div>

          {!result.eligible && (
            <div className="text-left mb-4">
              <p className="font-medium mb-2">Missing required skills:</p>
              <ul className="list-disc pl-5">
                {result.missing_skills?.map((skill, i) => (
                  <li key={i} className="text-red-600">{skill}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button
              onClick={result.eligible ? onClose : onRetry}
              className={result.eligible ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
            >
              {result.eligible ? "Start Interview" : "Upload New CV"}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}