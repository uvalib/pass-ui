import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { click, visit, waitFor } from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { getPageTitle } from 'ember-page-title/test-support';
import { setupMirage } from 'pass-ui/tests/test-support/mirage';
import sharedScenario from 'pass-ui/mirage/scenarios/shared';

module('Acceptance | page title', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    sharedScenario(this.server);
    await authenticateSession({ id: '0' });
  });

  test('dashboard has a descriptive title', async function (assert) {
    await visit('/app');

    assert.strictEqual(getPageTitle(), 'Dashboard | PASS');
  });

  test('grants list has a descriptive title', async function (assert) {
    await visit('/app/grants');

    assert.strictEqual(getPageTitle(), 'Your Grants | PASS');
  });

  test('submissions list has a descriptive title', async function (assert) {
    await visit('/app/submissions');

    assert.strictEqual(getPageTitle(), 'Submissions | PASS');
  });

  test('unknown routes have a not found title', async function (assert) {
    await visit('/app/this-page-does-not-exist');

    assert.strictEqual(getPageTitle(), 'Page not found | PASS');
  });

  test('title updates on client-side navigation into the submission workflow', async function (assert) {
    await visit('/app');
    assert.strictEqual(getPageTitle(), 'Dashboard | PASS');

    await click('[data-test-start-new-submission]');
    await waitFor('[data-test-workflow-basics-next]');

    assert.strictEqual(getPageTitle(), 'Basics | New Submission | PASS');
  });
});
