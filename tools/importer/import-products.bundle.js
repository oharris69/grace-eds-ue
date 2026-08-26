/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-products.js
  var import_products_exports = {};
  __export(import_products_exports, {
    default: () => import_products_default
  });

  // tools/importer/parsers/hero-fullbleed.js
  function parse(element, { document: document2 }) {
    const image = element.querySelector("img");
    const heading = element.querySelector(".hero__heading h1, .hero__headings h1, h1, h2");
    const ctaLinks = Array.from(element.querySelectorAll(".hero__button a, .button__section a, a.btn-primary"));
    const eyebrow = element.querySelector('.patent-number, .hero__eyebrow, [class*="eyebrow"]');
    if (!image && !heading && ctaLinks.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (image) {
      const imageFrag = document2.createDocumentFragment();
      imageFrag.appendChild(document2.createComment(" field:image "));
      imageFrag.appendChild(image);
      cells.push([imageFrag]);
    }
    const textFrag = document2.createDocumentFragment();
    textFrag.appendChild(document2.createComment(" field:text "));
    if (eyebrow) {
      const eyebrowText = eyebrow.textContent.trim();
      if (eyebrowText) {
        const p = document2.createElement("p");
        p.textContent = eyebrowText;
        textFrag.appendChild(p);
      }
    }
    if (heading) textFrag.appendChild(heading);
    ctaLinks.forEach((cta) => textFrag.appendChild(cta));
    cells.push([textFrag]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-fullbleed", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-product.js
  function parse2(element, { document: document2 }) {
    let cards = Array.from(element.querySelectorAll(".card"));
    if (cards.length === 0) {
      cards = element.matches(".card") ? [element] : [element];
    }
    const cells = [];
    cards.forEach((card) => {
      const cardLink = card.querySelector("a[href]");
      const href = cardLink ? cardLink.getAttribute("href") : null;
      const img = card.querySelector(".image img, img");
      const imageCell = document2.createDocumentFragment();
      if (img) {
        imageCell.appendChild(document2.createComment(" field:image "));
        imageCell.appendChild(img);
      }
      const eyebrow = card.querySelector(".text > p.h5, .text p:first-child");
      const title = card.querySelector(".text .title, .text p.h4, .text .h4");
      const caption = card.querySelector(".text .spt-copy, .text .h6");
      const textCell = document2.createDocumentFragment();
      textCell.appendChild(document2.createComment(" field:text "));
      if (eyebrow && eyebrow !== title) {
        const p = document2.createElement("p");
        p.textContent = eyebrow.textContent.trim();
        textCell.appendChild(p);
      }
      if (title) {
        const heading = document2.createElement("h3");
        const titleText = title.textContent.trim();
        if (href) {
          const a = document2.createElement("a");
          a.setAttribute("href", href);
          a.textContent = titleText;
          heading.appendChild(a);
        } else {
          heading.textContent = titleText;
        }
        textCell.appendChild(heading);
      }
      if (caption) {
        const p = document2.createElement("p");
        p.textContent = caption.textContent.trim();
        textCell.appendChild(p);
      }
      cells.push([imageCell, textCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-insights.js
  function parse3(element, { document: document2 }) {
    let cards = Array.from(element.querySelectorAll(".single-media.image.row, .right-media.image.row"));
    if (cards.length === 0) {
      cards = Array.from(element.querySelectorAll('article:has(h5):has(a[href*="/insights/"])'));
    }
    if (cards.length === 0) cards = [element];
    const cells = [];
    cards.forEach((card) => {
      const img = card.querySelector(".media img, .image img, img");
      const imageCell = document2.createDocumentFragment();
      if (img) {
        imageCell.appendChild(document2.createComment(" field:image "));
        imageCell.appendChild(img);
      }
      const eyebrow = card.querySelector("h5");
      const links = Array.from(card.querySelectorAll("a[href]"));
      const titleLink = links[0];
      const extraLinks = links.slice(1);
      const textCell = document2.createDocumentFragment();
      textCell.appendChild(document2.createComment(" field:text "));
      if (eyebrow) {
        const p = document2.createElement("p");
        p.textContent = eyebrow.textContent.replace(/\s+/g, " ").trim();
        textCell.appendChild(p);
      }
      if (titleLink) {
        const heading = document2.createElement("h3");
        const a = document2.createElement("a");
        a.setAttribute("href", titleLink.getAttribute("href"));
        a.textContent = titleLink.textContent.replace(/\s+/g, " ").trim();
        heading.appendChild(a);
        textCell.appendChild(heading);
      }
      extraLinks.forEach((link) => {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.setAttribute("href", link.getAttribute("href"));
        a.textContent = link.textContent.replace(/\s+/g, " ").trim();
        p.appendChild(a);
        textCell.appendChild(p);
      });
      cells.push([imageCell, textCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-insights", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/grace-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "#onetrust-banner-sdk",
        ".grecaptcha-badge",
        "#destination_publishing_iframe_grace_0"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".experiencefragment",
        "header",
        "footer",
        ".contact-us-sticky",
        ".search-bar-cmp",
        // Breadcrumb navigation (present on interior pages like /products/) and the
        // skip-to-main-content link — navigation chrome, not authorable content.
        ".breadcrumb",
        'a[href="#main-content"]'
      ]);
      WebImporter.DOMUtils.remove(element, [
        "link",
        "iframe",
        "video",
        "noscript",
        "script",
        "style"
      ]);
      element.querySelectorAll("[data-cmp-data-layer]").forEach((el) => {
        el.removeAttribute("data-cmp-data-layer");
      });
    }
  }

  // tools/importer/transformers/grace-dm-images.js
  function detectDynamicMediaUrl(urlStr) {
    let u;
    try {
      u = new URL(urlStr, "https://x/");
    } catch (e) {
      return false;
    }
    if (u.pathname.startsWith("/is/image/")) {
      return "scene7";
    }
    if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname) && u.pathname.startsWith("/adobe/assets/urn:")) {
      return "dm-openapi";
    }
    return false;
  }
  var LINKED_DM_INLINE_WRAPPER_TAGS = /* @__PURE__ */ new Set(["PICTURE"]);
  var LINKED_DM_WRAPPER_SIBLING_TAGS = /* @__PURE__ */ new Set(["SOURCE"]);
  function findLinkedDmCarrier(img) {
    if (!img || !img.parentElement) return null;
    let node = img;
    let parent = img.parentElement;
    while (parent && LINKED_DM_INLINE_WRAPPER_TAGS.has(parent.tagName)) {
      let foundNode = false;
      for (const child of parent.children) {
        if (child === node) {
          foundNode = true;
        } else if (!LINKED_DM_WRAPPER_SIBLING_TAGS.has(child.tagName)) {
          return null;
        }
      }
      if (!foundNode) return null;
      node = parent;
      parent = parent.parentElement;
    }
    if (!parent || parent.tagName !== "A") return null;
    if (parent.children.length !== 1 || parent.children[0] !== node) return null;
    if (parent.textContent.trim() !== "") return null;
    return parent;
  }
  var EMPTY_ALT_SENTINEL = "Image without alt text";
  function altToLinkText(alt) {
    return alt || EMPTY_ALT_SENTINEL;
  }
  function transform2(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const doc = element.ownerDocument;
    element.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (!detectDynamicMediaUrl(src)) return;
      const alt = img.getAttribute("alt") || "";
      const linkedAnchor = findLinkedDmCarrier(img);
      if (linkedAnchor) {
        linkedAnchor.setAttribute("title", src);
        linkedAnchor.textContent = altToLinkText(alt);
        return;
      }
      const parent = img.parentElement;
      if (parent && parent.tagName === "A") {
        console.warn("DM image inside mixed-content anchor, skipped:", src);
        return;
      }
      const a = doc.createElement("a");
      a.href = src;
      a.textContent = altToLinkText(alt);
      img.replaceWith(a);
    });
  }

  // tools/importer/transformers/grace-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function resolveSection(element, selector) {
    const candidates = Array.isArray(selector) ? selector : [selector];
    for (const candidate of candidates) {
      if (!candidate) continue;
      const el = element.querySelector(candidate);
      if (el) return el;
    }
    return null;
  }
  function transform3(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = resolveSection(element, section.selector);
        if (!sectionEl) continue;
        const hr = element.ownerDocument.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || resolveSection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-products.js
  var parsers = {
    "hero-fullbleed": parse,
    "cards-product": parse2,
    "cards-insights": parse3
  };
  var PAGE_TEMPLATE = {
    name: "products",
    description: "Grace products landing page: full-bleed hero, 2x2 product card grid, product stewardship intro (default content), and latest insights blog card row.",
    urls: ["https://grace.com/products/"],
    blocks: [
      { name: "hero-fullbleed", instances: ["div.generic-hero:has(h1)", ".generic-hero"] },
      { name: "cards-product", instances: ['div.section:has(> section article div.col-xs-12.col-lg-6 > div.card a[href*="/products/"])'] },
      { name: "cards-insights", instances: ["div.feature-blog:has(.blog-content)", "div.section:has(.feature-blog)"] }
    ],
    sections: [
      { id: "section-1-hero", name: "Hero", selector: ["div.generic-hero:has(h1)"], style: null, blocks: ["hero-fullbleed"], defaultContent: [] },
      { id: "section-2-products", name: "Products card grid", selector: ['div.section:has(div.col-xs-12.col-lg-6 > div.card a[href*="/products/"])'], style: null, blocks: ["cards-product"], defaultContent: [] },
      { id: "section-3-intro", name: "Product Stewardship intro", selector: ["div.section:has(> section .rich-text)"], style: null, blocks: [], defaultContent: ["div.section:has(> section .rich-text) h2", "div.section:has(> section .rich-text) p"] },
      { id: "section-4-insights", name: "Latest Insights from Grace", selector: ["div.section:has(.feature-blog)"], style: null, blocks: ["cards-insights"], defaultContent: ["div.section:has(.feature-blog) h2", "div.section:has(.feature-blog) .header a"] }
    ]
  };
  var transformers = [
    transform,
    transform2,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform3] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        let elements = [];
        try {
          elements = document2.querySelectorAll(selector);
        } catch (e) {
          console.warn(`Invalid selector for "${blockDef.name}": ${selector}`, e);
          return;
        }
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_products_default = {
    transform: (payload) => {
      const {
        document: document2,
        url,
        html,
        params
      } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      main.querySelectorAll('img[alt=""], img:not([alt])').forEach((img) => {
        const src = img.getAttribute("src") || "";
        if (/hero\/(home|products)\//i.test(src) || /\/(Feature-BG|Feature-BG-light|hero-bg)/i.test(src)) {
          const carrier = img.closest("p") || img;
          carrier.remove();
        }
      });
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      main.querySelectorAll(":scope > div").forEach((div) => {
        if (!div.textContent.trim() && !div.querySelector("img, picture, a, hr, iframe")) {
          div.remove();
        }
      });
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_products_exports);
})();
