import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function AdminFormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-border/70 bg-card/90 p-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        {description ? (
          <p className="text-muted-foreground text-sm leading-6">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export function AdminFormGrid({
  columns = 2,
  children,
}: {
  columns?: 1 | 2;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 2 ? "md:grid-cols-2" : "grid-cols-1",
      )}
    >
      {children}
    </div>
  );
}

export function AdminField({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-primary">*</span> : null}
      </Label>
      {children}
      {error ? (
        <p className="text-destructive text-sm leading-6">{error}</p>
      ) : hint ? (
        <p className="text-muted-foreground text-sm leading-6">{hint}</p>
      ) : null}
    </div>
  );
}

export function AdminInputField({
  label,
  id,
  hint,
  error,
  required,
  className,
  ...props
}: React.ComponentProps<typeof Input> & {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <AdminField
      label={label}
      htmlFor={id}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <Input id={id} aria-invalid={Boolean(error)} {...props} />
    </AdminField>
  );
}

export function AdminTextareaField({
  label,
  id,
  hint,
  error,
  required,
  className,
  ...props
}: React.ComponentProps<typeof Textarea> & {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <AdminField
      label={label}
      htmlFor={id}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <Textarea id={id} aria-invalid={Boolean(error)} {...props} />
    </AdminField>
  );
}

export function AdminSelectField({
  label,
  placeholder,
  value,
  hint,
  error,
  required,
  options,
  className,
}: {
  label: string;
  placeholder: string;
  value?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
  className?: string;
}) {
  return (
    <AdminField
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <Select defaultValue={value}>
        <SelectTrigger className="w-full" aria-invalid={Boolean(error)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </AdminField>
  );
}

export function AdminSwitchField({
  label,
  description,
  checked = false,
}: {
  label: string;
  description?: string;
  checked?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-card/90 px-4 py-3">
      <div className="space-y-1">
        <p className="text-sm font-medium">{label}</p>
        {description ? (
          <p className="text-muted-foreground text-sm leading-6">{description}</p>
        ) : null}
      </div>
      <Switch defaultChecked={checked} aria-label={label} />
    </div>
  );
}

export function AdminFormActions({
  primaryLabel,
  secondaryLabel,
}: {
  primaryLabel: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground text-sm leading-6">
        Footer дій форми стандартизує нижню частину create/edit screen-ів.
      </p>
      <div className="flex flex-wrap gap-2">
        {secondaryLabel ? (
          <Button type="button" variant="outline">
            {secondaryLabel}
          </Button>
        ) : null}
        <Button type="button">{primaryLabel}</Button>
      </div>
    </div>
  );
}
