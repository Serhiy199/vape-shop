import sanitizeHtml from "sanitize-html";

const allowedTags = [
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
];

export function sanitizeRichTextHtml(html: string | null | undefined) {
  if (!html?.trim()) {
    return "";
  }

  return sanitizeHtml(html, {
    allowedAttributes: {
      a: ["href", "rel", "target", "title"],
      img: ["alt", "src", "title", "width", "style"],
      "*": ["class", "colspan", "rowspan", "style"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      img: ["http", "https"],
    },
    allowedStyles: {
      "*": {
        "text-align": [/^left$/, /^center$/, /^right$/],
      },
      img: {
        height: [/^auto$/],
        width: [/^\d+%$/, /^\d+px$/],
      },
    },
    allowedTags,
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
    },
  });
}
