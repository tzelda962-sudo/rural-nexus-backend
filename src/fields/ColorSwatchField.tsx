'use client'

import React from 'react'
import { useField, FieldLabel, FieldDescription, FieldError } from '@payloadcms/ui'
import type { TextFieldClientProps } from 'payload'
import { COLOR_PALETTE, COLOR_OPTIONS } from '../lib/colorPalette'

export const ColorSwatchField: React.FC<TextFieldClientProps> = (props) => {
  const { field, path } = props
  const { value, setValue } = useField<string>({ path })

  const options = COLOR_OPTIONS

  return (
    <div className="field-type color-swatch-field">
      <FieldLabel label={field.label} required={field.required} />
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginTop: '0.5rem',
          marginBottom: '0.5rem',
        }}
      >
        {options.map((opt) => {
          const hex = COLOR_PALETTE[opt.value] ?? '#cccccc'
          const selected = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue(opt.value)}
              title={opt.label}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: hex,
                border: selected ? '3px solid var(--theme-elevation-800, #000)' : '2px solid var(--theme-elevation-150, #ddd)',
                boxShadow: selected ? '0 0 0 2px rgba(0,0,0,0.15)' : 'none',
                cursor: 'pointer',
                transform: selected ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.15s ease',
              }}
            />
          )
        })}
      </div>
      <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>
        Selected: <strong>{value ?? '(none)'}</strong>
      </div>
      {field.admin?.description ? <FieldDescription description={field.admin.description as string} path={path} /> : null}
      <FieldError path={path} />
    </div>
  )
}
