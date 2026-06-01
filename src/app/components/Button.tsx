import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 rounded-xl font-medium tracking-[0.01em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#16a34a] disabled:opacity-50 disabled:cursor-not-allowed";

    const variantStyles = {
      primary:
        "bg-[#16a34a] text-white shadow-sm shadow-green-600/25 hover:bg-[#15803d] hover:shadow-md hover:shadow-green-700/25 active:scale-[0.99]",
      secondary:
        "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99]",
      danger:
        "bg-red-600 text-white shadow-sm shadow-red-700/20 hover:bg-red-700 hover:shadow-md hover:shadow-red-700/20 active:scale-[0.99]",
      ghost:
        "bg-transparent text-slate-700 border border-transparent hover:bg-slate-100 hover:text-slate-900 active:scale-[0.99]",
    };

    const sizeStyles = {
      sm: "h-9 px-3.5 text-sm",
      md: "h-11 px-4.5 text-sm",
      lg: "h-12 px-6 text-base",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
