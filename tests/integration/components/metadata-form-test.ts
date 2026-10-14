import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { find, findAll, render, waitFor } from '@ember/test-helpers';
import stripEmptyArrays from 'pass-ui/util/strip-empty-arrays';

module('Integration | Component | metadata-form', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    const schema = {
      elements: [
        {
          name: 'title',
          type: 'text',
          title: 'Title',
          isRequired: true,
        },
      ],
    };

    const data = {
      title: 'this is a title',
    };

    this.set('schema', schema);
    this.set('data', data);
  });

  test('it renders', async function (assert) {
    await render(hbs`<MetadataForm @schema={{this.schema}} />`);

    assert.dom('#metadata-form').exists();
  });

  module('accessibility', function (hooks) {
    hooks.beforeEach(function () {
      this.set('schema', {
        elements: [
          { name: 'publicationDate', type: 'text', inputType: 'date', title: 'Publication Date', isRequired: true },
          { name: 'issue', type: 'text', title: 'Journal issue' },
          {
            name: 'authors',
            type: 'paneldynamic',
            title: 'Authors',
            addPanelText: 'Add author',
            removePanelText: 'Remove author',
            panelCount: 1,
            templateElements: [{ name: 'author', type: 'text', title: 'Author', isRequired: true }],
          },
        ],
      });
      this.set('data', {});
    });

    test('dynamic panels are groups named by their title', async function (assert) {
      await render(hbs`<MetadataForm @schema={{this.schema}} @data={{this.data}} />`);
      await waitFor('[data-name=authors][role=group]');

      const group = find('[data-name=authors]')!;
      assert.dom(group).hasAttribute('role', 'group');
      assert.dom(group).doesNotHaveAttribute('aria-required');

      const labelId = group.getAttribute('aria-labelledby');
      assert.ok(labelId, 'group has aria-labelledby');
      assert.dom(`#${labelId}`).hasText('Authors');
      const buttons = findAll('[data-name=authors] button').map((b) => b.textContent?.trim());
      assert.ok(buttons.includes('Add author'), 'add button uses the schema copy');
      assert.ok(buttons.includes('Remove author'), 'remove button uses the schema copy');
    });

    test('required questions show "(required)" and set aria-required', async function (assert) {
      await render(hbs`<MetadataForm @schema={{this.schema}} @data={{this.data}} />`);
      await waitFor('[data-name=publicationDate] input');

      assert.dom('[data-name=publicationDate] .sd-question__required-text').hasText('(required)');
      assert.dom('[data-name=publicationDate] input').hasAttribute('aria-required', 'true');
      assert.dom('[data-name=author] input').hasAttribute('aria-required', 'true');

      assert.dom('[data-name=issue] .sd-question__required-text').doesNotExist();
      assert.dom('[data-name=issue] input').hasAttribute('aria-required', 'false');
    });

    test('question titles start at h2 and nest without skipping levels', async function (assert) {
      await render(hbs`<MetadataForm @schema={{this.schema}} @data={{this.data}} />`);
      await waitFor('[data-name=author]');

      assert.dom('[data-name=publicationDate] h2').exists();
      assert.dom('[data-name=issue] h2').exists();
      assert.dom('[data-name=authors] h2').hasText('Authors');
      assert.dom('[data-name=author] h3').exists();
      assert.strictEqual(findAll('#metadata-form h4, #metadata-form h5, #metadata-form h6').length, 0);
    });
  });

  test('Test "stripEmptyArrays"', function (assert) {
    const obj = {
      one: [],
      two: ['moo'],
      three: undefined,
      four: [''],
      five: [{}],
      six: {},
      seven: { moo: [] },
    };
    const result = stripEmptyArrays(obj);

    assert.notOk('one' in result);
    assert.ok('two' in result);
    assert.ok('three' in result);
    assert.ok('four' in result);
    assert.ok('five' in result);
    assert.ok('six' in result);
    assert.ok('seven' in result);
    assert.ok('moo' in (result.seven as Record<string, unknown>));
  });
});
