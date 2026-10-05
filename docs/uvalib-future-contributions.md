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
