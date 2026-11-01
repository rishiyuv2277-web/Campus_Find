import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { CircleAlert, Clock, Loader2, MapPin, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PhotoField, SelectField, TextAreaField, TextField, validatePhoto, type PhotoState } from '@/components/FormFields'
import { ReportSuccess } from '@/components/ReportSuccess'
import { CATEGORIES, CENTER, LOCATIONS } from '@/data/campus'
import { createReport } from '@/services/reports'
import { fileToDataUrl } from '@/services/api'
import { today } from '@/lib/format'
import type { CategoryId, HandoverState, ItemReport, MatchResult } from '@/types'

type Values = {
  name: string
  category: string
  description: string
  date: string
  location: string
  features: string
  contact: string
  handover: HandoverState
  accurate: boolean
}

const EMPTY: Values = {
  name: '',
  category: '',
  description: '',
  date: today(),
  location: '',
  features: '',
  contact: '',
  handover: 'with-student',
  accurate: false,
}

type Errors = Partial<Record<keyof Values | 'photo', string>>

function validate(v: Values): Errors {
  const e: Errors = {}
  if (!v.name.trim()) e.name = 'Name the item as you would describe it to a friend.'
  if (!v.category) e.category = 'Choose the closest category.'
  if (v.description.trim().length < 15) e.description = 'A sentence about condition and colour is enough.'
  if (!v.date) e.date = 'When did you find it?'
  else if (v.date > today()) e.date = 'The date cannot be in the future.'
  if (!v.location) e.location = 'Where did you find it?'
  if (v.features.trim().length < 4) e.features = 'Note one detail — it is how the owner proves it is theirs.'
  if (!v.accurate) e.accurate = 'Confirm this is a truthful report before submitting.'
  return e
}

const handoverOptions: { value: HandoverState; title: string; body: string }[] = [
  {
    value: 'with-student',
    title: 'Found by student — still with me',
    body: 'The listing says the item is with you. The center will contact you to arrange the hand-in.',
  },
  {
    value: 'handed-over',
    title: 'Received by campus center',
    body: 'You have already handed it to Room A-012. The center marks it received once a staff member confirms it.',
  },
]

export default function ReportFound() {
  const [values, setValues] = useState<Values>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [photo, setPhoto] = useState<PhotoState>({ url: null, name: null, error: null, file: null })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ report: ItemReport; saved: boolean; matches: MatchResult[] } | null>(null)
  const urlRef = useRef<string | null>(null)

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    if (touched[key]) setErrors((prev) => ({ ...prev, [key]: validate({ ...values, [key]: value })[key] }))
  }

  const blur = (key: keyof Values) => {
    setTouched((t) => ({ ...t, [key]: true }))
    setErrors((prev) => ({ ...prev, [key]: validate(values)[key] }))
  }

  const handlePhoto = (file: File) => {
    const problem = validatePhoto(file)
    if (problem) {
      setPhoto((p) => ({ ...p, error: problem }))
      return
    }
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    const url = URL.createObjectURL(file)
    urlRef.current = url
    setPhoto({ url, name: file.name, error: null, file })
  }

  const clearPhoto = () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    urlRef.current = null
    setPhoto({ url: null, name: null, error: null, file: null })
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const found = validate(values)
    setErrors(found)
    setTouched(Object.fromEntries(Object.keys(values).map((k) => [k, true])))
    if (Object.keys(found).length > 0) {
      document.getElementById(`found-${Object.keys(found)[0]}`)?.focus()
      return
    }

    setSubmitting(true)
    try {
      const image = await fileToDataUrl(photo.file)
      const { report, saved } = await createReport({
        type: 'found',
        name: values.name.trim(),
        category: values.category as CategoryId,
        description: values.description.trim(),
        date: values.date,
        location: values.location,
        features: values.features.trim(),
        contact: values.contact.trim(),
        status: values.handover === 'handed-over' ? 'under-review' : 'open',
        handover: values.handover,
        image,
      })
      setSubmitting(false)
      setResult({ report, saved, matches: [] })
    } catch (error) {
      setSubmitting(false)
      setPhoto((p) => ({ ...p, error: error instanceof Error ? error.message : 'Could not save the report. Please try again.' }))
      return
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const reset = () => {
    clearPhoto()
    setValues(EMPTY)
    setErrors({})
    setTouched({})
  }

  if (result) {
    return (
      <main className="mx-auto w-full max-w-3xl px-gutter py-12 md:py-16">
        <ReportSuccess
          report={result.report}
          heading="Found report filed"
          body={`Report ${result.report.id} is listed. It shows as ${
            result.report.handover === 'handed-over' ? '“Received by campus center” only after staff confirm it' : '“Found by student”'
          } — nothing is marked deposited until the center has the item in hand.`}
          matches={[]}
          saved={result.saved}
        />
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="outline" className="h-11 rounded-md px-4" onClick={reset}>
            <RotateCcw className="size-4" strokeWidth={2} aria-hidden="true" />
            Report another find
          </Button>
          <Button asChild variant="ghost" className="h-11 rounded-md px-4">
            <Link to="/center">How hand-in works</Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-gutter py-10 md:py-16">
      <section aria-labelledby="found-form-heading" className="max-w-[60ch]">
        <p className="font-label text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">Report a found item</p>
        <h1 id="found-form-heading" className="mt-2 font-display text-4xl font-extrabold tracking-[-0.025em] text-balance md:text-5xl">
          You found something. List it.
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          One clear photo and the exact spot you found it is usually enough for the owner to spot their own
          listing within a day.
        </p>
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <form noValidate onSubmit={onSubmit} className="space-y-8">
          <fieldset className="space-y-5 rounded-xl border border-border bg-background p-5 shadow-raised sm:p-7">
            <legend className="px-1 font-display text-lg font-bold">The item you found</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                id="found-name"
                label="Item name"
                placeholder="Steel water bottle"
                value={values.name}
                onChange={(e) => set('name', e.target.value)}
                onBlur={() => blur('name')}
                error={errors.name}
              />
              <SelectField
                id="found-category"
                label="Category"
                value={values.category}
                onChange={(e) => set('category', e.target.value)}
                onBlur={() => blur('category')}
                error={errors.category}
              >
                <option value="">Choose a category</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </SelectField>
            </div>
            <TextAreaField
              id="found-description"
              label="Description and condition"
              placeholder="Blue 750 ml bottle, matte finish, still has water in it."
              value={values.description}
              onChange={(e) => set('description', e.target.value)}
              onBlur={() => blur('description')}
              error={errors.description}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                id="found-date"
                type="date"
                label="Date found"
                max={today()}
                value={values.date}
                onChange={(e) => set('date', e.target.value)}
                onBlur={() => blur('date')}
                error={errors.date}
              />
              <SelectField
                id="found-location"
                label="Where you found it"
                value={values.location}
                onChange={(e) => set('location', e.target.value)}
                onBlur={() => blur('location')}
                error={errors.location}
              >
                <option value="">Choose a campus location</option>
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </SelectField>
            </div>
            <TextAreaField
              id="found-features"
              label="Distinguishing features"
              placeholder="A sticker on the base, a name written inside the lid…"
              value={values.features}
              onChange={(e) => set('features', e.target.value)}
              onBlur={() => blur('features')}
              error={errors.features}
              hint="Kept for verification. The owner is asked to describe the same detail before collecting."
            />
            <PhotoField
              id="found-photo"
              photo={photo}
              onChange={handlePhoto}
              onClear={clearPhoto}
              label="Photograph of the item"
              hint="Photograph it on a plain surface if you can — a clear photo is the fastest way to a match."
            />
          </fieldset>

          <fieldset className="space-y-4 rounded-xl border border-border bg-background p-5 shadow-raised sm:p-7">
            <legend className="px-1 font-display text-lg font-bold">Where is it right now?</legend>
            <div className="space-y-2.5">
              {handoverOptions.map((option) => (
                <label
                  key={option.value}
                  htmlFor={`found-handover-${option.value}`}
                  className="flex cursor-pointer gap-3 rounded-md border border-border p-3 transition-colors duration-150 has-checked:border-primary has-checked:bg-accent"
                >
                  <input
                    id={`found-handover-${option.value}`}
                    type="radio"
                    name="found-handover"
                    value={option.value}
                    checked={values.handover === option.value}
                    onChange={() => set('handover', option.value)}
                    className="mt-1 size-5 shrink-0 accent-primary"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{option.title}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{option.body}</span>
                  </span>
                </label>
              ))}
            </div>
            <TextField
              id="found-contact"
              label="Contact"
              optional
              placeholder="you@svit.edu.in"
              value={values.contact}
              onChange={(e) => set('contact', e.target.value)}
              hint="Optional, but the center needs a way to reach you if the owner comes forward."
            />
            <div>
              <label htmlFor="found-accurate" className="flex items-start gap-3 rounded-md border border-border bg-muted/40 p-3">
                <input
                  id="found-accurate"
                  type="checkbox"
                  checked={values.accurate}
                  onChange={(e) => {
                    set('accurate', e.target.checked)
                    if (e.target.checked) setErrors((prev) => ({ ...prev, accurate: undefined }))
                  }}
                  aria-invalid={errors.accurate ? true : undefined}
                  aria-describedby={errors.accurate ? 'found-accurate-error' : undefined}
                  className="mt-0.5 size-5 shrink-0 accent-primary"
                />
                <span className="text-sm text-foreground">
                  I confirm I found this item and have described it honestly.
                </span>
              </label>
              {errors.accurate && (
                <p id="found-accurate-error" className="mt-1.5 text-xs font-medium text-destructive">
                  {errors.accurate}
                </p>
              )}
            </div>
          </fieldset>

          {Object.values(errors).some(Boolean) && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              <CircleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
              <span>Check the highlighted fields before submitting.</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" className="h-12 rounded-md px-6 text-base" disabled={submitting}>
              {submitting && <Loader2 className="size-4 animate-spin" strokeWidth={2} aria-hidden="true" />}
              {submitting ? 'Submitting…' : 'Submit found report'}
            </Button>
            <Button type="button" variant="ghost" className="h-12 rounded-md px-4" onClick={reset} disabled={submitting}>
              Clear form
            </Button>
          </div>
        </form>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="border-b border-border bg-primary px-5 py-4 text-primary-foreground">
              <p className="font-label text-[11px] font-semibold tracking-[0.1em] text-primary-foreground/70 uppercase">
                Drop-off
              </p>
              <h2 className="mt-1 font-display text-lg font-bold">{CENTER.name}</h2>
            </div>
            <div className="space-y-3 px-5 py-4 text-sm">
              <p className="flex gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={2} aria-hidden="true" />
                <span>
                  {CENTER.block}
                  <br />
                  {CENTER.room}
                </span>
              </p>
              <div className="flex gap-2.5">
                <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={2} aria-hidden="true" />
                <ul className="space-y-0.5 text-muted-foreground">
                  {CENTER.hours.map((h) => (
                    <li key={h.day}>
                      <span className="text-foreground">{h.day}</span> · {h.time}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-accent p-5 text-sm text-accent-foreground">
            <p className="font-semibold">Found by student ≠ received by center</p>
            <p className="mt-1 text-accent-foreground/80">
              An item is only marked received once a staff member logs it at the desk. Until then the listing says it
              is with you, so the owner knows who to ask.
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}
