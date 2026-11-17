import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupMirage } from 'pass-ui/tests/test-support/mirage';
import sharedScenario from 'pass-ui/mirage/scenarios/shared';

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

module('Acceptance | skip link', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await authenticateSession({ id: '0' });
    sharedScenario(this.server);
  });

  for (const url of ['/app/', '/app/submissions']) {
    test(`skip link is the first focusable element and moves focus to main on ${url}`, async function (assert) {
      await visit(url);

      const root = document.querySelector('#ember-testing') as HTMLElement;
      assert.strictEqual(
        root.querySelector(FOCUSABLE),
        document.querySelector('[data-test-skip-link]'),
        'skip link is the first focusable element',
      );
      assert.dom('[data-test-skip-link]').hasText('Skip to main content');
      assert.dom('[data-test-skip-link]').hasClass('visually-hidden-focusable');
      assert.dom('[data-test-skip-link]').hasAttribute('href', '#main-content');

      const urlBefore = currentURL();
      await click('[data-test-skip-link]');

      assert.dom('main#main-content').isFocused('focus moves to main');
      assert.strictEqual(currentURL(), urlBefore, 'route URL is unchanged');
      assert.notOk(window.location.hash.includes('main-content'), 'no fragment is added to the URL');
    });
  }
});
