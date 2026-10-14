import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import { guidFor } from '@ember/object/internals';

interface TooltipHostSignature {
  Element: HTMLButtonElement;
  Args: {
    text: string;
    position?: 'left' | 'right' | 'top' | 'bottom';
  };
  Blocks: {
    default: [];
  };
}

/**
 * Host for the CSS `[tooltip]` tooltip (see app.css). Renders a focusable button so keyboard
 * users can reveal the tooltip, and points aria-describedby at a hidden copy of the text
 * because CSS generated content is not announced by assistive tech. Escape hides the
 * tooltip until the button loses focus or is hovered again.
 */
export default class TooltipHost extends Component<TooltipHostSignature> {
  @tracked dismissed = false;

  descriptionId = `${guidFor(this)}-tooltip`;

  @action
  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.dismissed = true;
    }
  }

  @action
  reset() {
    this.dismissed = false;
  }

  <template>
    <button
      type='button'
      class='tooltip-host {{if this.dismissed "tooltip-dismissed"}}'
      tooltip={{@text}}
      tooltip-position={{@position}}
      aria-describedby={{this.descriptionId}}
      ...attributes
      {{on 'keydown' this.handleKeydown}}
      {{on 'blur' this.reset}}
      {{on 'mouseenter' this.reset}}
    >{{yield}}</button><span id={{this.descriptionId}} hidden>{{@text}}</span>
  </template>
}
