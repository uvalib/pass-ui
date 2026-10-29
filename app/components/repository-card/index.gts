import Component from '@glimmer/component';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import { guidFor } from '@ember/object/internals';
import type RepositoryModel from 'pass-ui/models/repository';

interface RepositoryCardSignature {
  Args: {
    repository: RepositoryModel;
    type: string;
    toggleRepository?: (repo: RepositoryModel, selected: boolean, type: string) => void;
    choice?: string;
    funders?: string;
  };
  Blocks: {
    default: [];
  };
}

export default class RepositoryCard extends Component<RepositoryCardSignature> {
  // Repository names can contain spaces and punctuation, so the checkbox id is built from the
  // repository id (falling back to this component's guid for unsaved records) to give the
  // visible label a valid, unique `for` target.
  get checkboxId() {
    const id = this.args.repository.id;
    return `repository-checkbox-${id ? id : guidFor(this)}`;
  }

  @action
  toggle(event: Event) {
    const selected = (event.target as HTMLInputElement).checked;
    this.args.toggleRepository!(this.args.repository, selected, this.args.type);
  }

  <template>
    <li class='list-group-item d-flex align-items-center my-1 gap-2'>
      {{#if @choice}}
        <input
          id={{this.checkboxId}}
          type='checkbox'
          name={{@repository.name}}
          checked={{@repository._selected}}
          {{on 'click' this.toggle}}
        />
        <label for={{this.checkboxId}} class='mb-0 ml-2'>
          {{@repository.name}}{{#if @funders}}
            -
            {{@funders}}
          {{/if}}
        </label>
      {{else}}
        {{@repository.name}}{{#if @funders}}
          -
          {{@funders}}
        {{/if}}
      {{/if}}

      {{#if @repository.description}}
        <p>
          {{@repository.description}}
        </p>
      {{/if}}
      {{yield}}
    </li>
  </template>
}
