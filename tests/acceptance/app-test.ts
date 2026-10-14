import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupMirage } from 'pass-ui/tests/test-support/mirage';
import sharedScenario from 'pass-ui/mirage/scenarios/shared';

module('Acceptance | application', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await authenticateSession({ id: '0' });
  });

  test('Make sure app loads outside of root', async function (assert) {
    sharedScenario(this.server);

    await visit('/app/submissions');

    assert.dom('.lds-dual-ring').doesNotExist('Loading spinner should not be present');

    assert.dom('h1').exists();
    assert.dom('h1').includesText('Submission');
  });

  test('Site header has a single brand link and named navigation landmarks', async function (assert) {
    sharedScenario(this.server);

    await visit('/app/submissions');

    assert.dom('#brand-header a[href="/"]').exists({ count: 1 }, 'only one brand link to the home page');
    assert.dom('#brand-header a[href="/"]').hasText('Public Access Submission System');
    assert.dom('nav:not([aria-label]):not([aria-labelledby])').doesNotExist('every nav landmark has a name');
    assert.dom('nav#header-navbar').hasAttribute('aria-label', 'Main');
  });
});
