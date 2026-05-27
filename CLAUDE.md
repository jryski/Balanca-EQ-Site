# BalanceEQ Marketing Site

Static marketing site for BalanceEQ — two-product nootropic line by Balasana LLC. Single-page app served from `index.html`, ingredient detail data loaded from `balanceeq-content.json`. No build step. Manual `git push` deploys.

**Products:** EQ:Focus (AM cognitive) and EQ:Restore (PM recovery and presence).
**Current locked formula:** v3.9 (April 2026).

## Files of note

- `index.html` — full site (nav, hero, product cards, Evidence Library, Transparency, Learn articles, Science page shell, inline JS). Uses **CRLF line endings**; preserve them.
- `balanceeq-content.json` — content for the Science page (ingredient detail pages, supplier links, brand metadata). Loaded via `fetch()` at runtime — Science page won't render without it.
- `styles.css` — referenced from index.html; not modified in recent work.
- `assets/` — logos, bottle images, glyphs.
- `coa/` — separate route referenced from nav (`href="coa/"`).

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

Shaun's red-team review identified 12 content issues in `index.html` plus a retired-terms sweep. All resolved. Separately, `balanceeq-content.json` was reconciled to v3.9 structure (data only — prose is Jesse's domain).

**May 18, 2026 — B-vitamin copy pass.** Jesse delivered combined prose for B6, Folate, B12, and a single grouped block for B1/B2/B5. Applied: merged the three B1/B2/B5 skeleton entries into one `b1-b2-b5` entry, replaced prose on B6/B12/Folate, dropped old taglines and unrelated prose per Jesse's "use only the new copy" directive, and removed B6's L-Tyrosine highlight span (the new copy frames B6 around dopamine/serotonin synthesis without naming Tyrosine).

### `index.html` — current state

- Focus formula card: v3.9, 13 ingredients (Citicoline 500mg, Lion's Mane 500mg, L-Theanine 200mg, NMN 200mg, Rhodiola 150mg, Phosphatidylserine 100mg, Apigenin 50mg, B5 15mg, B1 10mg, B2 10mg, B6 8mg, B12 500mcg, Folate 400mcg).
- Restore formula card: unchanged (already correct).
- Hero subhead uses "Evidence-based ingredients. Full transparency."
- Footer uses "Circadian nootropics" and "Evidence-based ingredients."
- Restore card has its own benefit bullets (was duplicating Focus).
- Evidence Library: Citicoline 500mg, L-Theanine unified at 200mg, Saffron link reworded to "mood and recovery" (not sleep).
- Restore bottle alt text corrected.
- ISO/NSF certifications say "Pursuing."
- Read times: all four Learn articles show "2 min read" (computed at 250 wpm — all four articles are 470–580 words; they're roughly the same length despite earlier impressions otherwise).
- Inline `<script>` block contains an `ingredientDatabase` JS object. **It is dead code** — referenced by `showIngredient()` which is never called from any onclick handler. Decision: leave it alone unless someone wires it up. NMN and Apigenin in that object use `scienceId: "nmn"` and `"apigenin"` (guesses pending Jesse's verification against the JSON).

### `balanceeq-content.json` — current state

- `brand.formula_version`: "3.9"
- `products.focus.ingredient_count`: 13
- `products.focus.total_actives_mg`: **still 1648.3 (stale)** — needs recompute by Jesse, methodology unknown.
- Focus ingredient list: 13 entries in v3.9 order, with `display_order` 1–13.
- Remaining full skeleton entries (NMN, Apigenin, Phosphatidylserine) have populated structural fields but every prose field is still `"i need info"` and `studies: []`.
- B-vitamin pass (May 2026): `b1-b2-b5` is a single merged entry at `display_order: 8` holding the combined "engine room" copy from Jesse. `vitamin-b6` (9), `vitamin-b12` (10), and `folate` (11) got new `why_its_here` + `how_it_works` prose from Jesse. Their `tagline`, `what_to_expect`, and `safety_note` are now `"i need info"` (old prose was discarded — Jesse asked to use only the new copy). Folate dose updated to `"400 mcg DFE"`. B6's L-Tyrosine highlight span was removed (new copy doesn't reference it).
- `products.focus.ingredient_count` is still `13` while `ingredients.focus[]` has 11 entries — intentional. Formula has 13 actives; the B1/B2/B5 merge collapses three into one detail entry.
- Removed entries: `l-tyrosine`, `nmn-apigenin` (split), `b-vitamins-complex` (split; B7 dropped), `vitamin-b1` / `vitamin-b2` / `vitamin-b5` (merged into `b1-b2-b5`).
- NMN entry retains Uthever brand: `branded: "Uthever"`, `supplier: "Uthever NMN by HPDI"`, but `supplier_link` is empty. The `supplier_links` dict has no `uthever` key — add one when Jesse provides the URL.

### Highlighted-for-review sentences

Light-red background spans wrap sentences that need Jesse's editorial judgment. These render visibly on the Science page as a flag. **When Jesse rewrites these, remove the `<span style="background-color: #ffcccc; padding: 0 2px;">…</span>` wrappers along with replacing the text.** Nothing else to undo.

Locations with highlights:

- `products.focus.timeline[0].description` — L-Tyrosine reference ("Tyrosine may help on high-pressure days immediately.")
- `magnesium-l-threonate` — tagline, why_its_here, what_to_expect (sleep-led prose)
- `l-ornithine` — why_its_here, what_to_expect, how_it_works
- `l-theanine-restore` — what_to_expect
- `saffron` — why_its_here, what_to_expect
- `vitamin-d3` — what_to_expect

## Conventions

- **HTML line endings:** CRLF. If editing programmatically, convert to LF for work then back to CRLF before saving.
- **Placeholder for pending content in JSON:** the literal string `"i need info"`. Don't invent prose for these fields.
- **Highlight span format (review markers, temporary):** `<span style="background-color: #ffcccc; padding: 0 2px;">…</span>` — wraps a full sentence including its trailing punctuation. Removed when content is rewritten.
- **Formatting in JSON:** 2-space indent, `ensure_ascii=False`, trailing newline. Matches existing style.
- **No CSS or class-name changes.** Recent work was content-only; this is the standing rule.
- **Brand naming:** "BalanceEQ" (one word) for the product line; "Balasana" for the parent LLC; "Balance EQ" (with space) appears in the URL only.

## Pending — waiting on Jesse

1. **Replace `"i need info"` placeholders.** Three full skeleton entries still need everything: NMN, Apigenin, Phosphatidylserine (all prose fields + studies). Four B-vitamin entries (`b1-b2-b5`, `vitamin-b6`, `vitamin-b12`, `folate`) need only `tagline`, `what_to_expect`, and `safety_note` — the rest is done.
2. **Rewrite the highlighted sentences** listed above (sleep-led Restore prose + L-Tyrosine references in B6 and timeline). Remove span wrappers as part of the rewrite.
3. **Recompute `products.focus.total_actives_mg`** for the v3.9 formula.
4. **Audit prose I didn't touch:** `products.focus.description`, `problem_statement`, `caffeine_faq`, `systems_framework`, `personas`, `timeline` (except [0]), and Restore equivalents — for any lingering v3.8 references.
5. **Decide on `supplier_links.uthever`** — add the entry when there's a URL, then set `nmn.supplier_link: "uthever"`.
6. **Optional:** keep `ingredientDatabase` in `index.html` in sync with the formula, or delete it as dead code.

## Source of truth: Shaun's red-team request

The original request file (May 2026) defined the 12 fixes and the retired-terms list. If a question comes up about *why* something was changed, the answer is usually in that file. Not checked into the repo — sits in the founder's chat with Claude.
