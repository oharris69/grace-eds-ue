/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Grace (grace.com) site-wide cleanup.
 * All selectors verified against migration-work/cleaned.html.
 *
 * Removes non-authorable site chrome so the import contains only page-level
 * authorable content. Header and footer are AEM experience fragments
 * (div.experiencefragment > .cmp-experiencefragment--header / --footer) and
 * are auto-populated on the EDS side, so they are stripped here.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Overlays / consent widgets that could interfere with block parsing.
    // Verified in cleaned.html:
    //   #onetrust-consent-sdk (line 1005), #onetrust-banner-sdk (line 1236),
    //   .grecaptcha-badge (line 992),
    //   #destination_publishing_iframe_grace_0 (Adobe demdex sync, line 988)
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#onetrust-banner-sdk',
      '.grecaptcha-badge',
      '#destination_publishing_iframe_grace_0',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome (verified in cleaned.html):
    //   div.experiencefragment wraps both the header fragment
    //     (.cmp-experiencefragment--header, line 6) and the footer fragment
    //     (.cmp-experiencefragment--footer, line 926) — both excluded.
    //   header#header (line 13) and footer (line 930) — belt-and-suspenders
    //     in case a fragment wrapper class changes.
    //   .contact-us-sticky (line 228) — empty sticky-CTA shell, clientlib only.
    //   .search-bar-cmp (line 110) — site search UI (part of header chrome).
    WebImporter.DOMUtils.remove(element, [
      '.experiencefragment',
      'header',
      'footer',
      '.contact-us-sticky',
      '.search-bar-cmp',
    ]);

    // Leftover non-authorable elements (verified in cleaned.html):
    //   link  -> AEM clientlib CSS links scattered in sections (e.g. lines 198,
    //            232, 238, 242, 275, 598, 229)
    //   iframe/video -> YouTube/media-modal embeds (lines 643-646) & tracking
    //   noscript / script / style -> non-authorable
    WebImporter.DOMUtils.remove(element, [
      'link',
      'iframe',
      'video',
      'noscript',
      'script',
      'style',
    ]);

    // Strip AEM data-layer / tracking attributes left on any element.
    element.querySelectorAll('[data-cmp-data-layer]').forEach((el) => {
      el.removeAttribute('data-cmp-data-layer');
    });
  }
}
