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

  // tools/importer/import-resources.js
  var import_resources_exports = {};
  __export(import_resources_exports, {
    default: () => import_resources_default
  });

  // tools/importer/parsers/cards-resource.js
  function parse(element, { document: document2 }) {
    let cards = Array.from(element.querySelectorAll(".card"));
    if (cards.length === 0) {
      cards = element.matches(".card") ? [element] : [element];
    }
    const cells = [];
    cards.forEach((card) => {
      const cardLink = card.querySelector("a[href]");
      const href = cardLink ? cardLink.getAttribute("href") : null;
      const img = card.querySelector(".image img, picture img, img");
      const imageCell = document2.createDocumentFragment();
      if (img) imageCell.appendChild(img);
      const title = card.querySelector(".text .title, .text p.h4, .text .h4");
      const bodyCell = document2.createDocumentFragment();
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
        bodyCell.appendChild(heading);
      } else if (href) {
        const a = document2.createElement("a");
        a.setAttribute("href", href);
        a.textContent = href;
        bodyCell.appendChild(a);
      }
      if (img || title || href) {
        cells.push([imageCell, bodyCell]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-resource", cells });
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

  // tools/importer/import-resources.js
  var parsers = {
    "cards-resource": parse
  };
  var PAGE_TEMPLATE = {
    name: "resources",
    description: "Grace Resources page: full-bleed dark-blue hero band with a single heading, then a 3-up promotional card grid (Catalagram, Insights, Newsroom).",
    urls: ["https://grace.com/resources/"],
    blocks: [
      {
        name: "cards-resource",
        // Single selector: the card-list container. A second, ancestor selector
        // (div.card-list:has(...)) would match a wrapping element and cause the
        // parser to run twice — the second run replaces the already-parsed block
        // with a degenerate single-card fallback. One selector = one parse.
        instances: [".cmp-card-list.grid.three-columns"]
      }
    ],
    sections: [
      {
        id: "section-1-hero",
        name: "Resources hero band",
        selector: ["div.generic-hero:has(.hero__heading)", "div.hero__section.dark-blue-bkgd"],
        style: "dark-blue",
        blocks: [],
        defaultContent: ["div.generic-hero .hero__heading"]
      },
      {
        id: "section-2-cards",
        name: "Resources promotional card grid",
        selector: ["div.section:has(.cmp-card-list.three-columns)"],
        style: null,
        blocks: ["cards-resource"],
        defaultContent: []
      }
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
  var import_resources_default = {
    transform: (payload) => {
      const {
        document: document2,
        url,
        html,
        params
      } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      document2.querySelectorAll("div.generic-hero .hero__heading").forEach((headingDiv) => {
        const text = headingDiv.textContent.trim();
        if (!text) {
          headingDiv.remove();
          return;
        }
        const h = document2.createElement("h1");
        h.textContent = text;
        headingDiv.replaceWith(h);
      });
      main.querySelectorAll(".hero__button").forEach((btn) => {
        if (!btn.textContent.trim() && !btn.querySelector("a")) btn.remove();
      });
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
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      main.querySelectorAll(":scope > div").forEach((div) => {
        if (!div.textContent.trim() && !div.querySelector("img, picture, a, hr, iframe")) {
          div.remove();
        }
      });
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const docPath = rawPath === "" ? "/index" : `${rawPath}/index`;
      const path = WebImporter.FileUtils.sanitizePath(docPath);
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
  return __toCommonJS(import_resources_exports);
})();
