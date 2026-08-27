/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsContactParser from './parsers/cards-contact.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/grace-cleanup.js';
import dmImagesTransformer from './transformers/grace-dm-images.js';
import sectionsTransformer from './transformers/grace-sections.js';

// PARSER REGISTRY
const parsers = {
  'cards-contact': cardsContactParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'contact-us',
  description: 'Grace Contact Us page: single light-gray section with a centered heading and a 3-up grid of contact tiles (icon + heading + bulleted list + optional green CTA).',
  urls: ['https://grace.com/contact-us/'],
  blocks: [
    {
      name: 'cards-contact',
      instances: [
        'section.none-bkgd:has(.col-xs-12.col-lg-4 .btn-primary-green)',
        'section.none-bkgd:has(.col-xs-12.col-lg-4)',
      ],
    },
  ],
  sections: [
    {
      id: 'section-1-help',
      name: 'How can we help you? contact tiles',
      selector: ['section.light-gray-bkgd:has(.col-xs-12.col-lg-4)'],
      style: 'light-gray',
      blocks: ['cards-contact'],
      defaultContent: ['div.text:has(h2)'],
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

    // 6. Generate sanitized path. Contact Us lives at /contact-us/ → /contact-us/index
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
