// Renders rich-text body text. Accepts:
//   - HTML (used by AI-imported content) — passed through as-is.
//   - Plain text with light Markdown — `**bold**`, `*italic*`, and inline
//     [links](https://...). Newlines split paragraphs.

interface Props {
  html: string;
}

export function RichBody({ html }: Props) {
  if (!html) return null;
  const looksHtml = /<\w+[^>]*>/.test(html);

  if (looksHtml) {
    // AI / pasted HTML. Author-controlled — no sanitization in Phase 7;
    // worth revisiting if we ever accept untrusted input.
    return (
      <div
        className="space-y-4 text-[15px] leading-[1.7]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  const paragraphs = html.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return (
    <div className="space-y-4 text-[15px] leading-[1.7]">
      {paragraphs.map((p, i) => (
        <p key={i} dangerouslySetInnerHTML={{ __html: markdownToHtml(p) }} />
      ))}
    </div>
  );
}

// Tiny Markdown-ish renderer: bold, italic, inline links. The text is
// HTML-escaped first, so `<script>` and friends don't sneak through.
function markdownToHtml(text: string): string {
  let s = escape(text);

  // Inline code (a single pair of backticks)
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold: **text**
  s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');

  // Italic: *text* — only if not part of ** (already consumed above).
  // Boundary lookbehind/ahead avoid matching mid-word emphasis edge cases.
  s = s.replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,;:!?]|$)/g, '$1<em>$2</em>');

  // Inline links [text](url)
  s = s.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer">$1</a>',
  );

  // Single newlines inside a paragraph become <br>
  s = s.replace(/\n/g, '<br />');

  return s;
}

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
