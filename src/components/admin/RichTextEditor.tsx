"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Paste-first rich text field.
 *
 * A contentEditable area, so text copied from Word, Google Docs or a web page
 * keeps its headings, bold, italics and lists. The markup is mirrored into a
 * hidden input on every change and cleaned again on the server, which is what
 * actually decides what survives.
 */

type Command = {
  label: string;
  title: string;
  command: string;
  value?: string;
  className?: string;
};

const COMMANDS: Command[] = [
  { label: "H2", title: "Heading", command: "formatBlock", value: "h2" },
  { label: "H3", title: "Subheading", command: "formatBlock", value: "h3" },
  { label: "P", title: "Paragraph", command: "formatBlock", value: "p" },
  { label: "B", title: "Bold", command: "bold", className: "font-bold" },
  { label: "I", title: "Italic", command: "italic", className: "italic" },
  { label: "U", title: "Underline", command: "underline", className: "underline" },
  { label: "• List", title: "Bulleted list", command: "insertUnorderedList" },
  { label: "1. List", title: "Numbered list", command: "insertOrderedList" },
  { label: "Quote", title: "Quote", command: "formatBlock", value: "blockquote" },
  { label: "Clear", title: "Remove formatting", command: "removeFormat" },
];

export default function RichTextEditor({
  name,
  defaultValue,
  placeholder,
}: {
  name: string;
  defaultValue: string;
  placeholder?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(defaultValue);

  // Set the starting markup once; React must not re-render this subtree.
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = defaultValue;
    }
  }, [defaultValue]);

  function sync() {
    setHtml(editorRef.current?.innerHTML ?? "");
  }

  function run(item: Command) {
    editorRef.current?.focus();
    document.execCommand(item.command, false, item.value);
    sync();
  }

  const isEmpty = !html.replace(/<[^>]*>/g, "").trim();

  return (
    <div>
      <input type="hidden" name={name} value={html} readOnly />

      <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 border-fun-gray-darker bg-fun-pink-darker px-2 py-2">
        {COMMANDS.map((item) => (
          <button
            key={item.label}
            type="button"
            title={item.title}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => run(item)}
            className={`rounded px-2 py-1 text-xs text-fun-gray-light transition-colors hover:bg-fun-pink hover:text-bg ${item.className ?? ""}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Case study body"
          onInput={sync}
          onBlur={sync}
          className="richText min-h-60 w-full overflow-y-auto rounded-b-lg border border-fun-gray-darker bg-fun-pink-darkest px-4 py-3 text-sm text-fun-gray-light outline-none focus:border-fun-pink"
        />
        {isEmpty && placeholder && (
          <p className="pointer-events-none absolute top-3 left-4 text-sm text-fun-gray-medium">
            {placeholder}
          </p>
        )}
      </div>

      <p className="mt-1 text-xs text-fun-gray-medium">
        Paste straight from Word, Google Docs or a web page — headings, bold,
        italics and lists come across. Colours and fonts are dropped so the page
        keeps its own styling.
      </p>
    </div>
  );
}
