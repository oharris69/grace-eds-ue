# Grace.com Homepage Migration Plan

## Objective
Migrate the **homepage of grace.com** (`http://grace.com/`) into this AEM Edge Delivery Services project as a **full page** — content, matched visual design, plus header/navigation and footer instrumentation.

## Scope (confirmed)
- **Target:** Homepage only (`http://grace.com/`)
- **Completeness:** Full page — content + design + header/nav + footer

## Approach
1. **Scrape & analyze** the homepage to capture DOM, metadata, images, and a cleaned HTML snapshot.
2. **Identify page structure** — break the page into sections and content sequences; decide default content vs. blocks.
3. **Map blocks** — reuse existing project/Block Collection blocks where possible; create new block variants only where needed, matching the original design.
4. **Build import infrastructure** — page template, block parsers, and page transformers.
5. **Run the content import** using the bundled import script (never hand-authoring HTML in the content directory).
6. **Migrate design** — extract computed styles from the source and apply EDS-ready CSS to the blocks/sections.
7. **Instrument navigation (header)** and **footer** from the source site.
8. **Preview & visually verify** against the original, iterating on styling.
9. **Lint & QA**, then prepare for publishing.

## Checklist
- [ ] Confirm `http://grace.com/` is reachable and is the correct source homepage
- [ ] Scrape homepage: metadata, images, cleaned HTML, analysis JSON
- [ ] Identify section boundaries and content sequences
- [ ] Survey available blocks (project + Block Collection) and produce a block inventory
- [ ] Decide authoring approach per sequence (default content vs. block) and map to block variants
- [ ] Create/adjust any new block variants required to match the source design
- [ ] Generate page template, block parsers, and page transformers
- [ ] Run the bundled import script to create the homepage content
- [ ] Extract and apply matched design/CSS for each block and section
- [ ] Instrument the header/navigation from the source
- [ ] Instrument the footer from the source
- [ ] Preview locally and compare against the original homepage
- [ ] Run visual critique and iterate on discrepancies
- [ ] Run `npm run lint` (and `npm run build:json` if models changed); fix issues
- [ ] Summarize results and outline publishing steps (branch, PR with preview URL)

## Open Questions / Notes
- I'll verify `http://grace.com/` resolves before scraping. If it's unreachable or redirects (e.g. to `https://`), I'll confirm the correct URL with you.
- Header/nav and footer instrumentation depend on screenshots of the source; if any menu content is hover-revealed, I'll capture that during analysis.

> **Note:** Execution of the steps above requires **Execute mode** — this plan is prepared and ready to run once approved.
