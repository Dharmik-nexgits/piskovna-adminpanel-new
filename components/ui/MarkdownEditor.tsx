import * as React from "react";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Link as LinkIcon,
  Quote,
  List,
  Type,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface MarkdownEditorProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
}

export function MarkdownEditor({
  className,
  label,
  error,
  value,
  onChange,
  ...props
}: MarkdownEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertFormat = (startTag: string, endTag: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newValue = `${before}${startTag}${selection}${endTag}${after}`;

    // Create a synthetic event to trigger onChange
    const event = {
      target: { value: newValue },
      currentTarget: { value: newValue },
    } as React.ChangeEvent<HTMLTextAreaElement>;

    onChange?.(event);

    // Restore focus and cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + startTag.length,
        end + startTag.length,
      );
    }, 0);
  };

  const tools = [
    { icon: Bold, label: "Bold", action: () => insertFormat("**", "**") },
    { icon: Italic, label: "Italic", action: () => insertFormat("*", "*") },
    //{ icon: Underline, label: "Underline", action: () => insertFormat("<u>", "</u>") }, // Markdown usually doesn't do underline
    { icon: Heading1, label: "H1", action: () => insertFormat("# ") },
    { icon: Heading2, label: "H2", action: () => insertFormat("## ") },
    { icon: List, label: "List", action: () => insertFormat("- ") },
    { icon: Quote, label: "Quote", action: () => insertFormat("> ") },
    //{ icon: LinkIcon, label: "Link", action: () => insertFormat("[", "](url)") },
  ];

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <div
        className={cn(
          "rounded-xl border border-secondary bg-white/50 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all overflow-hidden",
          error && "border-red-500 focus-within:ring-red-200",
          className,
        )}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-1 border-b border-secondary/50 p-2 bg-gray-50/50 text-gray-500">
          {tools.map((tool) => (
            <button
              key={tool.label}
              type="button"
              onClick={tool.action}
              className="p-1.5 hover:bg-white hover:text-primary hover:shadow-sm rounded-lg transition-all"
              title={tool.label}
            >
              <tool.icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          className="w-full p-4 bg-transparent border-none focus:outline-none resize-y min-h-[200px] text-gray-800 text-sm leading-relaxed font-mono"
          value={value}
          onChange={onChange}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
