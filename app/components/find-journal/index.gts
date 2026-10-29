import Component from '@glimmer/component';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import { dropTask, timeout } from 'ember-concurrency';
import type { Task } from 'ember-concurrency';
import PowerSelect from 'ember-power-select/components/power-select';
import { findRecord } from 'pass-ui/builders/pass-api';
import type AutocompleteService from 'pass-ui/services/autocomplete';
import type JournalModel from 'pass-ui/models/journal';
import type AppStore from 'pass-ui/services/store';

const eq = (a: unknown, b: unknown) => a === b;

const perform =
  (task: Task<unknown, unknown[]>) =>
  (...args: unknown[]) =>
    task.perform(...args);

const DEBOUNCE_MS = 750;

// The parts of the power-select public API used here (types/ember-power-select overrides the addon's types)
interface Select {
  isOpen: boolean;
  selected: unknown;
  actions: { select: (selected: unknown, event?: Event) => void };
}

interface FindJournalSignature {
  Element: HTMLDivElement;
  Args: {
    journalClass: string;
    value: JournalModel | null;
    selectJournal: (journal: JournalModel | null) => void;
    id?: string;
    ariaLabelledBy?: string;
    isValidDOI?: boolean;
  };
}

export default class FindJournal extends Component<FindJournalSignature> {
  @service declare store: AppStore;

  @service('autocomplete')
  declare autocomplete: AutocompleteService;

  searchJournals = dropTask(async (term: string) => {
    await timeout(DEBOUNCE_MS);
    return this.autocomplete.suggest('journal', 'journalName', term);
  });

  @action
  async onSelect(selected: JournalModel | null) {
    // The clear control (and Delete/Backspace) selects null
    if (!selected) {
      this.args.selectJournal(null);
      return;
    }
    const { content } = await this.store.request(findRecord('journal', selected.id!));
    this.args.selectJournal((content as { data: JournalModel }).data);
  }

  // Kept from @registerAPI so the clear button can use the select's own clear path
  selectAPI: Select | null = null;

  @action
  registerAPI(select: Select | null) {
    this.selectAPI = select;
  }

  // The clear button is a sibling of the combobox trigger rather than the addon's
  // @allowClear control, which is a mouse-only, unnamed span nested inside the trigger.
  @action
  clear(event: Event) {
    const trigger = (event.currentTarget as HTMLElement)
      .closest('.find-journal')
      ?.querySelector<HTMLElement>('.ember-power-select-trigger');
    this.selectAPI?.actions.select(null, event);
    // The button goes away with the selection, so keep focus in the field
    trigger?.focus();
  }

  // Run the clear on keydown and stop the browser's synthesized click, so Enter and
  // Space clear exactly once
  @action
  clearOnKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.clear(event);
    }
  }

  // Delete or Backspace on the closed trigger also clears the selection
  @action
  onKeydown(select: Select, event: KeyboardEvent) {
    if (!select.isOpen && select.selected && (event.key === 'Delete' || event.key === 'Backspace')) {
      event.preventDefault();
      select.actions.select(null, event);
      return false;
    }
    return true;
  }

  <template>
    <div class='find-journal {{if @value "find-journal-clearable"}}'>
      <PowerSelect
        @triggerClass={{if (eq @journalClass 'is-invalid') 'is-invalid'}}
        @search={{perform this.searchJournals}}
        @searchEnabled={{true}}
        @selected={{@value}}
        @placeholder='Journal'
        @registerAPI={{this.registerAPI}}
        @triggerId={{@id}}
        @ariaLabelledBy={{@ariaLabelledBy}}
        @onKeydown={{this.onKeydown}}
        data-test-find-journal-select
        @onChange={{this.onSelect}}
        as |journal|
      >
        {{journal.journalName}}
      </PowerSelect>
      {{#if @value}}
        <button
          type='button'
          class='find-journal-clear'
          aria-label='Clear journal selection'
          {{on 'click' this.clear}}
          {{on 'keydown' this.clearOnKeydown}}
          data-test-find-journal-clear
        >
          <span aria-hidden='true'>&times;</span>
        </button>
      {{/if}}
    </div>
  </template>
}
