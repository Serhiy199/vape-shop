import { sanitizeRichTextHtml } from "@/lib/rich-text/sanitize";
import { cn } from "@/lib/utils";

export function SafeRichTextContent({
  className,
  html,
}: {
  className?: string;
  html: string | null | undefined;
}) {
  const sanitizedHtml = sanitizeRichTextHtml(html);

  if (!sanitizedHtml) {
    return null;
  }

  return (
    <div
      className={cn("rich-text-content", className)}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
