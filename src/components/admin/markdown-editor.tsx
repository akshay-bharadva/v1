"use client";

import { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Toggle } from "@/components/ui/toggle";
import {
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Quote,
  Image as ImageIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

// This markdown parser is a simple RegExp-based one. For more complex needs (like nested lists),
// a library like 'marked' or 'react-markdown' might be better, but this is fast and lightweight.
const markdownToHtml = (markdown: string): string => {
  if (typeof window === "undefined" || !DOMPurify.sanitize) {
    return markdown; // Basic fallback for SSR or if DOMPurify isn't ready
  }
  const sanitizedMarkdown = DOMPurify.sanitize(markdown);

  let html = sanitizedMarkdown
    .replace(
      /^# (.*$)/gim,
      "<h1 class='text-3xl font-bold my-4 font-space'>$1</h1>",
    )
    .replace(
      /^## (.*$)/gim,
      "<h2 class='text-2xl font-bold my-3 font-space'>$1</h2>",
    )
    .replace(
      /^### (.*$)/gim,
      "<h3 class='text-xl font-bold my-2 font-space'>$1</h3>",
    )
    .replace(
      /\*\*(.*?)\*\*|__(.*?)__/gim,
      "<strong class='font-space'>$1$2</strong>",
    )
    .replace(/\*(.*?)\*|_(.*?)_/gim, "<em class='font-space'>$1$2</em>")
    .replace(
      /!\[([^\]]*)\]\(([^)]+)\)/gim,
      '<img src="$2" alt="$1" loading="lazy" class="max-w-full h-auto my-3 border-2 border-black rounded-none" />',
    )
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/gim,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline font-semibold font-space">$1</a>',
    )
    .replace(
      /```([\s\S]*?)```/gim,
      (match, p1) =>
        `<pre class='bg-gray-800 text-white p-3 my-3 border-2 border-black rounded-none overflow-x-auto font-mono text-sm'><code class='font-mono'>${p1.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`,
    )
    .replace(
      /`(.*?)`/gim,
      "<code class='bg-gray-200 text-red-600 px-1 py-0.5 font-mono text-sm border border-black rounded-none'>$1</code>",
    )
    .replace(
      /^\> (.*$)/gim,
      "<blockquote class='border-l-4 border-black pl-4 py-2 my-3 bg-gray-100 italic font-space rounded-none'>$1</blockquote>",
    )
    // Convert list items, then wrap them in ul/ol
    .replace(/^\s*([-*+]) (.*)/gm, "<li>$2</li>")
    .replace(/^\s*(\d+\.) (.*)/gm, "<li>$2</li>")
    .replace(/(<li>.*<\/li>)/gm, (match) => {
      // Naive check if it looks like an ordered list
      if (match.match(/^\d+\./)) {
        return `<ol class='list-decimal list-inside my-4 pl-4 font-space'>${match}</ol>`;
      }
      return `<ul class='list-disc list-inside my-4 pl-4 font-space'>${match}</ul>`;
    })
    // Consolidate adjacent lists
    .replace(
      /<\/ul>\s*<ul class='list-disc list-inside my-4 pl-4 font-space'>/g,
      "",
    )
    .replace(
      /<\/ol>\s*<ol class='list-decimal list-inside my-4 pl-4 font-space'>/g,
      "",
    )
    // Paragraphs and line breaks
    .replace(/\n\n/g, "</p><p class='my-2 font-space'>")
    .replace(/\n/g, "<br />");

  // Final cleanup
  if (!html.trim().startsWith("<")) {
    html = "<p class='my-2 font-space'>" + html;
  }
  if (!html.trim().endsWith("</p>")) {
    html = html + "</p>";
  }

  html = "<div class='markdown-preview-content font-space'>" + html + "</div>";
  html = html
    .replace(/<p class='my-2 font-space'>\s*(<br\s*\/?>\s*)*\s*<\/p>/g, "")
    .replace(/(<br\s*\/?>\s*){3,}/g, "<br /><br />");

  return html;
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
    {
      label: "H1",
      action: () => insertMarkdown("# ", "", "Heading 1"),
      icon: <Heading1 className="size-4" />,
    },
    {
      label: "H2",
      action: () => insertMarkdown("## ", "", "Heading 2"),
      icon: <Heading2 className="size-4" />,
    },
    {
      label: "H3",
      action: () => insertMarkdown("### ", "", "Heading 3"),
      icon: <Heading3 className="size-4" />,
    },
    { type: "separator" },
    {
      label: "Bold",
      action: () => insertMarkdown("**", "**", "bold text"),
      icon: <Bold className="size-4" />,
    },
    {
      label: "Italic",
      action: () => insertMarkdown("*", "*", "italic text"),
      icon: <Italic className="size-4" />,
    },
    { type: "separator" },
    {
      label: "Quote",
      action: () => insertMarkdown("\n> ", "", "Quote"),
      icon: <Quote className="size-4" />,
    },
    {
      label: "Code",
      action: () => insertMarkdown("`", "`", "code"),
      icon: <Code className="size-4" />,
    },
    {
      label: "Link",
      action: () => insertMarkdown("[", "](url)", "link text"),
      icon: <Link className="size-4" />,
    },
    {
      label: "Image",
      action: () => insertMarkdown("![", "](url)", "alt text"),
      icon: <ImageIcon className="size-4" />,
    },
    { type: "separator" },
    {
      label: "List",
      action: () => insertMarkdown("\n- ", "", "List item"),
      icon: <List className="size-4" />,
    },
    {
      label: "Ordered List",
      action: () => insertMarkdown("\n1. ", "", "List item"),
      icon: <ListOrdered className="size-4" />,
    },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-2">
        <ToggleGroup type="multiple" size="sm" variant="outline">
          {toolbarButtons.map((button, index) =>


            button.type === "separator" ? (
              <Separator
                key={`sep-${index}`}
                orientation="vertical"
                className="h-6 mx-1 bg-border"
              />
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
            ),
          )}
        </ToggleGroup>

        <ToggleGroup
          type="single"
          size="sm"
          value={activeTab}
          onValueChange={(value) => {
            if (value) setActiveTab(value as "write" | "preview");
          }}
        >
          <ToggleGroupItem value="write" aria-label="Write mode">
            Write
          </ToggleGroupItem>
          <ToggleGroupItem value="preview" aria-label="Preview mode">
            Preview
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div
        style={{ height }}
        className="prose prose-sm sm:prose-base dark:prose-invert max-w-none"
      >
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
