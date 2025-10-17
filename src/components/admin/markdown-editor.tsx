"use client";

import { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import { Bold, Italic, Code, Link as LinkIcon, Image as ImageIcon, List, Quote, Code2 } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

const markdownToHtml = (markdown: string): string => {
  if (typeof window === 'undefined' || !DOMPurify.sanitize) {
    return markdown; // Fallback for SSR
  }
  // The ReactMarkdown component will handle the conversion in the blog post itself.
  // For this preview, we can use a simpler conversion or just show the text.
  // To keep it simple and avoid dependency conflicts, we'll return a basic preview.
  // For a true preview, use ReactMarkdown here as well.
  const sanitizedMarkdown = DOMPurify.sanitize(markdown)
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `<div class="prose prose-invert prose-sm max-w-none p-4">${sanitizedMarkdown.replace(/\n/g, '<br />')}</div>`;
};

export default function MarkdownEditor({
  value,
  onChange,
  placeholder,
  height = "400px",
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [renderedHtml, setRenderedHtml] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (activeTab === "preview") {
      // For a real-time preview, you'd use a library like 'marked' or 'react-markdown' here.
      // This is a simplified version.
      setRenderedHtml(markdownToHtml(value));
    }
  }, [value, activeTab]);

  const insertMarkdown = (before: string, after = "", placeholderText = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholderText;
    const newText =
      value.substring(0, start) +
      before +
      textToInsert +
      after +
      value.substring(end);

    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + textToInsert.length,
      );
    }, 0);
  };

  const toolbarButtons = [
    { label: "H1", action: () => insertMarkdown("# ", "", "Heading 1"), content: <span className="text-xs font-bold">H1</span> },
    { label: "H2", action: () => insertMarkdown("## ", "", "Heading 2"), content: <span className="text-xs font-bold">H2</span> },
    { label: "H3", action: () => insertMarkdown("### ", "", "Heading 3"), content: <span className="text-xs font-bold">H3</span> },
    { label: "Bold", action: () => insertMarkdown("**", "**", "bold text"), content: <Bold className="size-4" /> },
    { label: "Italic", action: () => insertMarkdown("*", "*", "italic text"), content: <Italic className="size-4" /> },
    { label: "Code", action: () => insertMarkdown("`", "`", "inline code"), content: <Code className="size-4" /> },
    { label: "Code Block", action: () => insertMarkdown("```\n", "\n```", "code block"), content: <Code2 className="size-4" /> },
    { label: "Link", action: () => insertMarkdown("[", "](url)", "link text"), content: <LinkIcon className="size-4" /> },
    { label: "Image", action: () => insertMarkdown("![alt text](", ")", "image url"), content: <ImageIcon className="size-4" /> },
    { label: "List", action: () => insertMarkdown("- ", "", "list item"), content: <List className="size-4" /> },
    { label: "Quote", action: () => insertMarkdown("> ", "", "quote"), content: <Quote className="size-4" /> },
  ];

  return (
    <div className="overflow-hidden rounded-md border border-zinc-700 bg-zinc-900 font-sans">
      <div className="border-b border-zinc-700 bg-zinc-800/50 p-2">
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1">
            {toolbarButtons.map((button) => (
              <button
                key={button.label}
                type="button"
                onClick={button.action}
                className="flex size-7 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-zinc-700 hover:text-slate-100"
                title={button.label}
              >
                {button.content}
              </button>
            ))}
          </div>

          <div className="flex self-end rounded-md border border-zinc-600 bg-zinc-900 p-0.5 sm:self-center">
            <button
              type="button"
              onClick={() => setActiveTab("write")}
              className={`rounded-sm px-3 py-1 text-sm font-bold transition-colors ${
                activeTab === "write"
                  ? "bg-zinc-700 text-slate-100"
                  : "text-zinc-400 hover:bg-zinc-800/50"
              }`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`rounded-sm px-3 py-1 text-sm font-bold transition-colors ${
                activeTab === "preview"
                  ? "bg-zinc-700 text-slate-100"
                  : "text-zinc-400 hover:bg-zinc-800/50"
              }`}
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      <div style={{ height }}>
        {activeTab === "write" ? (
          <textarea
            id="markdown-textarea"
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="size-full resize-none rounded-b-md border-none bg-zinc-900 p-4 font-mono text-sm text-slate-200 placeholder:text-zinc-500 focus:outline-none"
            spellCheck="false"
          />
        ) : (
          <div
            className="size-full overflow-auto bg-zinc-900 p-4 font-sans text-slate-200"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
            style={{ lineHeight: "1.6" }}
          />
        )}
      </div>

      <div className="border-t border-zinc-700 bg-zinc-800/50 px-4 py-2 text-xs text-zinc-400">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Markdown supported</span>
          <span className="font-semibold">{value.length} characters</span>
        </div>
      </div>
    </div>
  );
}