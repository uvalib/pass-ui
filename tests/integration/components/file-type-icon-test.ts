import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';

module('Integration | Component | file type icon', (hooks) => {
  setupRenderingTest(hooks);

  const cases: [string | undefined, string, string][] = [
    ['pdf', 'PDF', 'file-pdf'],
    ['application/pdf', 'PDF', 'file-pdf'],
    ['png', 'Image', 'file-image'],
    ['image/png', 'Image', 'file-image'],
    ['msword', 'Word', 'file-word'],
    ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'PowerPoint', 'file-powerpoint'],
    ['text/plain', 'File', 'file'],
    [undefined, 'File', 'file'],
  ];

  cases.forEach(([mimeType, label, icon]) => {
    test(`names the ${String(mimeType)} icon "${label}"`, async function (assert) {
      this.set('mimeType', mimeType);
      await render(hbs`<FileTypeIcon @mimeType={{this.mimeType}} />`);

      assert.dom('svg').hasAttribute('data-icon', icon);
      assert.dom('svg').hasAttribute('aria-hidden', 'true', 'the icon itself stays hidden');
      assert.dom('[data-test-file-type-label]').hasText(label);
      assert.dom('[data-test-file-type-label]').hasClass('visually-hidden');
      assert.strictEqual(this.element.textContent!.trim(), label, 'the label is the only text content');
    });
  });
});
