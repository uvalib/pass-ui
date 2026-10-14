import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render, find, settled } from '@ember/test-helpers';

module('Integration | Component | pass-table', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('onChange', () => {});
    this.set('data', [{ name: 'one' }, { name: 'two' }]);
    this.set('page', 1);
    this.set('pageSize', 10);
    this.set('totalItems', 2);
    this.set('totalPages', 1);
  });

  const template = hbs`
    <PassTable
      @data={{this.data}}
      @page={{this.page}}
      @pageSize={{this.pageSize}}
      @totalItems={{this.totalItems}}
      @totalPages={{this.totalPages}}
      @onChange={{this.onChange}}
    >
      <:header><th>Name</th></:header>
      <:row as |record|><td>{{record.name}}</td></:row>
    </PassTable>
  `;

  test('result summary is a polite, atomic live region', async function (assert) {
    await render(template);

    assert
      .dom('.table-summary [role="status"]')
      .exists({ count: 1 })
      .hasAttribute('aria-live', 'polite')
      .hasAttribute('aria-atomic', 'true')
      .hasText('Show 1 - 2 of 2');
  });

  test('live region text updates in place when the page or result count changes', async function (assert) {
    this.set(
      'data',
      Array.from({ length: 10 }, (_, i) => ({ name: `row ${i}` })),
    );
    this.set('totalItems', 25);
    this.set('totalPages', 3);
    await render(template);

    const region = find('.table-summary [role="status"]');
    assert.dom(region).hasText('Show 1 - 10 of 25');

    this.set('page', 3);
    await settled();
    assert.dom('.table-summary [role="status"]').hasText('Show 21 - 25 of 25');

    this.set('data', [{ name: 'match' }]);
    this.set('page', 1);
    this.set('totalItems', 1);
    this.set('totalPages', 1);
    await settled();
    assert.dom('.table-summary [role="status"]').hasText('Show 1 - 1 of 1');

    // The same element must persist so assistive tech announces the change.
    assert.strictEqual(find('.table-summary [role="status"]'), region, 'live region element is not re-created');
  });

  test('empty state is announced through the live region', async function (assert) {
    this.set('data', []);
    this.set('totalItems', 0);
    await render(template);

    assert.dom('.nodata-placeholder').hasText('No data found');
    assert.dom('.table-summary [role="status"]').hasText('Show 0 - 0 of 0. No data found');
    assert.dom('.table-summary [role="status"] .emt-sr-only').hasText('. No data found');
  });

  test('live region announces the empty state when a filter removes all rows', async function (assert) {
    await render(template);
    assert.dom('.table-summary [role="status"] .emt-sr-only').doesNotExist();

    this.set('data', []);
    this.set('totalItems', 0);
    await settled();
    assert.dom('.table-summary [role="status"]').hasText('Show 0 - 0 of 0. No data found');
  });
});
