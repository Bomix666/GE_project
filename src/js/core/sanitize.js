/**
 * HTML from the data source (product descriptions, news, blog, text pages)
 * goes through an allowlist before it reaches innerHTML. The snapshot is
 * clean, but on the live site this text comes from the CMS database, and a
 * single <img onerror> there must not run script for every visitor.
 * The backend should sanitize as well — this is the second line.
 */
import DOMPurify from 'dompurify';

const CONFIG = {
  // what the CMS texts use today, plus ordinary text markup
  ALLOWED_TAGS: [
    'p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup', 'span',
    'h2', 'h3', 'h4', 'h5', 'blockquote', 'ul', 'ol', 'li',
    'a', 'img', 'figure', 'figcaption',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'title', 'src', 'alt', 'loading', 'width', 'height', 'colspan', 'rowspan'],
  // links and images: site paths, #anchors, http(s), mailto, tel — no javascript:, data:, vbscript:
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  ALLOW_DATA_ATTR: false,
};

// a link opened in a new tab must not get access to this page
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
    const rel = node.getAttribute('rel') || '';
    if (!/\bnoopener\b/.test(rel)) node.setAttribute('rel', `${rel} noopener`.trim());
  }
});

export const cleanHTML = (html) => DOMPurify.sanitize(String(html ?? ''), CONFIG);
