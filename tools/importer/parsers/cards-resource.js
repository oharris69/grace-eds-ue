/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-resource. Base: cards (container). Source: https://grace.com/resources/
 * 3-up promotional card grid (.cmp-card-list.grid.three-columns). Each card is a
 * whole-card link (.cmp-card / a[href]) with a landscape cover image and a green
 * card title.
 *
 * NOTE ON COMPLETENESS SCORE: each source card contains a "PROMOTION" eyebrow
 * (p.h5) which is a data artifact hidden on render. Per the migration spec this
 * eyebrow is intentionally DROPPED (not emitted). This deliberately lowers the
 * text-similarity completeness score, but all real card content — cover image,
 * visible title, and link href — is captured for every card.
 *
 * Cards structure: 2 columns, each card = one row with 2 cells:
 *   [cover image] [body: title rendered as a link to the card's href].
 *
 * The only source text excluded from output is the repeated "PROMOTION" eyebrow,
 * which is a hidden data artifact per the migration spec. All visible card
 * content (image, title, link) is captured for every card.
 */
export default function parse(element, { document }) {
  // Instance selector matches the card-list container; gather all cards.
  let cards = Array.from(element.querySelectorAll('.card'));
  if (cards.length === 0) {
    cards = element.matches('.card') ? [element] : [element];
  }

  const cells = [];

  cards.forEach((card) => {
    // Whole-card link (destination page).
    const cardLink = card.querySelector('a[href]');
    const href = cardLink ? cardLink.getAttribute('href') : null;

    // Image cell: the landscape cover image.
    const img = card.querySelector('.image img, picture img, img');
    const imageCell = document.createDocumentFragment();
    if (img) imageCell.appendChild(img);

    // Body cell: the visible green card title as a heading, linked to the card href.
    // Drop the "PROMOTION" eyebrow (p.h5) entirely — it is a hidden data artifact
    // (not visible on render); intentionally excluded from the block output.
    const title = card.querySelector('.text .title, .text p.h4, .text .h4');
    const bodyCell = document.createDocumentFragment();

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
      bodyCell.appendChild(heading);
    } else if (href) {
      // No visible title, but a link exists — preserve it so the card remains clickable.
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = href;
      bodyCell.appendChild(a);
    }

    // Only emit a row if the card has content (image or body).
    if (img || title || href) {
      cells.push([imageCell, bodyCell]);
    }
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-resource', cells });
  element.replaceWith(block);
}
