'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useField, FieldLabel, FieldError } from '@payloadcms/ui'
import type { TextFieldClientProps } from 'payload'
import { COUNTRIES } from '../lib/countries'

function isoToFlag(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
}

export const CountryPickerField: React.FC<TextFieldClientProps> = (props) => {
  const { field, path } = props

  const { value: isoValue, setValue: setIsoValue } = useField<string>({ path })

  // Derive the sibling 'name' field path by swapping the last segment
  const namePath = path.replace(/[^.]+$/, 'name')
  const { setValue: setNameValue } = useField<string>({ path: namePath })

  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = COUNTRIES.find((c) => c.code === isoValue?.toUpperCase())

  const filtered = search.trim()
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.code.toLowerCase().includes(search.toLowerCase()),
      )
    : COUNTRIES

  const handleSelect = useCallback(
    (country: { code: string; name: string }) => {
      setIsoValue(country.code)
      setNameValue(country.name)
      setSearch('')
      setOpen(false)
    },
    [setIsoValue, setNameValue],
  )

  const handleOpen = useCallback(() => {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="field-type" ref={containerRef} style={{ position: 'relative' }}>
      <FieldLabel label={field.label} required={field.required} />

      {/* Trigger button */}
      <button
        type="button"
        onClick={handleOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          width: '100%',
          padding: '0.5rem 0.75rem',
          border: open
            ? '1px solid var(--theme-elevation-400)'
            : '1px solid var(--theme-elevation-150)',
          borderRadius: '4px',
          cursor: 'pointer',
          background: 'var(--theme-elevation-0, transparent)',
          color: 'var(--theme-text)',
          textAlign: 'left',
          minHeight: '40px',
          transition: 'border-color 0.15s',
        }}
      >
        {selected ? (
          <>
            <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{isoToFlag(selected.code)}</span>
            <span style={{ flex: 1 }}>{selected.name}</span>
            <span style={{ opacity: 0.45, fontSize: '0.78rem', fontFamily: 'monospace' }}>
              {selected.code}
            </span>
          </>
        ) : (
          <span style={{ opacity: 0.45 }}>Select a country…</span>
        )}
        <span style={{ opacity: 0.4, marginLeft: selected ? '0' : 'auto', fontSize: '0.75rem' }}>
          ▾
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 200,
            background: 'var(--theme-elevation-0, white)',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '4px',
            boxShadow: '0 6px 24px rgba(0,0,0,0.14)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '280px',
          }}
        >
          {/* Search input */}
          <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--theme-elevation-100)' }}>
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or code…"
              style={{
                width: '100%',
                padding: '0.4rem 0.6rem',
                border: '1px solid var(--theme-elevation-150)',
                borderRadius: '4px',
                fontSize: '0.875rem',
                background: 'var(--theme-elevation-50, #f9f9f9)',
                color: 'var(--theme-text)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options list */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0 ? (
              <div
                style={{ padding: '0.75rem 1rem', opacity: 0.5, fontSize: '0.875rem' }}
              >
                No countries found
              </div>
            ) : (
              filtered.map((c) => {
                const isActive = isoValue?.toUpperCase() === c.code
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelect(c)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      padding: '0.45rem 0.75rem',
                      cursor: 'pointer',
                      background: isActive
                        ? 'var(--theme-elevation-100)'
                        : 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      color: 'var(--theme-text)',
                      fontSize: '0.875rem',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        e.currentTarget.style.background = 'var(--theme-elevation-50)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isActive
                        ? 'var(--theme-elevation-100)'
                        : 'transparent'
                    }}
                  >
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{isoToFlag(c.code)}</span>
                    <span style={{ flex: 1 }}>{c.name}</span>
                    <span
                      style={{ opacity: 0.4, fontSize: '0.75rem', fontFamily: 'monospace' }}
                    >
                      {c.code}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}

      <FieldError path={path} />
    </div>
  )
}
