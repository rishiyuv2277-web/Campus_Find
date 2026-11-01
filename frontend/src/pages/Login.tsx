import { AuthForm } from '@/components/AuthForm'
import { AuthHero } from '@/components/AuthBackdrop'

/* The front door. Nothing else on the site renders until this screen has been
   passed, so it carries the explanation as well as the form. */
export default function Login() {
  return (
    <AuthHero>
      <AuthForm mode="signin" />
    </AuthHero>
  )
}
