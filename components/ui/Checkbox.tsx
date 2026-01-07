import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, label, disabled, ...props }, ref) => {
    return (
      <label
        className={cn(
          "inline-flex items-start gap-2 cursor-pointer",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <div className="relative flex items-center">
          <input
            type="checkbox"
            className="peer sr-only"
            ref={ref}
            checked={checked}
            onChange={(e) => onCheckedChange?.(e.target.checked)}
            disabled={disabled}
            {...props}
          />
          <div
            className={cn(
              "h-5 w-5 rounded-md border border-secondary bg-white transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-primary/20",
              checked && "bg-primary border-primary text-white",
            )}
          >
            <Check
              className={cn(
                "h-4 w-4 absolute top-0.5 left-0.5 pointer-events-none transition-opacity",
                checked ? "opacity-100" : "opacity-0",
              )}
            />
          </div>
        </div>
        {label && (
          <span className="text-sm font-medium text-gray-700 select-none pt-0.5">
            {label}
          </span>
        )}
      </label>
    );
  },
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
