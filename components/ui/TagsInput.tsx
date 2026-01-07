import * as React from "react";
import { X, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TagsInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
}

export function TagsInput({
  value = [],
  onChange,
  placeholder = "Add tag...",
  label,
}: TagsInputProps) {
  const [inputValue, setInputValue] = React.useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      setInputValue("");
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2 p-3 bg-white/50 rounded-xl border border-secondary focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white border border-secondary text-sm font-medium text-gray-700 shadow-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1.5 text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
        <div className="relative flex-1 min-w-[120px]">
          <input
            type="text"
            className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none py-1"
            placeholder={value.length === 0 ? placeholder : ""}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {value.length === 0 && (
            <Tag className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  );
}
