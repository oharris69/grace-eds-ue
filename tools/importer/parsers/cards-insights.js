/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-insights. Base: cards (container). Source: https://grace.com/
 * Child model "card" fields: image (reference), imageAlt (collapsed → img alt), text (richtext).
 * Each blog card = one row with 2 cells: [image] [text]. Text = category eyebrow (h5) +
 * linked title + "Read more" link. Links point to /insights/*.
 */
export default function parse(element, { document }) {
  // Two source structures resolve to this block:
  //  (a) homepage insights: media-callout rows (.single-media.image.row / .right-media.image.row)
  //  (b) products "Latest Insights" feature-blog: a.item.isNormalCard cards with
  //      .image img + .blog-content > p.tag / p.blog-heading / p.read-more
  const featureCards = Array.from(element.querySelectorAll('a.item, a.isNormalCard'));
  const isFeatureBlog = featureCards.length > 0;

  let cards = featureCards;
  if (!isFeatureBlog) {
    cards = Array.from(element.querySelectorAll('.single-media.image.row, .right-media.image.row'));
    if (cards.length === 0) {
      // Fallbacks: treat element as a single card, or find card-like descendants.
      cards = Array.from(element.querySelectorAll('article:has(h5):has(a[href*="/insights/"])'));
    }
    if (cards.length === 0) cards = [element];
  }

  const cells = [];

  cards.forEach((card) => {
    // Image cell.
    const img = card.querySelector('.media img, .image img, img');
    const imageCell = document.createDocumentFragment();
    if (img) {
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(img);
    }

    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));

    if (isFeatureBlog) {
      // feature-blog card: whole card is the article link; text pieces are classed.
      const cardHref = card.getAttribute('href');
      const tag = card.querySelector('.tag');
      const heading = card.querySelector('.blog-heading');
      const readMore = card.querySelector('.read-more');

      if (tag) {
        const p = document.createElement('p');
        p.textContent = tag.textContent.replace(/\s+/g, ' ').trim();
        textCell.appendChild(p);
      }
      if (heading) {
        const h3 = document.createElement('h3');
        const a = document.createElement('a');
        a.setAttribute('href', cardHref);
        a.textContent = heading.textContent.replace(/\s+/g, ' ').trim();
        h3.appendChild(a);
        textCell.appendChild(h3);
      }
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', cardHref);
      a.textContent = (readMore ? readMore.textContent : 'Read more').replace(/\s+/g, ' ').trim();
      p.appendChild(a);
      textCell.appendChild(p);

      cells.push([imageCell, textCell]);
      return;
    }

    // Media-callout structure (homepage): eyebrow (h5), linked title, "Read more" link.
    const eyebrow = card.querySelector('h5');
    const links = Array.from(card.querySelectorAll('a[href]'));
    const titleLink = links[0];
    const extraLinks = links.slice(1);

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
