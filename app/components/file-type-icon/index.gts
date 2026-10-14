import type { TemplateOnlyComponent } from '@ember/component/template-only';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import type { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';

interface FileType {
  icon: IconName;
  prefix: IconPrefix;
  label: string;
}

const FILE_TYPES: Record<string, FileType> = {
  png: { icon: 'file-image', prefix: 'fas', label: 'Image' },
  'vnd.openxmlformats-officedocument.presentationml.presentation': {
    icon: 'file-powerpoint',
    prefix: 'fas',
    label: 'PowerPoint',
  },
  msword: { icon: 'file-word', prefix: 'fas', label: 'Word' },
  pdf: { icon: 'file-pdf', prefix: 'fas', label: 'PDF' },
};

const GENERIC_FILE: FileType = { icon: 'file', prefix: 'far', label: 'File' };

// Accepts either a full mime type ('application/pdf') or just its subtype ('pdf').
const fileTypeFor = (mimeType?: string | null): FileType => {
  const subtype = (mimeType ?? '').split('/').pop()!.toLowerCase();
  return FILE_TYPES[subtype] ?? GENERIC_FILE;
};

interface Signature {
  Args: {
    mimeType?: string | null;
  };
}

// The icon itself stays aria-hidden; the visually hidden label gives it a name.
<template>
  {{#let (fileTypeFor @mimeType) as |type|}}
    <FaIcon @icon={{type.icon}} @prefix={{type.prefix}} class='line-height-35 text-gray fa-30' />
    <span class='visually-hidden' data-test-file-type-label>{{type.label}}</span>
  {{/let}}
</template> satisfies TemplateOnlyComponent<Signature>;
