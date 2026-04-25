import type { Field } from 'payload'

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

export const slugField = (sourceField = 'title', opts: { unique?: boolean; sidebar?: boolean } = {}): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: opts.unique ?? true,
  index: true,
  admin: {
    position: opts.sidebar === false ? undefined : 'sidebar',
    description: `URL slug. Auto-filled from ${sourceField}; edit to customize.`,
  },
  hooks: {
    beforeValidate: [
      ({ value, data, operation }) => {
        if (typeof value === 'string' && value.length > 0) return slugify(value)
        if (operation === 'create' && data && typeof data[sourceField] === 'string') {
          return slugify(data[sourceField] as string)
        }
        return value
      },
    ],
  },
})
