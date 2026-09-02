"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Undo2,
  Redo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Field } from "@/components/ui";

type Editor = NonNullable<ReturnType<typeof useEditor>>;

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={cn(
        "size-8 grid place-items-center rounded transition-colors",
        active
          ? "bg-admin-accent/20 text-admin-accent"
          : "text-admin-text-secondary hover:text-admin-text-primary hover:bg-admin-surface-hover",
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const addLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-admin-border p-1.5">
      <ToolbarButton
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-4" />
      </ToolbarButton>

      <span className="w-px h-5 bg-admin-border mx-1" />

      <ToolbarButton
        label="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="size-4" />
      </ToolbarButton>

      <span className="w-px h-5 bg-admin-border mx-1" />

      <ToolbarButton
        label="Bulleted list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Quote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Link" active={editor.isActive("link")} onClick={addLink}>
        <Link2 className="size-4" />
      </ToolbarButton>

      <span className="w-px h-5 bg-admin-border mx-1" />

      <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 className="size-4" />
      </ToolbarButton>
    </div>
  );
}

export default function RichTextEditor({
  label,
  hint,
  value,
  onChange,
  minHeight = 220,
}: {
  label?: string;
  hint?: string;
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value,
    // Required in the App Router: rendering the editor on the server would
    // otherwise mismatch the client on hydration.
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose-admin focus:outline-none px-4 py-3",
        style: `min-height:${minHeight}px`,
      },
    },
  });

  // Keep the editor in sync when the form loads data after mount.
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  const body = (
    <div className="rounded-md border border-admin-border bg-admin-bg overflow-hidden focus-within:border-admin-accent">
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );

  if (!label) return body;
  return (
    <Field label={label} hint={hint}>
      {body}
    </Field>
  );
}
