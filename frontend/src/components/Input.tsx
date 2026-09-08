import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-gray-700">{label}</label>
        )}
        <input
          ref={ref}
          className={clsx(
            "w-full px-3 py-2 border rounded-lg text-sm transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent",
            "placeholder:text-gray-400",
            error
              ? "border-red-500 bg-red-50"
              : "border-gray-300 bg-white hover:border-gray-400",
            className,
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
        {helperText && !error && (
          <span className="text-xs text-gray-500">{helperText}</span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
