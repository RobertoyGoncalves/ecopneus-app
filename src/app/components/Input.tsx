import { InputHTMLAttributes, forwardRef, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16a34a]/25 ${
              icon ? "pl-10.5" : ""
            } ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                : "border-slate-200 focus:border-[#16a34a]"
            } ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
