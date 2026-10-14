import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit, settled } from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupMirage } from 'pass-ui/tests/test-support/mirage';
import sharedScenario from 'pass-ui/mirage/scenarios/shared';
import type { FlashMessageService } from 'pass-ui/types/ember-cli-flash';

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

  test('flash messages are announced through a polite live region', async function (assert) {
    sharedScenario(this.server);

    await visit('/app/submissions');

    // The live region has to be in the page before a message is added to it
    assert.dom('[data-test-flash-message-container]').hasAttribute('aria-live', 'polite');

    const flashMessages = this.owner.lookup('service:flash-messages') as FlashMessageService;
    flashMessages.success('Draft submission deleted.');
    flashMessages.danger('Something went wrong.');
    await settled();

    assert.dom('[data-test-flash-message-container] .alert-success').hasText(/Draft submission deleted\./);
    assert
      .dom('[data-test-flash-message-container] .alert-success')
      .doesNotHaveAttribute('role', 'status messages rely on the polite container, not role="alert"');
    assert.dom('[data-test-flash-message-container] .alert-danger').hasAttribute('role', 'alert');
  });
});
