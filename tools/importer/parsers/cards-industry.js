/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-industry. Base: cards (container). Source: https://grace.com/
 * Child model "card" fields: image (reference), imageAlt (collapsed → img alt), text (richtext).
 * Each industry tile = one row with 2 cells: [image] [text]. Text is a green label link
 * (industry name, no description). Whole card links to /industries/*.
 */
export default function parse(element, { document }) {
  // Scope to real tile cards inside the card grid (.card-item / .card-group),
  // which excludes unrelated .cmp-card anchors elsewhere on the page (e.g. the
  // pre-footer "Standard Industries" logo card). Fall back to broader selectors.
  let cards = Array.from(element.querySelectorAll('.card-item a.cmp-card, .card-group a.cmp-card'));
  if (cards.length === 0) {
    cards = Array.from(element.querySelectorAll('a.cmp-card, a[href*="/industries/"]'));
  }
  if (cards.length === 0 && element.matches('a')) cards = [element];

  const cells = [];

  cards.forEach((card) => {
    const href = card.getAttribute('href');

    // Image cell.
    const img = card.querySelector('.image img, img');
    const imageCell = document.createDocumentFragment();
    if (img) {
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(img);
    }

    // Label text (tile name). Lives in .content .cta / .text. The source also
    // carries a hidden "PROMOTION" eyebrow (p.h5) that is NOT rendered — prefer
    // the CTA/label element and strip a leading "PROMOTION" if it slips in.
    const labelEl = card.querySelector('.content .cta, .content .text .cta, .content .text, .content');
    let label = labelEl ? labelEl.textContent.replace(/\s+/g, ' ').trim() : '';
    if (!label) label = (card.getAttribute('aria-label') || card.textContent).replace(/\s+/g, ' ').trim();
    label = label.replace(/^\s*PROMOTION\s*/i, '').trim();

    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    if (label) {
      const heading = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = label;
        heading.appendChild(a);
      } else {
        heading.textContent = label;
      }
      textCell.appendChild(heading);
    }

    cells.push([imageCell, textCell]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-industry', cells });
  element.replaceWith(block);
}
