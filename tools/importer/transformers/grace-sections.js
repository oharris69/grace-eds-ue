/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Grace (grace.com) section breaks + Section Metadata.
 *
 * Driven by payload.template.sections (from tools/importer/page-templates.json).
 * The homepage template has 7 sections. Section boundary selectors were
 * DOM-verified by page analysis and are used directly; each `selector` is an
 * ARRAY of candidate selectors, so we resolve to the first candidate that
 * matches on this page.
 *
 * Styled sections (get a Section Metadata block):
 *   section-2-intro    -> light-gray
 *   section-6-video    -> dark-slate
 *   section-7-insights -> light-gray
 *
 * Breaks (<hr>) are inserted before every non-first section (6 total).
 *
 * Why both hooks: block parsers run between beforeTransform and afterTransform
 * and replace the exact elements their selectors match, so a section boundary
 * that wraps a single block no longer exists in afterTransform. We insert the
 * <hr> breaks in beforeTransform (while every section element still exists),
 * tagging the styled sections' <hr> with a marker attribute, then anchor the
 * Section Metadata blocks to that surviving marker in afterTransform.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

// Section selectors in page-templates.json are arrays of candidate selectors.
// Return the first candidate that matches under `element`.
function resolveSection(element, selector) {
  const candidates = Array.isArray(selector) ? selector : [selector];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const el = element.querySelector(candidate);
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    // Insert breaks now, before parsers can replace any section element.
    // Reverse order: inserting relative to a live element only affects nodes
    // after it, so walking backwards keeps every not-yet-processed section
    // exactly where querySelector found it.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      // First section: no leading break and (here) no style, so skip entirely.
      if (i === 0 && !section.style) continue;

      const sectionEl = resolveSection(element, section.selector);
      if (!sectionEl) continue; // no candidate matched on this page — skip, never guess

      const hr = element.ownerDocument.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Parsers have now run and may have replaced section elements. Anchor each
    // styled section's Section Metadata block to whichever still exists: the
    // marker <hr> placed above, or (fallback) the original element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || resolveSection(element, section.selector);
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // first section never gets a real leading break
      }
    }
  }
}
