// components/ui/textarea.tsx
import * as React from "react";
import { cn } from "../../lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-colors",
          "placeholder:text-gray-400",
          "focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50",
          "resize-none", // Remove resize handle
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };