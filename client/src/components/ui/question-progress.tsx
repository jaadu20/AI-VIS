import { cn } from "../../lib/utils"

interface QuestionProgressProps {
    current: number
    total: number
    className?: string
  }
  
  export function QuestionProgress({ current, total, className }: QuestionProgressProps) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex-1 h-2 bg-gray-200 rounded-full">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${(current / total) * 100}%` }}
          />
        </div>
        <span className="text-sm text-gray-600">
          {current}/{total}
        </span>
      </div>
    )
  }