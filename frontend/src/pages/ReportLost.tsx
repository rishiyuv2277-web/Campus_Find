import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { CircleAlert, Loader2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PhotoField, SelectField, TextAreaField, TextField, validatePhoto, type PhotoState } from '@/components/FormFields'
import { ReportSuccess } from '@/components/ReportSuccess'
import { CATEGORIES, LOCATIONS } from '@/data/campus'
import { createReport } from '@/services/reports'
import { fileToDataUrl, isApiConfigured } from '@/services/api'
import { findMatches } from '@/utils/matching'
import { today } from '@/lib/format'
import type { CategoryId, ItemReport, MatchResult } from '@/types'

type Values = {
  name: string
  category: string
  description: string
  date: string
  time: string
  location: string
  features: string
  contact: string
  accurate: boolean
}

const EMPTY: Values = {
  name: '',
  category: '',
  description: '',
  date: today(),
  time: '',
  location: '',
  features: '',
  contact: '',
  accurate: false,
}

type Errors = Partial<Record<keyof Values | 'photo', string>>

function validate(v: Values): Errors {
  const e: Errors = {}
  if (!v.name.trim()) e.name = 'Give the item a name so the center can search for it.'
  if (!v.category) e.category = 'Choose the closest category.'
  if (v.description.trim().length < 20)
    e.description = 'Describe it in at least 20 characters — brand, colour, what it looks like.'
  if (!v.date) e.date = 'Tell us the date you last had it.'
  else if (v.date > today()) e.date = 'The date cannot be in the future.'
  if (!v.location) e.location = 'Choose where you last saw it.'
  if (v.features.trim().length < 6) e.features = 'A detail only you would know makes verification possible.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.contact.trim()) && !/^[+\d][\d\s-]{7,}$/.test(v.contact.trim()))
    e.contact = 'Enter a college email address or a phone number we can reach you on.'
  if (!v.accurate) e.accurate = 'Confirm the details are accurate before filing.'
  return e
}

export default function ReportLost() {
  const [values, setValues] = useState<Values>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [photo, setPhoto] = useState<PhotoState>({ url: null, name: null, error: null, file: null })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ report: ItemReport; matches: MatchResult[]; saved: boolean } | null>(null)
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
      document.getElementById(`lost-${Object.keys(found)[0]}`)?.focus()
      return
    }

    setSubmitting(true)
    try {
    const image = await fileToDataUrl(photo.file)
    const { report: created, saved } = await createReport({
      type: 'lost',
      name: values.name.trim(),
      category: values.category as CategoryId,
      description: values.description.trim(),
      date: values.date,
      time: values.time || undefined,
      location: values.location,
      features: values.features.trim(),
      contact: values.contact.trim(),
      status: 'open',
      image,
    })
    const matches = findMatches(created)
    setSubmitting(false)
    setResult({ report: created, matches, saved })
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

  const errorList = Object.entries(errors).filter(([, v]) => v)

  if (result) {
    return (
      <main id="content" className="mx-auto w-full max-w-3xl px-gutter py-12 md:py-16">
        <ReportSuccess
          report={result.report}
          heading="Lost report filed"
          body={isApiConfigured ? `Report ${result.report.id} has been saved to CampusFind. Possible matches are suggestions and must be verified by the campus center.` : `Report ${result.report.id} is saved in this browser only because the backend URL is not configured yet. The campus center has not received it.`}
          matches={result.matches}
          saved={result.saved}
        />
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="outline" className="h-11 rounded-md px-4" onClick={reset}>
            <RotateCcw className="size-4" strokeWidth={2} aria-hidden="true" />
            File another report
          </Button>
          <Button asChild variant="ghost" className="h-11 rounded-md px-4">
            <Link to="/browse">Back to browsing</Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main id="content" className="mx-auto w-full max-w-6xl px-gutter py-10 md:py-16">
      <section aria-labelledby="lost-form-heading" className="max-w-[60ch]">
        <p className="font-label text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
          Report a lost item
        </p>
        <h1 id="lost-form-heading" className="mt-2 font-display text-4xl font-extrabold tracking-[-0.025em] text-balance md:text-5xl">
          Tell us what went missing
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          The more precisely you describe the item, the better the shelf can check it against what students
          hand in. It takes a couple of minutes.
        </p>
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <form noValidate onSubmit={onSubmit} className="space-y-8">
          <fieldset className="space-y-5 rounded-xl border border-border bg-background p-5 shadow-raised sm:p-7">
            <legend className="px-1 font-display text-lg font-bold">The item</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                id="lost-name"
                label="Item name"
                placeholder="Black over-ear headphones"
                value={values.name}
                onChange={(e) => set('name', e.target.value)}
                onBlur={() => blur('name')}
                error={errors.name}
              />
              <SelectField
                id="lost-category"
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
              id="lost-description"
              label="Detailed description"
              placeholder="What it is, its colour, how it is used — anything that would help someone recognise it."
              value={values.description}
              onChange={(e) => set('description', e.target.value)}
              onBlur={() => blur('description')}
              error={errors.description}
              hint={`${values.description.trim().length} characters`}
            />
            <TextAreaField
              id="lost-features"
              label="Distinguishing features"
              placeholder="A cracked left hinge, a library-barcode sticker, purple laces…"
              value={values.features}
              onChange={(e) => set('features', e.target.value)}
              onBlur={() => blur('features')}
              error={errors.features}
              hint="Used privately by the center to verify ownership — never shown in full on the public listing."
            />
          </fieldset>

          <fieldset className="space-y-5 rounded-xl border border-border bg-background p-5 shadow-raised sm:p-7">
            <legend className="px-1 font-display text-lg font-bold">Where and when</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                id="lost-date"
                type="date"
                label="Date lost"
                max={today()}
                value={values.date}
                onChange={(e) => set('date', e.target.value)}
                onBlur={() => blur('date')}
                error={errors.date}
              />
              <TextField
                id="lost-time"
                type="time"
                label="Approximate time"
                optional
                value={values.time}
                onChange={(e) => set('time', e.target.value)}
              />
            </div>
            <SelectField
              id="lost-location"
              label="Last seen at"
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
            <PhotoField id="lost-photo" photo={photo} onChange={handlePhoto} onClear={clearPhoto} />
          </fieldset>

          <fieldset className="space-y-5 rounded-xl border border-border bg-background p-5 shadow-raised sm:p-7">
            <legend className="px-1 font-display text-lg font-bold">How to reach you</legend>
            <TextField
              id="lost-contact"
              label="College email or phone"
              placeholder="you@svit.edu.in"
              value={values.contact}
              onChange={(e) => set('contact', e.target.value)}
              onBlur={() => blur('contact')}
              error={errors.contact}
              hint="Only the center sees this. It is never listed publicly."
            />
            <div>
              <label htmlFor="lost-accurate" className="flex items-start gap-3 rounded-md border border-border bg-muted/40 p-3">
                <input
                  id="lost-accurate"
                  type="checkbox"
                  checked={values.accurate}
                  onChange={(e) => {
                    set('accurate', e.target.checked)
                    if (e.target.checked) setErrors((prev) => ({ ...prev, accurate: undefined }))
                  }}
                  aria-invalid={errors.accurate ? true : undefined}
                  aria-describedby={errors.accurate ? 'lost-accurate-error' : undefined}
                  className="mt-0.5 size-5 shrink-0 accent-primary"
                />
                <span className="text-sm text-foreground">
                  I confirm these details are accurate and that the item is mine to claim.
                </span>
              </label>
              {errors.accurate && (
                <p id="lost-accurate-error" className="mt-1.5 text-xs font-medium text-destructive">
                  {errors.accurate}
                </p>
              )}
            </div>
          </fieldset>

          {errorList.length > 0 && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              <CircleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
              <span>
                {errorList.length} {errorList.length === 1 ? 'field needs' : 'fields need'} attention before this can
                be filed.
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" className="h-12 rounded-md px-6 text-base" disabled={submitting}>
              {submitting && <Loader2 className="size-4 animate-spin" strokeWidth={2} aria-hidden="true" />}
              {submitting ? 'Filing report…' : 'Submit lost report'}
            </Button>
            <Button type="button" variant="ghost" className="h-12 rounded-md px-4" onClick={reset} disabled={submitting}>
              Clear form
            </Button>
          </div>
        </form>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-display text-base font-bold">Fill it in this order</h2>
            <ol className="mt-3 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary font-label text-[11px] font-bold text-primary-foreground">
                  1
                </span>
                Name it in the words you would search for. “Headphones”, not “audio device”.
              </li>
              <li className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary font-label text-[11px] font-bold text-primary-foreground">
                  2
                </span>
                Pin the place and the day from memory. That is the strongest filter of all.
              </li>
              <li className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary font-label text-[11px] font-bold text-primary-foreground">
                  3
                </span>
                Keep one detail back for the center — a scratch, a name written inside a bag.
              </li>
            </ol>
          </div>
          <div className="rounded-xl border border-border bg-accent p-5 text-sm text-accent-foreground">
            <p className="font-semibold">This is a prototype</p>
            <p className="mt-1 text-accent-foreground/80">
              Your report is stored in this browser only. Nothing is sent to the campus center, because there is no
              server connected yet.
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}
