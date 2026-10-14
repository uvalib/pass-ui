import type { TemplateOnlyComponent } from '@ember/component/template-only';
import type SubmissionsNewBasics from 'pass-ui/controllers/submissions/new/basics';
import WorkflowWrapper from 'pass-ui/components/workflow-wrapper';
import WorkflowBasics from 'pass-ui/components/workflow-basics';
import { pageTitle } from 'ember-page-title';

interface Signature {
  Args: {
    controller: SubmissionsNewBasics;
  };
}

// prettier-ignore
<template>
  {{pageTitle 'Basics'}}
  <WorkflowWrapper
    @submission={{@controller.submission}}
    @publication={{@controller.publication}}
    @submissionEvents={{@controller.submissionEvents}}
    @loadTab={{@controller.validateAndLoadTab}}
    @updateCovidSubmission={{@controller.updateCovidSubmission}}
  >
    <WorkflowBasics
      @submission={{@controller.submission}}
      @publication={{@controller.publication}}
      @preLoadedGrant={{@controller.preLoadedGrant}}
      @journal={{@controller.journal}}
      @flaggedFields={{@controller.flaggedFields}}
      @validateTitle={{@controller.validateTitle}}
      @validateJournal={{@controller.validateJournal}}
      @validateSubmitterEmail={{@controller.validateSubmitterEmail}}
      @updatePublication={{@controller.updatePublication}}
      @validateAndLoadTab={{@controller.validateAndLoadTab}}
      @abort={{@controller.abort}}
    />
  </WorkflowWrapper>
</template> satisfies TemplateOnlyComponent<Signature>
