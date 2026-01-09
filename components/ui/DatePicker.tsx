import * as React from "react";
import { Calendar } from "lucide-react";
import { Input, InputProps } from "./Input";
import { cn } from "@/lib/utils";

export type DatePickerProps = Omit<InputProps, "type">;

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, defaultValue, ...props }, ref) => {
    const today = new Date().toISOString().split("T")[0];
    const isControlled = props.value !== undefined;

    return (
      <div className="relative">
        <Input
          type="date"
          defaultValue={isControlled ? undefined : defaultValue || today}
          className={cn(
            "[&::-webkit-calendar-picker-indicator]:opacity-0 cursor-pointer text-left block w-full",
            className,
          )}
          onClick={(e) => {
            try {
              if ("showPicker" in e.currentTarget) {
                (e.currentTarget as any).showPicker();
              }
            } catch {
              // Fallback or ignore
            }
          }}
          ref={ref}
          icon={<Calendar className={cn("h-4 w-4 text-gray-500")} />}
          {...props}
        />
      </div>
    );
  },
);

DatePicker.displayName = "DatePicker";

export { DatePicker };
