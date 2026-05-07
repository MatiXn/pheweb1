import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface LoginFormData {
  email: string
  password: string
}

export function LoginForm() {
  const { signIn, isLoading, error } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  const onSubmit = async (data: LoginFormData) => {
    const result = await signIn(data.email, data.password)
    if (result.success && result.redirectTo) {
      navigate(result.redirectTo)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="email">E-Mail-Adresse</label>
        <input
          id="email"
          type="email"
          {...register('email', {
            required: 'Bitte geben Sie Ihre E-Mail-Adresse ein',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
            },
          })}
        />
        {errors.email && <span role="alert">{errors.email.message}</span>}
      </div>

      <div>
        <label htmlFor="password">Passwort</label>
        <input
          id="password"
          type="password"
          {...register('password', {
            required: 'Bitte geben Sie Ihr Passwort ein',
          })}
        />
        {errors.password && <span role="alert">{errors.password.message}</span>}
      </div>

      {error && <div role="alert">{error}</div>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Wird angemeldet…' : 'Anmelden'}
      </button>
    </form>
  )
}
