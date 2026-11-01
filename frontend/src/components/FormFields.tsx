import * as React from 'react'
import { ImageOff, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

/* Field primitives shared by the two report forms. Each control owns its own
   error text, tied by aria-describedby, so a message can never float free of
   the field it belongs to. */

type BaseProps = {
  id: string
  label: string
  error?: string
  hint?: string
  optional?: boolean
}

export function FieldShell({
  id,
  label,
  error,
  hint,
  optional,
  children,
  className,
}: BaseProps & { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
        {optional && <span className="font-normal text-muted-foreground"> (optional)</span>}
      </Label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

export function describedBy(id: string, error?: string, hint?: string) {
  return [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined
}

export function TextField({
  optional,
  hint,
  error,
  className,
  label,
  id,
  ...props
}: BaseProps & React.ComponentProps<typeof Input> & { className?: string }) {
  return (
    <FieldShell id={id} label={label} optional={optional} hint={hint} error={error} className={className}>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className="h-11 rounded-md bg-background md:text-sm"
        {...props}
      />
    </FieldShell>
  )
}

export function TextAreaField({
  optional,
  hint,
  error,
  label,
  id,
  ...props
}: BaseProps & React.ComponentProps<typeof Textarea>) {
  return (
    <FieldShell id={id} label={label} optional={optional} hint={hint} error={error}>
      <Textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className="min-h-28 rounded-md bg-background md:text-sm"
        {...props}
      />
    </FieldShell>
  )
}

export function SelectField({
  optional,
  hint,
  error,
  label,
  id,
  children,
  ...props
}: BaseProps & React.ComponentProps<'select'>) {
  return (
    <FieldShell id={id} label={label} optional={optional} hint={hint} error={error}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  )
}

/* File input + preview. The photo is held in memory as an object URL and only
   the report record is persisted — no base64 image goes near localStorage. */

export const MAX_PHOTO_BYTES = 4 * 1024 * 1024
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']

export type PhotoState = {
  url: string | null
  name: string | null
  error: string | null
  file: File | null
}

export function PhotoField({
  id,
  photo,
  onChange,
  onClear,
  label = 'Photograph of the item',
  hint = 'JPG, PNG or WebP, up to 4 MB. A clear photo is what makes matching work.',
}: {
  id: string
  photo: PhotoState
  onChange: (file: File) => void
  onClear: () => void
  label?: string
  hint?: string
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleFile = (file: File | undefined) => {
    if (!file) return
    onChange(file)
  }

  return (
    <FieldShell id={id} label={label} hint={hint} error={photo.error ?? undefined}>
      <div className="rounded-md border border-border bg-background p-3">
        {photo.url ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <img
              src={photo.url}
              alt={`Preview of the photograph attached to this report: ${photo.name ?? 'item photo'}`}
              width={320}
              height={240}
              className="h-28 w-36 shrink-0 rounded-md border border-border object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{photo.name}</p>
              <p className="text-xs text-muted-foreground">Attached to this report. Not shared publicly until the center reviews it.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-md px-3"
                  onClick={() => inputRef.current?.click()}
                >
                  <Upload className="size-4" strokeWidth={2} aria-hidden="true" />
                  Replace
                </Button>
                <Button type="button" variant="ghost" size="sm" className="h-9 rounded-md px-3" onClick={onClear}>
                  <X className="size-4" strokeWidth={2} aria-hidden="true" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <label
            htmlFor={id}
            className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-sm px-4 py-6 text-center transition-colors duration-150 hover:bg-muted/70"
          >
            <span className="grid size-10 place-items-center rounded-full bg-accent text-accent-foreground">
              <ImageOff className="size-5" strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="mt-1 text-sm font-semibold text-foreground">Attach a photograph</span>
            <span className="text-xs text-muted-foreground">Tap to choose a file from this device</span>
          </label>
        )}
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={ACCEPTED.join(',')}
          aria-describedby={describedBy(id, photo.error ?? undefined, hint)}
          aria-invalid={photo.error ? true : undefined}
          className={photo.url ? 'sr-only' : 'sr-only'}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </FieldShell>
  )
}

export function validatePhoto(file: File): string | null {
  if (!ACCEPTED.includes(file.type)) return 'That file type is not supported. Choose a JPG, PNG or WebP image.'
  if (file.size > MAX_PHOTO_BYTES) return 'That image is larger than 4 MB. Choose a smaller file.'
  return null
}
