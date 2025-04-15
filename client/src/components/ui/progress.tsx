import { cva, type VariantProps } from "class-variance-authority"

const progressStyles = cva(
  "overflow-hidden rounded-full bg-gray-200",
  {
    variants: {
      variant: {
        default: "h-2",
        thick: "h-4",
        thin: "h-1"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

interface ProgressProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressStyles> {
  value: number
  max?: number
  indicatorColor?: string
}

export function Progress({
  value,
  max = 100,
  variant,
  indicatorColor = "bg-blue-600",
  className,
  ...props
}: ProgressProps) {
  const percentage = (value / max) * 100

  return (
    <div 
      className={progressStyles({ variant, className })} 
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      {...props}
    >
      <div
        className={`h-full transition-all duration-300 ${indicatorColor}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}