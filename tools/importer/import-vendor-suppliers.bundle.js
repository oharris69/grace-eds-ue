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

  // tools/importer/import-vendor-suppliers.js
  var import_vendor_suppliers_exports = {};
  __export(import_vendor_suppliers_exports, {
    default: () => import_vendor_suppliers_default
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

  // tools/importer/parsers/cards-contact.js
  function parse2(element, { document: document2 }) {
    const clean = (text) => (text || "").replace(/ /g, " ").trim();
    const cells = [];
    const cardLinks = Array.from(element.querySelectorAll(".card-group .card"));
    if (cardLinks.length > 0) {
      cardLinks.forEach((card) => {
        const img = card.querySelector(".card-content .image img, .image img, img");
        const imageCell = document2.createDocumentFragment();
        if (img) imageCell.appendChild(img);
        const bodyCell = document2.createDocumentFragment();
        const title = card.querySelector("p.h4.title, p.h4");
        if (title && clean(title.textContent)) {
          const h4 = document2.createElement("h4");
          h4.textContent = clean(title.textContent);
          bodyCell.appendChild(h4);
        }
        const list = card.querySelector(".h6 ul, ul");
        if (list) bodyCell.appendChild(list);
        const cardLink = card.querySelector("a.cmp-card[href], a[href]");
        const ctaDiv = card.querySelector(".cta");
        if (cardLink && ctaDiv && clean(ctaDiv.textContent)) {
          const p = document2.createElement("p");
          const a = document2.createElement("a");
          a.setAttribute("href", cardLink.getAttribute("href") || "#");
          a.textContent = clean(ctaDiv.textContent);
          p.appendChild(a);
          bodyCell.appendChild(p);
        }
        if (!img && !bodyCell.childNodes.length) return;
        cells.push([imageCell, bodyCell]);
      });
      if (cells.length === 0) {
        element.replaceWith(...element.childNodes);
        return;
      }
      const block2 = WebImporter.Blocks.createBlock(document2, { name: "cards-contact", cells });
      element.replaceWith(block2);
      return;
    }
    let tiles = Array.from(element.querySelectorAll(".col-xs-12.col-lg-4"));
    if (tiles.length === 0 && element.matches(".col-xs-12.col-lg-4")) tiles = [element];
    tiles.forEach((tile) => {
      const img = tile.querySelector(".image img, .cmp-image img, img");
      const imageCell = document2.createDocumentFragment();
      if (img) imageCell.appendChild(img);
      const bodyCell = document2.createDocumentFragment();
      tile.querySelectorAll(".text .rich-text").forEach((richText) => {
        Array.from(richText.children).forEach((child) => {
          if (child.textContent && clean(child.textContent)) {
            bodyCell.appendChild(child);
          }
        });
      });
      const cta = tile.querySelector(".button a.btn-primary-green, .button a.btn-primary, .button a");
      if (cta) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.setAttribute("href", cta.getAttribute("href") || "#");
        a.textContent = clean(cta.textContent);
        p.appendChild(a);
        bodyCell.appendChild(p);
      }
      if (!img && !bodyCell.childNodes.length) return;
      cells.push([imageCell, bodyCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-contact", cells });
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

  // tools/importer/import-vendor-suppliers.js
  var parsers = {
    "hero-fullbleed": parse,
    "cards-contact": parse2
  };
  var PAGE_TEMPLATE = {
    name: "vendor-suppliers",
    description: "Grace Vendors and Suppliers page: full-bleed hero, intro statement, a light-gray section with two icon-card grids (Working with Grace; Supplier Support and FAQs), and a green Contact Us / S2P Navigator callout.",
    urls: ["https://grace.com/vendor-suppliers/"],
    blocks: [
      {
        name: "hero-fullbleed",
        instances: ["div.generic-hero:has(.hero__heading) .hero__section", ".hero__section.background-image"]
      },
      {
        name: "cards-contact",
        instances: [".cmp-card-list.grid.three-columns:has(.card-group)", "section#video-threefeature"]
      }
    ],
    sections: [
      {
        id: "section-1-hero",
        name: "Hero - Delivering Value",
        selector: ["div.generic-hero:has(.hero__heading) .hero__section", ".hero__section.background-image"],
        style: null,
        blocks: ["hero-fullbleed"],
        defaultContent: []
      },
      {
        id: "section-2-intro",
        name: "Intro statement",
        selector: ["div.section:has(> .aem-Grid .text .rich-text h4)"],
        style: null,
        blocks: [],
        defaultContent: ["div.section .text:has(h4)"]
      },
      {
        id: "section-3-working-and-support",
        name: "Working with Grace + Supplier Support and FAQs",
        selector: ["section.light-gray-bkgd:has(.cmp-card-list)"],
        style: "light-gray",
        blocks: ["cards-contact"],
        defaultContent: ["div.card-list .heading:has(h2)", "#text-35a108d354"]
      },
      {
        id: "section-4-contact-callout",
        name: "Contact Us / S2P Navigator callout",
        // After beforeTransform relocation the callout lives at the end of main
        // as .contactus__content-desktop.green-bkgd (still carrying its class).
        selector: [".contactus__content-desktop.green-bkgd"],
        style: "green",
        blocks: [],
        defaultContent: [".contactus__content-desktop.green-bkgd"]
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
  var import_vendor_suppliers_default = {
    transform: (payload) => {
      const {
        document: document2,
        url,
        html,
        params
      } = payload;
      const main = document2.body;
      const desktopCallout = document2.querySelector(".contactus__content-desktop.green-bkgd");
      if (desktopCallout) {
        const headingDiv = desktopCallout.querySelector(".contactus__heading");
        if (headingDiv && headingDiv.textContent.trim()) {
          const h2 = document2.createElement("h2");
          h2.textContent = headingDiv.textContent.trim();
          headingDiv.replaceWith(h2);
        }
        desktopCallout.querySelectorAll(".contactus__buttons > div").forEach((div) => {
          if (!div.querySelector("a") && !div.textContent.trim()) div.remove();
        });
        main.appendChild(desktopCallout);
      }
      main.querySelectorAll(".contactus__content-mobile").forEach((el) => el.remove());
      main.querySelectorAll(".contact-us-sticky").forEach((el) => el.remove());
      main.querySelectorAll(".cmp-image").forEach((cmp) => {
        const img = cmp.querySelector("img.cmp-image__image, img");
        const link = cmp.querySelector("a.cmp-image__link");
        if (!img || !link) return;
        const src = img.getAttribute("src") || "";
        if (src.startsWith("blob:") || src.startsWith("data:") || !src) {
          const href = link.getAttribute("href");
          if (href) {
            img.setAttribute("src", href);
            img.removeAttribute("srcset");
          }
        }
      });
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
  return __toCommonJS(import_vendor_suppliers_exports);
})();
