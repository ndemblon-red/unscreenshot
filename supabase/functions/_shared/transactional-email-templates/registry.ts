// Registry of all transactional email templates.
// Each template module exports `template` satisfying TemplateEntry.

import type { ComponentType } from 'npm:react@18.3.1'

import { template as reminderDeadline } from './reminder-deadline.tsx'
import { template as reminderShared } from './reminder-shared.tsx'
import { template as passwordChanged } from './password-changed.tsx'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  to?: string
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  'reminder-deadline': reminderDeadline,
  'reminder-shared': reminderShared,
  'password-changed': passwordChanged,
}
