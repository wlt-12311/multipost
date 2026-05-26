/**
 * Simple renderer: converts markdown-like formatting to HTML for display.
 * Supports: **bold**, # headers, -/* lists, > quotes, [links](url), `code`, \n\n paragraphs
 */

export function renderMarkdown(text: string): string {
  let html = text
    // Escape HTML to prevent XSS (first pass)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

    // Inline code: `code`
    .replace(/`([^`]+)`/g, '<code>$1</code>')

    // Bold: **text** or __text__
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')

    // Italic: *text* (but not inside words and not markdown list items)
    .replace(/(?<![*])\*([^*\n]+?)\*(?![*])/g, '<em>$1</em>')

    // Links: [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

    // Blockquotes: > text (must be at start of line)
    .split('\n')
    .map(line => {
      if (line.startsWith('&gt; ')) {
        return `<blockquote>${line.slice(5)}</blockquote>`;
      }
      // Headers: ## Header / # Header (convert to h3/h4 for article feel)
      if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`;
      if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
      if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`;
      // Horizontal rule
      if (line === '---' || line === '***') return '<hr>';
      return line;
    })
    .join('\n');

  // Ordered lists: 1. item
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li value="$1">$2</li>');

  // Unordered lists: - item or * item
  html = html.replace(/^[*-] (.+)$/gm, '<li>$1</li>');

  // Wrap consecutive <li> in <ul> or <ol>
  html = html.replace(/((?:<li[^>]*>.*?<\/li>\n?)+)/g, (match) => {
    if (match.includes('value=')) return `<ol>${match}</ol>`;
    return `<ul>${match}</ul>`;
  });

  // Paragraphs: double newlines
  const paragraphs = html.split('\n\n');
  html = paragraphs
    .map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      // Skip if already wrapped in a block element
      if (/^<(h[12]|ul|ol|li|blockquote|hr|table|div)/.test(trimmed)) return trimmed;
      // Don't wrap single-line inline content that's part of a list
      if (trimmed.startsWith('<li')) return trimmed;
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');

  return html;
}

export function stripHtml(text: string): string {
  const div = document.createElement('div');
  div.innerHTML = text;
  return div.textContent || div.innerText || '';
}
