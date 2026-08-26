/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroFullbleedParser from './parsers/hero-fullbleed.js';
import cardsProductParser from './parsers/cards-product.js';
import cardsInsightsParser from './parsers/cards-insights.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/grace-cleanup.js';
import dmImagesTransformer from './transformers/grace-dm-images.js';
import sectionsTransformer from './transformers/grace-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-fullbleed': heroFullbleedParser,
  'cards-product': cardsProductParser,
  'cards-insights': cardsInsightsParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'products',
  description: 'Grace products landing page: full-bleed hero, 2x2 product card grid, product stewardship intro (default content), and latest insights blog card row.',
  urls: ['https://grace.com/products/'],
  blocks: [
    { name: 'hero-fullbleed', instances: ['div.generic-hero:has(h1)', '.generic-hero'] },
    { name: 'cards-product', instances: ['div.section:has(> section article div.col-xs-12.col-lg-6 > div.card a[href*="/products/"])'] },
    { name: 'cards-insights', instances: ['div.feature-blog:has(.blog-content)', 'div.section:has(.feature-blog)'] },
  ],
  sections: [
    { id: 'section-1-hero', name: 'Hero', selector: ['div.generic-hero:has(h1)'], style: null, blocks: ['hero-fullbleed'], defaultContent: [] },
    { id: 'section-2-products', name: 'Products card grid', selector: ['div.section:has(div.col-xs-12.col-lg-6 > div.card a[href*="/products/"])'], style: null, blocks: ['cards-product'], defaultContent: [] },
    { id: 'section-3-intro', name: 'Product Stewardship intro', selector: ['div.section:has(> section .rich-text)'], style: null, blocks: [], defaultContent: ['div.section:has(> section .rich-text) h2', 'div.section:has(> section .rich-text) p'] },
    { id: 'section-4-insights', name: 'Latest Insights from Grace', selector: ['div.section:has(.feature-blog)'], style: null, blocks: ['cards-insights'], defaultContent: ['div.section:has(.feature-blog) h2', 'div.section:has(.feature-blog) .header a'] },
  ],
};

// TRANSFORMER REGISTRY
// Order: cleanup (strip chrome) → DM images (convert Scene7 <img> to carrier anchors)
// → sections (insert <hr> breaks + section metadata). Section transformer runs last
// so it operates on the cleaned, block-parsed DOM.
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

    // Drop decorative section-background images surfaced by
    // transformBackgroundImages (hero bg photos carried as CSS background on
    // `.background-image` / `.generic-hero`). The hero block supplies its own
    // background; these have empty alt and live at known decorative paths.
    main.querySelectorAll('img[alt=""], img:not([alt])').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (/hero\/(home|products)\//i.test(src)
          || /\/(Feature-BG|Feature-BG-light|hero-bg)/i.test(src)) {
        const carrier = img.closest('p') || img;
        carrier.remove();
      }
    });

    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // Remove any now-empty section wrappers so EDS doesn't render a blank
    // section with stray vertical whitespace. Only drop truly empty direct
    // children of main — never anything carrying text or media.
    main.querySelectorAll(':scope > div').forEach((div) => {
      if (!div.textContent.trim()
          && !div.querySelector('img, picture, a, hr, iframe')) {
        div.remove();
      }
    });

    // 6. Generate sanitized path. Products page lives at /products/ → /products/index.
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

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
