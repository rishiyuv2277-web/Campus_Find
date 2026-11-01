import { AuthForm } from '@/components/AuthForm'
import { AuthHero } from '@/components/AuthBackdrop'

export default function Signup() {
  return (
    <AuthHero>
      <AuthForm mode="signup" />
    </AuthHero>
  )
}
