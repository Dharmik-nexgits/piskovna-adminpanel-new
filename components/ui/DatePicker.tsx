import * as React from "react";
import { DatePicker as AntDatePicker } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/cs";
import locale from "antd/es/date-picker/locale/cs_CZ";
import { cn } from "@/lib/utils";

dayjs.locale("cs");

export interface DatePickerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (event: { target: { value: string } }) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  error?: string;
}

const DatePicker = React.forwardRef<any, DatePickerProps>(
  (
    {
      className,
      value,
      defaultValue,
      onChange,
      label,
      disabled,
      min,
      max,
      error,
      ...props
    },
    ref,
  ) => {
    const dateValue = value
      ? dayjs(value)
      : defaultValue
      ? dayjs(defaultValue)
      : undefined;

    const handleChange = (
      date: dayjs.Dayjs | null,
      dateString: string | string[] | null,
    ) => {
      if (onChange) {
        let strVal = "";
        if (typeof dateString === "string") {
          strVal = dateString;
        } else if (Array.isArray(dateString) && dateString.length > 0) {
          strVal = dateString[0];
        }
        onChange({ target: { value: strVal } });
      }
    };

    const disabledDate = (current: dayjs.Dayjs) => {
      if (!current) return false;
      let isDisabled = false;
      if (min) {
        isDisabled = isDisabled || current.isBefore(dayjs(min), "day");
      }
      if (max) {
        isDisabled = isDisabled || current.isAfter(dayjs(max), "day");
      }
      return isDisabled;
    };

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-semibold text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          <AntDatePicker
            size="large"
            ref={ref}
            value={dateValue}
            onChange={handleChange}
            disabled={disabled}
            disabledDate={disabledDate}
            locale={locale}
            format="YYYY-MM-DD"
            className={cn(
              "flex w-full items-center justify-between rounded-xl border border-secondary! bg-white/50 px-4 py-3 text-sm transition-all hover:border-secondary! focus:outline-none focus:ring-2 focus:ring-primary/20",
              error ? "border-red-500" : "",
              className,
            )}
            style={{ width: "100%" }}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

DatePicker.displayName = "DatePicker";

export { DatePicker };
