/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-contact. Base: cards (2-column convention). Source: https://grace.com/contact-us/
 * and https://grace.com/vendor-suppliers/.
 * Cards block: 2 columns, multiple rows. Each contact card becomes one row with 2 cells:
 *   [icon image] [body: h4 heading + bulleted list(s) + optional CTA as a linked paragraph].
 * Matches the Cards convention (image/icon in cell 1, text content in cell 2) and the
 * decoration in blocks/cards-contact/cards-contact.js.
 *
 * Handles TWO Grace source encodings that both map to cards-contact:
 *  - Structure A: ".col-xs-12.col-lg-4" tiles (contact-us; vendor-suppliers Grid 2
 *    section#video-threefeature). Icon in .image/.cmp-image, body in .text .rich-text,
 *    optional CTA at .button a (btn-primary variants).
 *  - Structure B: ".cmp-card-list .card-group .card" whole-card links (vendor-suppliers
 *    Grid 1 "Working with Grace"). Icon in .card-content .image, title in p.h4.title,
 *    list in .h6 ul, CTA text in .cta with the whole-card a.cmp-card href as target.
 */
export default function parse(element, { document }) {
  const clean = (text) => (text || '').replace(/ /g, ' ').trim();
  const cells = [];

  // --- Structure B: whole-card links inside a .cmp-card-list card group. ---
  const cardLinks = Array.from(element.querySelectorAll('.card-group .card'));
  if (cardLinks.length > 0) {
    cardLinks.forEach((card) => {
      // Icon image lives in the card content.
      const img = card.querySelector('.card-content .image img, .image img, img');
      const imageCell = document.createDocumentFragment();
      if (img) imageCell.appendChild(img);

      const bodyCell = document.createDocumentFragment();

      // Visible green title (drop the hidden p.h5 "PROMOTION" eyebrow).
      const title = card.querySelector('p.h4.title, p.h4');
      if (title && clean(title.textContent)) {
        const h4 = document.createElement('h4');
        h4.textContent = clean(title.textContent);
        bodyCell.appendChild(h4);
      }

      // Bulleted list (may be absent).
      const list = card.querySelector('.h6 ul, ul');
      if (list) bodyCell.appendChild(list);

      // CTA: text from .cta div, link target is the whole-card href.
      const cardLink = card.querySelector('a.cmp-card[href], a[href]');
      const ctaDiv = card.querySelector('.cta');
      if (cardLink && ctaDiv && clean(ctaDiv.textContent)) {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.setAttribute('href', cardLink.getAttribute('href') || '#');
        a.textContent = clean(ctaDiv.textContent);
        p.appendChild(a);
        bodyCell.appendChild(p);
      }

      // Skip empty cards (no image and no body content).
      if (!img && !bodyCell.childNodes.length) return;

      cells.push([imageCell, bodyCell]);
    });

    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }

    const block = WebImporter.Blocks.createBlock(document, { name: 'cards-contact', cells });
    element.replaceWith(block);
    return;
  }

  // --- Structure A: .col-xs-12.col-lg-4 tiles. ---
  let tiles = Array.from(element.querySelectorAll('.col-xs-12.col-lg-4'));
  if (tiles.length === 0 && element.matches('.col-xs-12.col-lg-4')) tiles = [element];

  tiles.forEach((tile) => {
    // Icon image (Scene7 URL). In some tiles it is wrapped in a link to /forms/...;
    // extract just the <img> so the image cell stays a single-picture cell.
    const img = tile.querySelector('.image img, .cmp-image img, img');
    const imageCell = document.createDocumentFragment();
    if (img) imageCell.appendChild(img);

    // Body cell: heading(s), bulleted list(s), then optional CTA.
    // Rich-text containers hold the h4 and ul (some tiles split these across two blocks).
    const bodyCell = document.createDocumentFragment();
    tile.querySelectorAll('.text .rich-text').forEach((richText) => {
      Array.from(richText.children).forEach((child) => {
        // Only carry meaningful content nodes (headings, lists, paragraphs).
        if (child.textContent && clean(child.textContent)) {
          bodyCell.appendChild(child);
        }
      });
    });

    // Optional green CTA button, appended as a linked paragraph at the bottom.
    const cta = tile.querySelector('.button a.btn-primary-green, .button a.btn-primary, .button a');
    if (cta) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', cta.getAttribute('href') || '#');
      a.textContent = clean(cta.textContent);
      p.appendChild(a);
      bodyCell.appendChild(p);
    }

    // Skip empty tiles (no image and no body content).
    if (!img && !bodyCell.childNodes.length) return;

    cells.push([imageCell, bodyCell]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-contact', cells });
  element.replaceWith(block);
}
