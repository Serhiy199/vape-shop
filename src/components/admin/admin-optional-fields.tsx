"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import {
  AdminInputField,
  AdminTextareaField,
} from "@/components/admin/admin-form-primitives";
import { AdminRichTextEditor } from "@/components/admin/admin-rich-text-editor";
import { Button } from "@/components/ui/button";

function hasValue(value?: string | number | readonly string[]) {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

function AdminOptionalFieldShell({
  label,
  error,
  value,
  children,
}: {
  label: string;
  error?: string;
  value?: string | number | readonly string[];
  children: ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(
    hasValue(value) || Boolean(error),
  );
  const shouldShowField = isExpanded || hasValue(value) || Boolean(error);

  if (shouldShowField) {
    return children;
  }

  return (
    <div className="border-border/70 bg-muted/20 flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
      <p className="text-sm font-medium">{label}</p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(true)}
      >
        + Додати
      </Button>
    </div>
  );
}

export function AdminOptionalInputField({
  label,
  error,
  value,
  ...props
}: React.ComponentProps<typeof AdminInputField>) {
  return (
    <AdminOptionalFieldShell label={label} error={error} value={value}>
      <AdminInputField label={label} error={error} value={value} {...props} />
    </AdminOptionalFieldShell>
  );
}

export function AdminOptionalTextareaField({
  label,
  error,
  value,
  ...props
}: React.ComponentProps<typeof AdminTextareaField>) {
  return (
    <AdminOptionalFieldShell label={label} error={error} value={value}>
      <AdminTextareaField label={label} error={error} value={value} {...props} />
    </AdminOptionalFieldShell>
  );
}

export function AdminOptionalRichTextField({
  label,
  error,
  value,
  ...props
}: React.ComponentProps<typeof AdminRichTextEditor>) {
  return (
    <AdminOptionalFieldShell label={label} error={error} value={value}>
      <AdminRichTextEditor
        label={label}
        error={error}
        value={value}
        {...props}
      />
    </AdminOptionalFieldShell>
  );
}
