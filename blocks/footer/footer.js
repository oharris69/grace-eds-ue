import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment (dual-fetch: local /content first, then DA/EDS)
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/content/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Tag sections in fragment order: copyright, quick links, trademark, brand logo.
  const sectionClasses = ['footer-copyright', 'footer-links', 'footer-trademark', 'footer-brand'];
  Array.from(footer.children).forEach((section, i) => {
    if (sectionClasses[i]) section.classList.add(sectionClasses[i]);
  });

  block.append(footer);
}
