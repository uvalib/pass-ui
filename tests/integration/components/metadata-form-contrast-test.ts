import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { find, focus, render, waitFor } from '@ember/test-helpers';

// Contrast for the SurveyJS / form-control block in app/styles/app.css.
module('Integration | Component | metadata-form | contrast', (hooks) => {
  setupRenderingTest(hooks);

  test('SurveyJS text and control edges use accessible contrast colors', async function (assert) {
    this.set('schema', {
      elements: [
        {
          name: 'authors',
          type: 'paneldynamic',
          title: 'Authors',
          templateElements: [{ name: 'author', type: 'text', title: 'Author' }],
        },
        {
          name: 'issns',
          type: 'paneldynamic',
          title: 'ISSN Information',
          panelCount: 1,
          templateElements: [{ name: 'pubType', type: 'dropdown', title: 'Publication Type', choices: ['Print'] }],
        },
        { name: 'under-embargo', type: 'boolean', title: 'Under Embargo', description: 'Under an embargo.' },
        { name: 'title', type: 'text', title: 'Title', isRequired: true },
      ],
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let survey: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.set('onSurveyReady', (s: any) => (survey = s));

    await render(hbs`<MetadataForm @schema={{this.schema}} @onSurveyReady={{this.onSurveyReady}} />`);
    survey.validate(true);
    await waitFor('.sd-error');

    const style = (selector: string) => getComputedStyle(find(selector) as Element);

    // Assert WCAG ratios rather than exact colors, so a branding overlay that picks its own
    // accessible colors still passes, and one that regresses contrast fails.
    const rgb = (color: string) => (color.match(/[\d.]+/g) ?? []).slice(0, 4).map(Number);
    const luminance = (color: string) => {
      const [r, g, b] = rgb(color).map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
    };
    const ratio = (a: string, b: string) => {
      const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (hi! + 0.05) / (lo! + 0.05);
    };
    // The background an element's text sits on: translucent layers composited down to the
    // first opaque one (the test page is white)
    const background = (el: Element | null): string => {
      const layers: number[][] = [];
      for (let node = el; node; node = node.parentElement) {
        const [r = 0, g = 0, b = 0, a = 1] = rgb(getComputedStyle(node).backgroundColor);
        if (a === 0) continue;
        layers.push([r, g, b, a]);
        if (a === 1) break;
      }
      let [r, g, b] = [255, 255, 255];
      for (const [lr, lg, lb, la] of layers.reverse()) {
        [r, g, b] = [lr! * la! + r * (1 - la!), lg! * la! + g * (1 - la!), lb! * la! + b * (1 - la!)];
      }
      return `rgb(${r}, ${g}, ${b})`;
    };
    const page = background(find('[data-test-metadata-form]'));
    // A control's visible edge: an inset box-shadow ring, or else its border
    const edge = (selector: string) => {
      const s = style(selector);
      const ring = s.boxShadow.match(/rgba?\([^)]*\)(?= 0px 0px 0px \d+px inset)/);
      if (ring) return ring[0];
      return parseFloat(s.borderTopWidth) > 0 ? s.borderTopColor : 'rgba(0, 0, 0, 0)';
    };
    const text = (selector: string, label: string) =>
      assert.ok(ratio(style(selector).color, background(find(selector))) >= 4.5, `${label}: text 4.5:1`);
    const edgeVs = (selector: string, against: string, label: string) =>
      assert.ok(ratio(edge(selector), against) >= 3, `${label}: edge 3:1`);

    text('.sd-question__description', 'question description');
    text('.sd-boolean__label', 'unselected Yes/No label');
    edgeVs('.sd-boolean', page, 'Yes/No track');

    const dropdown = '.sv-dropdown_select-wrapper div.form-control';
    assert.notStrictEqual(style(dropdown).backgroundColor, 'rgb(233, 236, 239)', 'enabled dropdown is not greyed');
    const dropdownBg = background(find(dropdown));
    const placeholder = getComputedStyle(find(`${dropdown} input`) as Element, '::placeholder').color;
    assert.ok(ratio(placeholder, dropdownBg) >= 4.5, 'dropdown placeholder: text 4.5:1');
    assert.ok(ratio(style('.sd-dropdown_chevron-button-svg use').fill, dropdownBg) >= 3, 'dropdown chevron: 3:1');
    edgeVs(dropdown, page, 'form-control border');

    text('.sd-error', 'error text');
    edgeVs('.sd-error', page, 'error box');

    text('.sd-action--negative', 'Remove');
    await focus('.sd-action--negative');
    edgeVs('.sd-action--negative', page, 'Remove focus');
  });
});
