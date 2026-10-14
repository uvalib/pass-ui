/* eslint-disable ember/no-classic-classes, ember/avoid-leaking-state-in-ember-objects, ember/no-settled-after-test-helper */
import { A } from '@ember/array';
import Service from '@ember/service';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render, click, settled, waitFor } from '@ember/test-helpers';
import { run } from '@ember/runloop';
// @ts-expect-error no declaration file for sinon
import Sinon from 'sinon';

module('Integration | Component | submission action cell', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    const currentUserStub = Service.extend({
      user: {
        id: 1,
      },
    });

    const mockStore = Service.extend({
      query() {
        return Promise.resolve(A());
      },
    });

    run(() => {
      this.owner.unregister('service:store');
      this.owner.register('service:store', mockStore);
      this.owner.register('service:currentUser', currentUserStub);
    });
  });

  test('it renders', async function (assert) {
    const record = {
      preparers: [],
      submitted: true,
      submitter: {
        id: 1,
      },
    };

    this.set('record', record);

    await render(hbs`<SubmissionActionCell @record={{this.record}} />`);

    assert.strictEqual(this.element.textContent!.trim(), 'No actions available.');

    // Template block usage:
    await render(hbs`<SubmissionActionCell @record={{this.record}}>
  template block text
</SubmissionActionCell>`);

    assert.strictEqual(this.element.textContent!.trim(), 'No actions available.');
  });

  /**
   * Make sure that the 'deleteSubmission' action calls `submission#deleteRecord` on the
   * supplied submission, then `#save()` should be called
   */

  test('should delete and persist submission', async function (assert) {
    const record = {
      preparers: [],
      isDraft: true,
      save: Sinon.fake.resolves(),
      submitter: { id: 1 },
    };

    this.set('record', record);

    const submissionHandler = this.owner.lookup('service:submission-handler')!;
    const handlerFake = Sinon.replace(submissionHandler, 'deleteSubmission', Sinon.fake.resolves());
    this.owner.register('service:submission-handler', submissionHandler);

    this.flashMessages = this.owner.lookup('service:flash-messages');
    await render(hbs`{{#each this.flashMessages.queue as |flash|}}
  <div class='flash-message-container'>
    <FlashMessage @flash={{flash}} as |component flash close|>
      <div class='d-flex justify-content-between'>
        {{flash.message}}
        <span role='button' {{on 'click' close}}>
          x
        </span>
      </div>
    </FlashMessage>
  </div>
{{/each}}
<SubmissionActionCell @record={{this.record}} />`);
    await click('button.delete-button');
    // Destructive confirm: Cancel gets initial focus so Enter doesn't delete by accident
    assert.dom('.swal2-cancel').isFocused();
    await click(document.querySelector('.swal2-confirm')!);

    await settled();

    assert.ok(handlerFake.calledOnce, 'Submission handler delete should be called');
    await waitFor('.flash-message.alert-success');
    assert.dom('.flash-message.alert-success').containsText('Draft submission deleted.');
  });

  test('cancelling the confirm dialog does not delete', async function (assert) {
    const record = { preparers: [], isDraft: true, submitter: { id: 1 } };
    this.set('record', record);

    const submissionHandler = this.owner.lookup('service:submission-handler')!;
    const handlerFake = Sinon.replace(submissionHandler, 'deleteSubmission', Sinon.fake.resolves());

    await render(hbs`<SubmissionActionCell @record={{this.record}} />`);
    await click('button.delete-button');
    await click(document.querySelector('.swal2-cancel')!);
    await settled();

    assert.ok(handlerFake.notCalled, 'Submission handler delete should not be called');
  });

  test('Should show error message on submission deletion error', async function (assert) {
    const record = { preparers: [], isDraft: true, save: Sinon.fake.resolves(), submitter: { id: 1 } };
    this.record = record;

    const submissionHandler = this.owner.lookup('service:submission-handler')!;
    // Make sure submissionHandler#deleteSubmission fails
    const handlerFake = Sinon.replace(submissionHandler, 'deleteSubmission', Sinon.fake.throws());
    this.owner.register('service:submission-handler', submissionHandler);

    // Need to make sure the flash message service is initialized
    this.flashMessages = this.owner.lookup('service:flash-messages');
    // Need harness for flash messages
    // In the real app, this is done at the application level and will always be available
    // but needs to be injected for this isolated render test
    await render(hbs`{{#each this.flashMessages.queue as |flash|}}
  <div class='flash-message-container'>
    <FlashMessage @flash={{flash}} as |component flash close|>
      <div class='d-flex justify-content-between'>
        {{flash.message}}
        <span role='button' {{on 'click' close}}>
          x
        </span>
      </div>
    </FlashMessage>
  </div>
{{/each}}
<SubmissionActionCell @record={{this.record}} />`);

    assert.dom('button.delete-button').exists();
    assert.dom('a.btn').containsText('Edit');

    await click('button.delete-button');
    await click(document.querySelector('.swal2-confirm')!);
    await settled();

    await waitFor('.flash-message.alert-danger');
    assert.dom('.flash-message.alert-danger').containsText('We encountered an error deleting this draft submission');
    assert.dom('.flash-message.alert-success').doesNotExist('No success message when the delete fails');

    assert.ok(handlerFake.calledOnce, 'Submission handler delete should be called');
  });

  test('Draft submissions should display Edit and Delete buttons', async function (assert) {
    const record = {
      preparers: A(),
      isDraft: true,
      submitter: {
        id: 1,
      },
      // submissionStatus: 'draft'
    };
    this.set('record', record);

    await render(hbs`<SubmissionActionCell @record={{this.record}} />`);

    const links = this.element.querySelectorAll('a');
    assert.strictEqual(links.length, 1, `There should be one link, instead, ${links.length} were found`);
    assert.strictEqual(links[0]!.textContent!.trim(), 'Edit');

    // Delete is a real button so it is in the tab order and works with Enter/Space
    const buttons = this.element.querySelectorAll('button');
    assert.strictEqual(buttons.length, 1, `There should be one button, instead, ${buttons.length} were found`);
    assert.dom(buttons[0]!).hasText('Delete');
    assert.dom(buttons[0]!).hasAttribute('type', 'button');
    assert.dom(buttons[0]!).hasClass('delete-button');
  });
});
