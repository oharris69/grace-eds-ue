/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsResourceParser from './parsers/cards-resource.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/grace-cleanup.js';
import dmImagesTransformer from './transformers/grace-dm-images.js';
import sectionsTransformer from './transformers/grace-sections.js';

// PARSER REGISTRY
const parsers = {
  'cards-resource': cardsResourceParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'resources',
  description: 'Grace Resources page: full-bleed dark-blue hero band with a single heading, then a 3-up promotional card grid (Catalagram, Insights, Newsroom).',
  urls: ['https://grace.com/resources/'],
  blocks: [
    {
      name: 'cards-resource',
      // Single selector: the card-list container. A second, ancestor selector
      // (div.card-list:has(...)) would match a wrapping element and cause the
      // parser to run twice — the second run replaces the already-parsed block
      // with a degenerate single-card fallback. One selector = one parse.
      instances: ['.cmp-card-list.grid.three-columns'],
    },
  ],
  sections: [
    {
      id: 'section-1-hero',
      name: 'Resources hero band',
      selector: ['div.generic-hero:has(.hero__heading)', 'div.hero__section.dark-blue-bkgd'],
      style: 'dark-blue',
      blocks: [],
      defaultContent: ['div.generic-hero .hero__heading'],
    },
    {
      id: 'section-2-cards',
      name: 'Resources promotional card grid',
      selector: ['div.section:has(.cmp-card-list.three-columns)'],
      style: null,
      blocks: ['cards-resource'],
      defaultContent: [],
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

    // Promote the hero band heading to a real heading element. The source hero
    // renders the page title as <div class="hero__heading h2"><p>Resources</p></div>,
    // i.e. a styled paragraph rather than an <h1>. Left as-is it would import as
    // body text; convert it to a proper page heading so the dark-blue section
    // reads as a titled band. The div carries an hN class (e.g. "h2") indicating
    // the intended level; we use <h1> as this is the primary page heading.
    document.querySelectorAll('div.generic-hero .hero__heading').forEach((headingDiv) => {
      const text = headingDiv.textContent.trim();
      if (!text) {
        headingDiv.remove();
        return;
      }
      const h = document.createElement('h1');
      h.textContent = text;
      headingDiv.replaceWith(h);
    });

    // Remove the empty hero button shell (no CTA on this page) so it doesn't
    // leave a stray empty element in the section.
    main.querySelectorAll('.hero__button').forEach((btn) => {
      if (!btn.textContent.trim() && !btn.querySelector('a')) btn.remove();
    });

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

    // 6. Generate sanitized path. Resources lives at /resources/ → /resources/index
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
