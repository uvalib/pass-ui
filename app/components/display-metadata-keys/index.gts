import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type Owner from '@ember/owner';
import type MetadataSchemaService from 'pass-ui/services/metadata-schema';
import type { MetadataDisplayEntry } from 'pass-ui/services/metadata-schema';
import type SubmissionModel from 'pass-ui/models/submission';

interface DisplayMetadataKeysSignature {
  Args: {
    submission: SubmissionModel;
  };
  Blocks: {
    default: [];
  };
}

export default class DisplayMetadataKeys extends Component<DisplayMetadataKeysSignature> {
  @service declare metadataSchema: MetadataSchemaService;

  @tracked displayData: MetadataDisplayEntry[] | null = null;

  constructor(owner: Owner, args: DisplayMetadataKeysSignature['Args']) {
    super(owner, args);
    this.setupDisplayData();
  }

  async setupDisplayData() {
    const schemaService = this.metadataSchema;
    const displayData = await schemaService.displayMetadata(this.args.submission);
    this.displayData = displayData;
  }

  <template>
    {{! template-lint-disable no-triple-curlies }}
    <dl class='key-value-list d-flex flex-column gap-3'>
      {{#each this.displayData as |data|}}
        <div>
          {{#if data.isArray}}
            <dt>{{data.label}}</dt>
            <dd class='d-block'>
              <ul>
                {{! @glint-expect-error - data.value is unknown }}
                {{#each data.value as |moo|}}
                  <li>
                    <dl class='key-value-list mb-0'>
                      {{#each-in moo as |key val|}}
                        <div class='d-inline'>
                          {{! @glint-ignore - key/val are unknown from each-in on unknown value }}
                          <dt>{{key}}<span aria-hidden='true'> :</span></dt>
                          <dd>{{val}}</dd>
                        </div>
                      {{/each-in}}
                    </dl>
                  </li>
                {{/each}}
              </ul>
            </dd>
          {{else}}
            <dt>{{data.label}}<span aria-hidden='true'> :</span></dt>
            {{! @glint-expect-error - data.value is unknown }}
            <dd>{{{data.value}}}</dd>
          {{/if}}
        </div>
      {{/each}}
    </dl>
    {{yield}}
  </template>
}
