import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';

module('Integration | Component | submission nav', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.loadTab = () => assert.ok(true);

    await render(hbs`<SubmissionNav @loadTab={{this.loadTab}} />`);

    assert.ok(true);
  });

  module('with enlarged text in a narrow container', function (hooks) {
    let originalFontSize: string;

    hooks.beforeEach(function () {
      // Simulate a 200% browser text size setting
      originalFontSize = document.documentElement.style.fontSize;
      document.documentElement.style.fontSize = '200%';
    });

    hooks.afterEach(function () {
      document.documentElement.style.fontSize = originalFontSize;
    });

    test('step labels wrap instead of being clipped (WCAG 1.4.4)', async function (assert) {
      this.loadTab = () => {};

      await render(hbs`
        <div style='width: 320px'>
          <SubmissionNav @loadTab={{this.loadTab}} />
        </div>
      `);

      const bar = document.querySelector('.steps') as HTMLElement;
      const barRect = bar.getBoundingClientRect();
      const steps = Array.from(bar.querySelectorAll<HTMLElement>('.step'));

      assert.strictEqual(steps.length, 7, 'all seven steps render');
      assert.notStrictEqual(getComputedStyle(bar).overflow, 'hidden', 'the step bar does not hide overflow');

      steps.forEach((step) => {
        const label = step.textContent?.trim();
        const rect = step.getBoundingClientRect();

        assert.true(step.scrollWidth <= step.clientWidth, `"${label}" is not clipped horizontally`);
        assert.true(step.scrollHeight <= step.clientHeight, `"${label}" is not clipped vertically`);
        assert.true(
          rect.left >= barRect.left - 1 &&
            rect.right <= barRect.right + 1 &&
            rect.top >= barRect.top - 1 &&
            rect.bottom <= barRect.bottom + 1,
          `"${label}" stays inside the step bar`,
        );
      });

      const rows = new Set(steps.map((step) => Math.round(step.getBoundingClientRect().top)));
      assert.true(rows.size > 1, 'the step bar wraps onto more than one row');
    });
  });
});
