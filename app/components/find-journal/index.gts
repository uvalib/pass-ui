import Component from '@glimmer/component';
import { action } from '@ember/object';
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

  // The addon's clear control only responds to the mouse, so let keyboard users
  // clear the selection with Delete or Backspace while the dropdown is closed.
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
    <PowerSelect
      @triggerClass={{if (eq @journalClass 'is-invalid') 'is-invalid'}}
      @search={{perform this.searchJournals}}
      @searchEnabled={{true}}
      @selected={{@value}}
      @placeholder='Journal'
      @allowClear={{true}}
      @triggerId={{@id}}
      @ariaLabelledBy={{@ariaLabelledBy}}
      @onKeydown={{this.onKeydown}}
      data-test-find-journal-select
      @onChange={{this.onSelect}}
      as |journal|
    >
      {{journal.journalName}}
    </PowerSelect>
  </template>
}
