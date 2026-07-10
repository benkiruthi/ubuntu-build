import { forwardRef } from "react";
import { cn } from "../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--foreground)]"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-0 focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-[var(--destructive)] focus:ring-[var(--destructive)]",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[var(--destructive)]">{error}</p>}
        {hint && !error && (
          <p className="text-xs text-[var(--muted-foreground)]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
