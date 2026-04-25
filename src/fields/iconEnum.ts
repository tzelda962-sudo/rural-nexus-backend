import type { Field } from 'payload'

export const ICON_OPTIONS = [
  'Layers',
  'Rocket',
  'Info',
  'BarChart3',
  'MessageSquareQuote',
  'BookOpen',
  'Users',
  'Heart',
  'Globe',
  'Target',
  'Zap',
  'Sprout',
  'Droplets',
  'ShieldAlert',
  'Tractor',
  'Check',
  'FileText',
  'Calendar',
  'MapPin',
  'ExternalLink',
  'Quote',
] as const

export type IconName = (typeof ICON_OPTIONS)[number]

export const iconEnumField = (overrides: { name?: string; required?: boolean; defaultValue?: IconName; description?: string } = {}): Field => ({
  name: overrides.name ?? 'icon',
  type: 'select',
  required: overrides.required ?? false,
  defaultValue: overrides.defaultValue,
  options: ICON_OPTIONS.map((v) => ({ label: v, value: v })),
  admin: {
    description:
      overrides.description ??
      'Lucide icon name. Frontend resolves to the corresponding lucide-vue-next component.',
  },
})
