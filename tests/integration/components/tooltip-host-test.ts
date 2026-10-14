import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { blur, focus, render, triggerEvent, triggerKeyEvent } from '@ember/test-helpers';

module('Integration | Component | tooltip host', (hooks) => {
  setupRenderingTest(hooks);

  test('renders a focusable button described by the tooltip text', async function (assert) {
    await render(hbs`<TooltipHost @position='left' @text='Helpful guidance'>status</TooltipHost>`);

    assert.dom('button').hasAttribute('type', 'button');
    assert.dom('button').hasAttribute('tooltip', 'Helpful guidance');
    assert.dom('button').hasAttribute('tooltip-position', 'left');
    assert.dom('button').hasText('status', 'tooltip text is not part of the accessible name');

    const describedBy = this.element.querySelector('button')!.getAttribute('aria-describedby');
    assert.ok(describedBy, 'has aria-describedby');
    assert.dom(`#${describedBy}`).hasText('Helpful guidance');
  });

  test('passes attributes through to the button', async function (assert) {
    await render(
      hbs`<TooltipHost id='my-tip' class='failed' aria-label='About IDs' @position='top' @text='Some text' />`,
    );

    assert.dom('button#my-tip').hasClass('failed');
    assert.dom('button#my-tip').hasClass('tooltip-host');
    assert.dom('button#my-tip').hasAria('label', 'About IDs');
  });

  test('keyboard focus reveals the tooltip', async function (assert) {
    await render(hbs`<TooltipHost @position='top' @text='Some text'>status</TooltipHost>`);
    const button = this.element.querySelector('button')!;

    assert.strictEqual(getComputedStyle(button, '::after').opacity, '0', 'hidden by default');
    await focus(button);
    assert.true(button.matches(':focus-visible'), 'focus is visible');
    assert.strictEqual(getComputedStyle(button, '::after').opacity, '1', 'shown on focus');

    await triggerKeyEvent(button, 'keydown', 'Escape');
    assert.strictEqual(getComputedStyle(button, '::after').opacity, '0', 'hidden after Escape');
  });

  test('Escape dismisses the tooltip until blur or hover', async function (assert) {
    await render(hbs`<TooltipHost @position='top' @text='Some text'>status</TooltipHost>`);

    await focus('button');
    assert.dom('button').doesNotHaveClass('tooltip-dismissed');

    await triggerKeyEvent('button', 'keydown', 'Escape');
    assert.dom('button').hasClass('tooltip-dismissed');

    await blur('button');
    assert.dom('button').doesNotHaveClass('tooltip-dismissed');

    await focus('button');
    await triggerKeyEvent('button', 'keydown', 'Escape');
    await triggerEvent('button', 'mouseenter');
    assert.dom('button').doesNotHaveClass('tooltip-dismissed');
  });
});
