import * as React from "react";
import { cn } from "@/lib/utils";

interface RadioGroupContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({});

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, name, children, ...props }, ref) => {
    return (
      <RadioGroupContext.Provider value={{ value, onValueChange, name }}>
        <div className={cn("grid gap-2", className)} ref={ref} {...props}>
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  },
);
RadioGroup.displayName = "RadioGroup";

export interface RadioItemProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  label?: string;
}

const RadioItem = React.forwardRef<HTMLInputElement, RadioItemProps>(
  ({ className, value, label, disabled, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext);
    const checked = context.value === value;

    return (
      <label
        className={cn(
          "inline-flex items-center gap-2 cursor-pointer",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        <div className="relative flex items-center">
          <input
            type="radio"
            className="peer sr-only"
            name={context.name}
            value={value}
            checked={checked}
            onChange={() => context.onValueChange?.(value)}
            disabled={disabled}
            ref={ref}
            {...props}
          />
          <div
            className={cn(
              "aspect-square h-5 w-5 rounded-full border border-secondary text-primary shadow-sm hover:border-primary/50 transition-all flex items-center justify-center bg-white",
              checked && "border-primary",
            )}
          >
            {checked && (
              <div className="h-2.5 w-2.5 rounded-full bg-primary mx-auto" />
            )}
          </div>
        </div>
        {label && (
          <span className="text-sm font-medium text-gray-700 select-none">
            {label}
          </span>
        )}
      </label>
    );
  },
);
RadioItem.displayName = "RadioItem";

export { RadioGroup, RadioItem };
