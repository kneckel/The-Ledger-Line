// Renders a rich-text/HTML body string as paragraphs. The Phase-3 editor will
// produce sanitized HTML; for now we accept either HTML or plain text and
// split on double newlines.

interface Props {
  html: string;
}

export function RichBody({ html }: Props) {
  if (!html) return null;
  const looksHtml = /<\w+[^>]*>/.test(html);
  if (looksHtml) {
    // Phase 3 will plug in a sanitizer (DOMPurify or similar) before this lands
    // anywhere user-driven. For Phase 2 the body is author-controlled.
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
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}
