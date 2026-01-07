"use client";

import React, { useEffect, useRef } from "react";
import { AiEditor } from "aieditor";
import "aieditor/dist/style.css";
import { cn } from "@/lib/utils";

export interface EditorProps {
  value?: string;
  onChange?: (value: string) => void;
  holder: string;
  placeholder?: string;
  className?: string;
  label?: string;
  error?: string;
}

const EditorComponent = ({
  value,
  onChange,
  holder,
  placeholder = "Start writing...",
  className,
  label,
  error,
}: EditorProps) => {
  const divRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<AiEditor | null>(null);

  useEffect(() => {
    if (!divRef.current) return;
    if (editorRef.current) return;

    const editor = new AiEditor({
      element: divRef.current,

      lang: "en",
      placeholder: placeholder,
      content: value || "",
      onChange: (ed: AiEditor) => {
        if (onChange) {
          const content = ed.getMarkdown ? ed.getMarkdown() : ed.getHtml();
          onChange(content);
        }
      },
    });

    editorRef.current = editor;

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <div
        ref={divRef}
        id={holder}
        className={cn(
          "rounded-xl border border-secondary bg-white/50 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all",
          error && "border-red-500 focus-within:ring-red-200",
          className,
        )}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <style jsx global>{`
        .aie-footer-bar {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default React.memo(EditorComponent);
