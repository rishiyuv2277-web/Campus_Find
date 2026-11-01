import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { ArrowRight, CircleAlert, Loader2, LogIn, ShieldCheck, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/FormFields'
import { Brand } from '@/components/Brand'
import { useSession } from '@/hooks/useSession'
import { cn } from '@/lib/utils'

/* One form, two modes. Sign-in asks for an email and a password; sign-up adds
   the roll number and department the university would key an account on. Both
   sit on the navy band so the page reads as the college's own front door. */

type Mode = 'signin' | 'signup'

type Values = {
  name: string
  rollNo: string
  department: string
  email: string
  password: string
}

const EMPTY: Values = { name: '', rollNo: '', department: '', email: '', password: '' }

type Errors = Partial<Record<keyof Values, string>>

function validate(mode: Mode, v: Values): Errors {
  const e: Errors = {}
  if (mode === 'signup') {
    if (v.name.trim().length < 3) e.name = 'Enter your full name as it appears on your ID card.'
    /* Roll numbers vary by programme and intake; any 3+ characters, letters,
       digits or dashes are accepted rather than one fixed pattern. */
    if (!/^[A-Za-z0-9][A-Za-z0-9/-]{2,}$/.test(v.rollNo.trim()))
      e.rollNo = 'Enter your college roll number — letters, digits or dashes, at least three characters.'
    if (!v.department.trim()) e.department = 'Tell us your department and year.'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = 'Enter the email address you registered with.'
  if (v.password.length < 8) e.password = 'A password needs at least 8 characters.'
  return e
}

export function AuthForm({ mode }: { mode: Mode }) {
  const isSignUp = mode === 'signup'
  const { user, signIn, signUp } = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const [values, setValues] = useState<Values>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState<'form' | null>(null)

  /* Already signed in: send them where they were headed, or to the dashboard. */
  if (user && !busy) {
    const from = (location.state as { from?: string } | null)?.from ?? '/'
    return <Navigate to={from} replace />
  }

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
    setFormError(null)
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const found = validate(mode, values)
    setErrors(found)
    setFormError(null)
    if (Object.keys(found).length > 0) {
      document.getElementById(`auth-${Object.keys(found)[0]}`)?.focus()
      return
    }

    setBusy('form')
    const result = isSignUp
      ? await signUp({
          name: values.name,
          rollNo: values.rollNo,
          department: values.department,
          email: values.email,
          password: values.password,
        })
      : await signIn(values.email, values.password)

    setBusy(null)
    if (!result.ok) {
      setFormError(result.error)
      if (result.field) {
        setErrors({ [result.field]: result.error })
        document.getElementById(`auth-${result.field}`)?.focus()
      }
      return
    }
    /* The home page opens once there is a session — the desk needs a name. */
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-16">
      {/* The left column explains what an account is for; the form is on the right. */}
      <div className="max-w-[54ch]">
        <Brand tone="light" size="lg" />
        <h1 className="mt-8 font-display text-[length:var(--hero-mobile)] font-extrabold tracking-[-0.03em] text-foreground text-balance md:text-5xl">
          {isSignUp ? 'One account for everything you lose on campus.' : 'Sign in to your CampusFind desk.'}
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          {isSignUp
            ? 'Your reports, your possible matches and the center’s verification step all live behind one student account.'
            : 'Pick up your reports, follow a possible match and see what the Lost & Found Center has decided about a claim.'}
        </p>

        <ul className="mt-8 space-y-4">
          {[
            ['Report once, in either direction', 'File a lost item or hand in something you found from the same account.'],
            ['See every candidate side by side', 'Your lost report is compared with what students have handed in.'],
            ['Nothing moves without a person', 'The center verifies ownership before an item is released.'],
          ].map(([title, body]) => (
            <li key={title} className="flex gap-3">
              <ShieldCheck
                className="mt-0.5 size-5 shrink-0 text-primary"
                strokeWidth={2}
                aria-hidden="true"
              />
              <div>
                <p className="font-display text-sm font-bold text-foreground">{title}</p>
                <p className="mt-0.5 text-sm text-primary-foreground/65">{body}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-8 rounded-md border border-border bg-muted/60 px-4 py-3 text-xs text-muted-foreground">
          Prototype accounts: nothing leaves this browser. Passwords are stored unencrypted in local storage on this
          device and are not a real sign-in — the Java and MySQL service is the next phase.
        </p>
      </div>

      <div className="rounded-xl bg-background p-6 shadow-lift sm:p-8">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-md bg-accent text-accent-foreground">
            {isSignUp ? (
              <UserPlus className="size-5" strokeWidth={2} aria-hidden="true" />
            ) : (
              <LogIn className="size-5" strokeWidth={2} aria-hidden="true" />
            )}
          </span>
          <div>
            <h2 className="font-display text-lg font-bold">{isSignUp ? 'Create your account' : 'Welcome back'}</h2>
            <p className="text-xs text-muted-foreground">Stored on this device · nothing is sent anywhere</p>
          </div>
        </div>

        {formError && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
            <span>{formError}</span>
          </div>
        )}

        <form noValidate onSubmit={onSubmit} className="mt-5 space-y-4">
          {isSignUp && (
            <>
              <TextField
                id="auth-name"
                label="Full name"
                autoComplete="name"
                placeholder="Your full name"
                value={values.name}
                onChange={(e) => set('name', e.target.value)}
                error={errors.name}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  id="auth-rollNo"
                  label="Roll number"
                  autoComplete="off"
                  placeholder="e.g. 23CS1042 or CS-2023-045"
                  value={values.rollNo}
                  onChange={(e) => set('rollNo', e.target.value.toUpperCase())}
                  error={errors.rollNo}
                  hint="Any format your college uses."
                />
                <TextField
                  id="auth-department"
                  label="Department & year"
                  placeholder="Computer Science, 3rd year"
                  value={values.department}
                  onChange={(e) => set('department', e.target.value)}
                  error={errors.department}
                />
              </div>
            </>
          )}

          <TextField
            id="auth-email"
            type="email"
            label="College email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@svit.edu.in"
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
            error={errors.email}
          />

          <TextField
            id="auth-password"
            type="password"
            label="Password"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            placeholder={isSignUp ? 'At least 8 characters' : 'Your password'}
            value={values.password}
            onChange={(e) => set('password', e.target.value)}
            error={errors.password}
            hint={isSignUp ? 'Eight characters or more. It is stored on this device only.' : undefined}
          />

          <Button type="submit" disabled={busy !== null} className="h-12 w-full rounded-md text-base">
            {busy === 'form' ? (
              <>
                <Loader2 className="size-4 animate-spin" strokeWidth={2} aria-hidden="true" />
                {isSignUp ? 'Creating the account…' : 'Signing in…'}
              </>
            ) : (
              <>
                {isSignUp ? 'Create account' : 'Sign in'}
                <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
              </>
            )}
          </Button>
        </form>

        <p className={cn('mt-6 text-center text-sm text-muted-foreground')}>
          {isSignUp ? 'Already registered?' : 'New here?'}{' '}
          <Link
            to={isSignUp ? '/login' : '/signup'}
            className="font-semibold text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
          >
            {isSignUp ? 'Sign in instead' : 'Create an account'}
          </Link>
        </p>
      </div>
    </div>
  )
}
