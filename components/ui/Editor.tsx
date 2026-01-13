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

  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!divRef.current) return;
    if (editorRef.current) return;

    const editor = new AiEditor({
      element: divRef.current,
      lang: "en",
      placeholder: placeholder,
      content: value || "",
      toolbarKeys: [
        "undo",
        "redo",
        "brush",
        "eraser",
        "|",
        "font-size",
        "|",
        "bold",
        "italic",
        "underline",
        "strike",
        "link",
        "hr",
        "emoji",
        "|",
        "highlight",
        "font-color",
        "|",
        "align",
        "line-height",
        "|",
        "bullet-list",
        "ordered-list",
        "indent-decrease",
        "indent-increase",
        "|",
        "fullscreen",
      ],
      onChange: (ed: AiEditor) => {
        if (onChangeRef.current) {
          const content = ed.getHtml();
          onChangeRef.current(content);
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

  useEffect(() => {
    if (editorRef.current && value !== undefined) {
      const currentContent = editorRef.current.getHtml();

      if (currentContent !== value) {
        editorRef.current.setContent(value);
      }
    }
  }, [value]);

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
          "rounded-xl border border-secondary bg-white/50 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all para-fs-19",
          error && "border-red-500 focus-within:ring-red-200",
          className,
        )}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default React.memo(EditorComponent);
