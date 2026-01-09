import * as React from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options?: SelectOption[];
  label?: string;
  error?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onCancel?: () => void;
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      options = [],
      value: controlledValue,
      defaultValue,
      onChange,
      placeholder = "Vyberte...",
      disabled,
      onCancel,
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(
      defaultValue || "",
    );

    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : internalValue;

    const selectedLabel = options.find(
      (opt) => opt.value === currentValue,
    )?.label;

    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
      setIsOpen(false);
    };

    return (
      <div className="space-y-2" ref={containerRef}>
        {label && (
          <label className="block text-sm font-semibold text-gray-700">
            {label}
          </label>
        )}
        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              "flex w-full items-center justify-between rounded-xl border border-secondary bg-white/50 px-4 py-3 text-sm transition-all text-left",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
              isOpen && "border-primary ring-2 ring-primary/20",
              disabled
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:bg-white hover:border-gray-500",
              error && "border-red-500 focus:ring-red-200",
              className,
            )}
            {...props}
          >
            <span
              className={cn(currentValue ? "text-gray-800" : "text-gray-400")}
            >
              {selectedLabel || placeholder}
            </span>
            {onCancel && currentValue ? <X
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 transition-transform duration-200",
              )} onClick={onCancel}
            /> : <ChevronDown
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 transition-transform duration-200",
                isOpen && "rotate-180",
              )}
            />}
          </button>

          {isOpen && (
            <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-100">
              <div className="max-h-60 overflow-y-auto p-1 space-y-1">
                {options.length > 0 ? (
                  options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={cn(
                        "relative flex w-full select-none items-center rounded-lg py-2.5 pl-3 pr-8 text-sm outline-none transition-colors cursor-pointer",
                        currentValue === opt.value
                          ? "bg-secondary text-primary font-medium"
                          : "text-gray-700 hover:bg-secondary/65",
                      )}
                    >
                      {opt.label}
                      {currentValue === opt.value && (
                        <span className="absolute right-3 flex h-3.5 w-3.5 items-center justify-center">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="py-6 text-center text-sm text-gray-500">
                    Žádné možnosti
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select };
