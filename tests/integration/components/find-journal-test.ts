import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render, triggerEvent, triggerKeyEvent } from '@ember/test-helpers';
// @ts-expect-error no declaration file for sinon
import sinon from 'sinon';

module('Integration | Component | find journal', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    // Template usage:
    await render(hbs`<FindJournal />`);
    assert.ok(true);
  });

  test('the combobox gets its id and accessible name from the arguments', async function (assert) {
    await render(hbs`
      <label id='journal-label'>Journal</label>
      <FindJournal @id='journal' @ariaLabelledBy='journal-label' @value={{null}} />
    `);

    assert
      .dom('[data-test-find-journal-select]')
      .hasAttribute('id', 'journal')
      .hasAttribute('role', 'combobox')
      .hasAttribute('aria-labelledby', 'journal-label');
    assert.dom('.ember-power-select-clear-btn').doesNotExist('no clear control without a selection');
  });

  test('a selected journal can be cleared with the clear control', async function (assert) {
    this.set('journal', { id: '1', journalName: 'Moo Journal' });
    this.set('selectJournal', sinon.stub());

    await render(hbs`<FindJournal @id='journal' @value={{this.journal}} @selectJournal={{this.selectJournal}} />`);

    assert.dom('.ember-power-select-selected-item').hasText('Moo Journal');
    assert.dom('.ember-power-select-clear-btn').exists();

    await triggerEvent('.ember-power-select-clear-btn', 'mousedown');

    assert.ok(this.selectJournal.calledOnceWith(null), 'selectJournal called with null');
  });

  test('a selected journal can be cleared from the keyboard with Delete or Backspace', async function (assert) {
    this.set('journal', { id: '1', journalName: 'Moo Journal' });
    this.set('selectJournal', sinon.stub());

    await render(hbs`<FindJournal @id='journal' @value={{this.journal}} @selectJournal={{this.selectJournal}} />`);

    await triggerKeyEvent('#journal', 'keydown', 'Delete');
    assert.ok(this.selectJournal.calledOnceWith(null), 'Delete clears the selection');

    await triggerKeyEvent('#journal', 'keydown', 'Backspace');
    assert.ok(this.selectJournal.calledTwice, 'Backspace clears the selection');
    assert.strictEqual(this.selectJournal.secondCall.args[0], null);
  });
});
