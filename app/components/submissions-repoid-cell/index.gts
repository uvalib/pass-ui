import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { modifier } from 'ember-modifier';
import { query } from 'pass-ui/builders/pass-api';
import type Owner from '@ember/owner';
import type SubmissionModel from 'pass-ui/models/submission';
import type RepositoryCopyModel from 'pass-ui/models/repository-copy';
import type AppStore from 'pass-ui/services/store';

interface DisplayIdInfo {
  url: string;
  ids: Array<{ title: string; display: string }>;
}

interface SubmissionsRepoidCellSignature {
  Args: {
    record: SubmissionModel;
  };
}

export default class SubmissionsRepoidCell extends Component<SubmissionsRepoidCellSignature> {
  @service declare store: AppStore;

  @tracked repoCopies: RepositoryCopyModel[] | null = null;

  constructor(owner: Owner, args: SubmissionsRepoidCellSignature['Args']) {
    super(owner, args);
    this.setUpRepoidCell();
  }

  async setUpRepoidCell() {
    const publication = this.args.record.publication;
    if (!publication?.id) {
      if (!(this.isDestroyed || this.isDestroying)) {
        this.repoCopies = [];
        return;
      }
    }

    const queryHash = {
      filter: {
        repositoryCopy: `publication.id==${publication.id}`,
      },
    };

    this.store.request(query('repository-copy', queryHash)).then((result) => {
      if (!(this.isDestroyed || this.isDestroying)) {
        this.repoCopies = (result.content as { data: RepositoryCopyModel[] }).data;
      }
    });
  }

  setupTooltip = modifier(() => {
    if (!document.querySelector('#manuscriptIdTooltip')) {
      const th = document.querySelector('.table-header:nth-child(6)');
      const button = document.createElement('button');
      const icon = document.createElement('i');
      const description = document.createElement('span');
      const text = 'IDs are assigned to manuscripts by target repositories.';

      // Same markup as the TooltipHost component, so the tooltip is keyboard accessible
      button.id = 'manuscriptIdTooltip';
      button.type = 'button';
      button.className = 'tooltip-host';
      button.setAttribute('aria-label', 'About Manuscript IDs');
      button.setAttribute('aria-describedby', 'manuscriptIdTooltipText');
      button.setAttribute('tooltip-position', 'bottom');
      button.setAttribute('tooltip', text);
      icon.classList.add('fas', 'fa-info-circle', 'd-inline');
      icon.setAttribute('aria-hidden', 'true');
      description.id = 'manuscriptIdTooltipText';
      description.hidden = true;
      description.textContent = text;

      button.appendChild(icon);
      th?.append(button, description);
    }
  });

  formatId(id: string): string {
    const markers = ['/handle/', '/items/'];

    for (const marker of markers) {
      const index = id.indexOf(marker);
      if (index !== -1) {
        return id.slice(index + marker.length);
      }
    }

    return id;
  }

  get displayIds(): DisplayIdInfo[] {
    const rc = this.repoCopies;
    if (!rc) {
      return [];
    }

    return rc
      .filter((repoCopy: RepositoryCopyModel) => !!repoCopy.externalIds)
      .map((repoCopy: RepositoryCopyModel) => {
        const ids = repoCopy.externalIds.map((id: string) => ({
          title: id,
          display: this.formatId(id),
        }));
        return {
          url: repoCopy.accessUrl,
          ids,
        };
      });
  }

  <template>
    <span {{this.setupTooltip}}>
      {{#each this.displayIds as |idInfo|}}
        <ul class='repoid-cell'>
          {{#if idInfo.url}}
            {{#each idInfo.ids as |id|}}
              <a href='{{idInfo.url}}' target='_blank' rel='noopener noreferrer'>
                <li title='{{id.title}}'>
                  {{id.display}}
                </li>
              </a>
            {{/each}}
          {{else}}
            {{#each idInfo.ids as |id|}}
              <li title='{{id.title}}'>
                {{id.display}}
              </li>
            {{/each}}
          {{/if}}
        </ul>
      {{else}}
        <span class='nodata-placeholder'>
          Not available
        </span>
      {{/each}}
    </span>
  </template>
}
