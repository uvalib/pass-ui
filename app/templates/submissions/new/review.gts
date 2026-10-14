import type { TemplateOnlyComponent } from '@ember/component/template-only';
import type SubmissionsNewReview from 'pass-ui/controllers/submissions/new/review';
import WorkflowWrapper from 'pass-ui/components/workflow-wrapper';
import WorkflowReview from 'pass-ui/components/workflow-review';
import { pageTitle } from 'ember-page-title';

interface Signature {
  Args: {
    controller: SubmissionsNewReview;
  };
}

// prettier-ignore
<template>
  {{pageTitle 'Review'}}
  <WorkflowWrapper
    @submission={{@controller.submission}}
    @title={{@controller.publication.title}}
    @isProxySubmission={{@controller.submission.isProxySubmission}}
    @submissionEvents={{@controller.submissionEvents}}
    @loadTab={{@controller.loadTab}}
    @updateCovidSubmission={{@controller.updateCovidSubmission}}
  >
    <WorkflowReview
      @submission={{@controller.submission}}
      @publication={{@controller.publication}}
      @comment={{@controller.comment}}
      @back={{@controller.loadPrevious}}
      @submitSubmission={{@controller.submit}}
      @uploading={{@controller.uploading}}
      @waitingMessage={{@controller.waitingMessage}}
      @abort={{@controller.abort}}
    />
  </WorkflowWrapper>
</template> satisfies TemplateOnlyComponent<Signature>
