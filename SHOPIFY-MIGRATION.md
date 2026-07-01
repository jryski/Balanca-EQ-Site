# BalanceEQ → Shopify Migration Plan

Living checklist for moving the static marketing site (GitHub Pages) onto a Shopify
theme. Update this doc as decisions land. Companion to `CLAUDE.md` (which governs the
current static site).

**Strategy in one line:** Dawn (Shopify reference theme) as the base + heavy restyle +
custom sections/blocks + metaobjects. A *custom* theme, not a from-scratch theme. **Do
not reuse the old front-end code** (the existing Shopify theme is based on a messy
one-file/React iteration — throwaway). The asset that migrates is the *content*, not the
presentation.

**Timeline:** ~6 weeks of evenings (product launch mid-to-late July, possibly August).

**Working practice — verify after each batch.** Shaun can't deeply review backend/DB work
and there's no second reviewer, so after every batch of backend work (metaobjects, products,
metafields, theme logic) run a verification round before moving on and report it: **Function**
(counts, no dupes, references resolve, no encoding corruption, correct status) + **Security**
(parameterized queries, no secrets in files, no internal data exposed publicly, output
escaping in templates, pre-launch access protection).

---

## Source of truth (read before any content work)

1. **"Ask Balance EQ"** = the `anthropic-skills:beq-product-context` skill. This is the
   newest, most authoritative product/brand reference. **`balanceeq-content.json` (v3.9,
   April 2026) may be stale — validate every field against Ask Balance EQ before loading
   it into Shopify.**
2. **Amanda Ryski (CEO) has final approval on all public-facing content.** Jesse drafts
   prose; Amanda signs off on what ships.
3. **Words-to-avoid (legal/compliance — non-negotiable):** clinical doses, therapeutic
   doses, evidence-based *doses*, sleep aid / sleep product, clinically proven,
   treats / cures / prevents, anti-aging, biohacking-as-identity,
   optimization-as-personality, grind, hustle, Circadian-optimized (use "Circadian"),
   and the retired ingredient/supplier terms in `CLAUDE.md`. **EQ:Restore is recovery &
   presence, never a sleep product.** Sweep against this on every content change.
4. DSHEA disclaimer required on all materials; commercial emails also need physical
   address (23210 Greater Mack Ave #188, Saint Clair Shores, MI 48080) + unsubscribe.

---

## Shopify ↔ WordPress mental map (Shaun is a WP dev)

| BalanceEQ thing | Shopify primitive | WordPress analog |
|---|---|---|
| EQ:Focus / EQ:Restore / Bundle (sellable) | **Products** | WooCommerce products |
| Ingredients (~22) | **Metaobjects** `beq_ingredient` | CPT + ACF |
| Studies / citations | **Metaobjects** `beq_study` (refs ingredient) | CPT + relationship field |
| Batch certificates | **Metaobjects** `beq_coa` | CPT + ACF + file field |
| Product narrative (timeline, systems, personas…) | **Metafields** on the product | ACF fields on product |
| Transparency / COA / Science index pages | **Pages** + custom templates | Pages + page templates |
| Learn articles | **Blog + Articles** | Posts |
| Nav / footer | **Menus** (admin) | WP menus |
| Bespoke look | **Online Store 2.0 sections + blocks** | Gutenberg blocks / template parts |
| `styles.css` tokens | Theme CSS + `settings_schema.json` | `theme.json` |

> **URL reality:** Shopify forces resource prefixes you can't strip on a standard plan
> (`/pages/…`, `/blogs/…`, `/products/…`). Per Shaun, we do **not** need to preserve the
> old slugs with redirects — only the COA path matters, and that's handled via the GS1
> resolver (below), not a Shopify redirect.

---

## Current site inventory (what we're rebuilding)

7 pages, shared nav + footer. Only two have real logic.

| Page | Content today | Becomes in Shopify |
|---|---|---|
| **Home** | Glass hero, Klaviyo signup, "Powered by" logo bar, 2 product teaser cards | `index` template w/ custom sections |
| **Products** | Hero, "Why Two" lead-in, 2 full product cards | Product pages + a collection/landing page |
| **Science** | Data-driven (JSON): Focus/Restore toggle → overview → ingredient detail | Split: product-page narrative + `beq_ingredient` metaobject pages + a Science index |
| **Evidence** | Static filterable cards (ingredient + dose + study links) | Page looping `beq_study` metaobjects, filterable |
| **Learn** | 4 long-form articles w/ citations (JS show/hide) | "Learn" blog, 4 articles |
| **Transparency** | Commitment list, testing/cert cards, FAQ accordion | Page w/ section blocks |
| **COA** | Fake `alert()` batch lookup + 2 sample cards | Real `beq_coa`-backed lookup at `/pages/coa` |

**Decided — fold Science into the product pages (with a teaser back-link):** the Science
page currently does two jobs — (A) product *marketing* (problem statement, systems
framework / transition sequence, caffeine FAQ, personas, Days1-7→Weeks8+ timeline) and
(B) ingredient *proof* (per-ingredient mechanism/dose/studies/supplier/safety). Job A
moves onto the **product pages** (as metafields, next to the buy box). Job B stays as the
**ingredient library** (metaobject pages) with a short "key ingredients" teaser on the
product page linking to it. Wins: persuasion sits next to "add to cart," product pages
rank for product terms + ingredient pages rank for ingredient terms, clean data
separation, no more triple-restated benefit copy.

---

## Product / commerce model

- **EQ:Focus** — single-bottle product. Purchase options: one-time, subscribe (ReCharge),
  Founding 100 (lifetime-locked subscription tier, first 100).
- **EQ:Restore** — single-bottle product, same purchase options.
- **The System (bundle)** — Focus + Restore together, priced slightly below buying both
  separately. One-time + subscribe.
- **Subscriptions via ReCharge** (Shopify app) — *ideal* for steady revenue; expected
  volume skews to single bottles / bundle.
- **Pricing is undecided** → wire every price as a **theme setting / variable** so we can
  change it without touching templates. No prices hard-coded.
- Launch promo = Founding 100 tier (configured in ReCharge, capped at 100).

---

## Data model (metaobjects + metafields)

### `beq_ingredient` (drafted in `balanceeq-content.json` → create ~verbatim)
`name` (text), `branded_name` (text, opt), `supplier` (text, opt),
`supplier_link` (url, opt), `dose` (text), `form` (text), `category` (text),
`tagline` (text), `why_its_here` (multiline), `how_it_works` (multiline),
`what_to_expect` (multiline), `safety_note` (multiline), `product` (text: focus/restore),
`display_order` (integer). Enable the **online-store capability** so each ingredient gets
its own URL + a `templates/metaobject/beq_ingredient.liquid`.

### `beq_study` (drafted in JSON)
`title`, `authors`, `journal`, `year` (int), `doi`, `pmid`, `summary` (multiline),
`key_finding`, `ingredient_ref` (metaobject reference → `beq_ingredient`).

### `beq_coa` (NEW — not yet in JSON)
`batch_number` (text; **handle = batch number** for deep links), `product`
(reference → Shopify product), `manufacture_date`, `test_date`, `result` (PASS/FAIL),
`tests_performed` (list), `coa_pdf` (file). Scales cleanly to thousands of batches; one
admin entry per production run.

### Product metafields (narrative, from `products.{focus,restore}` in JSON)
`description`, `problem_statement`, `systems_framework` (Focus) / `transition_sequence`
(Restore), `caffeine_faq` (Focus — *positioning only; product is stimulant-free, no
caffeine*) / `what_its_not` (Restore), `personas`, `timeline`, `timeline_citations`,
`serving`, `capsule_type`, formula list, benefits, tags.

> **Migration win:** once defs exist, script the JSON → metaobjects/metafields import via
> the Shopify Admin GraphQL (the connected MCP can do this). One shot loads the whole
> ingredient/study library. Evidence + Science then share one source of truth (today the
> studies are typed by hand into both the JSON and the Evidence HTML).

---

## COA / GS1 Digital Link (decoded from the label SVGs, June 2026)

The bottle QR codes encode **GS1 Digital Links**, not a plain `/coa` URL:

- Focus  → `https://id.balance-eq.com/01/05070004634704`
- Restore → `https://id.balance-eq.com/01/05070004634711`

(`/01/` = GS1 AI for GTIN; both GTIN check digits validated.)

Implications:
1. The QR points to a **separate subdomain `id.balance-eq.com` (a GS1 resolver)** — not
   the Shopify store path. The resolver must map `/01/{GTIN}` → a COA destination
   (likely `/pages/coa`, optionally with the product preselected).
2. **GTIN-only, no `/10/{lot}`** → the QR is *product-level*, not batch-level. Every Focus
   bottle has the same QR. Batch-specific COA therefore needs the landing page to ask for
   the batch number, OR a future label run to add `/10/{lot}`.
3. **Resolver behavior — CONFIRMED (Shaun, June 2026):** `id.balance-eq.com` just sends
   the customer to the **COA landing page (`/pages/coa`)**, where they **enter their batch
   number** (for now and the next few runs). The QR codes are generated by a **third-party
   QR service** (the `id.` URL came from that app). **Jesse set up the QR / service** —
   he'll share more detail, but this is *not* a blocker: our job is just the `/coa` page +
   `beq_coa` lookup. (Future option: add `/10/{lot}` to QRs for true batch-level deep links.)

---

## Phased plan

### Phase 0 — Foundations
- [x] Authenticate the Shopify MCP connector. ✅ (June 2026)
- [x] Store recon (June 2026): store = **Balance EQ** on `0i4qxw-6j.myshopify.com`,
      plan **Basic**, USD, CDT, email `ops@balance-eq.com`. Apex `balance-eq.com` is still
      served by **GitHub Pages** (the Shopify store is on its myshopify URL) — so we can
      build the whole theme without touching the live site until the Phase 4 cutover.
- [x] Inspect existing store contents (June 2026):
      - **Products:** EQ:Focus (`eq-focus`, SKU `EQF-V39`) and EQ:Restore (`eq-restore`,
        SKU `EQR-V39`) exist as **DRAFT skeletons** ($0, 1 default variant, no
        content/media/inventory). **Reuse these** (handles + SKUs are clean); add the
        bundle product later.
      - **Metaobjects:** none defined — clean slate for `beq_ingredient` / `beq_study` /
        `beq_coa`.
      - **Themes:** published (MAIN) = "BalanceEQ Migration" (the messy one) + a copy of
        it; "Figma Make Export" (design reference only, not a base); stock "Horizon" +
        "Sense" installed.
- [x] **Base theme = Dawn** — chosen over Horizon (June 2026). Rationale: Dawn covers
      100% of this build, no realistic forced-rebuild risk (both are Online Store 2.0;
      section themes aren't being deprecated), and its docs/community depth is the biggest
      accelerator while learning Shopify. A heavily customized theme is frozen vs upstream
      anyway, so Horizon's newer "theme blocks" momentum matters little here; can adopt
      incrementally later if ever wanted.
- [x] Shopify CLI installed (v4.2.0). Fresh **Dawn** cloned + committed to git at
      `balance-eq/balanceeq-shopify-theme` (54 sections / 37 snippets / 14 templates).
      NOTE: `shopify theme init` now defaults to the minimal **Skeleton** theme, not Dawn —
      we cloned Dawn from `github.com/Shopify/dawn` instead. The Skeleton folder was discarded.
- [ ] Run the local preview: `shopify theme dev --store 0i4qxw-6j.myshopify.com` from the
      theme folder (Shaun — first run opens a browser to authorize the CLI). Optional before
      Phase 1; the metaobject/content load doesn't need it.

### Phase 1 — Content model + data load
- [x] **Reconciled `balanceeq-content.json` against Ask Balance EQ** (June 2026) — findings
      logged below; "evidence-based ingredients" wording fix applied to the JSON; Tier-1/2
      items assigned to Jesse as launch blockers.
- [x] Created metaobject definitions (June 2026):
      - `beq_ingredient` — `gid://shopify/MetaobjectDefinition/20552188015` (14 fields;
        publishable + renderable + online-store, urlHandle `ingredients`)
      - `beq_study` — `gid://shopify/MetaobjectDefinition/20552220783` (9 fields;
        `ingredient_ref` → beq_ingredient)
      - `beq_coa` — `gid://shopify/MetaobjectDefinition/20552253551` (7 fields; set handle =
        batch number)
- [x] Loaded JSON → metaobject entries (June 2026): **20 `beq_ingredient` + 24 `beq_study`**
      (studies linked via `ingredient_ref`), all published ACTIVE. Generator:
      `migration-scripts/load_metaobjects.py` (idempotent upsert by handle — re-run to update,
      no dupes; `gid_map.json` holds ingredient handle→GID for the study pass).
- [x] Products + narrative metafields (June 2026): defined **13 `beq.*` product metafields**
      (problem_statement, systems_framework, transition_sequence, personas, timeline,
      timeline_citations, caffeine_faq, what_its_not, serving, capsule_type, ingredient_count,
      total_actives_mg [labeled "do not render" — Jesse to confirm], `ingredients` =
      ordered list.metaobject_reference). Loaded values into `eq-focus` (11 mf) + `eq-restore`
      (10 mf) + set native descriptions. Generator: `migration-scripts/load_product_metafields.py`.
      Verified: metafields scoped correctly per product, ingredient refs resolve in display order.
      Products remain DRAFT.
- [ ] **Bundle mechanics:** "The System" product shell exists (`the-system`, DRAFT) but does
      NOT yet link Focus+Restore as components or have pricing/inventory. Wire real bundle
      (Shopify Bundles app / components) once selling model + pricing are settled.
- [x] Learn blog + articles (June 2026): reused the existing `learn` blog; **reconciled all
      4 articles**. ⚠️ The live March versions contained **retired ingredients** (L-Tyrosine in
      "2pm Wall", nicotinamide riboside in "Running on Empty") — caught by the verify gate.
      Replaced with current v3.9 bodies (B6/citicoline; NMN+Apigenin), stripped inline styles,
      rewrote broken `../science/` SPA links → `/products/...`, added summaries, `focus|restore`
      + `learn` tags, and `beq.read_time` + `beq.related_product` (ARTICLE) metafields. Deleted a
      duplicate empty `learn-1` blog. Articles remain published. Generator:
      `migration-scripts/extract_articles.py`.
- [ ] **Nav + footer menus → Phase 2** (build in admin: Online Store → Navigation;
      `menuCreate` isn't in this API version, and most link targets — Science/Evidence/COA/
      Transparency pages — don't exist until Phase 2 anyway). Intended structure:
      nav = Products, Science, Evidence, COAs, Transparency, Learn (`/blogs/learn` ✓ exists).

### Phase 2 — Theme build (the bulk, section by section)
- [~] Global brand layer (June 2026, in progress): **PostCSS build pipeline** added to the
      theme (`package.json` + `postcss.config.js`; postcss-import/mixins/nesting/autoprefixer).
      Source partials in `src/css/partials/` (colors, variables, mixins, typography, base,
      utilities) → compiled to `assets/application.css` (`npm run css:watch` alongside `theme dev`).
      Real brand tokens (jade `#00ae94`, pacific `#008bd8`, raven, etc.) + **Raleway** self-hosted
      (woff2 in assets/, `@font-face` via Liquid `asset_url` in theme.liquid). `application.css`
      loads after Dawn `base.css`. NO prefixes on files/classes per Shaun. Still TODO: moving-glyph
      background, glass on hero, header/footer restyle, **refactor `main-ingredient.liquid` to use
      tokens + drop `beq-` prefixes**. (Dawn's 2 pre-existing ValidSchemaTranslations errors —
      in `featured-product.liquid` referencing a missing `icon_with_text…content` key — FIXED
      June 2026 by pointing to the existing `pairing_1` keys; `theme check` now reports 0 errors.)
- [x] **FONTS (done June 2026): self-hosted Raleway only, zero third-party font calls.**
      Removed Dawn's `font_url` preloads in `theme.liquid` / `password.liquid` / `gift_card.liquid`,
      and overrode `--font-body-family`/`--font-heading-family` → `var(--font-primary)` in base.css
      so Dawn components use Raleway and its `@font-face` never downloads. Verified: grep = no
      `font_url` preloads, no Google refs; only the self-hosted `raleway-400` preload remains.
      (Decision recorded: stay self-hosted over Shopify's font library for full brand control.)
- [x] **Ingredient page refactored to the token system (done June 2026):** dropped `beq-` prefixes
      → scoped `.ingredient__*` / `.study__*`; styles moved to per-page `src/css/ingredient.css`
      (→ `assets/ingredient.css`, loaded by the section); uses real tokens (jade `#00ae94` /
      pacific `#008bd8` via `.is-focus`/`.is-restore` → `--color-accent`) + mixins. Also fixed a
      collision I'd introduced: removed global `.card`/`.section`/`.button-beq` utility classes
      (Dawn owns `.card`/`.section`) — shared patterns are mixins now. Lint clean, no new offenses.
- [x] **Header + footer (June 2026):** custom brand sections replacing Dawn's. Header = logo,
      nav (hardcoded placeholder links → convert to editable `main-menu` in admin later), cart
      link + count, mobile hamburger (`assets/header.js`). Footer = logo, bio, Products/Trust/Company
      columns, DSHEA disclaimer, dynamic copyright. Per-section `src/css/header.css` + `footer.css`.
      Simplified `header-group.json`/`footer-group.json` (dropped Dawn's announcement bar + footer
      blocks). DROPPED for now (re-add if wanted): Dawn cart-drawer, predictive search, localization,
      newsletter. Lint: 0 errors; known warnings = placeholder-nav HardcodedRoutes (vanish when
      nav→menu) + 6 OrphanedSnippet (dead Dawn snippets from the old header/footer).
      - **GOTCHA fixed (June 2026):** Dawn sets `html { font-size: 62.5% }` (10px root) in
        theme.liquid, so rem tokens rendered ~62% small. Switched all font/spacing tokens to
        **px** (16px floor, immune to the root). Also renamed header/footer block classes to
        **`.site-header` / `.site-footer`** — Dawn's `base.css` owns `.header`/`.footer` and was
        hijacking the layout. Nav = 18px/regular, logo 25px, 1200px container, placeholder cart icon.
- [ ] **Header/footer polish — flagged by Shaun (next session):**
      - **Cart icon overflow:** runs off-screen between ~900px and full width (nav links + cart in
        one row before the 900px hamburger breakpoint). Likely fix: raise breakpoint / condense
        tablet nav. Shaun reviewing other Shopify sites for best cart UX/UI first.
      - **Cart sits centered** on tablet/mobile (`space-between` + wrap parks it mid-row). Fix:
        group cart + hamburger on the right.
      - **Footer structure:** two flex wrappers — (a) logo + statement (column), (b) the three
        Products/Trust/Company columns in their own wrapper — so on wrap the columns stack *under*
        the brand block. Match the **live site's footer font sizes + colors**.
- [ ] Home.
- [ ] Product pages (narrative metafields + buy box: one-time / bundle / ReCharge).
- [~] Ingredient page **DONE** (first template, June 2026): `templates/metaobject/beq_ingredient.json`
      + `sections/main-ingredient.liquid`. Renders name/badge/meta-grid/prose, pulls in studies by
      matching `ingredient_ref` → handle, supplier transparency, safety, disclaimer. All text
      `| escape`'d. Lint-clean (`shopify theme check`, no errors). Live at `/pages/ingredients/{handle}`
      (e.g. citicoline, saffron, zinc). Still TODO: Science **index** page that links to these.
- [ ] Evidence (study loop + Focus/Restore filter).
- [ ] Transparency + FAQ.
- [ ] Learn (blog + article templates).
- [ ] COA (`/pages/coa` lookup backed by `beq_coa`).

### Phase 3 — Integrations & polish
- [ ] Klaviyo (native Shopify integration; keep email capture; compliant email footer).
- [ ] ReCharge subscription setup + Founding 100 tier.
- [ ] Confirm `id.balance-eq.com` (third-party QR service, set up by Jesse) lands on
      `/pages/coa`. Behavior confirmed; just verify the destination once the page exists.
- [ ] Analytics, SEO (titles/meta), `schema.org` Product + Article, accessibility, perf.

### Phase 4 — Launch
- [ ] **BLOCKER: all Tier-1/2 content-reconciliation flags answered by Jesse** (NMN
      regulatory status, population-stat sourcing, hormonal/sleep framing, citation
      alignment) + Amanda sign-off on public copy.
- [ ] Finalize pricing (swap the variables).
- [ ] Domain cutover from GitHub Pages → Shopify; QA pass; go live; retire temp site.

---

## Content reconciliation findings (JSON vs Ask Balance EQ, June 2026)

**⚠️ LAUNCH BLOCKER — Jesse is tasked with researching/answering ALL flagged items below**
(he owns the v3.9 formula + the underlying research). Answers required **before launch**.
Amanda retains final sign-off on public-facing copy. Tier 3 = already fine.

**Tier 1 — compliance/legal:**
1. **NMN regulatory status** — Focus contains NMN; there's an unresolved FDA position that
   NMN may not be marketable as a dietary supplement. Confirm current status before selling.
   (Product/legal issue, not copy.)
2. **"evidence-based levels/doses"** in both product descriptions + L-Ornithine note —
   retired phrasing AND inaccurate (several ingredients are below studied doses). Replace
   with "evidence-based ingredients." (Mechanical JSON fix, pending greenlight.)
3. **Unsourced population stats** (50% Mg-deficient, 60% MTHFR, 42% vit-D deficient, 20% B6)
   — need substantiation on file for FTC.
4. **"Hormonal transition" line** (Restore timeline) — borderline disease-claim; review.
5. **Sleep-forward study citations** — esp. the NMN sleep/drowsiness study cited on AM Focus
   (tonally off) and L-Theanine PSQI citation on Restore. Confirm framing vs "never lead with sleep."

**Tier 2 — accuracy/consistency (Jesse):**
6. Timeline footnotes cite studies absent from the `studies` arrays (Lopresti 2025 202-person;
   Hausenblas 2024 Magtein). Align footnotes ↔ `beq_study` records.
7. `total_actives_mg: 1766` still unconfirmed (data only, not rendered).

**Tier 3 — already compliant (keep):** Lion's Mane sub-clinical dose disclosed; Apigenin
CD38 flagged pre-clinical; Restore `what_its_not` de-positions sleep; no proprietary-blend
language; DSHEA disclaimer present.

> Structure (names/doses/suppliers/forms/study records) is migratable now; prose fields +
> Tier 1 items need Jesse-draft + Amanda sign-off before they're customer-facing.

## Open decisions / unknowns
- ~~Who hosts `id.balance-eq.com` / what it resolves to~~ — RESOLVED: third-party QR
  service (Jesse), lands on `/pages/coa`, customer enters batch. Jesse to share service details.
- Final pricing for all SKUs + Founding 100 (currently variables).
- Add `/10/{lot}` to future QR runs for true batch-level COA, or keep batch entry on the page?
- Keep a standalone Science *overview* page, or is the product-page fold + ingredient
  index enough? (current plan: fold + index.)
- Bundle as a distinct product vs. a Shopify Bundles/app approach (current plan: distinct product).
