import * as React from "react";
import { Calendar } from "lucide-react";
import { Input, InputProps } from "./Input";
import { cn } from "@/lib/utils";

export interface DatePickerProps extends Omit<InputProps, "type"> {}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative">
        <Input
          type="date"
          className={cn(
            "[&::-webkit-calendar-picker-indicator]:opacity-0",
            className,
          )}
          ref={ref}
          icon={<Calendar className="h-4 w-4" />}
          {...props}
        />
      </div>
    );
  },
);
DatePicker.displayName = "DatePicker";

export { DatePicker };
