# UVA future PASS UI contributions

Working list of generic `eclipse-pass/pass-ui` fixes we still want to send upstream, plus what to do on `uvalib` after each one lands. UVA-only branding stays in `public/branding-overrides.css` and is not listed here as a contribution.

This file lives on the `uvalib` branch. Do not merge it to `main` or into an Eclipse PR.

## How we contribute

Remotes: `origin` = `uvalib/pass-ui`, `upstream` = `eclipse-pass/pass-ui`. `main` tracks official; `uvalib` is the UVA release branch.

1. Sync `main` with `upstream/main`.
2. Open an issue on [eclipse-pass/main](https://github.com/eclipse-pass/main/issues) (product issues live there, not on pass-ui).
3. From current `main`, create a branch named `{issueNumber}-{short-slug}` (example: `1264-wizard-steps-reflow`).
4. Implement only the generic fix. No UVA tokens, no `branding-overrides.css`.
5. Open a PR on [eclipse-pass/pass-ui](https://github.com/eclipse-pass/pass-ui) against `main`, with `Fixes eclipse-pass/main#{issueNumber}` in the body.
6. Sign the Eclipse ECA with the GitHub account that opens the PR.

Local test of a contribution branch: check it out, refresh `http://localhost:8080/app/` (Vite on `:4200`, pass-core on `:8080`). Login `superuser` / `moo`.

## After Eclipse merges a PR

1. `git fetch upstream origin`
2. Fast-forward local `main` to `upstream/main` and push `origin/main`
3. `git checkout uvalib && git merge main`
4. Remove the UVA override that duplicated the generic fix (see each item below). Keep UVA color/branding rules.
5. Push `origin/uvalib`
6. Delete the contribution branch locally and on `origin` (`git branch -d …` / `git push origin --delete …`). Safe-delete may need `-D` if Eclipse squash-merged.

---

## Open PRs (wait, then clean up)

### Heading hierarchy — eclipse-pass/main#1261 / pass-ui#1350

- Branch: `1261-fix-heading-hierarchy`
- Companion TestCafe PR: [eclipse-pass/pass-acceptance-testing#39](https://github.com/eclipse-pass/pass-acceptance-testing/pull/39)
- Already merged into `uvalib`

**uvalib cleanup after #1350 merges**

- Merge `main` into `uvalib` (heading markup/`app.css` will already be present; expect a clean merge).
- Keep UVA `h1, h2 { color: var(--uva-brand-blue) !important; }` in `branding-overrides.css`. That is branding, not the heading-order fix.
- Delete `1261-fix-heading-hierarchy` locally and on `origin`.
- Merge or close acceptance-testing #39 with the pass-ui PR.

### File upload/removal focus — eclipse-pass/main#1263 / pass-ui#1351

- Branch: `1263-keep-file-upload-focus`
- Already merged into `uvalib`

**uvalib cleanup after #1351 merges**

- Merge `main` into `uvalib`.
- No branding-overrides to remove (this was component JS/tests only).
- Delete `1263-keep-file-upload-focus` locally and on `origin`.

---

## Backlog (contribute later)

### 1. Wizard step bar clips labels at 200% zoom (F1-3 + F1-4)

Do this as **one** generic PR. Same `.steps` bar. Independent of #1350 and #1351 (no shared hunks; #1350 touches `app.css` in other places only).

UVA already works around this in `public/branding-overrides.css` (`/* Submission wizard */`). No UVA production need until we want the override gone.

| Audit | WCAG | What fails |
| --- | --- | --- |
| F1-4 Hidden Text Form Step Button | 1.4.4 Resize Text | At 200% zoom on 1280px, step labels (Basics, Grants, Repositories, …) are cut off. |
| F1-3 Active Tab Label Not Visible | 1.4.4 Resize Text | Active step uses `.btn-primary`. Extra padding/margin plus `.steps { height: 35px; overflow: hidden; }` clips the active label. |

**Where (generic `main`)**

- Markup: `app/components/submission-nav/index.gts` (each step is `<button class="step {{if active "btn-primary"}}">`)
- CSS: `app/styles/app.css`

```css
.steps {
  height: 35px;
  display: flex;
  overflow: hidden;
}
.steps .step {
  width: 15.2857%;
  font-size: 16px;
  line-height: 35px;
}
```

**Suggested generic fix (no UVA colors)**

In `app/styles/app.css`, make `.steps` wrap and grow, and isolate step buttons from global `.btn-primary` box model:

- `.steps`: `height: auto; min-height: 2.1875rem; overflow: visible; flex-wrap: wrap; align-items: center;`
- `.steps .step`: `width: auto; flex: 1 1 8rem; min-width: 0; line-height: 1.3; white-space: normal;`
- `.steps .step.btn-primary`: `margin: 0; padding` that fits the bar; `line-height: normal; display: inline-flex; align-items: center; justify-content: center;`

Leave active-step **color** to `branding.css` / `--primary-500`. Do not copy UVA navy/white into `app.css`.

**Issue title (eclipse-pass/main)**

Submission wizard step labels are clipped when text is resized

**Issue body**

```markdown
## Summary
The New Submission wizard step bar (Basics, Grants, Policies, Repositories, Details, Files, Review) clips step labels when the page is zoomed to 200% at a 1280px-wide viewport (WCAG 1.4.4). The active step can also lose its label because it uses `.btn-primary` inside a 35px `overflow: hidden` bar.

## Steps to reproduce
1. Open a new submission (Basics).
2. Set the viewport to 1280px wide and zoom to 200% (or a ~640px-wide window).
3. Observe the `.steps` bar.

## Expected
Every step label remains fully visible. Text can wrap or the bar can grow. The active step label stays visible.

## Actual
`.steps` is `height: 35px; overflow: hidden` and each `.step` is a fixed `15.2857%` width with `line-height: 35px`. Longer labels are clipped. The active step also gets `.btn-primary` padding, which is taller than the bar.

## Suggested direction
Reflow `.steps` in `app/styles/app.css` (wrap, auto height, overflow visible) and reset `.steps .btn-primary` margin/padding so institution button styles cannot clip the active label.

## WCAG
1.4.4 Resize Text (Level AA)
```

**PR title**

Allow submission wizard step labels to reflow at 200% zoom

**PR body**

```markdown
Fixes eclipse-pass/main#{N}

The wizard `.steps` bar used a fixed 35px height, `overflow: hidden`, and percentage widths, so labels clipped at 200% zoom. The active step is `.btn-primary`, whose padding could clip the label inside that bar.

This lets the bar wrap and grow, and resets step-button box model so branded `.btn-primary` styles do not clip the active label. Active-step colors still come from existing branding tokens.
```

**How to verify**

1. Branch from `main` (generic branding, not `uvalib`).
2. New submission → Basics.
3. 1280px viewport at 100% and 200% zoom, and ~320px width.
4. Confirm all seven labels are fully visible; active step (dark/primary) still shows its text.
5. Confirm inactive hover still works (`.steps .step:not(.btn-primary):hover`).

**uvalib cleanup after this merges**

In `public/branding-overrides.css`, section `/* Submission wizard */`:

- **Remove** layout duplicates that core now owns:
  - `.steps { height / overflow / flex-wrap / gap / min-height / align-items }`
  - `.steps .step { width / flex / min-width / line-height / white-space / padding }`
  - `.steps .btn-primary` margin, padding, height, line-height, display, align-items, justify-content
- **Keep** UVA look on the active step: background `--uva-brand-blue`, color `--secondary-500`, `border-radius: 0`, `font-weight: bold`, `box-shadow: none`.
- Merge `main` into `uvalib`, visual-check the wizard at 200% zoom, push `uvalib`, delete the contribution branch.

### 2. Wizard pages scroll sideways at 320px (F2-3 + F6-5)

Independent of #1350, #1351, and backlog item 1 (different CSS: `.row` / tables, not `.steps`).

UVA already works around this in `public/branding-overrides.css` (`/* Reflow (320px / 400% zoom) */`). No UVA production need until we want that override slimmed down.

| Audit | WCAG | What fails |
| --- | --- | --- |
| F2-3 Incorrect Reflow & Horizontal Scrolling | 1.4.10 Reflow | At 320px (or 1280px at 400% zoom), the **whole page** scrolls horizontally on Grants. Tables may 2D-scroll; the rest of the page must not. |
| F6-5 Incorrect Reflow & Horizontal Scrolling | 1.4.10 Reflow | Same page-wide pan on Files. Same Bootstrap `.row` plus a wide files table. |

The audit also noted the **Remove** button stretching vertically on both steps. That is UVA full-width button CSS inside a table cell, already patched locally (`table.table .btn-outline-danger { white-space: nowrap; height: auto; writing-mode: horizontal-tb; }`). Do **not** put that in the generic PR.

**Where (generic `main`)**

- Bootstrap 5: `.row > * { flex-shrink: 0; width: 100%; }` and `.row` negative gutters (the snippet in F6-5)
- Column floors in `app/styles/app.css`: `.awardnum-column { min-width: 8rem; }`, `.projectname-date-column { min-width: 14rem; }`, plus other `*-column` min-widths
- Markup: `app/components/workflow-grants/index.gts`, `app/components/submission-funding-table/index.gts`, `app/components/workflow-files/index.gts` (`<table class="table …">`)

**Suggested generic fix (no UVA colors)**

Keep data tables as tables (1.4.10 exception). Stop the **page** from scrolling sideways:

- `.row > * { min-width: 0; }` so flex items can shrink
- At a small breakpoint, `.row > * { flex-shrink: 1; }`
- Wrap / contain `table.table` in `overflow-x: auto; max-width: 100%` (and `main { overflow-x: clip; }` if still needed)
- Leave column `min-width`s on the table itself; the table scroller is the allowed 2D region

Do not copy UVA review-details stacking, files-table padding, or Remove-button `writing-mode` into `app.css`.

**Issue title (eclipse-pass/main)**

Submission wizard causes page-wide horizontal scrolling at 320px

**Issue body**

```markdown
## Summary
On New Submission → Grants and Files (and other table-heavy wizard steps), a 320px-wide viewport (WCAG 1.4.10) requires horizontal scrolling of the **whole page**. Data tables may scroll in two dimensions; surrounding layout must reflow.

## Steps to reproduce
1. Start a new submission and add at least one grant so the “Grants added to submission” table is visible.
2. Set the viewport to 320px wide (or 1280px at 400% zoom) and try to scroll the page.
3. Repeat on Files with at least one uploaded file.

## Expected
Only the data table scrolls horizontally, if needed. The header, step bar, lead text, and Back/Next stay within the viewport width.

## Actual
Bootstrap `.row > * { flex-shrink: 0; width: 100%; }` plus column `min-width`s in `app/styles/app.css` (for example `.awardnum-column`, `.projectname-date-column`) make the page wider than 320px, so the entire view scrolls sideways.

## Suggested direction
Let row children shrink (`min-width: 0` / `flex-shrink: 1`) and contain table overflow (`overflow-x: auto` on the table wrapper, not the document). Keep tables as tables.

## WCAG
1.4.10 Reflow (Level AA)
```

**PR title**

Contain table overflow so the submission wizard does not scroll the page at 320px

**PR body**

```markdown
Fixes eclipse-pass/main#{N}

At 320px the Grants and Files steps (and other table-heavy views) scrolled the whole page horizontally. 1.4.10 allows 2D scrolling for tables, not for the surrounding layout.

Row children can shrink, and `table.table` overflow is contained in a horizontal scroller. Column min-widths stay on the table. Active-step and button colors are unchanged.
```

**How to verify**

1. Branch from `main` (generic branding, not `uvalib`).
2. New submission → Grants, with at least one grant selected; Files, with at least one file.
3. 320px width and 1280px at 400% zoom.
4. Confirm `document.documentElement.scrollWidth` is not larger than the viewport (page does not pan). The grants/files table may have its own horizontal scrollbar.
5. Spot-check Submissions list tables the same way.

**uvalib cleanup after this merges**

In `public/branding-overrides.css`, section `/* Reflow (320px / 400% zoom) */`:

- **Remove** layout duplicates that core now owns:
  - `.row > * { min-width: 0; overflow-wrap }`
  - `@media (max-width: 400px)` row column / `flex-shrink: 1`
  - `main { overflow-x: clip }` if core covers it
  - `:has(> table.table)` / `table.table` overflow-x scroller rules that match the generic fix
- **Keep** UVA-only rules:
  - Remove-button `writing-mode` / `white-space` on `table.table .btn-outline-danger`
  - `.files-table` padding and add-file-link wrap
  - Review / submission-details stacked label-value tables (`#review-step-table`, `#submission-details-body`)
  - `td.awardnum-column` / `td.projectname-date-column { min-width: 0 }` if still needed on UVA
- Merge `main` into `uvalib`, check Grants and Files at 320px (page does not pan; table may), push `uvalib`, delete the contribution branch.

### 3. SurveyJS Details contrast (F5-3 + F5-4 + F5-5 + F5-6 + F5-7 + F5-8 + F5-9 + F5-10 + F5-11)

Do this as **one** generic PR. Same SurveyJS token family, plus `form-control` scoping, 3:1 Yes/No, Remove, and error edges, and dropdown icon fills. Independent of #1350, #1351, and backlog items 1–2.

UVA already covers these in `branding-overrides.css`. No UVA production need until we want those overrides slimmed down.

| Audit | WCAG | What fails |
| --- | --- | --- |
| F5-3 Failed Color Contrast - Text | 1.4.3 Contrast (Minimum) | Authors empty-state and Embargo help text on Details are SurveyJS description/placeholder copy at `rgba(0, 0, 0, 0.45)` on white (~3.36:1). Body text needs 4.5:1. |
| F5-4 Failed Color Contrast - Toggle Button Text | 1.4.3 Contrast (Minimum) | Unselected Yes/No on the Details boolean toggle is `#909090` on the light track (~3:1). Enabled-but-unselected still needs 4.5:1. |
| F5-5 Failed Color Contrast - Remove Button | 1.4.3 Contrast (Minimum) | SurveyJS “Remove” (ISSN / Authors) is `--sjs-special-red` `#e60a3e` on white (~3.94:1). Needs 4.5:1. |
| F5-6 Failed Color Contrast - Error Message | 1.4.3 Contrast (Minimum) | Required-field errors use `--sjs-special-red` `#e60a3e` on the light red wash (~3.94:1). Same token as F5-5. |
| F5-7 Failed Color Contrast - Dropdown Bar | 1.4.3 Contrast (Minimum) | Empty enabled SurveyJS dropdown looks disabled. Text is `#909090` on a `:read-only` grey wash (`#e9ecef`), ~2.69:1. The control is enabled; 4.5:1 still applies. |
| F5-8 Toggle Switch Button Background Color Contrast | 1.4.11 Non-text Contrast | Yes/No track is `#f9f9f9` on white with a faint inner shadow (~1.07:1 fill, ~1.30:1 shadow). Enabled UI needs 3:1. Do not darken the fill (that would break F5-4 label text). |
| F5-9 Failed Color Contrast - Icon Buttons | 1.4.11 Non-text Contrast | Publication Type Clear and chevron SVGs are `#909090` (~2.69:1 on the grey wash; still under 3:1 on white). Enabled UI icons need 3:1. |
| F5-10 Failed Color UI Component Contrast - Remove Button | 1.4.11 Non-text Contrast | Remove fill vs page is `rgba(230, 10, 62, 0.1)` (~1.16:1). F5-5 is the text; this is the UI boundary. Keep fill light/transparent; add a 3:1 edge. |
| F5-11 Failed Color Contrast - Error Message | 1.4.11 Non-text Contrast | Error alert fill vs page is `rgba(230, 10, 62, 0.1)` (~1.16:1). F5-6 is the text; this is the UI boundary. Keep fill light; add a 3:1 edge. |

**Where (generic `main`)**

- Addon CSS: `node_modules/survey-core/survey-core.css`
  - `.sd-question__placeholder { color: var(--sjs-font-questiondescription-color, var(--sjs-general-forecolor-light, rgba(0, 0, 0, 0.45))); }`
  - `.sd-description` uses the same token
  - `.sd-boolean__thumb, .sd-boolean__label { color: var(--sjs-font-editorfont-placeholdercolor, var(--sjs-general-forecolor-light, var(--foreground-light, #909090))); }`
  - Toggle track default: `#f9f9f9` on white, inner shadow `rgba(0, 0, 0, 0.15)` (fails 1.4.11)
  - `.sd-action--negative { color: var(--sjs-special-red, var(--red, #e60a3e)); }` hover/focus fill `rgba(230, 10, 62, 0.1)` (~1.16:1 vs page)
  - `.sd-error { color: var(--sjs-special-red, #e60a3e); background-color: var(--sjs-special-red-light, rgba(230, 10, 62, 0.1)); }`
  - `.sd-dropdown--empty:not(.sd-input--disabled) { color: var(--sjs-general-forecolor-light, #909090); }`
  - `.sd-dropdown_chevron-button-svg` / `.sd-dropdown_clean-button-svg` (`<svg class="sv-svg-icon">` with `#icon-cancel-24x24`); fill follows `#909090`
- Bootstrap: `.form-control:read-only { background-color: #e9ecef; }` matches SurveyJS’s `div.form-control` even when the dropdown is enabled
- `app/styles/app.css`: `.form-control[readonly] { background-color: #eff7fb !important; }` can also wash enabled dropdowns
- Markup: SurveyJS on `app/components/workflow-metadata/` (Details step). Authors empty: “No entries yet…”. Embargo: “The material being submitted is published under an embargo.” Yes/No boolean questions. Remove appears after adding an Author or ISSN entry. Empty dropdowns (journal, etc.) show placeholder text on a grey bar. Required-field errors use `.sd-error`.

**Suggested generic fix (no UVA colors)**

1. Set SurveyJS theme tokens in `public/branding.css` (do not copy `--uva-grey-A` or `--uva-red-B`):

```css
:root {
  --sjs-general-forecolor-light: #595959;
  --sjs-font-questiondescription-color: #595959;
  --sjs-font-editorfont-placeholdercolor: #595959;
  --sjs-special-red: #b00000;
}
```

2. Stop treating enabled SurveyJS dropdowns as disabled. Scope the grey wash to real fields, e.g. in `app.css` / branding:

```css
input.form-control:disabled,
input.form-control:read-only,
textarea.form-control:disabled,
textarea.form-control:read-only {
  background-color: #e9ecef;
}
```

Do not apply `:read-only` / `[readonly]` background to `div.form-control`. Empty enabled dropdowns should stay on a white (or default editor) background so `#595959` meets 4.5:1.

3. Give the Yes/No track a **3:1 edge**, keep the fill light (F5-4 labels still need 4.5:1):

```css
.sd-boolean {
  border: 2px solid #767676;
  box-shadow: none;
}
```

`#767676` on white is about **4.5:1** (meets 3:1 for 1.4.11).

4. Set dropdown Clear / chevron icon fill to the same 3:1+ grey (token may not paint `<use>`):

```css
.sd-dropdown_chevron-button-svg use,
.sd-dropdown_clean-button-svg use {
  fill: #595959;
}
```

5. Give Remove a **3:1 edge**, keep fill transparent (F5-5 is the text):

```css
.sd-action--negative {
  border: 2px solid #b00000;
  background-color: transparent;
}
```

`#b00000` on white is about **7:1**.

6. Give required-field errors a **3:1 edge**, keep fill light (F5-6 is the text; `--sjs-special-red` already darkens it):

```css
.sd-error {
  border: 2px solid #b00000;
}
```

Do **not** copy UVA greys, UVA’s transparent selected-label trick, UVA Remove hover `--uva-red-100`, UVA `.sd-error` 10px left bar / grey-B text, or UVA dropdown colors. Do not restyle SurveyJS layout.

**Issue title (eclipse-pass/main)**

SurveyJS Details controls fail contrast (text 4.5:1, Yes/No, Remove, errors, and dropdown icons 3:1)

**Issue body**

```markdown
## Summary
On New Submission → Details, several SurveyJS controls fail WCAG 1.4.3 (16px text, 4.5:1) and the Yes/No track fails 1.4.11 (UI component, 3:1).

- Authors empty state and Embargo description: `rgba(0, 0, 0, 0.45)` on white (~3.36:1).
- Unselected Yes/No on the boolean toggle: `#909090` on the light track (~3:1). The control is still enabled, so both faces need 4.5:1.
- Remove text (after adding Author or ISSN): `#e60a3e` on white (~3.94:1).
- Remove as a UI component: hover/focus fill `rgba(230, 10, 62, 0.1)` vs the page (~1.16:1). Needs a 3:1 edge; keep the fill light.
- Required-field error text: `#e60a3e` on the light red wash (~3.94:1). Same token as Remove.
- Required-field error alert vs the page: fill `rgba(230, 10, 62, 0.1)` (~1.16:1). Needs a 3:1 edge; keep the fill light.
- Empty enabled dropdown: `#909090` on a grey `:read-only` wash (~2.69:1). `div.form-control` matches `:read-only` even when the dropdown is enabled, so it looks disabled.
- Yes/No track fill `#f9f9f9` on white (~1.07:1) with a faint inner shadow (~1.30:1). Enabled UI needs 3:1. Keep the fill light so label text still meets 4.5:1; add a 3:1 edge instead.
- Dropdown Clear and chevron icons: `#909090` (~2.69:1 on the grey wash; still under 3:1 on white).

## Steps to reproduce
1. Open a new submission and go to Details.
2. Inspect the Authors empty-state copy (“No entries yet…”), the Embargo description, and a Yes/No toggle in both states.
3. Add an Author (or ISSN) entry and inspect the red Remove control (text and the control’s edge vs the page, including hover/focus).
4. Inspect an empty dropdown (placeholder text, background, Clear and chevron icons).
5. Leave a required field empty (or submit) and inspect the error alert (text and the box vs the page).
6. Check text contrast against the panel / toggle track / dropdown background, and UI edges (Yes/No, Remove, error) against the page.

## Expected
Description, placeholder, unselected Yes/No, Remove, error, and empty-dropdown text meet 4.5:1. Empty enabled dropdowns look enabled. Yes/No, Remove, and error alerts have a 3:1 boundary against the page. Dropdown Clear and chevron icons meet 3:1.

## Actual
`.sd-question__placeholder` and `.sd-description` use `--sjs-font-questiondescription-color` / `--sjs-general-forecolor-light`, which default to `rgba(0, 0, 0, 0.45)`. `.sd-boolean__label` uses `--sjs-font-editorfont-placeholdercolor` → `--sjs-general-forecolor-light` → `#909090`. `.sd-action--negative` uses `--sjs-special-red` → `#e60a3e` with hover fill `rgba(230, 10, 62, 0.1)`. `.sd-error` uses the same red on `rgba(230, 10, 62, 0.1)`. Empty `.sd-dropdown` uses `#909090` on Bootstrap `.form-control:read-only` `#e9ecef`. `.sd-boolean` is `#f9f9f9` on white. Dropdown icon `<use>` fill stays `#909090`.

## Suggested direction
Set those SurveyJS CSS variables in `public/branding.css` to colors that meet 4.5:1 (for example `#595959` for muted text and `#b00000` for destructive actions). Scope `:read-only` / `[readonly]` grey wash to `input` and `textarea`, not `div.form-control`. Add a 3:1 border on `.sd-boolean`, `.sd-action--negative`, and `.sd-error`; keep fills light. Set `fill` on `.sd-dropdown_chevron-button-svg use` and `.sd-dropdown_clean-button-svg use` to the same 3:1+ grey.

## WCAG
1.4.3 Contrast (Minimum) (Level AA)
1.4.11 Non-text Contrast (Level AA)
```

**PR title**

Give SurveyJS Details controls passing text and UI-component contrast

**PR body**

```markdown
Fixes eclipse-pass/main#{N}

SurveyJS defaults question descriptions and placeholders to `rgba(0, 0, 0, 0.45)` on white (~3.36:1), unselected Yes/No labels to `#909090` (~3:1), and Remove and error text to `#e60a3e` (~3.94:1). Empty enabled dropdowns also look disabled: `div.form-control` matches `:read-only` and gets a grey wash, so placeholder text is ~2.69:1. The Yes/No track is `#f9f9f9` on white (~1.07:1). Remove hover and error fills are `rgba(230, 10, 62, 0.1)` vs the page (~1.16:1). Those UI edges fail 1.4.11.

This sets `--sjs-font-questiondescription-color`, `--sjs-general-forecolor-light`, `--sjs-font-editorfont-placeholdercolor`, and `--sjs-special-red` in `branding.css` to 4.5:1 colors, scopes the disabled/readonly background to real input and textarea fields, gives `.sd-boolean`, `.sd-action--negative`, and `.sd-error` a 3:1 border while keeping fills light, and sets dropdown Clear/chevron SVG `fill` to a 3:1 grey. Layout and UVA branding are unchanged.
```

**How to verify**

1. Branch from `main` (generic branding, not `uvalib`).
2. New submission → Details.
3. Confirm Authors empty-state and Embargo description computed color is at least 4.5:1 on white.
4. Toggle a Yes/No control both ways; unselected “Yes” and “No” each meet 4.5:1 on the track; selected face stays readable; track edge vs page is at least 3:1.
5. Add an Author or ISSN row; Remove text meets 4.5:1; Remove’s edge vs the page meets 3:1 (rest and hover/focus).
6. Empty dropdown: white (or default editor) background, placeholder ≥ 4.5:1, does not look disabled. Clear and chevron icons ≥ 3:1 against that background. A truly disabled/readonly `input.form-control` still gets the grey wash.
7. Trigger a required-field error; error text meets 4.5:1; error box edge vs the page meets 3:1.
8. Spot-check other SurveyJS helper text on that step.

**uvalib cleanup after this merges**

- **Keep** `.sv-string-viewer { color: var(--uva-grey-A); }` in `branding-overrides.css` (UVA grey, not the generic token).
- **Keep** the UVA `.sd-boolean` block (UVA greys, thumb colors). Core will add a generic 3:1 edge; UVA’s more specific border/fill still wins.
- **Keep** the UVA `.sd-action--negative` block (`--uva-red-B`, hover `--uva-red-100`). Core will add a generic 3:1 edge; UVA’s more specific border/hover still wins.
- **Keep** the UVA `.sd-error` block (grey-B text, `--uva-red-100` fill, `--uva-red-B` 10px left bar).
- **Keep** UVA empty-dropdown `color: var(--uva-grey-A)` and `.sd-dropdown_*_svg use { fill: var(--uva-grey-A) }` if we still want UVA grey rather than the generic token.
- **Remove** the `input.form-control:disabled` / `:read-only` scoping block if core now owns it (duplicate of the generic fix).
- Optionally also set `--sjs-font-questiondescription-color` / `--sjs-general-forecolor-light` / `--sjs-font-editorfont-placeholdercolor` to `--uva-grey-A`, and `--sjs-special-red` to `--uva-red-B`, in the UVA `:root`.
- Merge `main` into `uvalib`, check Details Authors/Embargo, Yes/No (text + track edge), Remove (text + edge), required-field errors (text + box edge), empty dropdowns, and dropdown icons, push `uvalib`, delete the contribution branch.

### 4. SweetAlert confirm fails 4.5:1 (F6-4 + F7-5)

Independent of #1350, #1351 (1351 uses this dialog; it does not set button colors), and backlog items 1–3.

UVA already restyles `.swal2-confirm` in `branding-overrides.css`. No UVA production need until we want that override slimmed down.

| Audit | WCAG | What fails |
| --- | --- | --- |
| F6-4 Pop Up Button Contrast | 1.4.3 Contrast (Minimum) | Files “Remove file?” dialog **I Agree** is white on `#418fde` (~3.38:1). Needs 4.5:1. |
| F7-5 Form Step 7 “Next” Pop Up Button Contrast | 1.4.3 Contrast (Minimum) | Review submit dialog **Next** / **Confirm** is the same `.swal2-confirm` (white on `#418fde`). Also on Submission Details (same template). |

**Where (generic `main`)**

- `app/styles/app.css`:

```css
.swal2-confirm {
  background-color: #418fde !important;
  border-color: #418fde !important;
  color: white !important;
}
```

- Markup: SweetAlert2 confirm in `app/components/workflow-files/index.gts` (`deleteExistingFile` → “I Agree”) and `app/components/workflow-review/index.gts` (Queue `confirmButtonText: 'Next →'`, final `Confirm`). Same `.swal2-confirm` class everywhere SweetAlert confirm is shown.

**Suggested generic fix (no UVA colors)**

Use a 4.5:1 pair with white. Default `--primary-600` in `branding.css` is `#1e40af` (~8:1 with white):

```css
.swal2-confirm {
  background-color: var(--primary-600) !important;
  border-color: var(--primary-600) !important;
  color: #fff !important;
}
```

Do not copy `--uva-blue-alt-A`. If a site remaps `--primary-600` to a light color (stock sample overlay orange), that site’s confirm button would fail again; that is the sample-overlay issue in Optional (D-4), not this PR.

**Issue title (eclipse-pass/main)**

SweetAlert confirm button fails 4.5:1 contrast

**Issue body**

```markdown
## Summary
The SweetAlert confirm control is white text on `#418fde` (~3.38:1). WCAG 1.4.3 needs 4.5:1 for 16px regular text. Same class on Files → Remove → **I Agree** and Review → submit → **Next** / **Confirm**.

## Steps to reproduce
1. Open a new submission, add a file on Files, and click Remove. Inspect **I Agree**.
2. On Review, start submit and inspect **Next** / **Confirm** in the dialog.

## Expected
Confirm button text meets 4.5:1 against the button background.

## Actual
`app/styles/app.css` sets `.swal2-confirm { background-color: #418fde; color: white; }`.

## Suggested direction
Use `var(--primary-600)` (default `#1e40af`, ~8:1 with white) for the confirm background, keep white text.

## WCAG
1.4.3 Contrast (Minimum) (Level AA)
```

**PR title**

Give SweetAlert confirm button 4.5:1 contrast

**PR body**

```markdown
Fixes eclipse-pass/main#{N}

`.swal2-confirm` (Files → Remove → I Agree, Review → Next/Confirm, and other SweetAlert confirms) was white on `#418fde` (~3.38:1).

This uses `var(--primary-600)` for the confirm background (default `#1e40af`, ~8:1 with white). UVA branding is unchanged.
```

**How to verify**

1. Branch from `main` (generic branding, not `uvalib`).
2. New submission → Files → add a file → Remove → inspect **I Agree** (white on `--primary-600` / `#1e40af`, ≥ 4.5:1).
3. Review → submit → inspect **Next** / **Confirm** (same class, same contrast).

**uvalib cleanup after this merges**

- **Keep** the UVA `.swal2-confirm` block (`--uva-blue-alt-A` / `--uva-brand-blue`, white text). That is branding; core will use `--primary-600`, which UVA remaps to `--uva-blue-alt-A`, so the override may become redundant. Keep it until a visual check shows the token path is enough.
- Merge `main` into `uvalib`, check Remove-file **I Agree** and Review **Next** / **Confirm**, push `uvalib`, delete the contribution branch.

---

## Optional / low priority (not needed for UVA)

These fail on the **stock sample** `public/branding-overrides.css` that ships on `main`, or are product choices. UVA already handles them locally. Contribute only if we want the default Eclipse demo to pass.

### Sample overlay link hover fails 1.4.3 (D-4)

- Stock `main` `branding-overrides.css` sets `--primary-600: #e37108`. `a:hover` uses that token. Orange on white is ~3.1:1.
- Generic `branding.css` default `--primary-600: #1e40af` already passes.
- UVA remaps `--primary-600` to `--uva-blue-alt-A` (`#005679`) and restyles `a:hover`.
- Possible PR: change the **sample** overlay tokens to passing colors. Do not change `branding.css`.
- **uvalib cleanup:** none.

### Header/nav at small widths (D-5)

- Generic `navbar-expand-md` collapses the nav into a hamburger below 768px. Logo in `branding.css` is a fixed 110px with negative margins.
- UVA already stacks the nav, wraps the site name, and shrinks the logo in `branding-overrides.css`.
- A core PR would be a product change (always-visible stacked nav vs hamburger). Skip unless Eclipse wants that default.

---

## Local-only (do not contribute)

| Audit | Why it stays on `uvalib` |
| --- | --- |
| D-4 hover orange (UVA build) | `--primary-600` / `a:hover` already overridden. |
| D-5 header/nav reflow | Already in `branding-overrides.css`. |
| F1-2 white `h1`/`h2` | `--secondary-500: #FFFFFF` is a UVA token used as button/banner color. Headings are forced to `--uva-brand-blue`. Generic `--secondary-500` is `#374151`. |
| F1-3 / F1-4 on UVA | Already in `/* Submission wizard */` overrides; contribute the generic version via backlog item 1. |
| F2-3 / F6-5 page scroll on UVA | Already in `/* Reflow (320px / 400% zoom) */` (Grants and Files); contribute the generic page-scroll fix via backlog item 2. Remove-button vertical stretch stays UVA-only. |
| F5-3 SurveyJS placeholder on UVA | Already `.sv-string-viewer { color: var(--uva-grey-A) }`; contribute the generic token fix via backlog item 3. |
| F5-4 Yes/No toggle on UVA | Already the `.sd-boolean` block in `branding-overrides.css`; fold the generic token fix into backlog item 3. Keep the UVA toggle restyle. |
| F5-5 SurveyJS Remove on UVA | Already `.sd-action--negative` uses `--uva-red-B`; fold `--sjs-special-red` into backlog item 3. Keep the UVA Remove restyle. |
| F5-7 empty dropdown on UVA | Already white background + `--uva-grey-A` and `:read-only` scoped to input/textarea; fold into backlog item 3. Keep UVA dropdown color if desired. |
| F5-8 Yes/No track on UVA | Already 2px `--uva-grey-A` edge on a light fill; fold a generic 3:1 `.sd-boolean` border into backlog item 3. Keep the UVA toggle restyle. |
| F5-9 dropdown icons on UVA | Already `.sd-dropdown_*_svg use { fill: var(--uva-grey-A) }`; fold generic icon `fill` into backlog item 3. Keep UVA fill if desired. |
| F5-10 Remove UI edge on UVA | Already 2px `--uva-red-B` border on transparent/light fill; fold a generic `.sd-action--negative` 3:1 edge into backlog item 3. Keep the UVA Remove restyle. |
| F5-6 error text on UVA | Already `.sd-error` / `.sv-string-viewer` use `--uva-grey-B`; `--sjs-special-red` in item 3 covers generic error text. Keep the UVA error restyle. |
| F5-11 error box on UVA | Already 2px/10px `--uva-red-B` edge on `--uva-red-100`; fold a generic `.sd-error` 3:1 border into backlog item 3. Keep the UVA error restyle. |
| F6-4 / F7-5 SweetAlert confirm on UVA | Already `.swal2-confirm` uses `--uva-blue-alt-A`; contribute the generic `--primary-600` confirm via backlog item 4. Keep the UVA confirm restyle until the token path is enough. |
