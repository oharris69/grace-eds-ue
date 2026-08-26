/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-insights. Base: cards (container). Source: https://grace.com/
 * Child model "card" fields: image (reference), imageAlt (collapsed → img alt), text (richtext).
 * Each blog card = one row with 2 cells: [image] [text]. Text = category eyebrow (h5) +
 * linked title + "Read more" link. Links point to /insights/*.
 */
export default function parse(element, { document }) {
  // The instance selector matches the container row; each card is a media row block.
  let cards = Array.from(element.querySelectorAll('.single-media.image.row, .right-media.image.row'));
  if (cards.length === 0) {
    // Fallbacks: treat element as a single card, or find card-like descendants.
    cards = Array.from(element.querySelectorAll('article:has(h5):has(a[href*="/insights/"])'));
  }
  if (cards.length === 0) cards = [element];

  const cells = [];

  cards.forEach((card) => {
    // Image cell.
    const img = card.querySelector('.media img, .image img, img');
    const imageCell = document.createDocumentFragment();
    if (img) {
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(img);
    }

    // Text cell: eyebrow (h5), linked title, "Read more" link.
    const eyebrow = card.querySelector('h5');
    const links = Array.from(card.querySelectorAll('a[href]'));
    // First link = title, subsequent = read more / secondary.
    const titleLink = links[0];
    const extraLinks = links.slice(1);

    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));

    if (eyebrow) {
      const p = document.createElement('p');
      p.textContent = eyebrow.textContent.replace(/\s+/g, ' ').trim();
      textCell.appendChild(p);
    }

    if (titleLink) {
      const heading = document.createElement('h3');
      const a = document.createElement('a');
      a.setAttribute('href', titleLink.getAttribute('href'));
      a.textContent = titleLink.textContent.replace(/\s+/g, ' ').trim();
      heading.appendChild(a);
      textCell.appendChild(heading);
    }

    extraLinks.forEach((link) => {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', link.getAttribute('href'));
      a.textContent = link.textContent.replace(/\s+/g, ' ').trim();
      p.appendChild(a);
      textCell.appendChild(p);
    });

    cells.push([imageCell, textCell]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-insights', cells });
  element.replaceWith(block);
}
