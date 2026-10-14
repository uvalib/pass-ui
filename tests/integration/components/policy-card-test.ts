import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render, click } from '@ember/test-helpers';
import { setupMirage } from 'pass-ui/tests/test-support/mirage';

module('Integration | Component | policy card', (hooks) => {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
  });

  test('it renders when given expected data', async function (assert) {
    const submissionAttrs = this.server.create('submission').attrs;
    const submission = this.store.createRecord('submission', submissionAttrs);
    const repositoryFactory = this.server.create('repository');
    const policyFactory = this.server.create('policy', {
      repositories: [repositoryFactory],
    });
    const journalFactory = this.server.create('journal', { pmcParticipation: 'B' });

    const repository = this.store.createRecord('repository', repositoryFactory.attrs);
    const policy = this.store.createRecord('policy', {
      ...policyFactory.attrs,
      description: 'This is a moo-scription',
      title: 'Moo title',
      repositories: [repository],
    });
    const journal = this.store.createRecord('journal', journalFactory.attrs);

    this.set('submission', submission);
    this.set('policy', policy);
    this.set('journal', journal);
    this.set('repository', repository);

    await render(hbs`<PolicyCard @policy={{this.policy}} @journal={{this.journal}} @submission={{this.submission}} />`);

    assert.dom(this.element as Element).includesText('Requires deposit into');
    assert.dom(this.element as Element).includesText('moo-scription');
  });

  module('PMC tests', (hooks) => {
    hooks.beforeEach(function () {
      const submissionAttrs = this.server.create('submission').attrs;
      const submission = this.store.createRecord('submission', submissionAttrs);
      const repositoryFactory = this.server.create('repository', { repositoryKey: 'pmc' });
      const policyFactory = this.server.create('policy', {
        repositories: [repositoryFactory],
      });
      const journalFactory = this.server.create('journal', { pmcParticipation: 'B' });

      const repository = this.store.createRecord('repository', repositoryFactory.attrs);
      const policy = this.store.createRecord('policy', {
        ...policyFactory.attrs,
        description: 'This is a moo-scription',
        title: 'Moo title',
        repositories: [repository],
      });
      const journal = this.store.createRecord('journal', journalFactory.attrs);

      this.set('submission', submission);
      this.set('policy', policy);
      this.set('journal', journal);
      this.set('repository', repository);
    });

    test('PMC journal displays user input', async function (assert) {
      const repositoryFactory = this.server.create('repository');
      const policyFactory = this.server.create('policy', {
        repositories: [repositoryFactory],
      });
      const journalFactory = this.server.create('journal', { pmcParticipation: 'B' });

      const repository = this.store.createRecord('repository', repositoryFactory.attrs);
      const policy = this.store.createRecord('policy', {
        ...policyFactory.attrs,
        description: 'This is a moo-scription',
        title: 'Moo title',
        repositories: [repository],
      });
      const journal = this.store.createRecord('journal', journalFactory.attrs);
      const submissionAttrs = this.server.create('submission').attrs;
      const submission = this.store.createRecord('submission', { effectivePolicies: [policy], ...submissionAttrs });

      this.set('submission', submission);
      this.set('policy', policy);
      this.set('journal', journal);
      this.set('repository', repository);

      await render(
        hbs`<PolicyCard @policy={{this.policy}} @journal={{this.journal}} @submission={{this.submission}} />`,
      );

      assert.dom('[data-test-workflow-policies-radio-no-direct-deposit]').exists();
      assert.dom('[data-test-workflow-policies-radio-direct-deposit]').exists();

      const effectivePolicies = await this.submission.effectivePolicies;

      assert.strictEqual(effectivePolicies.length, 1, 'Should be ONE effective policy on submission');
      assert.ok(effectivePolicies.some((p: { title?: string }) => p.title === 'Moo title'));
    });

    test('PMC non-type A can be removed', async function (assert) {
      await render(
        hbs`<PolicyCard @policy={{this.policy}} @journal={{this.journal}} @submission={{this.submission}} />`,
      );

      const inputs = this.element.querySelectorAll('input');
      assert.strictEqual(inputs.length, 2, `Found ${inputs.length} inputs, but was expecting 2`);

      // Select option to remove this policy
      await click('[data-test-workflow-policies-radio-direct-deposit]');

      const effectivePolicies = await this.submission.effectivePolicies;
      assert.strictEqual(effectivePolicies.length, 0, 'Should be ZERO effective policies');
    });

    test('PMC radios are a named group labeled by their visible text', async function (assert) {
      await render(
        hbs`<PolicyCard @policy={{this.policy}} @journal={{this.journal}} @submission={{this.submission}} />`,
      );

      const noDeposit = this.element.querySelector('[data-test-workflow-policies-radio-no-direct-deposit]')!;
      const directDeposit = this.element.querySelector('[data-test-workflow-policies-radio-direct-deposit]')!;

      // Accessible name comes from the wrapping <label>, not a developer aria-label
      for (const radio of [noDeposit, directDeposit]) {
        assert.dom(radio).doesNotHaveAttribute('aria-label');
        assert.dom(radio).hasAttribute('name', 'pmc-deposit-arrangement');
        assert.ok(radio.closest('label'), 'radio is wrapped in a label');
      }
      assert
        .dom(noDeposit.closest('label'))
        .includesText('I would like to submit my manuscript to PMC via the NIH Manuscript System (NIHMS)');
      assert
        .dom(directDeposit.closest('label'))
        .includesText('I have made (or intend to make) an arrangement with the publisher');

      // Both radios sit in one fieldset whose legend is the intro text
      const fieldset = noDeposit.closest('fieldset');
      assert.ok(fieldset, 'radios are grouped in a fieldset');
      assert.strictEqual(directDeposit.closest('fieldset'), fieldset, 'both radios share the fieldset');
      assert
        .dom(fieldset!.querySelector(':scope > legend'))
        .includesText('Please indicate below whether or not you have made an arrangement with the publisher');

      // Clicking the visible text selects the radio
      await click(directDeposit.closest('label')!);
      assert.dom(directDeposit).isChecked();
      assert.dom(noDeposit).isNotChecked();
      assert.strictEqual(this.submission.effectivePolicies.length, 0, 'Should be ZERO effective policies');
    });

    test('PMC type A journal as no inputs and is not added to submission', async function (assert) {
      const repositoryFactory = this.server.create('repository', { repositoryKey: 'pmc' });
      const policyFactory = this.server.create('policy', {
        repositories: [repositoryFactory],
      });
      const journalFactory = this.server.create('journal', { pmcParticipation: 'A' });

      const repository = this.store.createRecord('repository', repositoryFactory.attrs);
      const policy = this.store.createRecord('policy', {
        ...policyFactory.attrs,
        description: 'This is a moo-scription',
        title: 'Moo title',
        repositories: [repository],
      });
      const journal = this.store.createRecord('journal', journalFactory.attrs);

      this.set('policy', policy);
      this.set('journal', journal);
      this.set('repository', repository);

      await render(
        hbs`<PolicyCard @policy={{this.policy}} @journal={{this.journal}} @submission={{this.submission}} />`,
      );
      assert.ok(this.element, 'failed to render');

      assert
        .dom('[data-test-method-a-journal-pmc-intro]')
        .containsText('The journal you published in will submit the published article to PMC on your behalf.');

      assert.dom('[data-test-workflow-policies-radio-no-direct-deposit]').doesNotExist();
      assert.dom('[data-test-workflow-policies-radio-direct-deposit]').doesNotExist();

      assert.strictEqual(this.submission.effectivePolicies.length, 0, 'should be ZERO effective policies set');
    });
  });
});
