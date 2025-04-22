import * as React from "react";
import { cn } from "../../lib/utils";
import { VariantProps, cva } from "class-variance-authority";

const inputVariants = cva(
  "flex w-full rounded-lg border bg-transparent text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: [
          "border-gray-300 bg-white",
          "focus-visible:ring-blue-500 focus-visible:border-blue-500",
          "placeholder:text-gray-400"
        ],
        error: [
          "border-red-500 bg-red-50",
          "focus-visible:ring-red-500 focus-visible:border-red-500",
          "placeholder:text-red-300"
        ]
      },
      size: {
        default: "h-10 px-4 py-2",
        lg: "h-12 px-6 py-3 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      leftIcon,
      rightIcon,
      error = false,
      ...props
    },
    ref
  ) => {
    const calculatedVariant = error ? "error" : variant;

    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          className={cn(
            inputVariants({ variant: calculatedVariant, size, className }),
            leftIcon && "pl-10",
            rightIcon && "pr-10"
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };