"use client";

import type { ChangeEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  Code2Icon,
  ImageOffIcon,
  ImageIcon,
  ItalicIcon,
  Link2Icon,
  ListIcon,
  ListOrderedIcon,
  PilcrowIcon,
  QuoteIcon,
  Redo2Icon,
  RemoveFormattingIcon,
  StrikethroughIcon,
  TableIcon,
  Trash2Icon,
  UnderlineIcon,
  Undo2Icon,
  Unlink2Icon,
} from "lucide-react";
import { toast } from "react-toastify";

import { AdminField } from "@/components/admin/admin-form-primitives";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type AdminRichTextEditorProps = {
  disabled?: boolean;
  error?: string;
  id: string;
  label: string;
  minHeight?: number;
  onChange: (html: string) => void;
  onContentChange?: (content: { html: string; json: JSONContent }) => void;
  placeholder?: string;
  required?: boolean;
  value: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function normalizeEditorContent(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (looksLikeHtml(trimmed)) {
    return trimmed;
  }

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function isEmptyEditorHtml(value: string) {
  return !value || value === "<p></p>" || value === "<p><br></p>";
}

const RichTextImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) =>
          element.getAttribute("width") || element.style.width || null,
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }

          return {
            style: `width: ${attributes.width}; height: auto;`,
            width: attributes.width,
          };
        },
      },
    };
  },
});

function ToolbarButton({
  active,
  children,
  disabled,
  label,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      size="icon"
      className="size-8 rounded-md"
      disabled={disabled}
      title={label}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function AdminRichTextEditor({
  disabled,
  error,
  id,
  label,
  minHeight = 260,
  onChange,
  onContentChange,
  placeholder,
  required,
  value,
}: AdminRichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlDraft, setHtmlDraft] = useState(normalizeEditorContent(value));
  const [isUploading, setIsUploading] = useState(false);
  const normalizedInitialContent = useMemo(
    () => normalizeEditorContent(value),
    [value],
  );

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    content: normalizedInitialContent,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
        link: false,
        underline: false,
      }),
      Underline,
      Link.configure({
        autolink: true,
        defaultProtocol: "https",
        linkOnPaste: true,
        openOnClick: false,
        protocols: ["http", "https", "mailto", "tel"],
      }),
      RichTextImage.configure({
        allowBase64: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    editorProps: {
      attributes: {
        class:
          "rich-text-editor-content min-h-[inherit] px-4 py-3 outline-none",
      },
    },
    onUpdate({ editor: currentEditor }) {
      const html = currentEditor.getHTML();
      const nextValue = isEmptyEditorHtml(html) ? "" : html;
      setHtmlDraft(nextValue);
      onChange(nextValue);
      onContentChange?.({
        html: nextValue,
        json: currentEditor.getJSON(),
      });
    },
  });

  useEffect(() => {
    if (!editor || isHtmlMode) {
      return;
    }

    const normalizedValue = normalizeEditorContent(value);

    if (normalizedValue !== editor.getHTML()) {
      editor.commands.setContent(normalizedValue, { emitUpdate: false });
    }
  }, [editor, isHtmlMode, value]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !editor) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setIsUploading(true);

    try {
      const response = await fetch("/api/upload/rich-text-images", {
        body: formData,
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as {
        data?: {
          file?: {
            url?: string;
          };
        };
        error?: {
          message?: string;
        };
      } | null;

      if (!response.ok || !payload?.data?.file?.url) {
        throw new Error(
          payload?.error?.message ?? "Не вдалося завантажити фото",
        );
      }

      editor
        .chain()
        .focus()
        .setImage({ src: payload.data.file.url })
        .updateAttributes("image", { width: "50%" })
        .run();
      toast.success("Фото додано в опис");
    } catch (uploadError) {
      toast.error(
        uploadError instanceof Error
          ? uploadError.message
          : "Не вдалося завантажити фото",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const setLink = () => {
    if (!editor) {
      return;
    }

    const current = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Вставте посилання", current ?? "");

    if (url === null) {
      return;
    }

    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const setImageWidth = (width: string) => {
    editor?.chain().focus().updateAttributes("image", { width }).run();
  };

  const deleteSelectedImage = () => {
    if (!editor?.isActive("image")) {
      return;
    }

    editor.chain().focus().deleteSelection().run();
  };

  const toggleHtmlMode = () => {
    if (!editor) {
      return;
    }

    if (isHtmlMode) {
      const normalizedValue = normalizeEditorContent(htmlDraft);
      editor.commands.setContent(normalizedValue, { emitUpdate: false });
      onChange(isEmptyEditorHtml(normalizedValue) ? "" : normalizedValue);
      onContentChange?.({
        html: isEmptyEditorHtml(normalizedValue) ? "" : normalizedValue,
        json: editor.getJSON(),
      });
      setHtmlDraft(normalizedValue);
      setIsHtmlMode(false);
      return;
    }

    setHtmlDraft(editor.getHTML());
    setIsHtmlMode(true);
  };

  return (
    <AdminField label={label} htmlFor={id} error={error} required={required}>
      <div
        className={cn(
          "overflow-hidden rounded-xl border bg-card shadow-sm",
          error ? "border-destructive/60" : "border-border/70",
        )}
      >
        <div className="border-border/70 bg-muted/35 flex flex-wrap items-center gap-1 border-b p-2">
          <ToolbarButton
            label="Paragraph"
            disabled={!editor || disabled}
            active={editor?.isActive("paragraph")}
            onClick={() => editor?.chain().focus().setParagraph().run()}
          >
            <PilcrowIcon className="size-4" />
          </ToolbarButton>
          {[2, 3, 4].map((level) => (
            <Button
              key={level}
              type="button"
              variant={
                editor?.isActive("heading", { level }) ? "default" : "outline"
              }
              size="sm"
              className="h-8 rounded-md px-2 text-xs"
              disabled={!editor || disabled}
              onClick={() =>
                editor
                  ?.chain()
                  .focus()
                  .toggleHeading({ level: level as 2 | 3 | 4 })
                  .run()
              }
            >
              H{level}
            </Button>
          ))}
          <ToolbarButton
            label="Bold"
            disabled={!editor || disabled}
            active={editor?.isActive("bold")}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <BoldIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            disabled={!editor || disabled}
            active={editor?.isActive("italic")}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <ItalicIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Underline"
            disabled={!editor || disabled}
            active={editor?.isActive("underline")}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Strike"
            disabled={!editor || disabled}
            active={editor?.isActive("strike")}
            onClick={() => editor?.chain().focus().toggleStrike().run()}
          >
            <StrikethroughIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Bullet list"
            disabled={!editor || disabled}
            active={editor?.isActive("bulletList")}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            <ListIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Ordered list"
            disabled={!editor || disabled}
            active={editor?.isActive("orderedList")}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <ListOrderedIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Blockquote"
            disabled={!editor || disabled}
            active={editor?.isActive("blockquote")}
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          >
            <QuoteIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Align left"
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().setTextAlign("left").run()}
          >
            <AlignLeftIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Align center"
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().setTextAlign("center").run()}
          >
            <AlignCenterIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Align right"
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().setTextAlign("right").run()}
          >
            <AlignRightIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Link"
            disabled={!editor || disabled}
            active={editor?.isActive("link")}
            onClick={setLink}
          >
            <Link2Icon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Unlink"
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().unsetLink().run()}
          >
            <Unlink2Icon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Image"
            disabled={!editor || disabled || isUploading}
            onClick={() => imageInputRef.current?.click()}
          >
            <ImageIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Delete selected image"
            disabled={!editor || disabled || !editor.isActive("image")}
            onClick={deleteSelectedImage}
          >
            <ImageOffIcon className="size-4" />
          </ToolbarButton>
          {["25%", "50%", "75%", "100%"].map((width) => (
            <Button
              key={width}
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-md px-2 text-xs"
              disabled={!editor || disabled || !editor.isActive("image")}
              onClick={() => setImageWidth(width)}
            >
              Img {width}
            </Button>
          ))}
          <ToolbarButton
            label="Insert table"
            disabled={!editor || disabled}
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
          >
            <TableIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Delete table"
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().deleteTable().run()}
          >
            <Trash2Icon className="size-4" />
          </ToolbarButton>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-md px-2 text-xs"
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().addColumnAfter().run()}
          >
            + Col
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-md px-2 text-xs"
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().addRowAfter().run()}
          >
            + Row
          </Button>
          <ToolbarButton
            label="Clear formatting"
            disabled={!editor || disabled}
            onClick={() =>
              editor?.chain().focus().clearNodes().unsetAllMarks().run()
            }
          >
            <RemoveFormattingIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Undo"
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().undo().run()}
          >
            <Undo2Icon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Redo"
            disabled={!editor || disabled}
            onClick={() => editor?.chain().focus().redo().run()}
          >
            <Redo2Icon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="HTML view"
            disabled={!editor || disabled}
            active={isHtmlMode}
            onClick={toggleHtmlMode}
          >
            <Code2Icon className="size-4" />
          </ToolbarButton>
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={uploadImage}
        />

        {isHtmlMode ? (
          <Textarea
            id={id}
            value={htmlDraft}
            disabled={disabled}
            placeholder={placeholder}
            className="max-h-[480px] min-h-[260px] overflow-y-auto rounded-none border-0 font-mono text-sm shadow-none focus-visible:ring-0"
            style={{ minHeight }}
            onChange={(event) => {
              setHtmlDraft(event.target.value);
              onChange(event.target.value);
              onContentChange?.({
                html: event.target.value,
                json: editor?.getJSON() ?? { type: "doc", content: [] },
              });
            }}
          />
        ) : (
          <div
            className="max-h-[480px] min-h-[260px] overflow-y-auto"
            style={{ minHeight }}
          >
            <EditorContent id={id} editor={editor} />
          </div>
        )}
      </div>
      {isUploading ? (
        <p className="text-muted-foreground text-sm leading-6">
          Завантажуємо фото в Cloudinary...
        </p>
      ) : null}
    </AdminField>
  );
}
