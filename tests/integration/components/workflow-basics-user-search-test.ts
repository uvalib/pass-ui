import Service from '@ember/service';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { click, focus, render, triggerKeyEvent } from '@ember/test-helpers';

type TestUser = { id: string; firstName: string; lastName: string; email: string };

module('Integration | Component | workflow basics user search', (hooks) => {
  setupRenderingTest(hooks);

  let users: TestUser[] = [];

  hooks.beforeEach(function () {
    this.set('pickSubmitter', () => {});
    this.set('toggleUserSearchModal', () => {});
    users = [];

    class MockStore extends Service {
      request() {
        return Promise.resolve({ content: { data: users } });
      }
    }
    this.owner.unregister('service:store');
    this.owner.register('service:store', MockStore);
  });

  test('it renders', async function (assert) {
    this.set('userSearchTerm', '');

    await render(hbs`<WorkflowBasicsUserSearch
  @toggleUserSearchModal={{this.toggleUserSearchModal}}
  @pickSubmitter={{this.pickSubmitter}}
  @searchInput={{this.userSearchTerm}}
/>`);

    assert.ok(true);
  });

  test('heading has an id the dialog can use as its accessible name', async function (assert) {
    this.set('userSearchTerm', '');

    await render(hbs`<WorkflowBasicsUserSearch
  @toggleUserSearchModal={{this.toggleUserSearchModal}}
  @pickSubmitter={{this.pickSubmitter}}
  @searchInput={{this.userSearchTerm}}
/>`);

    assert.dom('h2#user-search-title').hasText('Search Users');
  });

  test('announces the result count in a polite status region without moving focus', async function (assert) {
    this.set('userSearchTerm', 'moo');
    users = [
      { id: '1', firstName: 'Moo', lastName: 'Cow', email: 'moo@example.com' },
      { id: '2', firstName: 'Moo', lastName: 'Calf', email: 'calf@example.com' },
    ];

    await render(hbs`<WorkflowBasicsUserSearch
  @toggleUserSearchModal={{this.toggleUserSearchModal}}
  @pickSubmitter={{this.pickSubmitter}}
  @searchInput={{this.userSearchTerm}}
/>`);

    assert.dom('[data-test-user-search-status]').hasAttribute('role', 'status');
    assert.dom('[data-test-user-search-status]').hasAttribute('aria-live', 'polite');
    assert.dom('[data-test-user-search-status]').hasText('2 users found.');

    // Repeating a search with the same outcome still ends with the message set
    await focus('.user-search-container input');
    await triggerKeyEvent('.user-search-container input', 'keydown', 'Enter');

    assert.dom('[data-test-user-search-status]').hasText('2 users found.');
    assert.dom('.user-search-container input').isFocused('focus stays on the search field');

    users = [{ id: '1', firstName: 'Moo', lastName: 'Cow', email: 'moo@example.com' }];
    await click('#search-for-users');

    assert.dom('[data-test-user-search-status]').hasText('1 user found.');
    assert.dom('#search-for-users').isFocused('focus stays on the search button');
  });

  test('announces when no users match', async function (assert) {
    this.set('userSearchTerm', 'nobody');

    await render(hbs`<WorkflowBasicsUserSearch
  @toggleUserSearchModal={{this.toggleUserSearchModal}}
  @pickSubmitter={{this.pickSubmitter}}
  @searchInput={{this.userSearchTerm}}
/>`);

    assert.dom('[data-test-user-search-status]').hasText('No results found.');
  });

  test('status region is empty before any search', async function (assert) {
    this.set('userSearchTerm', '');

    await render(hbs`<WorkflowBasicsUserSearch
  @toggleUserSearchModal={{this.toggleUserSearchModal}}
  @pickSubmitter={{this.pickSubmitter}}
  @searchInput={{this.userSearchTerm}}
/>`);

    assert.dom('[data-test-user-search-status]').exists();
    assert.dom('[data-test-user-search-status]').hasNoText();
  });
});
