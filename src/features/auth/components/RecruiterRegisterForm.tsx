import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface RecruiterRegisterFormData {
  fullName: string
  email: string
  password: string
  nutzungsvereinbarung: boolean
}

export function RecruiterRegisterForm() {
  const { signUpRecruiter, isLoading, error } = useAuth()
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecruiterRegisterFormData>()

  const onSubmit = async (data: RecruiterRegisterFormData) => {
    const success = await signUpRecruiter(data.email, data.password, data.fullName)
    if (success) {
      setIsSuccess(true)
    }
  }

  if (isSuccess) {
    return (
      <div>
        <h2>Registrierung erfolgreich!</h2>
        <p>
          Ihr Recruiter-Konto wurde erstellt. Sie können sich jetzt{' '}
          <Link to="/login">anmelden</Link>.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="fullName">Vollständiger Name</label>
        <input
          id="fullName"
          type="text"
          {...register('fullName', {
            required: 'Bitte geben Sie Ihren Namen ein',
            validate: (value) => value.trim().length > 0 || 'Bitte geben Sie Ihren Namen ein.',
          })}
        />
        {errors.fullName && <span role="alert">{errors.fullName.message}</span>}
      </div>

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
            required: 'Bitte geben Sie ein Passwort ein',
            minLength: {
              value: 8,
              message: 'Das Passwort muss mindestens 8 Zeichen lang sein',
            },
          })}
        />
        {errors.password && <span role="alert">{errors.password.message}</span>}
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            {...register('nutzungsvereinbarung', {
              validate: (value) => value === true || 'Bitte stimmen Sie den Bedingungen zu.',
            })}
          />
          {' '}
          Ich akzeptiere die Nutzungsvereinbarung und bestätige, dass ich für alle von mir
          hochgeladenen Kandidaten eine gültige DSGVO-Einwilligung eingeholt habe
        </label>
        {errors.nutzungsvereinbarung && (
          <span role="alert">{errors.nutzungsvereinbarung.message}</span>
        )}
      </div>

      {error && <div role="alert">{error}</div>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Wird registriert…' : 'Als Recruiter registrieren'}
      </button>
    </form>
  )
}
