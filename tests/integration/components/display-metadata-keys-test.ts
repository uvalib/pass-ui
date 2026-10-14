import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import type MetadataSchemaService from 'pass-ui/services/metadata-schema';

module('Integration | Component | display-metadata-keys', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    const mockData = {
      'journal-NLMTA-ID': 'MOO-ID',
      authors: [
        {
          name: 'Moo Jones',
          orcid: '1234',
        },
        {
          name: 'Moo Too',
        },
      ],
      issns: [
        {
          issn: '1234j-09ufe',
          pubType: 'Online',
        },
      ],
      title: 'This is the title moo',
      'journal-title': 'Journal moo',
    };
    const submission = {
      metadata: JSON.stringify(mockData),
    };

    const mockSchema = {
      properties: {
        authors: {
          type: 'array',
          title: 'Authors of this article or manuscript',
          description: 'List of authors and their associated ORCIDS, if available',
          uniqueItems: true,
          items: {
            type: 'object',
            title: 'Author',
            properties: {
              author: {
                type: 'string',
              },
              orcid: {
                type: 'string',
              },
            },
          },
        },
        title: {
          type: 'string',
          title: 'Article / Manuscript Title',
          description: 'The title of the individual article or manuscript that was submitted',
        },
        issns: {
          type: 'array',
          title: "ISSN information for the manuscript's journal",
          description: 'List of ISSN numbers with optional publication type',
          uniqueItems: true,
          items: {
            type: 'object',
            title: 'ISSN info',
            properties: {
              issn: {
                type: 'string',
                title: 'ISSN ',
              },
              pubType: {
                type: 'string',
                title: 'publication type',
                enum: ['Print', 'Online'],
              },
            },
          },
        },
        'journal-NLMTA-ID': {
          type: 'string',
          title: 'NTMLA',
          description: 'NLM identifier for a journal',
        },
        'journal-title': {
          type: 'string',
          title: 'Journal title',
          description: 'Title of the journal the individual article or manuscript was submitted to',
        },
      },
    };

    this.set('submission', submission);

    const metadataSchema = this.owner.lookup('service:metadata-schema') as MetadataSchemaService;
    metadataSchema.displayMetadata = async (_submission) => [
      { label: 'Journal nlmta-id', value: 'MOO-ID', isArray: false },
      {
        label: 'Authors',
        isArray: true,
        value: [{ name: 'Moo Jones', orcid: '1234' }, { name: 'Moo Too' }],
      },
      {
        label: 'Issns',
        isArray: true,
        value: [{ issn: '1234j-09ufe', pubType: 'Online' }],
      },
      { label: 'Title', isArray: false, value: 'This is the title moo' },
      { label: 'Journal Title', isArray: false, value: 'Journal moo' },
    ];
  });

  test('Check the "display" blob', async function (assert) {
    await render(hbs`<DisplayMetadataKeys @submission={{this.submission}} />`);

    assert.dom(this.element as Element).includesText('Journal nlmta-id : MOO-ID');
    assert.dom(this.element as Element).includesText('Authors');
    assert.dom(this.element as Element).includesText('name : Moo Jones');
  });

  test('labels and values are a description list', async function (assert) {
    await render(hbs`<DisplayMetadataKeys @submission={{this.submission}} />`);

    const pairs = [...this.element.querySelectorAll(':scope > dl > div')].map((pair) => ({
      term: pair.querySelector(':scope > dt')!.textContent!.replace(':', '').trim(),
      hasValue: !!pair.querySelector(':scope > dd'),
    }));
    assert.ok(pairs.length > 0, 'renders top-level pairs');
    assert.ok(
      pairs.every((p) => p.hasValue),
      'every term has a value',
    );
    assert.ok(
      pairs.some((p) => p.term === 'Journal Title'),
      'Journal Title is a term',
    );
    assert.dom('b').doesNotExist('no presentational bold labels');

    const journalTitle = [...this.element.querySelectorAll('dt')].find((dt) =>
      dt.textContent!.includes('Journal Title'),
    );
    assert.dom(journalTitle!.nextElementSibling).hasTagName('dd');
    assert.dom(journalTitle!.nextElementSibling).hasText('Journal moo');
    assert.dom(journalTitle!.querySelector('[aria-hidden="true"]')).hasText(':', 'the visual separator is hidden');

    // Array entries nest a <dl> per item
    assert.dom('dd ul li dl dt').exists();
  });
});
