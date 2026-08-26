import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Collapses the mobile nav and resets the hamburger.
 * @param {Element} nav The nav element
 */
function closeMenu(nav) {
  nav.setAttribute('aria-expanded', 'false');
  const hamburger = nav.querySelector('.nav-hamburger button');
  if (hamburger) hamburger.setAttribute('aria-label', 'Open navigation');
  document.body.style.overflowY = '';
}

/**
 * Toggles the mobile nav open/closed.
 * @param {Element} nav The nav element
 * @param {Boolean|null} forceExpanded Force a state when not null
 */
function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  const hamburger = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (hamburger) hamburger.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
}

/**
 * Builds the search control (expandable icon toggling an input). Content-first:
 * the fragment carries only the "Search" label; the interactive form is built here.
 * @param {Element} toolsSection The nav-tools section element
 */
function decorateSearch(toolsSection) {
  if (!toolsSection) return;
  toolsSection.textContent = '';
  const form = document.createElement('form');
  form.className = 'nav-search';
  form.setAttribute('role', 'search');
  form.action = '/search';
  form.method = 'get';

  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.placeholder = 'Search';
  input.setAttribute('aria-label', 'Search');
  input.className = 'nav-search-input';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'nav-search-toggle';
  button.setAttribute('aria-label', 'Search');
  button.setAttribute('aria-expanded', 'false');

  button.addEventListener('click', () => {
    const open = form.classList.toggle('nav-search-open');
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) input.focus();
  });

  form.append(input, button);
  toolsSection.append(form);
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/content/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Sections in fragment order: utility, brand, sections (links), tools (search)
  const classes = ['utility', 'brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // Build the expandable search control from the tools section.
  decorateSearch(nav.querySelector('.nav-tools'));

  // Group brand + sections + tools into a single main bar row (utility stays
  // full-width above). This lets CSS lay the main bar out as one flex row.
  const brand = nav.querySelector('.nav-brand');
  const sections = nav.querySelector('.nav-sections');
  const tools = nav.querySelector('.nav-tools');
  if (brand) {
    const mainBar = document.createElement('div');
    mainBar.className = 'nav-main';
    [brand, sections, tools].forEach((el) => {
      if (el) mainBar.append(el);
    });
    nav.append(mainBar);
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  // reset menu state when crossing the desktop/mobile breakpoint
  isDesktop.addEventListener('change', () => closeMenu(nav));

  // close mobile menu on escape
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && !isDesktop.matches) closeMenu(nav);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
