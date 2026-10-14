import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { find, focus, render, waitFor } from '@ember/test-helpers';

// Colors come from the SurveyJS / form-control contrast block in app/styles/app.css.
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
    const grey = 'rgb(89, 89, 89)'; // #595959, 7:1 on white
    const red = 'rgb(176, 0, 0)'; // #b00000, 7.38:1 on white
    const edge = 'rgb(118, 118, 118)'; // #767676, 4.54:1 on white

    assert.strictEqual(style('.sd-question__description').color, grey, 'question description');
    assert.strictEqual(style('.sd-boolean__label').color, grey, 'unselected Yes/No label');
    assert.ok(style('.sd-boolean').boxShadow.includes(`${edge} 0px 0px 0px 2px inset`), 'Yes/No track edge');

    const dropdown = '.sv-dropdown_select-wrapper div.form-control';
    assert.strictEqual(style(dropdown).backgroundColor, 'rgb(255, 255, 255)', 'enabled dropdown is not greyed');
    assert.strictEqual(getComputedStyle(find(`${dropdown} input`) as Element, '::placeholder').color, grey);
    assert.strictEqual(style('.sd-dropdown_chevron-button-svg use').fill, grey, 'dropdown chevron');
    assert.strictEqual(style(dropdown).borderColor, edge, 'form-control border');

    assert.strictEqual(style('.sd-error').color, red, 'error text');
    assert.strictEqual(style('.sd-error').borderColor, red, 'error box edge');

    assert.strictEqual(style('.sd-action--negative').color, red, 'Remove text');
    await focus('.sd-action--negative');
    assert.ok(style('.sd-action--negative').boxShadow.includes(`${red} 0px 0px 0px 2px inset`), 'Remove focus edge');
  });
});
