import DOMPurify from "isomorphic-dompurify";

const SAFE_URI_PATTERN =
  /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i;

export function sanitizeRichTextHtml(html: string | null | undefined) {
  if (!html?.trim()) {
    return "";
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_ATTR: [
      "alt",
      "class",
      "colspan",
      "href",
      "rel",
      "rowspan",
      "src",
      "style",
      "target",
      "title",
      "width",
    ],
    ALLOWED_TAGS: [
      "a",
      "blockquote",
      "br",
      "div",
      "em",
      "h2",
      "h3",
      "h4",
      "hr",
      "img",
      "li",
      "ol",
      "p",
      "s",
      "span",
      "strong",
      "table",
      "tbody",
      "td",
      "th",
      "thead",
      "tr",
      "u",
      "ul",
    ],
    ALLOWED_URI_REGEXP: SAFE_URI_PATTERN,
    ADD_ATTR: ["target"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
    FORBID_TAGS: ["iframe", "object", "script", "style"],
  });
}
