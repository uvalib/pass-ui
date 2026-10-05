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

### 2. Grants (and other wizard) pages scroll sideways at 320px (F2-3)

Independent of #1350, #1351, and backlog item 1 (different CSS: `.row` / tables, not `.steps`).

UVA already works around this in `public/branding-overrides.css` (`/* Reflow (320px / 400% zoom) */`). No UVA production need until we want that override slimmed down.

| Audit | WCAG | What fails |
| --- | --- | --- |
| F2-3 Incorrect Reflow & Horizontal Scrolling | 1.4.10 Reflow | At 320px (or 1280px at 400% zoom), the **whole page** scrolls horizontally on Grants. Tables may 2D-scroll; the rest of the page must not. |

The audit also noted the **Remove** button stretching vertically. That is UVA full-width button CSS inside a table cell, already patched locally (`table.table .btn-outline-danger { white-space: nowrap; height: auto; writing-mode: horizontal-tb; }`). Do **not** put that in the generic PR.

**Where (generic `main`)**

- Bootstrap 5: `.row > * { flex-shrink: 0; width: 100%; }` (the snippet in the audit)
- Column floors in `app/styles/app.css`: `.awardnum-column { min-width: 8rem; }`, `.projectname-date-column { min-width: 14rem; }`, plus other `*-column` min-widths
- Markup: `app/components/workflow-grants/index.gts`, `app/components/submission-funding-table/index.gts` (same pattern on other list tables)

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
On New Submission → Grants (and other table-heavy wizard steps), a 320px-wide viewport (WCAG 1.4.10) requires horizontal scrolling of the **whole page**. Data tables may scroll in two dimensions; surrounding layout must reflow.

## Steps to reproduce
1. Start a new submission and add at least one grant so the “Grants added to submission” table is visible.
2. Set the viewport to 320px wide (or 1280px at 400% zoom).
3. Try to scroll.

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

At 320px the Grants step (and other table-heavy views) scrolled the whole page horizontally. 1.4.10 allows 2D scrolling for tables, not for the surrounding layout.

Row children can shrink, and `table.table` overflow is contained in a horizontal scroller. Column min-widths stay on the table. Active-step and button colors are unchanged.
```

**How to verify**

1. Branch from `main` (generic branding, not `uvalib`).
2. New submission → Grants, with at least one grant selected.
3. 320px width and 1280px at 400% zoom.
4. Confirm `document.documentElement.scrollWidth` is not larger than the viewport (page does not pan). The grants table may have its own horizontal scrollbar.
5. Spot-check Files and Submissions list tables the same way.

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
- Merge `main` into `uvalib`, check Grants at 320px (page does not pan; table may), push `uvalib`, delete the contribution branch.

### 3. SurveyJS Details helper text and Yes/No labels fail 1.4.3 (F5-3 + F5-4)

Do this as **one** generic PR. Same SurveyJS token family. Independent of #1350, #1351, and backlog items 1–2.

UVA already paints `.sv-string-viewer` and restyles `.sd-boolean` in `branding-overrides.css`. No UVA production need until we want those overrides slimmed down.

| Audit | WCAG | What fails |
| --- | --- | --- |
| F5-3 Failed Color Contrast - Text | 1.4.3 Contrast (Minimum) | Authors empty-state and Embargo help text on Details are SurveyJS description/placeholder copy at `rgba(0, 0, 0, 0.45)` on white (~3.36:1). Body text needs 4.5:1. |
| F5-4 Failed Color Contrast - Toggle Button Text | 1.4.3 Contrast (Minimum) | Unselected Yes/No on the Details boolean toggle is `#909090` on the light track (~3:1). Enabled-but-unselected still needs 4.5:1. |

**Where (generic `main`)**

- Addon CSS: `node_modules/survey-core/survey-core.css`
  - `.sd-question__placeholder { color: var(--sjs-font-questiondescription-color, var(--sjs-general-forecolor-light, rgba(0, 0, 0, 0.45))); }`
  - `.sd-description` uses the same token
  - `.sd-boolean__thumb, .sd-boolean__label { color: var(--sjs-font-editorfont-placeholdercolor, var(--sjs-general-forecolor-light, var(--foreground-light, #909090))); }`
  - Toggle track default: `#f9f9f9`
- Markup: SurveyJS on `app/components/workflow-metadata/` (Details step). Authors empty: “No entries yet…”. Embargo: “The material being submitted is published under an embargo.” Yes/No boolean questions on the same step.
- Inner helper text is usually `<span class="sv-string-viewer sv-string-viewer--multiline">`

**Suggested generic fix (no UVA colors)**

Set SurveyJS theme tokens in `public/branding.css` so descriptions, placeholders, and unselected toggle labels pick up a 4.5:1 grey (do not copy `--uva-grey-A`):

```css
:root {
  --sjs-general-forecolor-light: #595959;
  --sjs-font-questiondescription-color: #595959;
  --sjs-font-editorfont-placeholdercolor: #595959;
}
```

`#595959` on white / `#f9f9f9` is about **7:1**. Default Yes/No track is already light, so the darker token is enough; do **not** copy UVA’s `.sd-boolean` restyle (grey edge, transparent selected label, thumb colors). Do not restyle SurveyJS layout.

**Issue title (eclipse-pass/main)**

SurveyJS helper text and Yes/No labels fail 4.5:1 contrast

**Issue body**

```markdown
## Summary
On New Submission → Details, SurveyJS helper text and unselected Yes/No labels fail WCAG 1.4.3 for 16px regular text (needs 4.5:1).

- Authors empty state and Embargo description: `rgba(0, 0, 0, 0.45)` on white (~3.36:1).
- Unselected Yes/No on the boolean toggle: `#909090` on the light track (~3:1). The control is still enabled, so both faces need 4.5:1.

## Steps to reproduce
1. Open a new submission and go to Details.
2. Inspect the Authors empty-state copy (“No entries yet…”), the Embargo description, and a Yes/No toggle in both states.
3. Check contrast of that text against the panel / toggle track.

## Expected
Description, placeholder, and unselected Yes/No text meet 4.5:1 against their backgrounds.

## Actual
`.sd-question__placeholder` and `.sd-description` use `--sjs-font-questiondescription-color` / `--sjs-general-forecolor-light`, which default to `rgba(0, 0, 0, 0.45)`. `.sd-boolean__label` uses `--sjs-font-editorfont-placeholdercolor` → `--sjs-general-forecolor-light` → `#909090`.

## Suggested direction
Set those SurveyJS CSS variables in `public/branding.css` to a grey that meets 4.5:1 (for example `#595959`). The default toggle track is already light (`#f9f9f9`); no layout change required.

## WCAG
1.4.3 Contrast (Minimum) (Level AA)
```

**PR title**

Give SurveyJS helper text and Yes/No labels 4.5:1 contrast

**PR body**

```markdown
Fixes eclipse-pass/main#{N}

SurveyJS defaults question descriptions and placeholders to `rgba(0, 0, 0, 0.45)` on white (~3.36:1), and unselected Yes/No labels to `#909090` (~3:1). Details-step helper text and boolean toggles failed 1.4.3.

This sets `--sjs-font-questiondescription-color`, `--sjs-general-forecolor-light`, and `--sjs-font-editorfont-placeholdercolor` in `branding.css` to a 4.5:1 grey. Layout and UVA branding are unchanged.
```

**How to verify**

1. Branch from `main` (generic branding, not `uvalib`).
2. New submission → Details.
3. Confirm Authors empty-state and Embargo description computed color is at least 4.5:1 on white.
4. Toggle a Yes/No control both ways; unselected “Yes” and “No” each meet 4.5:1 on the track; selected face stays readable.
5. Spot-check other SurveyJS helper text on that step (not error text).

**uvalib cleanup after this merges**

- **Keep** `.sv-string-viewer { color: var(--uva-grey-A); }` in `branding-overrides.css` (UVA grey, not the generic token).
- **Keep** the UVA `.sd-boolean` block (light track, grey edge, thumb colors). That is branding; the generic PR only sets tokens.
- Optionally also set `--sjs-font-questiondescription-color` / `--sjs-general-forecolor-light` / `--sjs-font-editorfont-placeholdercolor` to `--uva-grey-A` in the UVA `:root`.
- Merge `main` into `uvalib`, check Details Authors/Embargo and Yes/No contrast, push `uvalib`, delete the contribution branch.

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
| F2-3 page scroll on UVA | Already in `/* Reflow (320px / 400% zoom) */`; contribute the generic page-scroll fix via backlog item 2. Remove-button vertical stretch stays UVA-only. |
| F5-3 SurveyJS placeholder on UVA | Already `.sv-string-viewer { color: var(--uva-grey-A) }`; contribute the generic token fix via backlog item 3. |
| F5-4 Yes/No toggle on UVA | Already the `.sd-boolean` block in `branding-overrides.css`; fold the generic token fix into backlog item 3. Keep the UVA toggle restyle. |
