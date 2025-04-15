import { cn } from "../../lib/utils"

interface RadialProgressProps {
    value: number
    size?: number
    strokeWidth?: number
    trackColor?: string
    indicatorColor?: string
    className?: string
  }
  
  export function RadialProgress({
    value,
    size = 100,
    strokeWidth = 8,
    trackColor = "stroke-gray-200",
    indicatorColor = "stroke-blue-600",
    className
  }: RadialProgressProps) {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (value / 100) * circumference
  
    return (
      <div
        className={cn("relative inline-block", className)}
        style={{ width: size, height: size }}
      >
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            strokeWidth={strokeWidth}
            className={trackColor}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            strokeWidth={strokeWidth}
            className={indicatorColor}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
          {Math.round(value)}%
        </div>
      </div>
    )
  }