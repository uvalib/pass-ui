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

Work **Do first** items before the numbered CSS items. They are still broken on `uvalib` (markup/JS, not branding-overrides). Merge each contribution branch into `uvalib` as soon as it exists; do not wait for Eclipse to merge.

### Do first: Empty table headers (F2-2 + F7-4)

**Priority: highest.** Still fails on `uvalib`. Independent of #1350, #1351, F2-4, F7-1, F7-3 (row headers on Review/Details key-value tables), and numbered items 1–6 (different files: table `<th>` text only). Same Grants step as F2-4 (Available grants Select column). Details files empty `<th>` is the column header only; F7-1 names the icon in that cell. Keep them as separate PRs.

| Audit | WCAG | What fails |
| --- | --- | --- |
| F2-2 Missing Table Header Text | 1.3.1 Info and Relationships | “Grants added to submission” third column (Remove) is `<th></th>`. Assistive tech needs header text. |
| F7-4 Submissions Detail Page: Missing Header Text | 1.3.1 Info and Relationships | Details files table first column is `<th scope="col"></th>`. Review already has “File Type”. |

F7-4 is that Details files first column (`<th scope="col"></th>` for the file-type icon). Files wizard already has `<th>Action</th>`. Review files table already has `<th>File Type</th>`. Icon accessible names in that column are F7-1.

**Where (generic `main` / `uvalib`)**

- `app/components/submission-funding-table/index.gts`:

```html
<th>Award Number</th>
<th>Project name (funding period)</th>
<th></th>
```

- `app/templates/submissions/detail.gts` files table: first `<th scope="col"></th>` (icon column)

**Suggested generic fix**

Put a real header on the Remove column (visible is best; `.visually-hidden` only if product wants no extra chrome):

```html
<th>Remove</th>
```

For the Details icon column, match Review: `File Type`, or `<th><span class="visually-hidden">File type</span></th>`.

No UVA tokens. No `branding-overrides.css`.

**Issue title (eclipse-pass/main)**

Grants-added Remove column and Details files File Type header are empty

**Issue body**

```markdown
## Summary
On New Submission → Grants, the “Grants added to submission” table’s third column (Remove) has `<th></th>`. WCAG 1.3.1 requires table header text for that structural column. The same empty first header appears on Submission Details files (icon column).

## Steps to reproduce
1. Start a new submission, add at least one grant, stay on Grants.
2. Inspect the header row of “Grants added to submission”.
3. Open Submission Details for a submission with files and inspect the files table headers.

## Expected
Every column has header text (visible or visually hidden). Remove column is announced as Remove (or Actions).

## Actual
`app/components/submission-funding-table/index.gts` has `<th></th>` over the Remove buttons. `app/templates/submissions/detail.gts` has `<th scope="col"></th>` over the file-type icons.

## Suggested direction
Use `<th>Remove</th>` on the grants-added table. Label the Details icon column `File Type` (as Review already does) or a visually hidden equivalent.

## WCAG
1.3.1 Info and Relationships (Level A)
```

**PR title**

Add header text to grants-added Remove column and Details file-type column

**PR body**

```markdown
Fixes eclipse-pass/main#{N}

The grants-added table had an empty `<th>` over Remove. Submission Details files had an empty `<th>` over the icon column. Screen readers need that header text (1.3.1).

This sets the grants-added header to “Remove” and the Details icon header to “File Type”.
```

**How to verify**

1. Branch from `main` (or land on `uvalib` immediately after).
2. Grants step with at least one grant: third header reads Remove; column still aligns with Remove buttons.
3. Submission Details with files: first header is File Type (or visually hidden equivalent); icons still in that column.
4. Files wizard and Review file tables unchanged (already labeled).

**uvalib cleanup after this merges**

- Merge `main` into `uvalib` if the branch was not already merged there. Expect a clean merge (no branding-overrides).
- No CSS to remove.
- Delete the contribution branch locally and on `origin`.

### Do first: Available grants Select checkboxes (F2-4)

**Priority: highest** (same Grants step as F2-2; do after empty headers or in parallel). Still fails on `uvalib`. Independent of #1350, #1351, F2-2, F1-10/F1-11, F1-6, and numbered items 1–6. Markup/JS only; cannot be done in `branding-overrides.css`.

The Ember 6 upgrade wrapped the Font Awesome square in `<button type="button" class="grant-select-btn">`, so the control is keyboard-reachable. The SVG is still `role="img"` `aria-hidden="true"` `focusable="false"`. The button has no accessible name and no checked/pressed state. Focus styles are stripped (`border: none; background: none`).

| Audit | WCAG | What fails |
| --- | --- | --- |
| F2-4 Checkboxes Not Functional | 4.1.2 Name, Role, Value; 1.3.1 Info and Relationships; 2.1.1 Keyboard; 2.4.7 Focus Visible | Available grants Select column. Icon-only button; selected vs unselected is a hidden SVG (`square` / `square-check`). Assistive tech hears an unnamed button with no state. |

**Where (generic `main` / `uvalib`)**

- `app/components/workflow-grants/index.gts` — Select cell:

```gts
<button type='button' class='grant-select-btn' {{on 'click' (fn this.toggleGrantFromButton grant)}}>
  {{#if (includes this._selectedGrants grant)}}
    <FaIcon @icon='square-check' @prefix='far' />
  {{else}}
    <FaIcon @icon='square' @prefix='far' />
  {{/if}}
</button>
```

- Row click `{{on 'click' (fn this.toggleGrant grant)}}` on `<tr>` (mouse convenience; `toggleGrantFromButton` already `stopPropagation`)
- `app/styles/app.css` — `#grants-selection-table .grant-select-btn` (no border/background/padding)
- Tests: `tests/integration/components/workflow-grants-test.ts` still asserts `.svg-inline--fa.fa-square` / `.fa-square-check`

**Suggested generic fix**

Use a real checkbox labelled with the award number. Keep `stopPropagation` so row click does not double-toggle.

```gts
<label>
  <input
    type='checkbox'
    checked={{includes this._selectedGrants grant}}
    {{on 'click' (fn this.toggleGrantFromButton grant)}}
  />
  <span class='visually-hidden'>Select {{grant.awardNumber}}</span>
</label>
```

Native checkbox supplies role, checked state, keyboard, and a focus ring (2.4.7). Drop the FaIcon pair and `grant-select-btn` if unused. Update the integration tests to assert `input[type="checkbox"]` checked/unchecked instead of Font Awesome classes. No UVA tokens. No `branding-overrides.css`.

**Issue title (eclipse-pass/main)**

Grant selection controls are unnamed icon buttons with no checked state

**Issue body**

```markdown
## Summary
On New Submission → Grants, Available grants “Select” is a Font Awesome square inside `<button class="grant-select-btn">`. The SVG is `role="img"` `aria-hidden="true"` `focusable="false"`. The button has no accessible name and no `aria-checked` / `aria-pressed`. Screen readers hear an unnamed button; selected vs unselected is not exposed. WCAG 4.1.2 / 1.3.1 / 2.1.1 / 2.4.7.

## Steps to reproduce
1. Start a new submission for a submitter who has grants (or proxy as that person).
2. Open Grants. Inspect a Select control in Available grants.
3. Tab to it. Toggle it. Check the accessible name and checked/pressed state.

## Expected
Each grant has a checkbox (or equivalent) named for that grant, with a programmatic checked state, keyboard access, and a visible focus indicator.

## Actual
`workflow-grants` renders an unnamed `grant-select-btn` wrapping `FaIcon` `square` / `square-check`. `#grants-selection-table .grant-select-btn` removes border and background (no custom focus ring).

## Suggested direction
Replace the icon button with `<input type="checkbox">` labelled “Select {awardNumber}” (visually hidden text is fine). Keep click `stopPropagation` so the row handler does not double-toggle. Update `workflow-grants-test` away from `.fa-square` / `.fa-square-check`.

## WCAG
4.1.2 Name, Role, Value (Level A)
1.3.1 Info and Relationships (Level A)
2.1.1 Keyboard (Level A)
2.4.7 Focus Visible (Level AA)
```

**PR title**

Use labeled checkboxes to select grants in the submission wizard

**PR body**

```markdown
Fixes eclipse-pass/main#{N}

Available grants Select used an unnamed icon button (hidden Font Awesome square / square-check) with no checked state (4.1.2, 1.3.1).

This replaces it with a native checkbox labelled “Select {awardNumber}”, keeps row-click from double-toggling, and updates the workflow-grants tests.
```

**How to verify**

1. Branch from `main` (or land on `uvalib` immediately after).
2. Grants step with grants listed: each Select control is a checkbox named “Select {award number}”.
3. Tab to a checkbox: visible focus ring; Space toggles; row is added/removed from “Grants added to submission”.
4. Screen reader / a11y tree: role checkbox, name includes the award number, checked state updates.
5. Clicking the row still toggles once (no double-toggle).
6. Integration tests pass without `.fa-square` / `.fa-square-check`.

**uvalib cleanup after this merges**

- Merge `main` into `uvalib` if the branch was not already merged there. Expect a clean merge (no branding-overrides).
- No CSS to remove from `branding-overrides.css`.
- Delete the contribution branch locally and on `origin`.

### Do first: File type icon accessible name (F7-1)

**Priority: high** (after empty table headers and grant select checkboxes). Still fails on `uvalib`. Independent of #1350, #1351, F2-2, F2-4, F7-9, F1-10/F1-11, F1-6, and numbered items 1–6. Markup only; cannot be done in `branding-overrides.css`.

The icon is the only mime-type cue besides the filename. The adjacent Type / Manuscript/Supplement column is `fileRole`, not PDF vs Word vs image. Review already has a File Type header (F2-2 still needed for the empty Details `<th>`).

| Audit | WCAG | What fails |
| --- | --- | --- |
| F7-1 File Type Icon Accessible Name | 1.1.1 Non-text Content | Review and Submission Details files tables. File-type Font Awesome icons (`fa-file-pdf`, `fa-file-image`, `fa-file-word`, `fa-file-powerpoint`, `fa-file`) have no accessible name. FA renders `aria-hidden="true"`. |

**Where (generic `main` / `uvalib`)**

Same `if` chain in both:

- `app/components/workflow-review/index.gts` (Review files table; header already “File Type”)
- `app/templates/submissions/detail.gts` (Details files table; empty header is F2-2)

```html
<i class='fas fa-file-pdf line-height-35 text-gray fa-30'></i>
```

**Suggested generic fix**

Keep the decorative SVG hidden and put the format in visually hidden text. A small shared component avoids the duplicated `if` chain.

```html
<i class='fas fa-file-pdf line-height-35 text-gray fa-30' aria-hidden='true'></i>
<span class='visually-hidden'>PDF</span>
```

Map: `png` → Image, PowerPoint mime → PowerPoint, `msword` → Word, `pdf` → PDF, else → File. No UVA tokens. No `branding-overrides.css`.

**Issue title (eclipse-pass/main)**

File type icons on Review and Submission Details have no accessible name

**Issue body**

```markdown
## Summary
On New Submission → Review and on Submission Details, the files table uses Font Awesome file-type icons (PDF, image, Word, PowerPoint, generic file) with no accessible name. Font Awesome renders `aria-hidden="true"`. The Type / Manuscript/Supplement column is `fileRole`, not mime type, so the icon is the only format cue besides the filename. WCAG 1.1.1.

## Steps to reproduce
1. Open Review for a submission with files, or Submission Details for a submission that originated in PASS.
2. Inspect the first cell of a files-table row (the icon).
3. Check the accessible name (screen reader or computed name).

## Expected
Each icon is named for its format (PDF, Image, Word, PowerPoint, or File).

## Actual
`workflow-review` and `submissions/detail` render `<i class="fa-file-…">` with no `aria-label` and no visually hidden text.

## Suggested direction
Keep `aria-hidden` on the SVG and add visually hidden text (`PDF`, `Image`, `Word`, `PowerPoint`, `File`). A small shared component can replace the duplicated mime-type `if` chain.

## WCAG
1.1.1 Non-text Content (Level A)
```

**PR title**

Give file type icons an accessible name on Review and Submission Details

**PR body**

```markdown
Fixes eclipse-pass/main#{N}

File type icons on Review and Submission Details were Font Awesome SVGs with no accessible name (1.1.1). The Type column is manuscript vs supplement, not mime type.

This adds visually hidden format text (PDF, Image, Word, PowerPoint, File) next to each icon.
```

**How to verify**

1. Branch from `main` (or land on `uvalib` immediately after).
2. Review with at least one file: first column still shows the icon; accessible name is the format (e.g. PDF).
3. Submission Details for a PASS-origin submission with files: same.
4. Type / Manuscript/Supplement column unchanged (`fileRole`).
5. F2-2 Details empty `<th>` is unchanged unless that PR already landed.

**uvalib cleanup after this merges**

- Merge `main` into `uvalib` if the branch was not already merged there. Expect a clean merge (no branding-overrides).
- No CSS to remove.
- Delete the contribution branch locally and on `origin`.

### Do first: Review and Details row headers (F7-3)

**Priority: high** (after empty table headers, grant select checkboxes, and file type icons). Still fails on `uvalib`. Independent of #1350, #1351, F2-2 (empty **column** headers on files / grants-added tables), F2-4, F7-1, F7-2 (already h1→h2), numbered items 1–6, and the Optional Review/Details `<b>` label/value lists. Markup only; cannot be done in `branding-overrides.css`. Same Review/Details key-value pattern as **one** PR.

Left-hand labels (Repositories, Grants, Details, Files, …) are `<td>` (Details wraps them in `<strong>`). Assistive tech does not get row headers. Nested files tables already use `<th scope="col">`. Inner `<b>Label</b> : value` lists (`display-metadata-keys`, grant award/funder) are a separate Optional item.

| Audit | WCAG | What fails |
| --- | --- | --- |
| F7-3 Inaccurate Table Tags and Missing Scope | 1.3.1 Info and Relationships | `#review-step-table` and Submission Details key-value table. First column is `<td>`, not `<th scope="row">`. |

**Where (generic `main` / `uvalib`)**

- `app/components/workflow-review/index.gts` — `#review-step-table` rows (Repositories, Grants, Details, Files; plus `external-repo-review` first cell)
- `app/templates/submissions/detail.gts` — bordered key-value table (Submission status, Grants, Repositories, Submitter, Preparer(s), External Submission, Details, Files)

**Suggested generic fix**

```gts
<th scope='row' class='max-width'>
  Repositories
</th>
```

Same for every left-hand label. Keep visible text. `<strong>` on Details is optional once the cell is a `th`. No UVA tokens.

**Issue title (eclipse-pass/main)**

Review and Submission Details key-value tables lack row headers

**Issue body**

```markdown
## Summary
On Review (`#review-step-table`) and Submission Details, the left-hand labels (Repositories, Grants, Details, Files, …) are `<td>`. WCAG 1.3.1 expects `<th scope="row">` so those labels are tied to the values.

## Steps to reproduce
1. Open New Submission → Review. Inspect the first cell of each row in `#review-step-table`.
2. Open Submission Details. Inspect the first cell of each key-value row.

## Expected
Each label cell is `<th scope="row">`.

## Actual
Review uses `<td class="max-width">Repositories</td>` (and `<td>` for Grants/Details/Files). Details uses `<td><strong>…</strong></td>`.

## Suggested direction
Replace those first cells with `<th scope="row">`. Nested files tables already have `scope="col"`.

## WCAG
1.3.1 Info and Relationships (Level A)
```

**PR title**

Use row headers on Review and Submission Details key-value tables

**PR body**

```markdown
Fixes eclipse-pass/main#{N}

Review and Submission Details used `<td>` for left-hand labels (1.3.1).

This switches those cells to `<th scope="row">`. Nested files tables are unchanged.
```

**How to verify**

1. Branch from `main` (or land on `uvalib` immediately after).
2. Review: first cell of each key-value row is a row header (Repositories, Grants, Details, Files).
3. Submission Details: same for Submission status, Grants, Repositories, Submitter, Details, Files, etc.
4. Nested files table still has column headers. F2-2 empty File Type `<th>` on Details is unchanged unless that PR already landed.

**uvalib cleanup after this merges**

- Merge `main` into `uvalib` if the branch was not already merged there. Expect a clean merge (no branding-overrides).
- No CSS to remove.
- Delete the contribution branch locally and on `origin`.

### Do first: Deposit agreement scrollable region is keyboard-operable (F7-8)

**Priority: high** (CRITICAL 2.1.1; after Review row headers). Still fails on `uvalib`. Independent of #1350, #1351, F6-2 (Swal icon `aria-hidden`), F7-3, and numbered items 1–6 (item 4 is confirm **button contrast** only). Markup/JS; cannot be done in `branding-overrides.css`.

The confirm dialog’s deposit-requirements block is `overflow: auto` and not in the tab order. Keyboard users cannot scroll the LibraOpen / JScholarship (etc.) license text.

| Audit | WCAG | What fails |
| --- | --- | --- |
| F7-8 Form Step 7: Confirmation Pop-Up Scrollable Content | 2.1.1 Keyboard | Review Swal HTML is a `div.deposit-agreement-content` (500px, overflow auto, no `tabindex`). Details uses a **disabled** `<textarea>` (also not focusable). |

**Where (generic `main` / `uvalib`)**

- `app/components/workflow-review/index.gts` — `html: \`<div class="form-control deposit-agreement-content …">${repo.agreementText}</div>\``
- `app/styles/app.css` — `.deposit-agreement-content { height: 500px; overflow: auto; }`
- `app/controllers/submissions/detail.ts` — `_categorizeRepositories`: `disabled` textarea with the same agreement text

**Suggested generic fix**

Use a **readonly** textarea (natively focusable and keyboard-scrollable), not `disabled` and not an unfocusable overflow `div`:

```html
<textarea
  class="form-control deposit-agreement-content py-4 mt-4"
  readonly
  aria-label="Deposit requirements for ${repo.name}"
>${repo.agreementText}</textarea>
```

Keep the height/overflow CSS if the textarea still needs a fixed box. Alternative: `tabindex="0"` `role="region"` `aria-label="…"` on the existing div. Same HTML for Review and Details. No UVA tokens.

**Issue title (eclipse-pass/main)**

Deposit agreement in the submit confirmation dialog cannot be scrolled with the keyboard

**Issue body**

```markdown
## Summary
On Review submit, repositories with `agreementText` (e.g. LibraOpen / JScholarship) show a 500px overflow `div.deposit-agreement-content` inside SweetAlert. It is not in the tab order, so keyboard users cannot read the full license (2.1.1). Submission Details uses a disabled textarea, which is also skipped.

## Steps to reproduce
1. Complete a submission whose repository has `agreementText`.
2. Review → submit. Tab through the confirm dialog. The agreement box is skipped; arrow keys do not scroll it.
3. Repeat from Submission Details if that flow shows the same dialog.

## Expected
The agreement region is focusable; arrow keys / Page Down scroll the text.

## Actual
Review: `<div class="deposit-agreement-content">` (`height: 500px; overflow: auto`). Details: `<textarea disabled>`.

## Suggested direction
Readonly (not disabled) textarea with an accessible name, or `tabindex="0"` + `role="region"` on the div. Share the markup between Review and Details.

## WCAG
2.1.1 Keyboard (Level A)
```

**PR title**

Make deposit-agreement text keyboard-scrollable in the submit confirmation dialog

**PR body**

```markdown
Fixes eclipse-pass/main#{N}

The submit confirmation’s agreement box was an unfocusable overflow div (Review) or a disabled textarea (Details), so keyboard users could not scroll it (2.1.1).

This uses a readonly, named textarea (or a focusable region) on both Review and Details.
```

**How to verify**

1. Branch from `main` (or land on `uvalib` immediately after).
2. Review submit with `agreementText`: Tab lands in the agreement box; arrow keys scroll; title still “Deposit requirements for {repo}”.
3. Submission Details same dialog: agreement is focusable (not `disabled`).
4. Confirm / Cancel still work. F6-2 icon and item 4 contrast are unchanged.

**uvalib cleanup after this merges**

- Merge `main` into `uvalib` if the branch was not already merged there. Expect a clean merge (no branding-overrides).
- No CSS to remove (keep `.deposit-agreement-content` height unless the PR drops it).
- Delete the contribution branch locally and on `origin`.

### Do first: Files cloud download icon accessible name (F6-1)

**Priority: high** (after empty table headers, grant select checkboxes, file type icons, and Review row headers). Still fails on `uvalib`. Independent of #1350, #1351, F2-2, F2-4, F7-1 (Review/Details file-type icons), F7-3, F7-8, F7-9/GS-10, and numbered items 1–6. Markup only; cannot be done in `branding-overrides.css`.

OA copies on Files tell the user to click a cloud icon. That icon is `aria-hidden` in the instruction paragraph. The row links are the URL plus `title="Download this manuscript"` — they do not show a cloud icon. Font Awesome renders `fa-cloud-arrow-down` (auditor SVG) from `fa-cloud-download-alt`.

| Audit | WCAG | What fails |
| --- | --- | --- |
| F6-1 Cloud Icon Accessible Name | 1.1.1 Non-text Content | Files found-manuscripts instruction. Cloud icon has no accessible name. |

**Where (generic `main` / `uvalib`)**

- `app/components/found-manuscripts/index.gts` (used from `workflow-files`)
- Tests: `tests/integration/components/found-manuscripts/component-test.ts`

```gts
Click the
<i class='fa fa-cloud-download-alt' aria-hidden='true'></i>
icon or a file name to view and download a file first.
```

**Suggested generic fix**

Either name the icon in the sentence, or stop referring to it:

```gts
Click the
<i class='fa fa-cloud-download-alt' aria-hidden='true'></i>
<span class='visually-hidden'>download</span>
icon or a file name to view and download a file first.
```

or: `Click a file name to view and download a file first.`

No UVA tokens.

**Issue title (eclipse-pass/main)**

Files OA-copy instructions reference a cloud icon with no accessible name

**Issue body**

```markdown
## Summary
On New Submission → Files, found OA copies say “Click the [cloud] icon or a file name…”. The icon is `fa-cloud-download-alt` with `aria-hidden="true"`, so the accessible sentence is “Click the icon…” (1.1.1). Row links do not include that icon.

## Steps to reproduce
1. Start a submission with a DOI that returns OA copies (or mock `oa-manuscript-service`).
2. Open Files. Inspect the cloud icon in the instruction line.

## Expected
The instruction names the download action without an unnamed image, or the icon has an accessible name (e.g. “download”).

## Actual
`found-manuscripts` renders `<i class="fa fa-cloud-download-alt" aria-hidden="true">` in the copy.

## Suggested direction
Visually hidden “download” next to the icon, or drop the icon from the sentence.

## WCAG
1.1.1 Non-text Content (Level A)
```

**PR title**

Give the Files OA-copy cloud icon an accessible name

**PR body**

```markdown
Fixes eclipse-pass/main#{N}

OA-copy instructions on Files pointed at an `aria-hidden` cloud icon (1.1.1).

This names the icon (or removes it from the sentence) so the download instruction is available without seeing the glyph.
```

**How to verify**

1. Branch from `main` (or land on `uvalib` immediately after).
2. Files with OA copies: instruction accessible name includes “download” (or no longer says “the icon”).
3. File name / URL links still open the manuscript. Upload still works.

**uvalib cleanup after this merges**

- Merge `main` into `uvalib` if the branch was not already merged there. Expect a clean merge (no branding-overrides).
- No CSS to remove.
- Delete the contribution branch locally and on `origin`.

### Do first: SweetAlert icon and dialog announcement (F6-2 + F6-8)

**Priority: high** (after empty table headers, grant select checkboxes, file type icons, and cloud download icon). Still fails on `uvalib`. Independent of #1350, #1351 (`returnFocus` only), F6-1, F7-8 (agreement scroll), F7-9/GS-10, and numbered items 1–6 (item 4 is confirm **contrast** only). JS; cannot be done in `branding-overrides.css`. Same `Swal.mixin` as **one** PR.

Files Remove uses `icon: 'warning'`. SweetAlert2 renders `<div class="swal2-icon-content">!</div>` (F6-2) and `role="dialog"` with `aria-labelledby` / `aria-describedby` correctly wired, plus `aria-live="assertive"` on the popup. Focus goes to **I Agree**. Screen readers often announce “!” and the button, not “Are you sure?” (F6-8). Auditor marked F6-8 **UNSURE** on 4.1.2 because the name attributes exist. Same `icon: 'warning'` / `'error'` on Basics, Repositories, Review, error-handler, and Delete.

| Audit | WCAG | What fails |
| --- | --- | --- |
| F6-2 Warning Icon Accessible Name | 1.1.1 Non-text Content | Warning icon accessible name is “!” — neither “Warning” nor hidden as decorative. |
| F6-8 Alert Dialog Not Announced | 4.1.2 Name, Role, Value | Files Remove. Title/description are wired; AT often does not announce them on open (focus on confirm + `!` + `aria-live` on the dialog). |

**Where (generic `main` / `uvalib`)**

- `app/components/workflow-files/index.gts` — auditor’s dialog (`title: 'Are you sure?'`, `text: 'If you delete this file…'`, `icon: 'warning'`)
- Also: `workflow-basics`, `workflow-review`, `submissions/new/{files,repositories}.ts`, `error-handler.ts`, `submission-action-cell` / detail delete
- Import: `sweetalert2/dist/sweetalert2.js` (no mixin today). CSS import in `app/app.ts`

**Suggested generic fix**

One `Swal.mixin` / `didOpen`:

1. `aria-hidden="true"` on `.swal2-icon` (F6-2). Title + text remain the name of the dialog.
2. Remove `aria-live` from `.swal2-popup` so `role="dialog"` can announce the name (F6-8).
3. Optional: `focusConfirm: false` and focus the title or the dialog.

Do not replace `!` with the word “Warning” if the title already says so. No UVA tokens. No `branding-overrides.css`.

**Issue title (eclipse-pass/main)**

SweetAlert warning icon is announced as “!” and the dialog name is skipped

**Issue body**

```markdown
## Summary
Files → Remove (and other `icon: 'warning'` / `'error'` dialogs) render SweetAlert2’s `<div class="swal2-icon-content">!</div>` (1.1.1). The popup is `role="dialog"` with `aria-labelledby` / `aria-describedby` (title “Are you sure?”, description “If you delete this file…”), but screen readers often hear only “!” and the focused confirm button (4.1.2 announcement). SweetAlert2 also sets `aria-live="assertive"` on the dialog.

## Steps to reproduce
1. New submission → Files → add a file → Remove.
2. Inspect `.swal2-icon` and whether VO/NVDA announces the dialog title on open.

## Expected
The icon is decorative. On open, AT announces the dialog name (title) and description.

## Actual
`!` is in the accessibility tree. Focus is on **I Agree**. Title is often not spoken.

## Suggested direction
`Swal.mixin` / `didOpen`: `aria-hidden` on `.swal2-icon`; drop `aria-live` from `.swal2-popup`. Optional: do not auto-focus confirm.

## WCAG
1.1.1 Non-text Content (Level A)
4.1.2 Name, Role, Value (Level A)
```

**PR title**

Hide SweetAlert icons and let dialogs announce their title

**PR body**

```markdown
Fixes eclipse-pass/main#{N}

SweetAlert warning icons exposed “!” (1.1.1), and screen readers often skipped the dialog title on open (4.1.2).

This mixin marks `.swal2-icon` decorative and removes `aria-live` from the popup so `role="dialog"` can announce the name.
```

**How to verify**

1. Branch from `main` (or land on `uvalib` immediately after).
2. Files → Remove: `.swal2-icon` is `aria-hidden`; `!` is not announced; screen reader speaks “Are you sure?” / the delete description on open.
3. Review confirm / a warning or error Swal: same.
4. Confirm/Cancel still work. Item 4 contrast is unchanged.

**uvalib cleanup after this merges**

- Merge `main` into `uvalib` if the branch was not already merged there. Expect a clean merge (no branding-overrides).
- No CSS to remove.
- Delete the contribution branch locally and on `origin`.

### Do first: Keyboard-accessible tooltips (F7-9 + GS-10 + F6-6)

**Priority: high** (after empty table headers, grant select checkboxes, file type icons, cloud download icon, and SweetAlert icon). Still fails on `uvalib`. Independent of #1350, #1351 (different hunks in `workflow-files`), F2-2, F2-4, F7-1, F6-1, F6-2/F6-8, F1-10/F1-11, F1-6, and numbered items 1–6. Markup + generic `app.css`; `branding-overrides.css` cannot put a `<span>` in the tab order.

CSS tooltips use `[tooltip]` + `content: attr(tooltip)` and show only on `[tooltip]:hover`. Hosts are unfocusable `<span>`s around `fa-info-circle` (`aria-hidden`). No `:focus` / `:focus-visible` rule.

Do this as **one** generic PR for the shared pattern. F7-9 is Details status; GS-10 is PassTable Status + Manuscript IDs (GS-10 “Status” is draft submission status, not file-upload status); F6-6 is Files Description (`tooltip-position="top"`).

| Audit | WCAG | What fails |
| --- | --- | --- |
| F7-9 Submission Detail Page: Info Icon Tooltip | 2.1.1 Keyboard | Details “Submission status” and “Deposit status”. Hover-only; not keyboard focusable. |
| GS-10 Submission Page & Grant Details Page: Info Icon Tooltip | 2.1.1 Keyboard | Manuscript IDs header and Status column (`draft` snippet) on Submissions / Grant Details. Same `[tooltip]` span. |
| F6-6 Info Icon Tooltip | 2.1.1 Keyboard | Files uploaded-files “Description” header. Same span; `tooltip-position="top"`. |

**Where (generic `main` / `uvalib`)**

- `app/styles/app.css` — `[tooltip]::before` / `::after`; reveal only `[tooltip]:hover`
- `app/components/submission-status/index.gts` — Details (F7-9 “submitted”) + PassTable status cell (GS-10 “draft”) via `submissions-status-cell`
- `app/components/submission-repo-details/index.gts` — Details “Deposit status” (auditor “n/a” snippet)
- `app/components/workflow-files/index.gts` — Description column header (F6-6)
- `app/templates/submissions/index.gts` and `app/templates/grants/detail.gts` — Manuscript IDs header (GS-10 `manuscriptIdTooltip`)
- `app/components/submissions-repoid-cell/index.gts` — JS-built `tooltip` span

**Suggested generic fix**

Make each tooltip host a `<button type="button">` (name stays the visible status / “Description” / “Manuscript IDs” text). Reveal the CSS tooltip on focus as well as hover. Expose the same string to assistive tech with `aria-describedby` (visually hidden copy of the tooltip text); CSS `content: attr(tooltip)` is not announced.

```css
[tooltip]:hover::after,
[tooltip]:hover::before,
[tooltip]:focus-visible::after,
[tooltip]:focus-visible::before {
  opacity: 1;
}
```

Keep existing `tooltip` / `tooltip-position` attributes so placement CSS still applies. Style the button as unobtrusive (no extra chrome beyond a focus ring). Update the JS-created Manuscript IDs tooltip the same way. No UVA tokens.

**Issue title (eclipse-pass/main)**

CSS tooltips on status and info icons are not keyboard accessible

**Issue body**

```markdown
## Summary
Submission Details “Submission status” and “Deposit status” use a CSS tooltip (`[tooltip]` + `content: attr(tooltip)`) that appears only on `:hover`. The host is a `<span>` around an `aria-hidden` info icon, so it is not in the tab order. Keyboard users cannot read the guidance (2.1.1). The same pattern is used on Submissions / Grant Details (Manuscript IDs + Status column; GS-10) and Files Description (F6-6).

## Steps to reproduce
1. Open Submission Details. Tab through Submission status / Deposit status. The info control is skipped.
2. Open Submissions or Grant Details. Tab past Manuscript IDs and the Status column (`draft`). Same skip.
3. Files with uploaded files: Tab past Description. Same skip.
4. Hover the icon: tooltip appears.

## Expected
The tooltip control is keyboard-focusable; the guidance appears on focus and is available to assistive tech.

## Actual
`app.css` reveals `[tooltip]` only on `:hover`. `submission-status` and `submission-repo-details` wrap the icon in an unfocusable span.

## Suggested direction
Use `<button type="button">` as the tooltip host. Add `[tooltip]:focus-visible::after` / `::before`. Add `aria-describedby` with the tooltip string (CSS generated content is not announced). Apply the same pattern to Files Description and Manuscript IDs.

## WCAG
2.1.1 Keyboard (Level A)
```

**PR title**

Make CSS tooltips keyboard-focusable and expose their text to assistive tech

**PR body**

```markdown
Fixes eclipse-pass/main#{N}

Status and info tooltips only appeared on hover from an unfocusable span (2.1.1).

This uses a button host, shows the tooltip on `:focus-visible` as well as hover, and adds `aria-describedby` for the tooltip text. Same pattern on Submission status, Deposit status, Files Description, and Manuscript IDs (F7-9 + GS-10 + F6-6).
```

**How to verify**

1. Branch from `main` (or land on `uvalib` immediately after).
2. Submission Details: Tab to Submission status and Deposit status; tooltip appears on focus; screen reader description is the tooltip string.
3. Submissions list and Grant Details: Tab to Status (`draft`) and Manuscript IDs; tooltip appears on focus.
4. Files step Description header (F6-6): Tab shows the tooltip.
5. Hover still shows the tooltip. Esc/Tab away hides it. Existing placement (left/top/bottom) still works.

**uvalib cleanup after this merges**

- Merge `main` into `uvalib` if the branch was not already merged there. Expect a clean merge (no branding-overrides).
- No CSS to remove from `branding-overrides.css`.
- Delete the contribution branch locally and on `origin`.

### Do first: Draft Delete is not a keyboard-operable control (GS-11 + GS-14 + GS-16)

**Priority: high** (after empty table headers, grant select checkboxes, file type icons, and keyboard tooltips). Still fails on `uvalib`. Independent of #1350, #1351 (Files-step **file** remove already has `aria-live`), GS-15 (table **count** live region), F2-2, F2-4, F7-1, F7-9/GS-10, F1-10/F1-11, F1-6, and numbered items 1–6. Markup only; cannot be done in `branding-overrides.css`. Same PassTable Actions Delete as **one** PR.

Draft Delete in the list tables is `<a class="… delete-button">` with `{{on 'click'}}` and no `href` (`template-lint-disable link-href-attributes`). An anchor without `href` is not in the tab order (GS-11) and has no button/link role, so screen readers announce “Delete” as static text (GS-14). After confirm, success is silent (GS-16; auditor “deleted file” = this draft **submission**). Error already uses `flashMessages.danger`. Submission Details already uses `<button type="button">` but also has no success message.

| Audit | WCAG | What fails |
| --- | --- | --- |
| GS-11 Submission Page & Grant Details Page: Delete Button | 2.1.1 Keyboard | PassTable Actions “Delete”. `<a>` without `href`; not in the tab order. |
| GS-14 Delete Button (Screen Reader) | 4.1.2 Name, Role, Value | Same control. A11y tree is static text (“Delete”), not “button” or “link”. |
| GS-16 Deleted File Confirmation | 4.1.3 Status Messages | Same Delete. No success status after the row is gone. |

**Where (generic `main` / `uvalib`)**

- `app/components/submission-action-cell/index.gts` (used by `submissions/index.gts` and `grants/detail.gts`)
- `app/controllers/submissions/detail.ts` — `deleteSubmission` (button already OK; no success flash; then `transitionTo('submissions')`)
- `app/templates/application.gts` — `.flash-message-container` (no `aria-live` today)
- Tests: `tests/integration/components/submission-action-cell-test.ts` (`a.delete-button`, `querySelectorAll('a')`)

```gts
<a
  class='btn btn-outline-danger text-danger w-100 delete-button'
  {{on 'click' (fn this.deleteSubmission @record)}}
>
  Delete
</a>
```

**Suggested generic fix**

Match Details:

```gts
<button
  type='button'
  class='btn btn-outline-danger text-danger w-100 delete-button'
  {{on 'click' (fn this.deleteSubmission @record)}}
>
  Delete
</button>
```

Drop `link-href-attributes` for this control if nothing else in the template needs it. Update tests to `button.delete-button` / `querySelectorAll('a, button.btn')` (Edit stays a `LinkTo`). Same SweetAlert confirm.

After successful `deleteSubmission`, `flashMessages.success('Draft submission deleted.')` in the action cell **and** on Details (before the transition). Put `aria-live="polite"` `aria-atomic="true"` on `.flash-message-container` so the toast is a status message. No UVA tokens. No `branding-overrides.css`.

**Issue title (eclipse-pass/main)**

Draft Delete is an unfocusable anchor and success is not announced

**Issue body**

```markdown
## Summary
On Submissions and Grant Details, draft “Delete” is `<a class="delete-button">` with a click handler and no `href`. Anchors without `href` are not in the tab order (2.1.1). The accessibility tree treats it as static text (4.1.2). After confirm, the row disappears with no success status (4.1.3). Submission Details already uses a button but also has no success message. Files-step file remove already has a live region (#1351).

## Steps to reproduce
1. Open Submissions (or Grant Details) with a draft row.
2. Tab through Actions: Edit is a link; Delete is skipped.
3. Inspect `.delete-button`: `<a>` with no `href`.

## Expected
Delete is a button, in the tab order, activatable with Enter/Space, still opening the confirm dialog. After success, a polite status message (e.g. “Draft submission deleted.”).

## Actual
`submission-action-cell` renders an href-less `<a>` (`template-lint-disable link-href-attributes`).

## Suggested direction
Use `<button type="button" class="… delete-button">`. Keep the existing click → SweetAlert flow. On success, `flashMessages.success` and `aria-live` on `.flash-message-container`. Update `submission-action-cell-test` selectors.

## WCAG
2.1.1 Keyboard (Level A)
4.1.2 Name, Role, Value (Level A)
4.1.3 Status Messages (Level AA)
```

**PR title**

Use a button for draft Delete and announce successful deletion

**PR body**

```markdown
Fixes eclipse-pass/main#{N}

Draft Delete in PassTable Actions was an `<a>` without `href` (2.1.1, 4.1.2) and success was silent (4.1.3).

This switches it to `<button type="button">`, flashes “Draft submission deleted.” on success (list and Details), and marks the flash container as a polite live region.
```

**How to verify**

1. Branch from `main` (or land on `uvalib` immediately after).
2. Submissions list, draft row: Tab reaches Delete; Enter/Space opens the confirm dialog; confirm still deletes; a success status is announced.
3. Grant Details Actions column: same.
4. Details Delete: still a button; success announced before/while returning to the list.
5. Edit remains a link. `submission-action-cell` integration tests pass.

**uvalib cleanup after this merges**

- Merge `main` into `uvalib` if the branch was not already merged there. Expect a clean merge (no branding-overrides).
- No CSS to remove.
- Delete the contribution branch locally and on `origin`.

### Do first: PassTable result count is a status message (GS-15)

**Priority: high** (after draft Delete; same PassTable). Still fails on `uvalib`. Independent of #1350, #1351, GS-11/GS-14/GS-16 (explicit “deleted” flash vs this **count**), F1-10/F1-11 (same `aria-live` idea, Search Users modal), and numbered items 1–6. Markup only; cannot be done in `branding-overrides.css`.

Search, Rows, and pagination update **Show X–Y of Z** without announcing it. There is no `aria-live`. Sort-by / `aria-sort` is obsolete: PassTable does not sort (GS-9 / GS-13 already gone).

| Audit | WCAG | What fails |
| --- | --- | --- |
| GS-15 No Status Updates | 4.1.3 Status Messages | Grants, Grant Details, Submissions. Filter / page / page-size change the count; AT is not told. Auditor also cited sort; those headers no longer exist. |

**Where (generic `main` / `uvalib`)**

- `app/components/pass-table/index.gts` — footer `<span class="input-group-text">Show {{showingStart}} - {{showingEnd}} of {{totalItemsDisplay}}</span>`
- Empty body: `<span class="nodata-placeholder">No data found</span>` (also not live)

**Suggested generic fix**

Polite, atomic live region on the existing summary (include empty state):

```gts
<span class='input-group-text' aria-live='polite' aria-atomic='true'>
  {{#if this.totalItemsDisplay}}
    Show {{this.showingStart}} - {{this.showingEnd}} of {{this.totalItemsDisplay}}
  {{else}}
    No data found
  {{/if}}
</span>
```

Do not add `aria-sort` unless sorting is brought back. Same announce pattern as F1-11 / #1351. No UVA tokens.

**Issue title (eclipse-pass/main)**

PassTable does not announce result count when search or pagination changes

**Issue body**

```markdown
## Summary
On Grants, Grant Details, and Submissions, PassTable shows “Show X–Y of Z” but does not use `aria-live`. Filtering, page size, and pagination update the count without a status message (4.1.3). Sort headers (and `aria-sort`) are gone with ember-models-table.

## Steps to reproduce
1. Open Submissions (or Grants) with several rows.
2. Type in Search or change page. The footer count updates visually.
3. Inspect: no `aria-live` / `aria-sort`.

## Expected
The result count (or “No data found”) is announced politely when it changes, without moving focus.

## Actual
`pass-table` footer is a static `<span>Show … of …</span>`.

## Suggested direction
`aria-live="polite"` `aria-atomic="true"` on that summary, including the empty state. Do not restore sort.

## WCAG
4.1.3 Status Messages (Level AA)
```

**PR title**

Announce PassTable result counts with a polite live region

**PR body**

```markdown
Fixes eclipse-pass/main#{N}

Search, page size, and pagination updated “Show X–Y of Z” without a status message (4.1.3).

This marks the existing summary as `aria-live="polite"` (including “No data found”). Sort is out of scope (PassTable does not sort).
```

**How to verify**

1. Branch from `main` (or land on `uvalib` immediately after).
2. Submissions / Grants / Grant Details: Search until the count changes — screen reader announces the new “Show … of …” (or “No data found”) without moving focus.
3. Change page or Rows: same announcement.
4. Headers remain static text (no sort).

**uvalib cleanup after this merges**

- Merge `main` into `uvalib` if the branch was not already merged there. Expect a clean merge (no branding-overrides).
- No CSS to remove.
- Delete the contribution branch locally and on `origin`.

### Do first: Header DOM order matches visual order (D-3)

**Priority: high** (after empty table headers, grant select checkboxes, file type icons, keyboard tooltips, and draft Delete). Still fails on `uvalib`. Independent of #1350, #1351, F2-2, F2-4, F7-1, F7-9/GS-10, GS-11/GS-14, GS-15, F1-10/F1-11, F1-6, and numbered items 1–6. Related to optional D-5 (small-width stacking) but a different criterion.

Visual order is logo left, product name right. DOM is product name, then logo. Tab and screen-reader order follow the DOM. CSS `flex-flow: row-reverse` / `order` cannot satisfy 1.3.2.

On `uvalib` the swap is `.navbar > .container { flex-flow: row-reverse !important; }` in `branding-overrides.css`. Stock `branding.css` has no reverse; the logo still has leftover `pull-right`.

| Audit | WCAG | What fails |
| --- | --- | --- |
| D-3 Programmatic Order of Header | 1.3.2 Meaningful Sequence; 2.4.3 Focus Order | `#brand-header`: visual F-order is logo then “Public Access Submission System”; DOM and Tab are title then logo. |

**Where (generic `main` / `uvalib`)**

- `app/templates/application.gts` — `#brand-header` inner `.container`: two `navbar-brand` title links, then the logo `<a>` / `#brand-logo` with `pull-right`
- UVA after merge: `public/branding-overrides.css` — remove `flex-flow: row-reverse` on `.navbar > .container` (keep the small-width wrap / `space-between` used for D-5)

**Suggested generic fix**

Put the logo link first when `logoUri` is set, then the product-name links. Drop `pull-right`. Use flex `space-between` (or equivalent) so visual order is logo, then title — the same as the DOM. Do not use `row-reverse` or `order`. No UVA tokens in the upstream PR. The old `<h3>` in the auditor snippet is already a `<span class="brand-header-title">`.

**Issue title (eclipse-pass/main)**

Brand header DOM order does not match visual order (logo vs product name)

**Issue body**

```markdown
## Summary
In `#brand-header`, the product name (`navbar-brand`) comes before the institution logo in the DOM, but many branded sites (and the UVA overlay via `flex-flow: row-reverse`) show the logo first. CSS reverse/`order` fails WCAG 1.3.2 / 2.4.3: Tab and screen readers follow the DOM.

## Steps to reproduce
1. Open any page with a header logo.
2. Compare left-to-right visual order with Tab order / accessibility tree.

## Expected
DOM, visual order, and Tab order are the same (logo, then product name, for the usual F-pattern).

## Actual
`application.gts` renders the title links first, then `#brand-logo` with `pull-right`.

## Suggested direction
Render the logo link first when present, then the product name. Drop `pull-right`. Lay out with flex `space-between` (no `row-reverse` / `order`).

## WCAG
1.3.2 Meaningful Sequence (Level A)
2.4.3 Focus Order (Level A)
```

**PR title**

Put the brand logo before the product name in header DOM order

**PR body**

```markdown
Fixes eclipse-pass/main#{N}

The header showed the logo first visually (or via CSS reverse) while the DOM and Tab order were product name then logo (1.3.2, 2.4.3).

This puts the logo link first when present, drops `pull-right`, and uses flex so visual order matches the DOM.
```

**How to verify**

1. Branch from `main` (or land on `uvalib` immediately after).
2. Dashboard (and any other page): logo is first in the DOM, on the left, and first in Tab order; product name is next.
3. Keyboard Tab: logo link, then “Public Access Submission System” (or “P.A.S.S.” at the stock small breakpoint).
4. No logo configured: only the product name, still first.

**uvalib cleanup after this merges**

- Merge `main` into `uvalib`.
- Remove `.navbar > .container { flex-flow: row-reverse !important; }` from `public/branding-overrides.css`. Keep the `max-width: 767.98px` wrap / `space-between` rules that stack the header (D-5).
- Confirm logo still left, title right, Tab order logo then title, at desktop and ~320–768px.
- Delete the contribution branch locally and on `origin`.

### Do first: Two navigation landmarks need distinct names (D-8)

**Priority: high** (after empty table headers, grant select checkboxes, file type icons, keyboard tooltips, draft Delete, and header DOM order). Still fails on `uvalib`. Independent of #1350, #1351, F2-2, F2-4, F7-1, F7-9/GS-10, GS-11, D-3, F1-10/F1-11, F1-6/D-7, and numbered items 1–6. Related to optional D-6 (skip link uses landmarks) but a different criterion.

The instructions banner and the site menu are both unnamed `<nav>`s. Grant pagination already has `aria-label="Grant pagination"`. CSS cannot name landmarks.

| Audit | WCAG | What fails |
| --- | --- | --- |
| D-8 Two Navigation Menus - Names | 4.1.2 Name, Role, Value | `notice-banner` (`<nav class="info-banner">`) and `nav-bar` (`<nav id="header-navbar">`) have no `aria-label` / `aria-labelledby`. |

**Where (generic `main` / `uvalib`)**

- `app/components/notice-banner/index.gts` — `<nav class="info-banner …">` (help copy + instructions / contact links)
- `app/components/nav-bar/index.gts` — `<nav id="header-navbar" …>` (Dashboard / Grants / Submissions)
- Tests: `tests/integration/components/notice-banner-test.ts` (class selectors only; no `nav` assert)

**Suggested generic fix**

The banner is not site navigation. Change it to a `<div>` (keep `class="info-banner …"`). Then there is one primary `<nav>`, which 4.1.2 allows to go unnamed. Still add `aria-label="Main"` (or `"Site"`) on `#header-navbar` so it stays distinct from Grant pagination. Do not wrap the banner in `<nav>` with a second name unless product wants two nav landmarks. No UVA tokens. No `branding-overrides.css`.

**Issue title (eclipse-pass/main)**

Instructions banner and site menu are both unnamed navigation landmarks

**Issue body**

```markdown
## Summary
The instructions banner (`<nav class="info-banner">`) and the site menu (`<nav id="header-navbar">`) are both navigation landmarks with no accessible name. WCAG 4.1.2 requires unique names when the same landmark role appears more than once. The banner is help text plus a link, not navigation.

## Steps to reproduce
1. Open Dashboard (or any page with the notice banner).
2. Inspect landmarks: two `nav`s, neither with `aria-label` / `aria-labelledby`.

## Expected
At most one unnamed primary navigation, or two navigations with distinct names. The instructions strip is not a `nav`.

## Actual
`notice-banner` and `nav-bar` both render unnamed `<nav>`. Grant pagination is already `aria-label="Grant pagination"`.

## Suggested direction
Change the banner to a `<div class="info-banner">`. Add `aria-label="Main"` on `#header-navbar`.

## WCAG
4.1.2 Name, Role, Value (Level A)
```

**PR title**

Stop using nav for the instructions banner and name the site menu

**PR body**

```markdown
Fixes eclipse-pass/main#{N}

The instructions banner and site menu were both unnamed `<nav>` landmarks (4.1.2). The banner is help copy, not navigation.

This changes the banner to a `div` and adds `aria-label="Main"` on `#header-navbar`.
```

**How to verify**

1. Branch from `main` (or land on `uvalib` immediately after).
2. Dashboard: one navigation landmark named “Main” (the Dashboard/Grants/Submissions bar). The instructions line is not a `nav`.
3. Grants wizard pagination still “Grant pagination”.
4. Notice-banner integration test still passes (hrefs).
5. Banner look unchanged (same `info-banner` classes).

**uvalib cleanup after this merges**

- Merge `main` into `uvalib` if the branch was not already merged there. Expect a clean merge (no branding-overrides).
- No CSS to remove.
- Delete the contribution branch locally and on `origin`.

### Do first: Proxy submitter labels on Basics (F1-8)

**Priority: high** (after empty table headers, grant select checkboxes, file type icons, keyboard tooltips, draft Delete, header DOM order, and unnamed navs). Still fails on `uvalib`. Independent of #1350, #1351, F2-2, F2-4, F7-1, F7-9/GS-10, GS-11, D-3, D-8, F1-10/F1-11 (same Basics step, different controls — modal name/live region vs visible labels), F1-6/D-7, numbered items 1–6, and the Optional DOI placeholder instructions. Markup only; cannot be done in `branding-overrides.css`.

Search has `aria-label="Proxy search input"` and a preceding `<p>`, not a `<label>`, and nothing says this searches **existing** PASS users. Email and name have aria-labels plus placeholders only. DOI and Title on the same step already use `<label for>`. The DOI “leave blank” placeholder is a separate Optional item.

| Audit | WCAG | What fails |
| --- | --- | --- |
| F1-8 Incomplete Label/Instructions | 3.3.2 Labels or Instructions | Proxy block on Basics. Existing-user search has no visible label. New-user email/name use placeholder-only visible labels. |

**Where (generic `main` / `uvalib`)**

- `app/components/workflow-basics/index.gts` — `#proxy-input-block` (shown when “Someone else” is selected)
- Tests use `data-test-proxy-search-input` / `data-test-proxy-submitter-email-input` (`tests/acceptance/proxy-submission-test.ts`); keep those attributes

**Suggested generic fix**

Visible labels, associated with `for`/`id`. Keep aria-labels only if they add more than the visible text (otherwise drop the redundant aria-label). Placeholders optional as examples, not as the only label.

```gts
<label for='proxy-user-search'>Search for an existing PASS user</label>
<input id='proxy-user-search' type='text' … data-test-proxy-search-input />
```

```gts
<label for='proxy-submitter-email'>Email address</label>
<input id='proxy-submitter-email' type='text' … data-test-proxy-submitter-email-input />
<label for='proxy-submitter-name'>Name</label>
<input id='proxy-submitter-name' type='text' … data-test-proxy-submitter-name-input />
```

Keep the “does not have an account with PASS” paragraph as extra instruction. No UVA tokens.

**Issue title (eclipse-pass/main)**

Proxy submitter fields on Basics lack visible labels and existing-user search instructions

**Issue body**

```markdown
## Summary
On New Submission → Basics, “Someone else” shows a search field and email/name fields. Search has only `aria-label="Proxy search input"` and a generic paragraph; it does not say this finds existing PASS users. Email and name use placeholders as the only visible labels (3.3.2). DOI and Title on the same step already have `<label for>`.

## Steps to reproduce
1. Start a new submission. Choose Someone else.
2. Inspect the search field and the email/name fields for visible `<label>`s.

## Expected
Search has a persistent visible label that it searches existing PASS users. Email and name have persistent visible labels.

## Actual
`workflow-basics` `#proxy-input-block`: search is unlabeled except aria-label; email/name are `placeholder="Email address"` / `"Name"` plus aria-labels.

## Suggested direction
Add `<label for>` on all three. Wording e.g. “Search for an existing PASS user”, “Email address”, “Name”. Keep `data-test-*` attributes.

## WCAG
3.3.2 Labels or Instructions (Level A)
```

**PR title**

Add visible labels to proxy submitter fields on Basics

**PR body**

```markdown
Fixes eclipse-pass/main#{N}

Proxy search and new-user email/name on Basics had no persistent visible labels (3.3.2). Search also did not state that it finds existing PASS users.

This adds `<label for>` on those three fields.
```

**How to verify**

1. Branch from `main` (or land on `uvalib` immediately after).
2. Basics → Someone else: search field labeled “Search for an existing PASS user” (or equivalent); email and name have visible labels that remain while typing.
3. Search still opens the modal. Email/name still notify a person without an account.
4. Proxy submission acceptance test still passes.

**uvalib cleanup after this merges**

- Merge `main` into `uvalib` if the branch was not already merged there. Expect a clean merge (no branding-overrides).
- No CSS to remove.
- Delete the contribution branch locally and on `origin`.

### Do first: Allow clearing the selected journal on Basics (F1-9)

**Priority: high** (after proxy labels; same Basics step). Still fails on `uvalib`. Independent of #1350, #1351, F1-8, F1-10/F1-11, and numbered items 1–6. Markup/JS; cannot be done in `branding-overrides.css`. Auditor marked 3.3.4 **UNSURE**; clearing journal is still undo (it changes policies/repos later). Copy on the same step says journal is optional except NIH/PMC.

`FindJournal` PowerSelect has no `@allowClear`. `selectJournal` only accepts a `JournalModel`. After a pick, the only change is another search hit. DOI-filled journal is a **disabled** input — out of scope for this PR.

| Audit | WCAG | What fails |
| --- | --- | --- |
| F1-9 Deselect Journal | 3.3.4 Error Prevention | Basics journal PowerSelect. No clear/undo once a journal is selected. |

**Where (generic `main` / `uvalib`)**

- `app/components/find-journal/index.gts` — `<PowerSelect @onChange={{this.onSelect}}>` (no `@allowClear`)
- `app/components/workflow-basics/index.gts` — `selectJournal(journal: JournalModel)` (no `null`)
- Tests: `tests/integration/components/find-journal-test.ts`

**Suggested generic fix**

```gts
<PowerSelect
  @allowClear={{true}}
  @selected={{@value}}
  @onChange={{this.onSelect}}
  …
/>
```

`onSelect` / `selectJournal` accept `JournalModel | null` and set `publication.journal = null` when cleared. No UVA tokens.

**Issue title (eclipse-pass/main)**

Selected journal on Basics cannot be cleared

**Issue body**

```markdown
## Summary
On New Submission → Basics, ember-power-select for Journal has no `@allowClear`. After choosing a journal, the user can only pick a different one, not undo (3.3.4). Copy says journal is optional except for NIH/PMC.

## Steps to reproduce
1. Basics, no DOI (searchable journal).
2. Select a journal. There is no X / clear.

## Expected
The selection can be cleared, restoring the empty/optional state.

## Actual
`find-journal` PowerSelect has no `@allowClear`. `selectJournal` does not accept `null`.

## Suggested direction
`@allowClear={{true}}`. Handle `null` in `onSelect` / `selectJournal`. Leave DOI-disabled journal as-is.

## WCAG
3.3.4 Error Prevention (Legal, Financial, Data) (Level AA)
```

**PR title**

Allow clearing the journal PowerSelect on Basics

**PR body**

```markdown
Fixes eclipse-pass/main#{N}

Basics journal select could not be cleared after a choice (3.3.4).

This enables ember-power-select `@allowClear` and sets `publication.journal` to null when cleared.
```

**How to verify**

1. Branch from `main` (or land on `uvalib` immediately after).
2. Basics, no DOI: select a journal; clear control appears; clearing empties Journal; Next still works when journal is optional.
3. NIH path: journal still required to proceed as today.
4. DOI-lookup journal remains a disabled input (not this PR).

**uvalib cleanup after this merges**

- Merge `main` into `uvalib` if the branch was not already merged there. Expect a clean merge (no branding-overrides).
- No CSS to remove.
- Delete the contribution branch locally and on `origin`.

### Do first: Search Users dialog name and search status (F1-10 + F1-11)

**Priority: high** (after empty table headers, grant select checkboxes, file type icons, keyboard tooltips, draft Delete, header DOM order, unnamed navs, proxy labels, and journal clear). Still fails on `uvalib`. Independent of #1350, #1351, F2-2, F2-4, F7-1, F7-9/GS-10, GS-11, D-3, D-8, F1-8, F1-9, and numbered items 1–6. Same modal as one PR.

The old ember-modal-dialog addon fail (no dialog role) is already fixed in generic pass-ui with native `<dialog>` + `showModal()`. Role, modal, and focus trap are in place. The dialog still has no accessible name, and search results are not announced.

| Audit | WCAG | What fails |
| --- | --- | --- |
| F1-10 Pop-Up Missing ARIA | 4.1.2 Name, Role, Value | Proxy “Search Users” modal. Role is now native `<dialog>`. Missing `aria-labelledby` / `aria-label`, so the dialog itself has no programmatic name. |
| F1-11 Search Status Not Announced | 4.1.3 Status Messages | After Search, “Results” / “No results found.” update visually only. No `aria-live` status, so screen readers hear nothing unless the user tabs into the list. |

**Where (generic `main` / `uvalib`)**

- `app/components/workflow-basics/index.gts` — `<dialog class="… user-search-modal">` (no `aria-labelledby`)
- `app/components/workflow-basics-user-search/index.gts` — `<h2>Search Users</h2>` (no `id`); `<h3>Results</h3>` plus list or `<p>No results found.</p>` (no live region)

**Suggested generic fix**

Name the dialog:

```gts
<dialog
  class='ember-modal-dialog pass-modal-translucent user-search-modal'
  aria-labelledby='user-search-title'
  {{this.showModal}}
  {{on 'close' this.toggleUserSearchModal}}
>
```

```gts
<h2 id='user-search-title'>Search Users</h2>
```

Announce results without moving focus (`aria-live="polite"`). Same pattern as file-upload status in #1351: clear the message, then set it on `next()` so a second search with the same count still announces.

Examples: “N users found.” / “No results found.” Keep focus on the Search field/button. Optional: `aria-describedby` on the dialog pointing at the help paragraph. No UVA tokens. No `branding-overrides.css`.

**Issue title (eclipse-pass/main)**

Search Users dialog has no accessible name and does not announce results

**Issue body**

```markdown
## Summary
On New Submission → Basics, the proxy Search Users pop-up is a native `<dialog>` with `showModal()` (role and modal are present) but has no accessible name (4.1.2). After Search, result count / “No results found” is not announced unless the user tabs into the dialog (4.1.3).

## Steps to reproduce
1. Start a new submission as a preparer (or enable proxy submitter search).
2. Open Search Users. Inspect the `<dialog>` for `aria-labelledby` or `aria-label`.
3. Run a search that returns results, then one that returns none, with a screen reader. Do not Tab into the results.

## Expected
The dialog is named “Search Users”. A polite status announces “N users found” or “No results found” without moving focus.

## Actual
`workflow-basics` renders `<dialog class="… user-search-modal">` with no name. `workflow-basics-user-search` has `<h2>Search Users</h2>` with no `id`, and Results / “No results found.” with no live region.

## Suggested direction
Give the `h2` an `id` and set `aria-labelledby` on the `<dialog>`. Add an `aria-live="polite"` status (clear, then set on `next()` so repeats announce). Leave focus on the search control.

## WCAG
4.1.2 Name, Role, Value (Level A)
4.1.3 Status Messages (Level AA)
```

**PR title**

Name the Search Users dialog and announce search results

**PR body**

```markdown
Fixes eclipse-pass/main#{N}

The proxy Search Users `<dialog>` had no accessible name (4.1.2). Role/modal already come from native `showModal()`. Search results also were not announced (4.1.3).

This sets `aria-labelledby` on the dialog to the “Search Users” heading, and a polite live region for “N users found” / “No results found” without moving focus.
```

**How to verify**

1. Branch from `main` (or land on `uvalib` immediately after).
2. Open Search Users from Basics. Dialog computed name is “Search Users”.
3. Search with hits: live region announces a count; focus stays on Search.
4. Search with no hits: announces “No results found.”
5. Repeat the same search: it announces again.
6. Esc/close still dismisses.

**uvalib cleanup after this merges**

- Merge `main` into `uvalib` if the branch was not already merged there. Expect a clean merge.
- No CSS to remove.
- Delete the contribution branch locally and on `origin`.

### Do first: Policies PMC radios use visible text as the name (F3-4)

**Priority: high** (after empty table headers, grant select checkboxes, file type icons, keyboard tooltips, draft Delete, header DOM order, unnamed navs, proxy labels, and Search Users). Still fails on `uvalib` for 4.1.2. Independent of #1350, #1351 (policy-card headings only), F2-2, F2-4, F7-1, F7-9/GS-10, GS-11, D-3, D-8, F1-8, F1-10/F1-11, F1-6/D-7, and numbered items 1–6. Markup only; cannot be done in `branding-overrides.css`. Same radios as **one** PR (include the 1.3.1 grouping).

Auditor: PARTIALLY SUPPORTED / MODERATE on 4.1.2 (also 2.5.3). A name exists (`aria-label`); it is developer wording and is not tied to the visible sentences. Sibling finding **Radio Group Semantic HTML** passed 1.3.1 because users can still match radios to sentences; the durable fix is semantic HTML (`<fieldset>` / `<legend>` / `<label>`), not more ARIA.

| Audit | WCAG | What fails |
| --- | --- | --- |
| F3-4 ARIA Labels for Radio Buttons | 4.1.2 Name, Role, Value | Policies non-method-A PMC radios. Visible choice text is sibling text; `aria-label` is “Workflow policies radio indicating no/a direct deposit”. |
| Radio Group Semantic HTML | 1.3.1 Info and Relationships | Same radios. Auditor passed 1.3.1. Instructional paragraph and choices are not a fieldset/legend/label group. |

**Where (generic `main` / `uvalib`)**

- `app/components/policy-card/index.gts` — `data-test-non-method-a-journal-pmc-intro` block
- Tests: `tests/integration/components/policy-card-test.ts`, `tests/acceptance/nih-submission-test.ts` (`data-test-workflow-policies-radio-*`; keep those attributes)

**Suggested generic fix**

Wrap the intro paragraph as `<legend>` on a `<fieldset>`. Wrap each option in `<label>`. Share `name="pmc-deposit-arrangement"`. Drop the aria-labels.

```gts
<fieldset>
  <legend>
    Some journals would submit your article to PMC on your behalf, for a fee. Specific arrangements would
    be required. Please indicate below whether or not you have made an arrangement with the publisher to
    have your article deposited by your journal/publisher.
  </legend>
  <label>
    <input
      type='radio'
      name='pmc-deposit-arrangement'
      checked={{not this.pmcPublisherDeposit}}
      {{on 'change' (fn this.pmcPublisherDepositToggled false)}}
      data-test-workflow-policies-radio-no-direct-deposit
    />
    I would like to submit my manuscript to PMC via the NIH Manuscript System (NIHMS) as part of this process.
  </label>
  <label>
    <input
      type='radio'
      name='pmc-deposit-arrangement'
      checked={{this.pmcPublisherDeposit}}
      {{on 'change' (fn this.pmcPublisherDepositToggled true)}}
      data-test-workflow-policies-radio-direct-deposit
    />
    I have made (or intend to make) an arrangement with the publisher to deposit my article directly to PMC
    and will not submit my article as part of this process.
  </label>
</fieldset>
```

Keep `data-test-non-method-a-journal-pmc-intro` on the alert wrapper. No UVA tokens.

**Issue title (eclipse-pass/main)**

Policies PMC radio buttons are not labeled by their visible choice text

**Issue body**

```markdown
## Summary
On New Submission → Policies, the non-method-A PMC radios use `aria-label="Workflow policies radio indicating no/a direct deposit"`. The visible sentences sit next to the inputs as loose text. Assistive tech gets the aria-label, not the choice the user sees (4.1.2; also 2.5.3). The instructional paragraph and the two radios are not a semantic group (1.3.1 best practice).

## Steps to reproduce
1. Start a submission whose journal uses PMC and is not method A.
2. Open Policies. Inspect the two radios in the info alert.

## Expected
Each radio’s accessible name is the visible sentence. The two radios are one group named by the intro text.

## Actual
`policy-card` renders `<input type="radio" aria-label="…">` plus sibling text. No `<label>`, no `name`, no `<fieldset>`.

## Suggested direction
Wrap the intro as `<legend>` on a `<fieldset>`, wrap each option in `<label>`, add `name="pmc-deposit-arrangement"`, drop the aria-labels. Keep `data-test-workflow-policies-radio-*`.

## WCAG
4.1.2 Name, Role, Value (Level A)
1.3.1 Info and Relationships (Level A)
```

**PR title**

Label Policies PMC radios with their visible choice text

**PR body**

```markdown
Fixes eclipse-pass/main#{N}

PMC deposit radios used developer aria-labels instead of the visible sentences (4.1.2) and were not a semantic group (1.3.1).

This wraps the intro in a `<fieldset>` / `<legend>`, each option in a `<label>`, groups them with `name`, and removes the aria-labels.
```

**How to verify**

1. Branch from `main` (or land on `uvalib` immediately after).
2. Policies, non-method-A PMC: each radio’s name is the full visible sentence; the group name is the intro; Tab/Space still toggles; choosing direct deposit still updates the effective policy.
3. Method-A journal: radios still hidden; success alert unchanged.
4. `policy-card` and NIH submission tests pass.

**uvalib cleanup after this merges**

- Merge `main` into `uvalib` if the branch was not already merged there. Expect a clean merge (no branding-overrides).
- No CSS to remove.
- Delete the contribution branch locally and on `origin`.

### Do first: SurveyJS Details groups and required (F5-1 + F5-2 + F5-12)

**Priority: high** (after empty table headers, grant select checkboxes, file type icons, keyboard tooltips, draft Delete, header DOM order, unnamed navs, proxy labels, Search Users, and Policies radios). Still fails on `uvalib`. Independent of #1350, #1351, F2-2, F2-4, F7-1, F7-9/GS-10, GS-11, D-3, D-8, F1-8, F1-10/F1-11, F3-4, F1-6/D-7, and numbered items 1–6 (item 3 is SurveyJS **contrast** only). Same Details SurveyJS form as **one** PR. Markup/JS; cannot be done in `branding-overrides.css`.

Authors and ISSN are SurveyJS `paneldynamic` with `role="textbox"` and an add-entry hint in the name. Required fields (auditor: `publicationDate`) get `<span class="sd-question__required-text" aria-hidden="true">*</span>`: sighted users see an unexplained star (F5-12); AT never hears it (F5-2). Required flags come from `repository.json` (e.g. jscholarship / inveniordm `publicationDate`). Basics already uses visible “(required)” on Manuscript/Article Title.

| Audit | WCAG | What fails |
| --- | --- | --- |
| F5-1 Programmatic Relationships of Groups | 1.3.1 Info and Relationships | Authors and ISSN wrappers are `role="textbox"`; name includes “Click the button below to add a new entry”. |
| F5-2 Required Status of Fields | 1.3.1 Info and Relationships | Required is visual-only / inconsistent. `publicationDate` title has `--required` but AT often hears no required state (`aria-hidden` on the `*`). |
| F5-12 Required Asterisk Label | 3.3.2 Labels or Instructions | Same `*`. No legend that the asterisk means required. |

**Where (generic `main` / `uvalib`)**

- `app/services/schema/surveyjs.json` — `authors` / `issns` paneldynamic; `publicationDate` title “Publication Date”
- `app/services/schema/repository.json` — per-repo `required` / `requiredIf` (merged in `metadata-schema.ts`)
- `app/components/metadata-form/index.gts` — `SurveyModel` render; no ARIA patch today
- Tests: `[data-test-metadata-form] div[data-name=authors]` (`nih-submission-test.ts`); keep `data-name`

**Suggested generic fix**

1. Schema: `panelAddText` / `panelRemoveText` / `noEntriesText` (e.g. “Add author”, “Remove this author”). Same for ISSN.
2. After render: paneldynamic wrappers `role="group"` labeled by the question **title** only (not the add hint). If a SurveyJS upgrade already uses `group`, skip the patch.
3. Required: `aria-required="true"` on the actual input when the question is required. Explain the mark for everyone: SurveyJS `requiredText` as `(required)` (match Basics), **or** keep `*` plus a visible legend (“Required fields are marked with *”). Do not leave an unexplained, `aria-hidden` star. Same for `requiredIf` fields once they become required.

Do not copy UVA colors.

**Issue title (eclipse-pass/main)**

SurveyJS Details sections are not groups and required is an unexplained asterisk

**Issue body**

```markdown
## Summary
On New Submission → Details, Authors and ISSN `paneldynamic` wrappers are `role="textbox"` with a name that includes “Click the button below to add a new entry” (F5-1). Required questions (e.g. Publication Date) use `<span class="sd-question__required-text" aria-hidden="true">*</span>`: no legend that * means required (F5-12 / 3.3.2), and AT often hears no required state (F5-2 / 1.3.1).

## Steps to reproduce
1. Open Details (Authors / ISSN visible). Inspect `data-name="authors"` / `issns`.
2. Open Details for a repo that requires Publication Date (jscholarship / inveniordm). Inspect the date field’s accessible name and `aria-required`.

## Expected
Repeating sections are groups named “Authors” / “ISSN Information”. Required is explained (legend or “(required)” text) and exposed with `aria-required`.

## Actual
Paneldynamic: `role="textbox"`. Required: `aria-hidden` asterisk, no legend.

## Suggested direction
Schema Add/Remove copy. After render: `role="group"` from the question title. Required: `aria-required` on the control; `requiredText` “(required)” or a visible * legend. Or upgrade SurveyJS if it already does this.

## WCAG
1.3.1 Info and Relationships (Level A)
3.3.2 Labels or Instructions (Level A)
```

**PR title**

Expose SurveyJS Details groups and required state to assistive tech

**PR body**

```markdown
Fixes eclipse-pass/main#{N}

Authors/ISSN paneldynamic used `role="textbox"` (F5-1). Required used an unexplained, `aria-hidden` asterisk (F5-2, F5-12).

This labels those sections as groups, clarifies Add/Remove copy, explains required visually, and sets `aria-required` on the control.
```

**How to verify**

1. Branch from `main` (or land on `uvalib` immediately after).
2. Details: Authors / ISSN are groups named from the title (not textboxes; name has no “Click the button below…”).
3. Required Publication Date (jscholarship/inveniordm): visible “(required)” or a * plus legend; `aria-required="true"`. Optional fields do not claim required.
4. Add author / Add ISSN still works; NIH metadata tests still pass.
5. Item 3 contrast tokens are unchanged.

**uvalib cleanup after this merges**

- Merge `main` into `uvalib` if the branch was not already merged there. Expect a clean merge (no branding-overrides).
- No CSS to remove.
- Delete the contribution branch locally and on `origin`.

### Do first: Unique document titles per route (F1-6 + D-7 + GS-12)

**Priority: high** (after empty table headers, grant select checkboxes, file type icons, keyboard tooltips, draft Delete, header DOM order, unnamed navs, proxy labels, Search Users, Policies radios, and SurveyJS groups/required). Still fails on `uvalib`. Independent of #1350, #1351, F2-2, F2-4, F7-1, F7-9/GS-10, GS-11, D-3, D-8, F1-8, F1-10/F1-11, F3-4, F5-1/F5-2/F5-12, and numbered items 1–6. Cannot be done in `branding-overrides.css`; every site currently shares a static `<title>PASS</title>`.

| Audit | WCAG | What fails |
| --- | --- | --- |
| F1-6 Non-Descriptive Page Title | 2.4.2 Page Titled | New Submission → Basics. Title stays `PASS` and does not name the form step. |
| D-7 Non-Descriptive Page Title | 2.4.2 Page Titled | Dashboard. Same static `<title>PASS</title>`. |
| GS-12 Repeated Page Title | 2.4.2 Page Titled | Grants, Grant Details, and Submissions. Same static title reused on every list/detail screen. |

`ember-page-title` is already in `package.json` (`^9.0.3`) and unused: no `{{pageTitle}}` in templates, and routes do not set `document.title`.

**Where (generic `main` / `uvalib`)**

- `index.html` — keep `<title>PASS</title>` for the first paint
- `app/templates/application.gts` — add site token
- List and detail templates: `app/templates/dashboard.gts`, `grants/index.gts`, `grants/detail.gts`, `submissions/index.gts`, `submissions/detail.gts`, `thanks.gts`, `not-found-error.gts`
- Wizard: `app/components/workflow-wrapper/index.gts` for “New Submission”; each `app/templates/submissions/new/{basics,grants,policies,repositories,metadata,files,review}.gts` for the step name

**Suggested generic fix**

Import `pageTitle` from `ember-page-title` in `.gts` files. Default stacking (`prepend`, separator `" | "`) gives `Basics | New Submission | PASS`.

```gts
import { pageTitle } from 'ember-page-title';
```

- `application.gts`: `{{pageTitle "PASS"}}` (or `"Public Access Submission System"`; match the existing `index.html` token)
- `workflow-wrapper`: `{{pageTitle "New Submission"}}`
- Each wizard step template: `{{pageTitle "Basics"}}` / `"Grants"` / `"Policies"` / `"Repositories"` / `"Details"` / `"Files"` / `"Review"` (Details is the metadata step)
- Other routes: match the visible `h1` (`Dashboard`, `Your Grants`, `Grant Details`, `Submissions`, `Submission Detail`, `Thank you!`, `404: Page not found`)

Static titles matching the heading are enough. Optional later: grant project name / article title on detail routes. No UVA tokens. No `branding-overrides.css`. Do not remove the `index.html` `<title>` (needed before the app boots).

**Issue title (eclipse-pass/main)**

Document title is always PASS and does not describe the current page

**Issue body**

```markdown
## Summary
The document title is hardcoded to `PASS` in `index.html` and never updated. WCAG 2.4.2 requires a title that describes the current page. Dashboard (D-7), New Submission → Basics (F1-6), Grants / Grant Details / Submissions (GS-12), and every other screen stay `PASS`. `ember-page-title` is already a dependency and is unused.

## Steps to reproduce
1. Open Dashboard, Grants, Submissions, and New Submission → Basics.
2. Read `document.title` / the browser tab on each screen.

## Expected
Each route has a unique, descriptive title, e.g. `Basics | New Submission | PASS`.

## Actual
`<title>PASS</title>` in `index.html`. No `{{pageTitle}}` in templates. Title stays `PASS` after client-side navigation.

## Suggested direction
Keep the initial `index.html` title. Use `ember-page-title` (`import { pageTitle } from 'ember-page-title'`) on `application` plus each route/step template. Match visible headings. Wizard: “New Submission” on `workflow-wrapper`, step name on each `submissions/new/*` template.

## WCAG
2.4.2 Page Titled (Level A)
```

**PR title**

Set unique document titles per route with ember-page-title

**PR body**

```markdown
Fixes eclipse-pass/main#{N}

The document title stayed `PASS` on every screen (2.4.2). `ember-page-title` was already a dependency and unused.

This adds `{{pageTitle}}` on the application template (site name), list/detail/thanks/404 routes (matching the visible heading), `workflow-wrapper` (“New Submission”), and each wizard step template (Basics, Grants, Policies, Repositories, Details, Files, Review).
```

**How to verify**

1. Branch from `main` (or land on `uvalib` immediately after).
2. Dashboard tab: `Dashboard | PASS` (or the site-name variant chosen in the PR).
3. Grants / Submissions lists and Grant Details / Submission Detail: titles match the `h1`.
4. New Submission → Basics: `Basics | New Submission | PASS`. Advance through Grants … Review: only the step token changes.
5. Thanks and 404: titles match those headings.
6. View-source / first paint still has `<title>PASS</title>` in `index.html`.

**uvalib cleanup after this merges**

- Merge `main` into `uvalib` if the branch was not already merged there. Expect a clean merge (no branding-overrides).
- Keep the generic `PASS` (or Public Access Submission System) suffix. Do not put UVA-only wording in the upstream PR. A later UVA-only site-name token in config is optional and separate.
- No CSS to remove.
- Delete the contribution branch locally and on `origin`.

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

### 2. Reflow at 320px: page scroll and PassTable controls (F2-3 + F6-5 + F7-6 + GS-6)

Independent of #1350, #1351, and backlog item 1 (different CSS: `.row` / tables / PassTable footer, not `.steps`).

UVA already works around this in `public/branding-overrides.css` (`/* Reflow (320px / 400% zoom) */`). No UVA production need until we want that override slimmed down.

| Audit | WCAG | What fails |
| --- | --- | --- |
| F2-3 Incorrect Reflow & Horizontal Scrolling | 1.4.10 Reflow | At 320px (or 1280px at 400% zoom), the **whole page** scrolls horizontally on Grants. Tables may 2D-scroll; the rest of the page must not. |
| F6-5 Incorrect Reflow & Horizontal Scrolling | 1.4.10 Reflow | Same page-wide pan on Files. Same Bootstrap `.row` plus a wide files table. |
| F7-6 Incorrect Reflow & Horizontal Scrolling | 1.4.10 Reflow | Same page-wide pan on Review and Submission Details (same template). Audit also saw label/value text squeezed vertical; that stacking fix stays UVA-only (`#review-step-table`, `#submission-details-body`). |
| GS-6 Overlapping Content (320px) | 1.4.10 Reflow | Grants / Grant Details / Submissions PassTable footer (`col-5` + `col-2` + `col-5`: show-range, Rows, pager) overlaps instead of stacking. |

The audit also noted the **Remove** button stretching vertically on both steps. That is UVA full-width button CSS inside a table cell, already patched locally (`table.table .btn-outline-danger { white-space: nowrap; height: auto; writing-mode: horizontal-tb; }`). Do **not** put that in the generic PR.

**Where (generic `main`)**

- Bootstrap 5: `.row > * { flex-shrink: 0; width: 100%; }` and `.row` negative gutters (the snippet in F6-5)
- Column floors in `app/styles/app.css`: `.awardnum-column { min-width: 8rem; }`, `.projectname-date-column { min-width: 14rem; }`, plus other `*-column` min-widths
- Markup: `app/components/workflow-grants/index.gts`, `app/components/submission-funding-table/index.gts`, `app/components/workflow-files/index.gts` (`<table class="table …">`), `app/components/workflow-review/index.gts` (`#review-step-table`), `app/templates/submissions/detail.gts` (`#submission-details-body`)
- PassTable footer: `app/components/pass-table/index.gts` (`.table-summary.col-5`, `.col-2` Rows, `.table-nav.col-5`); `app/styles/app.css` `.table-nav.col-5 { display: flex; justify-content: flex-end; }`

**Suggested generic fix (no UVA colors)**

Keep data tables as tables (1.4.10 exception). Stop the **page** from scrolling sideways:

- `.row > * { min-width: 0; }` so flex items can shrink
- At a small breakpoint, `.row > * { flex-shrink: 1; }`
- Wrap / contain `table.table` in `overflow-x: auto; max-width: 100%` (and `main { overflow-x: clip; }` if still needed)
- Leave column `min-width`s on the table itself; the table scroller is the allowed 2D region
- At a small breakpoint, stack PassTable footer columns full-width and wrap `.table-nav` (UVA already does this at `max-width: 575.98px`)

Do not copy UVA review-details stacking, files-table padding, or Remove-button `writing-mode` into `app.css`.

**Issue title (eclipse-pass/main)**

Layout does not reflow at 320px (page scroll and PassTable controls)

**Issue body**

```markdown
## Summary
At a 320px-wide viewport (WCAG 1.4.10):

- New Submission → Grants, Files, and Review (and Submission Details) require horizontal scrolling of the **whole page**. Data tables may scroll in two dimensions; surrounding layout must reflow.
- Grants / Submissions PassTable footer (show-range, Rows, pager: `col-5` + `col-2` + `col-5`) overlaps instead of stacking.

## Steps to reproduce
1. Start a new submission and add at least one grant so the “Grants added to submission” table is visible.
2. Set the viewport to 320px wide (or 1280px at 400% zoom) and try to scroll the page.
3. Repeat on Files with at least one uploaded file, then on Review and on an existing Submission Details page.
4. Open Grants or Submissions and inspect the table footer controls at 320px.

## Expected
Only data tables scroll horizontally, if needed. PassTable footer controls stack without overlapping.

## Actual
Bootstrap `.row > * { flex-shrink: 0; width: 100%; }` plus column `min-width`s in `app/styles/app.css` make the page wider than 320px. PassTable keeps `col-5` / `col-2` / `col-5` in one row.

## Suggested direction
Let row children shrink (`min-width: 0` / `flex-shrink: 1`) and contain table overflow (`overflow-x: auto` on the table wrapper, not the document). At a small breakpoint, stack PassTable footer columns full-width and wrap `.table-nav`. Keep data tables as tables.

## WCAG
1.4.10 Reflow (Level AA)
```

**PR title**

Reflow PassTable controls and contain table overflow at 320px

**PR body**

```markdown
Fixes eclipse-pass/main#{N}

At 320px the Grants, Files, and Review steps (and Submission Details) scrolled the whole page horizontally, and PassTable footer controls (show-range, Rows, pager) overlapped. 1.4.10 allows 2D scrolling for tables, not for the surrounding layout.

Row children can shrink, `table.table` overflow is contained in a horizontal scroller, and the PassTable footer stacks at a small breakpoint. Column min-widths stay on the table. Active-step and button colors are unchanged.
```

**How to verify**

1. Branch from `main` (generic branding, not `uvalib`).
2. New submission → Grants (at least one grant); Files (at least one file); Review; open Submission Details.
3. Grants and Submissions list pages: PassTable footer at 320px.
4. 320px width and 1280px at 400% zoom.
5. Confirm `document.documentElement.scrollWidth` is not larger than the viewport (page does not pan). Data tables may have their own horizontal scrollbar. Footer show-range, Rows, and pager stack without overlapping.

**uvalib cleanup after this merges**

In `public/branding-overrides.css`, section `/* Reflow (320px / 400% zoom) */`:

- **Remove** layout duplicates that core now owns:
  - `.row > * { min-width: 0; overflow-wrap }`
  - `@media (max-width: 400px)` row column / `flex-shrink: 1`
  - `main { overflow-x: clip }` if core covers it
  - `:has(> table.table)` / `table.table` overflow-x scroller rules that match the generic fix
  - `.table-summary.col-5` / `.col-2` / `.table-nav.col-5` stacking if core now owns it
- **Keep** UVA-only rules:
  - Remove-button `writing-mode` / `white-space` on `table.table .btn-outline-danger`
  - `.files-table` padding and add-file-link wrap
  - Review / submission-details stacked label-value tables (`#review-step-table`, `#submission-details-body`)
  - `td.awardnum-column` / `td.projectname-date-column { min-width: 0 }` if still needed on UVA
- Merge `main` into `uvalib`, check Grants, Files, Review, Submission Details, and Grants/Submissions PassTable footers at 320px (page does not pan; data tables may; Review/details still stack; footer stacks), push `uvalib`, delete the contribution branch.

### 3. SurveyJS Details contrast (F5-3 + F5-4 + F5-5 + F5-6 + F5-7 + F5-8 + F5-9 + F5-10 + F5-11)

Do this as **one** generic PR. Same SurveyJS token family, plus `form-control` scoping, 3:1 Yes/No, Remove, and error edges, and dropdown icon fills. Independent of #1350, #1351, backlog items 1–2, and Do-first F5-1/F5-2/F5-12 (groups + required; structure, not contrast).

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

Independent of #1350, #1351 (1351 uses this dialog; it does not set button colors), backlog items 1–3, Do-first F6-2/F6-8 (icon + dialog announcement, not contrast), and F7-8 (agreement region keyboard scroll).

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

### 5. Links need rest-state and keyboard-focus indicators (GS-3 + GS-4 + F3-2 + F6-3)

Independent of #1350, #1351, and backlog items 1–4.

UVA already underlines links at rest and on `:focus` / `:focus-visible` in `branding-overrides.css` (global, `.models-table-wrapper`, Files name rows, Policies “more information”). No UVA production need until we want those duplicates slimmed down.

| Audit | WCAG | What fails |
| --- | --- | --- |
| GS-4 Visible Links | 1.4.1 Use of Color | Grants / Grant Details / Submissions row links have no rest-state underline (or other non-hover cue). |
| F3-2 Link Contrast to Surrounding Text | 1.4.1 Use of Color | Policies “more information” links: same rest-state `text-decoration: none`. UVA navy vs black is ~1.55:1, so color-only fails. |
| GS-3 Focus State Indicator | 1.4.1 Use of Color | Same links get color + underline on **hover**, but not on **keyboard focus**. |
| F6-3 Missing Focus State | 1.4.1 Use of Color | Same focus gap on Files uploaded-file name links (`<a href={{file.uri}}>`). |

GS-3 also notes orange hover contrast; that is Optional **D-4** (`--primary-600` in the sample overlay), not this PR.

**Where (generic `main`)**

- `public/branding.css`:

```css
a {
  text-decoration: underline;
}
a, .btn-link {
  color: var(--primary-500);
  text-decoration: none;
}
a:hover, .btn-link:hover {
  color: var(--primary-600);
  text-decoration: underline;
}
```

The later `none` wins at rest. There is no `a:focus` / `a:focus-visible`.

**Suggested generic fix (no UVA colors)**

Keep rest-state underline (drop or override the `text-decoration: none`), and add focus next to hover:

```css
a,
.btn-link {
  color: var(--primary-500);
  text-decoration: underline;
}

a:hover,
.btn-link:hover,
a:focus,
.btn-link:focus,
a:focus-visible,
.btn-link:focus-visible {
  color: var(--primary-600);
  text-decoration: underline;
}
```

Do not copy UVA blues or the 2px `:focus-visible` outline (nice-to-have). Do not apply this hover color to PassTable `.clearFilters` / `.clearFilterIcon` (see item 6).

**Issue title (eclipse-pass/main)**

Links are not identifiable at rest or on keyboard focus

**Issue body**

```markdown
## Summary
Links are not underlined (or otherwise marked) at rest, and keyboard focus does not get the hover underline/color. WCAG 1.4.1 requires a non-color-only cue, and hover vs keyboard focus should match. Seen on Grants / Submissions tables, Policies “more information”, and Files file-name links.

## Steps to reproduce
1. Open Grants or Submissions and look at row links at rest (no hover).
2. Tab to a row link and compare to mouse hover.
3. Repeat on Policies “more information” and on Files with an uploaded file that has a URI.

## Expected
Links look like links at rest (underline). Keyboard focus uses the same underline (and hover color) as mouse hover.

## Actual
`public/branding.css` sets `a { text-decoration: underline }` then `a, .btn-link { text-decoration: none }`. Hover adds underline; there is no `a:focus` / `a:focus-visible`.

## Suggested direction
Keep rest-state underline on `a, .btn-link`. Add `a:focus` and `a:focus-visible` next to the hover rule, same `color` and `text-decoration`.

## WCAG
1.4.1 Use of Color (Level A)
```

**PR title**

Underline links at rest and on keyboard focus

**PR body**

```markdown
Fixes eclipse-pass/main#{N}

Links had `text-decoration: none` at rest and no `:focus` styles, so they only looked like links on hover (Grants/Submissions tables, Policies, Files names).

This keeps rest-state underline and adds `a:focus` / `a:focus-visible` next to `a:hover` in `branding.css`. UVA branding is unchanged.
```

**How to verify**

1. Branch from `main` (generic branding, not `uvalib`).
2. Grants, Submissions, Policies: row / “more information” links are underlined at rest.
3. Tab those links; underline/color match hover.
4. Files: Tab to an uploaded file name link; same.
5. Mouse hover still works.

**uvalib cleanup after this merges**

- **Keep** UVA `a` / `a:hover` / `a:focus` / `a:focus-visible` color (`--uva-blue-alt-A`).
- **Keep** `.models-table-wrapper` and Files-row `:focus-visible` outlines if we still want the extra 2px ring.
- Rest-state underline in core may make some UVA `text-decoration: underline` duplicates redundant; keep until a visual check.
- Merge `main` into `uvalib`, check rest + Tab on Grants/Submissions/Policies/Files links, push `uvalib`, delete the contribution branch.

### 6. PassTable clear (X) hover fails 3:1 (GS-7)

Independent of #1350, #1351, and backlog items 1–4. Related to item 5: `a:hover` / `.btn-link:hover` must **not** paint this control with `--primary-600`.

UVA already restyles `.clearFilters` / `.clearFilterIcon` hover and focus in `branding-overrides.css`. No UVA production need until we want that override slimmed down.

| Audit | WCAG | What fails |
| --- | --- | --- |
| GS-7 Active/Hover States Button Contrast | 1.4.11 Non-text Contrast | PassTable “X” (clear filters / clear column filter) hover is `--primary-600` `#e37108` on `#6c757d` (~1.48:1). Enabled UI needs 3:1. Default `--primary-600` `#1e40af` on that grey is still under 3:1. |

**Where (generic `main`)**

- Markup: `app/components/pass-table/index.gts` — `.clearFilters.btn.btn-outline-secondary.btn-link` (and `.clearFilterIcon`)
- Hover color from `public/branding.css` `a:hover, .btn-link:hover { color: var(--primary-600); }`
- Chip background: Bootstrap `#6c757d` (`.btn-secondary` / outline-secondary)

**Suggested generic fix (no UVA colors)**

Give hover/focus a 3:1 pair and turn off link underline on the X. Example (white on a darker grey):

```css
.models-table-wrapper .clearFilterIcon:hover:not(:disabled),
.models-table-wrapper .clearFilters:hover:not(:disabled),
.models-table-wrapper .clearFilterIcon:focus:not(:disabled),
.models-table-wrapper .clearFilters:focus:not(:disabled) {
  color: #fff;
  background-color: #495057;
  text-decoration: none;
}
```

`#ffffff` on `#495057` is about **8:1**. Do not copy `--uva-grey-A`. Do not use `--primary-600` here.

**Issue title (eclipse-pass/main)**

PassTable clear-filter (X) hover fails 3:1 contrast

**Issue body**

```markdown
## Summary
On Grants and Submissions, the PassTable clear-filter “X” is a `.btn-link` on a `#6c757d` chip. Hover uses `--primary-600` (sample overlay `#e37108`, ~1.48:1 on that grey). WCAG 1.4.11 needs 3:1 for an enabled UI control. Default `--primary-600` `#1e40af` on `#6c757d` also fails 3:1.

## Steps to reproduce
1. Open Grants or Submissions with a filter applied so the X is enabled.
2. Hover (and Tab-focus) the X.
3. Check icon/text contrast against the button background.

## Expected
Hover and keyboard focus meet 3:1 against the chip. The control does not look like a text link.

## Actual
`.btn-link:hover { color: var(--primary-600); }` paints the X orange or dark blue on `#6c757d`.

## Suggested direction
Style `.clearFilters` / `.clearFilterIcon` hover and focus with a 3:1 pair (for example white on `#495057`) and `text-decoration: none`. Do not use `--primary-600`.

## WCAG
1.4.11 Non-text Contrast (Level AA)
```

**PR title**

Give PassTable clear-filter (X) hover 3:1 contrast

**PR body**

```markdown
Fixes eclipse-pass/main#{N}

PassTable `.clearFilters` is a `.btn-link` on a grey chip, so `a:hover` `--primary-600` fails 1.4.11 (~1.48:1 with sample orange; dark blue on `#6c757d` also fails).

This sets hover/focus to a 3:1 pair (white on `#495057`) and removes the link underline. UVA branding is unchanged.
```

**How to verify**

1. Branch from `main` (generic branding, not `uvalib`).
2. Grants and Submissions: enable a filter, hover and Tab the X; contrast ≥ 3:1; no orange/blue link treatment.
3. Disabled X still looks disabled.

**uvalib cleanup after this merges**

- **Keep** UVA `.clearFilters` / `.clearFilterIcon` hover (`white` on `--uva-grey-A`) and `:focus-visible` outline. Core will add a generic 3:1 pair; UVA’s more specific rule still wins.
- Merge `main` into `uvalib`, hover/Tab the PassTable X, push `uvalib`, delete the contribution branch.

---

## Optional / low priority

Sample-overlay issues, product choices, or auditor “on the fence” items. Do these after Do-first markup and numbered CSS items.

### Skip to main content (D-6) — auditor on the fence

**Priority: low.** Not on the Do-first list. 2.4.1 can already pass via `<main>` + header/nav landmarks. The auditor failed a missing skip **button** but noted it could be a recommendation. D-8 (unnamed navs) is a separate Do-first item; naming or removing the extra `nav` does not add a skip link.

There is no skip link on `main` or `uvalib`. CSS cannot add one.

| Audit | WCAG | What fails |
| --- | --- | --- |
| D-6 No Skip to Main Content Button | 2.4.1 Bypass Blocks | No skip link. `application.gts` already has `<main class="container-fluid site-content">`. |

**Suggested generic fix (when we bother)**

First-focus link in `app/templates/application.gts`, visually hidden until `:focus`, `href="#main-content"`, `id="main-content"` on `<main>`. Style the focused skip control in `branding.css` (not UVA-only). Independent of #1350 / #1351.

**Issue title:** Add a skip-to-main-content link  
**PR:** skip link + `id` on `<main>`; visually hidden until keyboard focus.

**uvalib cleanup:** merge `main`; no branding-overrides to remove.

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
- Header **left/right order** (logo vs product name) is D-3, not D-5. After D-3 merges, drop `row-reverse` here; keep these stack/wrap rules.

### Review/Details `<b>` label/value pairs (1.3.1) — auditor pass / best practice

**Priority: low.** Same screens as Do-first **F7-3** (outer table row headers); different markup. Do F7-3 first. Auditor passed because the label then the value is in reading order, and still recommended a description list so the pairing is programmatic.

| Audit | WCAG | What fails |
| --- | --- | --- |
| Non-Semantic Label/Value Pairs | 1.3.1 Info and Relationships | Review Step 7 and Submission Details. `<b>` bolds “Journal Title”, “Authors”, nested “Author”, grant award/funder. No `<dt>`/`<dd>` relationship. |

**Where (generic `main` / `uvalib`)**

- `app/components/display-metadata-keys/index.gts` — `<ul>` of `<b>{{data.label}}</b>` and nested `<b>{{key}}</b> : {{val}}` (Authors / Author: name). Used from Review and Details.
- `app/components/workflow-review/index.gts` and `app/templates/submissions/detail.gts` — grant lines `<b>{{grant.awardNumber}}</b> : {{grant.projectName}}` and `<b>Funder</b> : …`
- Tests: `tests/integration/components/display-metadata-keys-test.ts`

**Suggested generic fix (when we bother)**

Rewrite `display-metadata-keys` as a `<dl>`: `<dt>` for the label, one `<dd>` per value (several `<dd>` under one `<dt>` for author arrays). Same pattern for grant award/funder lists. Do not use `<label>` (not a form control). Independent of F7-3 (`<th scope="row">` on the outer table). No UVA tokens. No `branding-overrides.css`.

**Issue title:** Use description lists for Review and Submission Details metadata  
**PR:** `display-metadata-keys` → `<dl>` / `<dt>` / `<dd>`; grant inner lists the same.

**uvalib cleanup:** merge `main`; no branding-overrides to remove.

### DOI placeholder instructions (3.3.2) — auditor pass / best practice

**Priority: low.** Same Basics step as Do-first **F1-8** (proxy labels); different control. Do F1-8 first. Auditor passed because `#doi` has a permanent `<label for="doi">` and lead copy that uses “if” language; the leave-blank instruction still lives in the placeholder and disappears while typing.

| Audit | WCAG | What fails |
| --- | --- | --- |
| Placeholder Text | 3.3.2 Labels or Instructions | Basics DOI. `placeholder="Leave blank if your manuscript or article has not yet been assigned a DOI"`. |

**Where (generic `main` / `uvalib`)**

- `app/components/workflow-basics/index.gts` — `#doi` / `data-test-doi-input`
- Visible already: `<label for="doi">DOI</label>` and `<p class="lead">If the manuscript/article you are submitting has been assigned a Digital Object Identifier (DOI), please provide it now…</p>`
- A longer DOI definition sits in `.help-block` and is `display: none` in `app.css`; that is out of scope unless we choose to unhide it.

**Suggested generic fix (when we bother)**

Add the leave-blank sentence to the lead paragraph (or a visible helper under the label). Drop or shorten the placeholder so it is not the only place that instruction lives. Independent of F1-8, F1-9, F1-10. No UVA tokens. No `branding-overrides.css`.

**Issue title:** Keep DOI leave-blank instructions visible on Basics  
**PR:** move placeholder copy into the lead/helper text; keep `data-test-doi-input`.

**uvalib cleanup:** merge `main`; no branding-overrides to remove.

---

## Local-only (do not contribute)

| Audit | Why it stays on `uvalib` |
| --- | --- |
| D-4 hover orange (UVA build) | `--primary-600` / `a:hover` already overridden. |
| D-5 header/nav reflow | Already in `branding-overrides.css`. |
| F1-2 white `h1`/`h2` | `--secondary-500: #FFFFFF` is a UVA token used as button/banner color. Headings are forced to `--uva-brand-blue`. Generic `--secondary-500` is `#374151`. |
| F1-3 / F1-4 on UVA | Already in `/* Submission wizard */` overrides; contribute the generic version via backlog item 1. |
| F2-3 / F6-5 / F7-6 / GS-6 reflow on UVA | Already in `/* Reflow (320px / 400% zoom) */` (page scroll, PassTable footer stack, Review/details); contribute the generic page-scroll + PassTable footer stack via backlog item 2. Remove-button stretch and Review/details stacking stay UVA-only. |
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
| GS-3 / GS-4 / F3-2 / F6-3 links on UVA | Already rest-state underline and `a:focus` / `a:focus-visible` (global, tables, Files, Policies); contribute the generic rest + focus underline via backlog item 5. Keep UVA blues and extra outlines. |
| GS-7 PassTable X on UVA | Already white on `--uva-grey-A` for `.clearFilters` hover/focus; contribute the generic 3:1 chip hover via backlog item 6. Keep the UVA X restyle. |
