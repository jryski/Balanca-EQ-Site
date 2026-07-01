# BalanceEQ Marketing Site

Static marketing site for BalanceEQ — two-product nootropic line by Balasana LLC. **Multipage static site** — one `index.html` per route, plain `<a href>` navigation, shared chrome duplicated per page. Ingredient detail data loaded from `balanceeq-content.json`. No build step. Manual `git push` deploys to GitHub Pages (`CNAME` → balance-eq.com).

> **Temporary site.** This is a stopgap. The real production site will be a **Shopify theme** (target ~Aug 2026). Ingredients become Shopify metaobjects rendered by one Liquid template; pages become Shopify pages/articles. Don't over-invest in abstractions here (no build step, no framework, no shared-include tooling) — the presentation is throwaway; the **`balanceeq-content.json` content is the asset that migrates**.

**Products:** EQ:Focus (AM cognitive) and EQ:Restore (PM recovery and presence).
**Current locked formula:** v3.9 (April 2026).

## Founders / who's who

Three co-founders:
- **Jesse** — had the product idea; built the original (rough) site; owns the **prose/content** (ingredient copy and long-form prose are his call). Married to Amanda.
- **Amanda** — co-founder, Jesse's wife; funding the company alongside Jesse.
- **Shaun** — created the **brand**; the developer who maintains this site (brand, design, and the build are his domain).

So: **prose/content = Jesse's call; brand / design / build = Shaun's.** Don't describe BalanceEQ as a two-founder company — Amanda is one too, even though most of the day-to-day notes below reference Shaun (build) and Jesse (content).

## Tone (Shaun's preference)

Speak freely — humor, sarcasm, whatever feels natural. Shaun is rarely serious, so don't treat every exchange like a code-red incident; match the loose register. The one rule, by mutual gentlemen's agreement: **don't be a complete dick.** Work quality stays non-negotiable underneath the banter — clean diffs, real verification, accuracy never traded for a punchline. (Shaun's words: *"Light you = better you,"* and *"speak however you like, try not to be a complete dick."*)

## Files of note

- `index.html` — **home page only** (nav, hero, two product cards, footer). CRLF line endings; preserve them.
- `products/`, `evidence/`, `science/`, `transparency/`, `learn/`, `coa/` — each a folder with its own `index.html` (real slugs: `/evidence/`, `/science/`, etc.). Each carries its own copy of the nav + footer (intentional duplication; keep them byte-identical except the `active-link` and the `coa/` inline-script note below).
- `assets/site.js` — **shared** vanilla JS for every page: mobile-menu toggle, evidence filter (`filterEvidence`), learn-article toggle (`showArticle`), and the data-driven science renderer. Auto-inits the science page only when its containers exist. Linked as `assets/site.js` from home, `../assets/site.js` from subpages.
- `balanceeq-content.json` — content for the Science page (ingredient detail pages, supplier links, brand metadata). Loaded via `fetch("../balanceeq-content.json")` from `/science/` at runtime — Science page won't render without it.
- `styles.css` — shared by every page. Pages reuse the `.page`/`.page.active` wrapper (background + decorative glyphs) so no per-page CSS was needed.
- `assets/` — logos, bottle images, glyphs.
- `coa/index.html` — still has its **own inline** `toggleMobileMenu`/`closeMobileMenu` script rather than loading `assets/site.js` (deliberately left — works fine, not worth unifying on a throwaway site). If you change nav JS, update both.
- `archive/` — backups: `spa-index.html` (the pre-split single-page version), `react-nuked-*` (pre-React-removal).

## Brand voice rules — hard constraints

These are non-negotiable. Both Shaun and Jesse have flagged them as launch-blocking when violated.

- **EQ:Restore is NOT a sleep product.** It's a recovery and presence product. Sleep may appear as a **downstream consequence** but never as a primary benefit or lead claim. "Helps you sleep better" → wrong. "Supports the transition from work mode to presence" → right.
- **"Clinical doses" is retired.** Several ingredients (NMN 200mg, Apigenin 50mg, Lion's Mane 500mg) are below studied human clinical doses. Use "**evidence-based ingredients**" instead.
- **"Circadian-optimized" is retired.** Use "**Circadian nootropics**" (matches the hero eyebrow).
- **Pursuing certifications, not "in process."** ISO 9001:2015 and NSF are described as "Pursuing X certification" — "in process" overstated.

## Retired terms — must not appear

Sweep for these on any content change:

| Term | Replaced by |
|---|---|
| Niagen | (retired ingredient) |
| NR 250 / nicotinamide riboside | NMN (Uthever) |
| ChromaDex | (retired supplier) |
| L-Tyrosine | (removed from formula in v3.9) |
| clinical doses | evidence-based ingredients |
| evidence-based doses | evidence-based ingredients |
| therapeutic doses | evidence-based ingredients |
| Circadian-optimized | Circadian |

**Documented exception:** The "2pm Wall" article body in `index.html` retains L-Tyrosine references because the article is about formulation research, not the final formula. A disclaimer (italic, gray) was added immediately before the article's "This is part of the science behind…" callout. Do not remove L-Tyrosine from that article's body without removing the disclaimer too.

## Recent work (May 2026 v3.9 cleanup)

**June 5, 2026 — launch date + article-link audit.** Replaced the hard-coded "July 1, 2026" launch date with **"Coming soon"** everywhere it appeared (both product cards on `index.html` + both on `products/index.html`, the transparency FAQ, and the COA lookup `alert()`). Not stored in the JSON — it's inline HTML in 6 spots. Then validated every scientific article link (all DOIs + PubMed IDs across `evidence/`, `learn/`, and the JSON): all resolve **except** the Chini DOI, which was fabricated — now fixed (see Deferred items → Chini). Method: curl for HTTP status, Crossref `/agency` to confirm DOIs are registered (publishers 403 curl but are valid), PubMed MCP to find the correct paper. Handy for next time: 403 from a publisher ≠ dead; verify via `api.crossref.org/works/{doi}/agency`. **Then** ran a metadata-match audit (compare each citation's PMID against real PubMed journal/year/DOI) across the Shopify migration data (`../migration-scripts/_out/study_*.json`) — this catches wrong-*target* links that still resolve, which plain link-checking misses. Found 2 more real errors, fixed in **both** the live `balanceeq-content.json` and `study_1.json`: (a) "Phosphatidylserine and the human brain" (Glade & Smith) had a wrong PMID/DOI/year that belonged to a different paper — corrected to PMID 25933483, DOI `10.1016/j.nut.2014.10.014`, 2015; (b) the Kato-Kataoka PS study (PMID 21103029) had DOI `10.3164/jcbn.10-19` (resolved, but wrong article) — corrected to `10.3164/jcbn.10-54`. The other 21 study citations (incl. all saffron) verified correct. Minor/left alone: Bacopa meta-analysis (PMID 24252493) lists 2014 vs PubMed's 2013 (epub-vs-print, both defensible). Also metadata-audited the Learn-article citations in `articles.json` (19 refs) — all clean (6 article-only refs verified against PubMed; the rest overlap the study set; one intentional no-link psychology reference). **Net: citations are fully validated across the live site + Shopify migration data as of June 5.**

Shaun's red-team review identified 12 content issues in `index.html` plus a retired-terms sweep. All resolved. Separately, `balanceeq-content.json` was reconciled to v3.9 structure (data only — prose is Jesse's domain).

**May 18, 2026 — B-vitamin copy pass.** Jesse delivered combined prose for B6, Folate, B12, and a single grouped block for B1/B2/B5. Applied: merged the three B1/B2/B5 skeleton entries into one `b1-b2-b5` entry, replaced prose on B6/B12/Folate, dropped old taglines and unrelated prose per Jesse's "use only the new copy" directive, and removed B6's L-Tyrosine highlight span (the new copy frames B6 around dopamine/serotonin synthesis without naming Tyrosine).

**June 1, 2026 — multipage conversion + cleanup.** Split the single-page app into separate static pages with real slugs (`/`, `/evidence/`, `/science/`, `/transparency/`, `/learn/`, plus the existing `/coa/`). Removed the `showPage()` SPA router and hash-based navigation; nav/footer are now plain `<a href>` links duplicated per page. Extracted shared JS to `assets/site.js`. Removed dead code: `ingredientDatabase`, `showIngredient`, `scrollToProduct`, `showStory` (its founder-toggle markup never existed), and the orphaned in-`index` `#coas` page. Removed the never-rendered subscribe **modal** (`openModal`/`closeModal`/`handleSubscribe` + the two "Get Notified Now" product-card CTAs) — the hero Klaviyo form handles email capture now, so the cards currently have no CTA button. Science overview hero now shows `ingredient_count` (13 Focus / 9 Restore) instead of the detail-entry count. SPA backed up to `archive/spa-index.html`. Browser-verified every page (nav, active states, evidence filter, learn-article toggle, full science render/detail flow) — zero console errors.

**June 1, 2026 — glass hero banners + working Products anchor.** Wrapped the eyebrow/headline/subhead on all five internal pages (evidence, science, transparency, learn, coa) in a centered `.glass` panel (`max-width: 760px`, `border-radius: 24px`, padded) so the moving background glyph is blurred behind the hero text (readability fix). Added a real in-page anchor: `id="products"` on the home `.partner-logo-bar` with `scroll-margin-top: 6rem` (nav clearance), and pointed every nav "Products" + footer "All Products" link at it — `#products` on home, `../#products` from subpages (native cross-page anchor, no JS). **Key fix:** changed `.page` from `overflow: hidden` to `overflow: clip`. `hidden` made `.page` a non-scrollable scroll container, which silently broke native `#anchor` jumps to any descendant (the page would barely scroll); `clip` still clips the off-canvas glyphs but is not a scroll container. Landing verified: logo bar sits just under the nav with the product cards in view below. *(Superseded same day — see next entry: a dedicated `/products/` page now exists, the home `#products` anchor was retired, and all "Products" links repoint to the page. The `overflow: clip` fix stays — it's general.)*

**June 1, 2026 — Products page.** Built `/products/index.html`: glass hero (eyebrow "The System" + headline *"Focus when it counts. Restore when it's done."* + subhead), a "Why Two" lead-in block, and two **horizontal** product cards (`id="focus"` / `id="restore"`) reusing the `.launch-card` system. New CSS: each card has a `.launch-card__header` row (bottle in-flow beside the `.launch-card__facts` = brand/launch/serving/tags) with benefits + formula + CTA full-width below it; at ≤768px the card stacks and the bottle floats off the top edge (home-card style: absolute, centered, `top: -7rem`, with `margin-top`/`padding-top` clearance). `.launch-card__cta` got `text-decoration: none; display: inline-block` so it works as an `<a>`. Re-added CTAs to the home product cards ("Explore the System" → `products/`) — they'd been CTA-less since the modal removal. Repointed nav "Products" + footer "All Products" → `/products/` across all 6 other pages, gave the new page `active-link`, and retired the home `#products` anchor (home now has no active nav item — the logo is its destination). Product-card CTAs link to `../science/` for now; per-product deep-linking is pre-wired via the `#focus`/`#restore` ids. Hero/lead-in copy is first-draft (Shaun to red-pen). Browser-verified: horizontal layout at desktop, mobile stack, nav/active state, CTAs, zero console errors.

**June 8, 2026 — home cards trimmed to teasers.** The home product cards were duplicating the `/products/` cards almost verbatim (same benefits, serving, full formula), so clicking through felt redundant. Trimmed both home cards (`index.html`) to a teaser shape to open a curiosity gap: **dropped the serving line**, cut **benefits from 4 → 2** (kept the two strongest per product — Focus: working memory / calm under pressure; Restore: work-mode-to-presence / evening mood & stress recovery), and **replaced the full ingredient list** (`launch-card__formula-label` + `launch-card__ingredients`) with a single credibility line: "13 evidence-based ingredients" (Focus) / "9 evidence-based ingredients" (Restore). Kept name, launch date, tags, and the "Explore the System" → `products/` CTA. The **`/products/` cards are untouched** — they remain the full payoff (serving protocol, all 4 benefits, complete formula with doses, "see the ingredient science" CTA). Used the approved "evidence-based ingredients" term (not a total-mg figure — `total_actives_mg` 1766 is still unconfirmed and stays off the site). CRLF preserved. Reversible if Shaun/Jesse dislike it — the full content still lives in git history and on the products page.

### Page content — current state

_Since the June multipage split this content is distributed across the per-page files (home keeps the hero + product cards; Evidence/Learn/Transparency/Science live in their own folders) — it is no longer all in `index.html`._

- Focus formula card: v3.9, 13 ingredients (Citicoline 500mg, Lion's Mane 500mg, L-Theanine 200mg, NMN 200mg, Rhodiola 150mg, Phosphatidylserine 100mg, Apigenin 50mg, B5 15mg, B1 10mg, B2 10mg, B6 8mg, B12 500mcg, Folate 400mcg).
- Restore formula card: unchanged (already correct).
- Hero subhead uses "Evidence-based ingredients. Full transparency."
- Footer uses "Circadian nootropics" and "Evidence-based ingredients."
- Restore card has its own benefit bullets (was duplicating Focus).
- Evidence Library: Citicoline 500mg, L-Theanine unified at 200mg, Saffron link reworded to "mood and recovery" (not sleep).
- Restore bottle alt text corrected.
- ISO/NSF certifications say "Pursuing."
- Read times: all four Learn articles show "2 min read" (computed at 250 wpm — all four articles are 470–580 words; they're roughly the same length despite earlier impressions otherwise).
- The old inline `ingredientDatabase` object and `showIngredient()` were **deleted** in the June multipage conversion (confirmed dead code). The live ingredient data is `balanceeq-content.json` only.

### `balanceeq-content.json` — current state

- `brand.formula_version`: "3.9"
- `products.focus.ingredient_count`: 13
- `products.focus.total_actives_mg`: now `1766` (was the stale 1648.3). **Not rendered anywhere on the site** — data only; Jesse to confirm the figure is right for v3.9.
- Focus ingredient list: 13 entries in v3.9 order, with `display_order` 1–13.
- All ingredient prose is now **fully populated** — 0 `"i need info"` placeholders remain (NMN, Apigenin, Phosphatidylserine and the B-vitamin entries were all filled by Jesse). Every field the renderer reads is present (validated June 2026: 11 Focus + 9 Restore ingredients, all supplier links resolve).
- B-vitamin pass (May 2026): `b1-b2-b5` is a single merged entry at `display_order: 8` holding the combined "engine room" copy from Jesse. `vitamin-b6` (9), `vitamin-b12` (10), and `folate` (11) got new `why_its_here` + `how_it_works` prose from Jesse. Their `tagline`, `what_to_expect`, and `safety_note` (briefly `"i need info"` after the merge) have since been filled in by Jesse. Folate dose updated to `"400 mcg DFE"`. B6's L-Tyrosine highlight span was removed (new copy doesn't reference it).
- `products.focus.ingredient_count` is still `13` while `ingredients.focus[]` has 11 entries — intentional. Formula has 13 actives; the B1/B2/B5 merge collapses three into one detail entry.
- Removed entries: `l-tyrosine`, `nmn-apigenin` (split), `b-vitamins-complex` (split; B7 dropped), `vitamin-b1` / `vitamin-b2` / `vitamin-b5` (merged into `b1-b2-b5`).
- NMN: `branded: "Uthever"`, `supplier: "Uthever NMN by HPDI"`. The `supplier_links.uthever` key now **exists** (added since the original note).
- The JSON also contains `shopify_metaobject_schemas` and `url_map` blocks — forward-looking scaffolding for the Shopify migration; not consumed by the current site's JS.

### Highlighted-for-review sentences — RESOLVED

Earlier, light-red `<span style="background-color: #ffcccc; …">` wrappers flagged sentences needing Jesse's editorial judgment (sleep-led Restore prose, L-Tyrosine references). **As of June 2026 there are 0 such spans left in the JSON** — all resolved. The highlight-span convention below is retained only in case the pattern is reused.

## Conventions

- **HTML line endings:** CRLF. If editing programmatically, convert to LF for work then back to CRLF before saving.
- **Placeholder for pending content in JSON:** the literal string `"i need info"`. Don't invent prose for these fields.
- **Highlight span format (review markers, temporary):** `<span style="background-color: #ffcccc; padding: 0 2px;">…</span>` — wraps a full sentence including its trailing punctuation. Removed when content is rewritten.
- **Formatting in JSON:** 2-space indent, `ensure_ascii=False`, trailing newline. Matches existing style.
- **CSS/structure changes are now in scope.** The old "content-only, no CSS changes" rule applied to the v3.9 content cleanup. The June multipage rebuild deliberately changed structure and `styles.css`; reuse existing classes where possible and keep changes minimal.
- **Keep this file in sync.** After any structural or content change, update CLAUDE.md in the same pass so it never drifts from reality.
- **Anchors vs `overflow`.** Keep `.page` on `overflow: clip`, never `overflow: hidden`. `hidden` turns `.page` into a non-scrollable scroll container and silently breaks native `#anchor` jumps to any descendant. Use `scroll-margin-top` on an anchor target to offset the fixed nav.
- **Specificity gotcha (cards).** `.offset-outer-wrapper` nests `& .offset-inner-wrapper { flex-direction: column }`, which compiles to `.offset-outer-wrapper .offset-inner-wrapper` (specificity 0,2,0). A single-class layout override on an `.offset-inner-wrapper` element loses to it — qualify the selector to 0,2,0+ to win (e.g. `.launch-card.launch-card--horizontal`, not just `.launch-card--horizontal`).
- **Brand naming:** "BalanceEQ" (one word) for the product line; "Balasana" for the parent LLC; "Balance EQ" (with space) appears in the URL only.

## Pending — waiting on Jesse

Most of the original pending items are now **done**: `"i need info"` placeholders filled, highlight spans resolved, `supplier_links.uthever` added, `ingredientDatabase` deleted, `total_actives_mg` updated to 1766. Genuinely still open:

1. **Confirm `products.focus.total_actives_mg = 1766`** is the correct figure for the v3.9 formula. (Data only — not rendered on the site.)
2. **Subjective v3.8 prose audit.** A keyword scan of the JSON for retired terms (Niagen, NR / nicotinamide riboside, ChromaDex, L-Tyrosine, "clinical/therapeutic/evidence-based doses", "Circadian-optimized") is **clean — 0 hits**. What remains is a human read of the long-form prose fields — `products.{focus,restore}.description`, `problem_statement`, `caffeine_faq`, `systems_framework`, `personas`, `timeline` — for subtler v3.8 leftovers a keyword scan can't catch (e.g. a dose or framing that changed between formula versions).
3. **Product-card CTA (optional).** The home product cards lost their "Get Notified" buttons with the modal removal. Add a CTA that scrolls to the hero signup form if you want one back.

## Deferred / manual-intervention items

Surfaced from the **May 28 "Website content fixes"** session (these were skipped there as needing manual work and had not been recorded in this doc). Current status checked June 1:

- **Quatrefolic logo** — ✅ present in the home partner-logo-bar (`assets/quatrefolic.svg`).
- **Klaviyo form testing** — ✅ done. Shaun validated the hero signup form; leads appear in Klaviyo (confirmed June 1).
- **Copyright year** — ✅ resolved. Footer "© 2025-2026" is fine as-is per Shaun (DSHEA disclaimer sits above it).
- **Ingredient Science dynamic loading** — ✅ done. Science page renders ingredient data dynamically from `balanceeq-content.json` (verified June 1).
- **Pricing** — ⏸ deferred. Not set yet; waiting on the Shopify build (~Aug 2026). No pricing on the temp site.
- **Chini citation** — ✅ fixed June 5. The NAD+/CD38 reference (science backing Apigenin + NMN in EQ:Focus). The old DOI `10.1038/s41574-020-0355-2` was fabricated (404 on doi.org + Crossref) and the journal was wrong. Corrected via PubMed (PMID 33199925) to the real paper — Chini CCS et al., *"CD38 ecto-enzyme in immune cells is induced during aging and regulates NAD and NMN levels,"* **Nature Metabolism** 2020, DOI **`10.1038/s42255-020-00298-z`** (verified 200). Fixed in `evidence/index.html` and `learn/index.html` (DOI + journal name; also "2020 review" → "2020 study" since it's a primary article, not a review). The same broken citation also lived in the Shopify migration content `../migration-scripts/_out/articles.json` — fixed there too (June 5). Nothing had been pushed to the live Shopify store, so no store-side correction was needed. Note: the `beq_study` metaobjects (`study_2.json`) cite a *different, valid* Chini paper (PMID 27304511, Cell Metab 2016) — those were already fine.

## Source of truth: Shaun's red-team request

The original request file (May 2026) defined the 12 fixes and the retired-terms list. If a question comes up about *why* something was changed, the answer is usually in that file. Not checked into the repo — sits in the founder's chat with Claude.
