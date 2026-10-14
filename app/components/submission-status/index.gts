import type { TemplateOnlyComponent } from '@ember/component/template-only';
import TooltipHost from 'pass-ui/components/tooltip-host';

const eq = (a: unknown, b: unknown) => a === b;

interface SubmissionStatusSignature {
  Args: {
    submissionStatus: string;
  };
}

// prettier-ignore
<template>
  <span class='status {{@submissionStatus}} pr-1' data-test-submission-detail-status>
    {{#if (eq @submissionStatus 'manuscript-required')}}
      <TooltipHost
        @position='left'
        @text='Your funder is aware of this publication and is expecting the deposit of your manuscript.'
      >
        <i class='fas fa-info-circle' aria-hidden='true'></i>
        manuscript required
      </TooltipHost>
    {{/if}}
    {{#if (eq @submissionStatus 'approval-requested')}}
      <TooltipHost
        @position='left'
        @text='This submission has been prepared on behalf of the designated submitter and is awaiting approval before being submitted.'
      >
        <i class='fas fa-info-circle' aria-hidden='true'></i>
        approval requested
      </TooltipHost>
    {{/if}}
    {{#if (eq @submissionStatus 'changes-requested')}}
      <TooltipHost @position='left' @text='The designated submitter has requested changes to this submission'>
        <i class='fas fa-info-circle' aria-hidden='true'></i>
        changes requested
      </TooltipHost>
    {{/if}}
    {{#if (eq @submissionStatus 'cancelled')}}
      <TooltipHost @position='left' @text='This submission has been cancelled by the designated submitter'>
        <i class='fas fa-info-circle' aria-hidden='true'></i>
        cancelled
      </TooltipHost>
    {{/if}}
    {{#if (eq @submissionStatus 'submitted')}}
      <TooltipHost
        @position='left'
        @text='The submission was successfully created. PASS will deposit this work into the target repositories and provide a link and feedback where available'
      >
        <i class='fas fa-info-circle' aria-hidden='true'></i>
        submitted
      </TooltipHost>
    {{/if}}
    {{#if (eq @submissionStatus 'needs-attention')}}
      <TooltipHost
        @position='left'
        @text='PASS has delivered the submission, but one or more repositories have indicated that there may be a need for further action before the submission is complete. View the submission for more details'
      >
        <i class='fas fa-info-circle' aria-hidden='true'></i>
        needs attention
      </TooltipHost>
    {{/if}}
    {{#if (eq @submissionStatus 'complete')}}
      <TooltipHost
        @position='left'
        @text='The submission was accepted by all target repositories and is either pending publication or already published'
      >
        <i class='fas fa-info-circle' aria-hidden='true'></i>
        complete
      </TooltipHost>
    {{/if}}
    {{#if (eq @submissionStatus 'draft')}}
      <TooltipHost
        @position='left'
        @text='This submission is a draft. No action will be taken on this submission until it is completed.'
      >
        <i class='fas fa-info-circle' aria-hidden='true'></i>
        draft
      </TooltipHost>
    {{/if}}
  </span>
</template> satisfies TemplateOnlyComponent<SubmissionStatusSignature>
