import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';

module('Integration | Component | submissions status cell', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    await render(hbs`<SubmissionsStatusCell @submissionStatus='submitted' />`);
    assert.ok(true);
  });

  test('draft submission renders', async function (assert) {
    const record = {
      submissionStatus: 'draft',
    };
    this.set('record', record);

    await render(hbs`<SubmissionsStatusCell @record={{this.record}} />`);

    assert.ok(this.element, 'Failed to render');
    assert.ok(this.element.textContent!.includes('draft'), 'unexpected text found');
  });

  test('status tooltip is a keyboard-focusable button with a description', async function (assert) {
    this.set('record', { submissionStatus: 'draft' });

    await render(hbs`<SubmissionsStatusCell @record={{this.record}} />`);

    assert.dom('button[tooltip]').hasAttribute('type', 'button');
    assert.dom('button[tooltip]').hasText('draft');
    const describedBy = this.element.querySelector('button[tooltip]')!.getAttribute('aria-describedby');
    assert
      .dom(`#${describedBy}`)
      .hasText('This submission is a draft. No action will be taken on this submission until it is completed.');
  });
});
