/*
This file has been significantly updated for the new kinetic typography design.
- The old custom toolbar is replaced with the redesigned `ToggleGroup` and `Toggle` components for a cleaner, more integrated feel.
- The `markdownToHtml` function is simplified. It no longer injects styling classes directly. Instead, the preview `div` will have the `prose` and `prose-invert` classes, allowing Tailwind Typography to handle all styling, making it automatically theme-aware.
- The overall component container has its neo-brutalist styling removed in favor of a simple, clean border.
- The Write/Preview tabs are also implemented using a `ToggleGroup` for consistency.
*/
"use client";

import { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Toggle } from "@/components/ui/toggle";
import { Bold, Italic, Link, List, ListOrdered, Heading1, Heading2, Heading3, Code, Quote, Image as ImageIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

const markdownToHtml = (markdown: string): string => {
  if (typeof window === 'undefined' || !DOMPurify.sanitize) {
    return markdown; // Basic fallback for SSR
  }
  // Sanitize first to prevent XSS
  let sanitized = DOMPurify.sanitize(markdown);

  // Simple RegExp replacements. For a full-featured preview, a library like `marked` would be better.
  let html = sanitized
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*|__(.*?)__/gim, '<strong>$1$2</strong>')
    .replace(/\*(.*?)\*|_(.*?)_/gim, '<em>$1$2</em>')
    .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2" />')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\n\s*-\s(.*)/gim, '<ul>\n<li>$1</li>\n</ul>')
    .replace(/<\/ul>\s*<ul>/gim, '')
    .replace(/\n(\d+)\.\s(.*)/gim, '<ol>\n<li>$2</li>\n</ol>')
    .replace(/<\/ol>\s*<ol>/gim, '')
    .replace(/\n\n/gim, '<p>')
    .replace(/\n/gim, '<br />');
    
  // Wrap in a container for prose styling
  return `<div class="prose prose-sm sm:prose-base dark:prose-invert focus:outline-none">${html}</div>`;
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
    const newText = value.substring(0, start) + before + textToInsert + after + value.substring(end);

    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + textToInsert.length);
    }, 0);
  };

  const toolbarButtons = [
    { label: "H1", action: () => insertMarkdown("# ", "", "Heading 1"), icon: <Heading1 className="size-4" /> },
    { label: "H2", action: () => insertMarkdown("## ", "", "Heading 2"), icon: <Heading2 className="size-4" /> },
    { label: "H3", action: () => insertMarkdown("### ", "", "Heading 3"), icon: <Heading3 className="size-4" /> },
    { type: 'separator' },
    { label: "Bold", action: () => insertMarkdown("**", "**", "bold text"), icon: <Bold className="size-4" /> },
    { label: "Italic", action: () => insertMarkdown("*", "*", "italic text"), icon: <Italic className="size-4" /> },
    { type: 'separator' },
    { label: "Quote", action: () => insertMarkdown("\n> ", "", "Quote"), icon: <Quote className="size-4" /> },
    { label: "Code", action: () => insertMarkdown("`", "`", "code"), icon: <Code className="size-4" /> },
    { label: "Link", action: () => insertMarkdown("[", "](url)", "link text"), icon: <Link className="size-4" /> },
    { label: "Image", action: () => insertMarkdown("![", "](url)", "alt text"), icon: <ImageIcon className="size-4" /> },
    { type: 'separator' },
    { label: "List", action: () => insertMarkdown("\n- ", "", "List item"), icon: <List className="size-4" /> },
    { label: "Ordered List", action: () => insertMarkdown("\n1. ", "", "List item"), icon: <ListOrdered className="size-4" /> },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-2">
        <ToggleGroup type="multiple" size="sm" variant="outline">
          {toolbarButtons.map((button, index) => 
            button.type === 'separator' ? (
                <Separator key={`sep-${index}`} orientation="vertical" className="h-6 mx-1 bg-border"/>
            ) : (
                <Toggle
                    key={button.label}
                    size="sm"
                    variant="outline"
                    pressed={false} // This makes them act like one-off buttons
                    onClick={button.action}
                    aria-label={button.label}
                    className="h-8 w-8 p-0"
                >
                    {button.icon}
                </Toggle>
            )
          )}
        </ToggleGroup>
        
        <ToggleGroup type="single" size="sm" value={activeTab} onValueChange={(value) => { if (value) setActiveTab(value as "write" | "preview")}}>
            <ToggleGroupItem value="write" aria-label="Write mode">Write</ToggleGroupItem>
            <ToggleGroupItem value="preview" aria-label="Preview mode">Preview</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div style={{ height }} className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
        {activeTab === "write" ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full resize-none rounded-b-lg border-none bg-card p-4 font-mono text-sm text-foreground focus:outline-none placeholder:text-muted-foreground"
            spellCheck="false"
          />
        ) : (
          <div
            className="h-full overflow-auto bg-card p-4"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        )}
      </div>

      <div className="border-t border-border bg-secondary/30 px-4 py-1.5 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>Markdown supported</span>
          <span>{value.length} characters</span>
        </div>
      </div>
    </div>
  );
}