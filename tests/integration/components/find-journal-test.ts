import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { click, focus, render, triggerKeyEvent } from '@ember/test-helpers';
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
    assert.dom('[data-test-find-journal-clear]').doesNotExist('no clear control without a selection');
  });

  test('the clear control is a named, focusable button next to the combobox', async function (assert) {
    this.set('journal', { id: '1', journalName: 'Moo Journal' });
    this.set('selectJournal', sinon.stub());

    await render(hbs`<FindJournal @id='journal' @value={{this.journal}} @selectJournal={{this.selectJournal}} />`);

    assert.dom('.ember-power-select-selected-item').hasText('Moo Journal');
    assert.dom('.ember-power-select-clear-btn').doesNotExist('the addon clear span is not rendered');
    assert
      .dom('[data-test-find-journal-clear]')
      .hasTagName('button')
      .hasAttribute('type', 'button')
      .hasAria('label', 'Clear journal selection');
    assert
      .dom('#journal [data-test-find-journal-clear]')
      .doesNotExist('the button is not nested inside the combobox trigger');

    await focus('[data-test-find-journal-clear]');
    assert.dom('[data-test-find-journal-clear]').isFocused();
  });

  test('clicking the clear control clears without opening the dropdown', async function (assert) {
    this.set('journal', { id: '1', journalName: 'Moo Journal' });
    this.set(
      'selectJournal',
      sinon.spy((journal: unknown) => this.set('journal', journal)),
    );

    await render(hbs`<FindJournal @id='journal' @value={{this.journal}} @selectJournal={{this.selectJournal}} />`);
    await click('[data-test-find-journal-clear]');

    assert.ok(this.selectJournal.calledOnceWith(null), 'selectJournal called with null');
    assert.dom('#journal').hasAria('expanded', 'false');
    assert.dom('.ember-power-select-dropdown').doesNotExist();
    assert.dom('#journal').isFocused('focus moves back to the combobox');
    assert.dom('.ember-power-select-placeholder').hasText('Journal', 'the empty placeholder is back');
    assert.dom('[data-test-find-journal-clear]').doesNotExist('the clear control goes away with the selection');
  });

  test('Enter and Space on the clear control each clear the selection once', async function (assert) {
    this.set('journal', { id: '1', journalName: 'Moo Journal' });
    this.set('selectJournal', sinon.stub());

    await render(hbs`<FindJournal @id='journal' @value={{this.journal}} @selectJournal={{this.selectJournal}} />`);

    await triggerKeyEvent('[data-test-find-journal-clear]', 'keydown', 'Enter');
    assert.ok(this.selectJournal.calledOnceWith(null), 'Enter clears the selection');
    assert.dom('#journal').isFocused('focus moves back to the combobox');

    await triggerKeyEvent('[data-test-find-journal-clear]', 'keydown', ' ');
    assert.ok(this.selectJournal.calledTwice, 'Space clears the selection');
    assert.strictEqual(this.selectJournal.secondCall.args[0], null);
    assert.dom('.ember-power-select-dropdown').doesNotExist('the dropdown stays closed');
  });

  test('Enter on the combobox still opens the dropdown', async function (assert) {
    this.set('journal', { id: '1', journalName: 'Moo Journal' });

    await render(hbs`<FindJournal @id='journal' @value={{this.journal}} @selectJournal={{this.selectJournal}} />`);
    await triggerKeyEvent('#journal', 'keydown', 'Enter');

    assert.dom('#journal').hasAria('expanded', 'true');
    assert.dom('.ember-power-select-dropdown').exists();
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
