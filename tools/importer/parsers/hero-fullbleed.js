/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-fullbleed. Base: hero. Source: https://grace.com/
 * Model fields: image (reference), imageAlt (collapsed → img alt), text (richtext).
 * Structure (1 column, up to 3 rows): [name] / [image] / [text: heading + CTA].
 */
export default function parse(element, { document }) {
  // Background image (full-bleed photo). Source uses a top-level <img> inside .hero__section.
  const image = element.querySelector('img');

  // Heading and CTA live inside the hero content area.
  const heading = element.querySelector('.hero__heading h1, .hero__headings h1, h1, h2');
  const ctaLinks = Array.from(element.querySelectorAll('.hero__button a, .button__section a, a.btn-primary'));
  // Optional eyebrow / supporting line (e.g. patent number) shown above/near the heading.
  const eyebrow = element.querySelector('.patent-number, .hero__eyebrow, [class*="eyebrow"]');

  // Empty-block guard: bail gracefully if nothing meaningful was found.
  if (!image && !heading && ctaLinks.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: image cell with field hint (imageAlt collapses into the img alt attribute).
  if (image) {
    const imageFrag = document.createDocumentFragment();
    imageFrag.appendChild(document.createComment(' field:image '));
    imageFrag.appendChild(image);
    cells.push([imageFrag]);
  }

  // Row 3: text cell (heading + CTA) with field hint. richtext field.
  const textFrag = document.createDocumentFragment();
  textFrag.appendChild(document.createComment(' field:text '));
  if (eyebrow) {
    const eyebrowText = eyebrow.textContent.trim();
    if (eyebrowText) {
      const p = document.createElement('p');
      p.textContent = eyebrowText;
      textFrag.appendChild(p);
    }
  }
  if (heading) textFrag.appendChild(heading);
  ctaLinks.forEach((cta) => textFrag.appendChild(cta));
  cells.push([textFrag]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-fullbleed', cells });
  element.replaceWith(block);
}
