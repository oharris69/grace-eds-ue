/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroFullbleedParser from './parsers/hero-fullbleed.js';
import cardsContactParser from './parsers/cards-contact.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/grace-cleanup.js';
import dmImagesTransformer from './transformers/grace-dm-images.js';
import sectionsTransformer from './transformers/grace-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-fullbleed': heroFullbleedParser,
  'cards-contact': cardsContactParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'vendor-suppliers',
  description: 'Grace Vendors and Suppliers page: full-bleed hero, intro statement, a light-gray section with two icon-card grids (Working with Grace; Supplier Support and FAQs), and a green Contact Us / S2P Navigator callout.',
  urls: ['https://grace.com/vendor-suppliers/'],
  blocks: [
    {
      name: 'hero-fullbleed',
      instances: ['div.generic-hero:has(.hero__heading) .hero__section', '.hero__section.background-image'],
    },
    {
      name: 'cards-contact',
      instances: ['.cmp-card-list.grid.three-columns:has(.card-group)', 'section#video-threefeature'],
    },
  ],
  sections: [
    {
      id: 'section-1-hero',
      name: 'Hero - Delivering Value',
      selector: ['div.generic-hero:has(.hero__heading) .hero__section', '.hero__section.background-image'],
      style: null,
      blocks: ['hero-fullbleed'],
      defaultContent: [],
    },
    {
      id: 'section-2-intro',
      name: 'Intro statement',
      selector: ['div.section:has(> .aem-Grid .text .rich-text h4)'],
      style: null,
      blocks: [],
      defaultContent: ['div.section .text:has(h4)'],
    },
    {
      id: 'section-3-working-and-support',
      name: 'Working with Grace + Supplier Support and FAQs',
      selector: ['section.light-gray-bkgd:has(.cmp-card-list)'],
      style: 'light-gray',
      blocks: ['cards-contact'],
      defaultContent: ['div.card-list .heading:has(h2)', '#text-35a108d354'],
    },
    {
      id: 'section-4-contact-callout',
      name: 'Contact Us / S2P Navigator callout',
      // After beforeTransform relocation the callout lives at the end of main
      // as .contactus__content-desktop.green-bkgd (still carrying its class).
      selector: ['.contactus__content-desktop.green-bkgd'],
      style: 'green',
      blocks: [],
      defaultContent: ['.contactus__content-desktop.green-bkgd'],
    },
  ],
};

// TRANSFORMER REGISTRY
// Order: cleanup → DM images → sections. Section transformer runs last so it
// operates on the cleaned, block-parsed DOM.
const transformers = [
  cleanupTransformer,
  dmImagesTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - The hook name ('beforeTransform' or 'afterTransform')
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - The payload containing { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      let elements = [];
      try {
        elements = document.querySelectorAll(selector);
      } catch (e) {
        console.warn(`Invalid selector for "${blockDef.name}": ${selector}`, e);
        return;
      }
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        if (seen.has(element)) return; // avoid double-parsing when multiple selectors match
        seen.add(element);
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // --- Relocate the green Contact Us callout to the end of main ---------
    // The callout is a .contact-us-sticky floating widget positioned early in
    // the DOM (right after the hero) but visually rendered last. It is also
    // duplicated as a desktop + mobile copy, and grace-cleanup strips
    // .contact-us-sticky wholesale. We must (a) keep it as authorable content,
    // (b) place it last so section order is correct, and (c) do this BEFORE the
    // cleanup transformer runs. So we handle it here, before executeTransformers.
    const desktopCallout = document.querySelector('.contactus__content-desktop.green-bkgd');
    if (desktopCallout) {
      // Convert the div-based heading to a real heading element.
      const headingDiv = desktopCallout.querySelector('.contactus__heading');
      if (headingDiv && headingDiv.textContent.trim()) {
        const h2 = document.createElement('h2');
        h2.textContent = headingDiv.textContent.trim();
        headingDiv.replaceWith(h2);
      }
      // Drop empty button placeholder divs, keep the real S2P Navigator button.
      desktopCallout.querySelectorAll('.contactus__buttons > div').forEach((div) => {
        if (!div.querySelector('a') && !div.textContent.trim()) div.remove();
      });
      // Detach from the sticky wrapper and re-append to the end of main so it
      // becomes the final section (and escapes the .contact-us-sticky removal).
      main.appendChild(desktopCallout);
    }
    // Remove the now-empty sticky wrappers and the mobile duplicate so cleanup
    // has nothing left to strip and no duplicate content remains.
    main.querySelectorAll('.contactus__content-mobile').forEach((el) => el.remove());
    main.querySelectorAll('.contact-us-sticky').forEach((el) => el.remove());

    // --- Recover lazy-loaded cmp-image icons ------------------------------
    // The "Supplier Support and FAQs" grid (section#video-threefeature) uses
    // Grace's cmp-image component, whose client-side lazy-loader swaps the real
    // Scene7 <img src> for an ephemeral blob: URL in the live DOM before the
    // importer captures it. Each cmp-image still carries a .cmp-image__link
    // anchor pointing at the underlying DAM asset (the .svg), so we restore the
    // icon src from that link. adjustImageUrls (step 5) then absolutizes it.
    main.querySelectorAll('.cmp-image').forEach((cmp) => {
      const img = cmp.querySelector('img.cmp-image__image, img');
      const link = cmp.querySelector('a.cmp-image__link');
      if (!img || !link) return;
      const src = img.getAttribute('src') || '';
      if (src.startsWith('blob:') || src.startsWith('data:') || !src) {
        const href = link.getAttribute('href');
        if (href) {
          img.setAttribute('src', href);
          img.removeAttribute('srcset');
        }
      }
    });

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // Remove any now-empty section wrappers so EDS doesn't render blank sections.
    main.querySelectorAll(':scope > div').forEach((div) => {
      if (!div.textContent.trim()
          && !div.querySelector('img, picture, a, hr, iframe')) {
        div.remove();
      }
    });

    // 6. Generate sanitized path. /vendor-suppliers/ → /vendor-suppliers/index
    //    (directory-style URL maps to an explicit index document, matching the
    //    other migrated top-level pages: /products/index, /about-grace/index, etc.).
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const docPath = rawPath === '' ? '/index' : `${rawPath}/index`;
    const path = WebImporter.FileUtils.sanitizePath(docPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
