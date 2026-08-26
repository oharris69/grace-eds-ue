/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-product. Base: cards (container). Source: https://grace.com/
 * Child model "card" fields: image (reference), imageAlt (collapsed → img alt), text (richtext).
 * Each card = one row with 2 cells: [image] [text]. Whole card links to /products/*.
 */
export default function parse(element, { document }) {
  // The instance selector matches the container row; gather all product cards.
  // Fall back to treating the element itself as a single card.
  let cards = Array.from(element.querySelectorAll('.card'));
  if (cards.length === 0) {
    cards = element.matches('.card') ? [element] : [element];
  }

  const cells = [];

  cards.forEach((card) => {
    // Whole-card link (product detail page).
    const cardLink = card.querySelector('a[href]');
    const href = cardLink ? cardLink.getAttribute('href') : null;

    // Image cell.
    const img = card.querySelector('.image img, img');
    const imageCell = document.createDocumentFragment();
    if (img) {
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(img);
    }

    // Text cell: eyebrow, linked title (heading), caption.
    const eyebrow = card.querySelector('.text > p.h5, .text p:first-child');
    const title = card.querySelector('.text .title, .text p.h4, .text .h4');
    const caption = card.querySelector('.text .spt-copy, .text .h6');

    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));

    if (eyebrow && eyebrow !== title) {
      const p = document.createElement('p');
      p.textContent = eyebrow.textContent.trim();
      textCell.appendChild(p);
    }

    if (title) {
      const heading = document.createElement('h3');
      const titleText = title.textContent.trim();
      if (href) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = titleText;
        heading.appendChild(a);
      } else {
        heading.textContent = titleText;
      }
      textCell.appendChild(heading);
    }

    if (caption) {
      const p = document.createElement('p');
      p.textContent = caption.textContent.trim();
      textCell.appendChild(p);
    }

    cells.push([imageCell, textCell]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-product', cells });
  element.replaceWith(block);
}
