import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render, findAll } from '@ember/test-helpers';

module('Integration | Component | submission-funding-table', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<SubmissionFundingTable />`);

    assert.ok(true);
  });

  test('it labels the Remove column when grants can be removed', async function (assert) {
    this.set('grants', [{ id: 1, awardNumber: 'A1', projectName: 'Moo 1' }]);
    this.set('remove', () => {});

    await render(hbs`<SubmissionFundingTable @grants={{this.grants}} @remove={{this.remove}} />`);

    const headers = findAll('[data-test-submission-funding-table] thead th');
    assert.strictEqual(headers.length, 3);
    assert.dom(headers[2]).hasText('Remove');
    assert.dom('[data-test-submission-funding-table] tbody tr td').exists({ count: 3 });
  });

  test('it omits the Remove column when grants cannot be removed', async function (assert) {
    this.set('grants', [{ id: 1, awardNumber: 'A1', projectName: 'Moo 1' }]);

    await render(hbs`<SubmissionFundingTable @grants={{this.grants}} />`);

    assert.dom('[data-test-submission-funding-table] thead th').exists({ count: 2 });
    assert.dom('[data-test-submission-funding-table] tbody tr td').exists({ count: 2 });
  });
});
