/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-feature. Base: columns. Source: https://grace.com/
 * Columns block: 2 columns, 1 content row. Per xwalk rules, Columns blocks do NOT
 * carry field:* hints — cells hold default content only.
 * Each column = image + paragraph + CTA button link.
 */

/**
 * The two Life-at-Grace feature images are Scene7-hosted and lazy-loaded on the
 * source page. Depending on scroll/timing during the import scrape, their <img>
 * src can be captured as a transient `blob:` placeholder rather than the real
 * Scene7 URL. Recover the real URL by alt text so the DM/Scene7 transformer can
 * build a responsive <picture>. Values are the source's own Scene7 URLs.
 */
const SCENE7_BY_ALT = {
  'Image of Grace employee celebrating Veteran\'s Day':
    'https://grace.scene7.com/is/image/grace/Employee-Appreciation-Day_GVETS_680x300?qlt=85&wid=600&ts=1758550755835&dpr=off',
  'Image of Grace warehouse employees':
    'https://grace.scene7.com/is/image/grace/Grace_Employees_680x300?qlt=85&wid=600&ts=1758550916155&dpr=off',
};

function recoverLazyImageSrc(img) {
  const src = img.getAttribute('src') || '';
  if (/^https?:\/\//i.test(src)) return; // already a real URL
  const alt = (img.getAttribute('alt') || '').trim();
  if (SCENE7_BY_ALT[alt]) img.setAttribute('src', SCENE7_BY_ALT[alt]);
}

export default function parse(element, { document }) {
  // The instance selector matches the row containing the two columns.
  let columns = Array.from(element.querySelectorAll(':scope > div.col-xs-12.col-lg-6'));
  if (columns.length === 0) {
    columns = Array.from(element.querySelectorAll(':scope > div[class*="col-"]'));
  }
  if (columns.length === 0) columns = [element];

  const rowCells = [];

  columns.forEach((col) => {
    const cellContent = [];

    // Image (preserve the <img> element so the DM/Scene7 transformer can process it).
    const img = col.querySelector('.cmp-image img, .image img, img');
    if (img) {
      recoverLazyImageSrc(img);
      cellContent.push(img);
    }

    // Body copy.
    const text = col.querySelector('.rich-text, .text .rich-text, .text p, p');
    if (text) {
      // Prefer the rich-text wrapper's paragraph(s); fall back to the element itself.
      const paras = text.matches('p') ? [text] : Array.from(text.querySelectorAll('p'));
      if (paras.length) {
        paras.forEach((p) => cellContent.push(p));
      } else {
        cellContent.push(text);
      }
    }

    // CTA button link — build a clean anchor with its label text.
    const cta = col.querySelector('.button a, .button__section a, a.btn-primary');
    if (cta) {
      const a = document.createElement('a');
      a.setAttribute('href', cta.getAttribute('href'));
      a.textContent = cta.textContent.replace(/\s+/g, ' ').trim();
      cellContent.push(a);
    }

    rowCells.push(cellContent);
  });

  if (rowCells.every((c) => c.length === 0)) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Single content row with one cell per column.
  const cells = [rowCells];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });
  element.replaceWith(block);
}
