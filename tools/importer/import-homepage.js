/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroFullbleedParser from './parsers/hero-fullbleed.js';
import cardsProductParser from './parsers/cards-product.js';
import columnsFeatureParser from './parsers/columns-feature.js';
import cardsIndustryParser from './parsers/cards-industry.js';
import columnsVideoParser from './parsers/columns-video.js';
import cardsInsightsParser from './parsers/cards-insights.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/grace-cleanup.js';
import dmImagesTransformer from './transformers/grace-dm-images.js';
import sectionsTransformer from './transformers/grace-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-fullbleed': heroFullbleedParser,
  'cards-product': cardsProductParser,
  'columns-feature': columnsFeatureParser,
  'cards-industry': cardsIndustryParser,
  'columns-video': columnsVideoParser,
  'cards-insights': cardsInsightsParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Grace corporate homepage: header/nav experience fragment, hero with heading + CTA, intro paragraph link, products card grid, life-at-grace two-column feature, industries card grid, we-are-grace video callout, insights/blogs card grid, footer experience fragment.',
  urls: ['https://grace.com/'],
  blocks: [
    { name: 'hero-fullbleed', instances: ['.generic-hero', '.hero__section'] },
    { name: 'cards-product', instances: ['div.row:has(> div.col-xs-12.col-lg-3 > div.card a[href*="/products/"])'] },
    { name: 'columns-feature', instances: ['div.row:has(> div.col-xs-12.col-lg-6 a[href*="/life-at-grace/"])'] },
    { name: 'cards-industry', instances: ['div.card-list:has(a[href*="/industries/"])'] },
    { name: 'columns-video', instances: ['div.cmp-media-callout.slate-bkgd.white'] },
    { name: 'cards-insights', instances: ['#blogs div.row:has(> div.col-xs-12.col-lg-6 .single-media.image.row)'] },
  ],
  sections: [
    { id: 'section-1-hero', name: 'Hero', selector: ['#main-content > div.hero__content', '.generic-hero'], style: null, blocks: ['hero-fullbleed'], defaultContent: [] },
    { id: 'section-2-intro', name: 'Intro statement', selector: ['div.section:has(.card-group a[href*="/about-grace/this-is-grace/"])', 'div.section.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(3)'], style: 'light-gray', blocks: [], defaultContent: ['div.section:has(.card-group a[href*="/about-grace/this-is-grace/"]) p', 'div.section:has(.card-group a[href*="/about-grace/this-is-grace/"]) a'] },
    { id: 'section-3-products', name: 'Products grid', selector: ['div.section:has(div.col-xs-12.col-lg-3 > div.card a[href*="/products/"])', 'div.section.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(4)'], style: null, blocks: ['cards-product'], defaultContent: ['div.section:has(div.col-xs-12.col-lg-3 > div.card a[href*="/products/"]) h2'] },
    { id: 'section-4-life', name: 'Life at Grace feature', selector: ['div.section:has(> div div.col-xs-12.col-lg-6 a[href*="/life-at-grace/"])', 'div.section.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(5)'], style: null, blocks: ['columns-feature'], defaultContent: [] },
    { id: 'section-5-industries', name: 'Industries grid', selector: ['div.section:has(.card-list a[href*="/industries/"])', 'div.section.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(6)'], style: null, blocks: ['cards-industry'], defaultContent: ['div.section:has(.card-list a[href*="/industries/"]) h3', 'div.section:has(.card-list a[href*="/industries/"]) .button a'] },
    { id: 'section-6-video', name: 'We Are Grace video callout', selector: ['div.section:has(.cmp-media-callout.slate-bkgd)', 'div.section.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(7)'], style: 'dark-slate', blocks: ['columns-video'], defaultContent: [] },
    { id: 'section-7-insights', name: 'Insights from Grace', selector: ['#blogs'], style: 'light-gray', blocks: ['cards-insights'], defaultContent: ['#blogs h2', '#blogs .button a'] },
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
    // transformBackgroundImages. The hero and the industries section carry a
    // CSS `background-image` (source class `.background-image`); those photos
    // are section decoration, not authorable content — the hero block supplies
    // its own background and the industries grid sits on a plain light section.
    // They have empty alt and live at known decorative asset paths. Removing
    // them eliminates the empty hero-bg section and the oversized light blob
    // above the industries grid.
    main.querySelectorAll('img[alt=""], img:not([alt])').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (/\/(Industry-Feature-BG|Industry-Feature-BG-light)/i.test(src)
          || /hero\/home\/homepage-/i.test(src)) {
        const carrier = img.closest('p') || img;
        carrier.remove();
      }
    });

    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // Remove any now-empty section wrappers (e.g. a section whose only content
    // was a decorative background image removed above), so EDS doesn't render a
    // blank section with stray vertical whitespace. Only drop truly empty
    // direct children of main — never anything carrying text or media.
    main.querySelectorAll(':scope > div').forEach((div) => {
      if (!div.textContent.trim()
          && !div.querySelector('img, picture, a, hr, iframe')) {
        div.remove();
      }
    });

    // 6. Generate sanitized path; map the root/homepage URL to `/index`.
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
