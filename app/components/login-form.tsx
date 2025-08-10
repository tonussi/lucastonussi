import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '../components/ui/input-otp'
import { login as authLogin } from '../lib/auth'
import { useAuth } from '../lib/auth-context'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast, Toaster } from 'sonner'
import { z } from 'zod'

import { Button } from '../components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form'
import { Input } from '../components/ui/input'
import GenericModalForm, { type ModalFormField } from './generic-modal-form'

export function InputEmailResendForm({
  onSubmitEmail,
}: {
  onSubmitEmail: (email: string) => void
}) {
  const { t } = useTranslation()

  const EmailSchema = z.object({
    email: z.email(t('zod.errors.emailInvalid')),
  })

  const handleSubmit = async (email: string) => {
    toast.success(t('login.otpResend'))
  }

  const form = useForm<z.infer<typeof EmailSchema>>({
    resolver: zodResolver(EmailSchema),
    defaultValues: {
      email: '',
    },
  })

  function onSubmit(data: z.infer<typeof EmailSchema>) {
    handleSubmit(data.email)
    onSubmitEmail(data.email)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full md:w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <div className="grid grid-rows-2 gap-2">
              <FormItem>
                <FormLabel>{t('login.email')}</FormLabel>
                <FormControl>
                  <Input className="w-full" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
              <Button className="w-full" type="submit">
                {t('login.otpResend')}
              </Button>
            </div>
          )}
        />
      </form>
    </Form>
  )
}

export function InputOTPForm({ email }: { email: string }) {
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const EmailSchema = z.object({
    email: z.email(t('zod.errors.emailInvalid')),
  })
  const PinSchema = z.object({
    pin: z.string().min(6, t('zod.errors.pinInvalid')),
  })

  useEffect(() => {
    if (error) {
      toast.error(error)
      setError('')
    }
  }, [error])

  const handleSubmit = async (pin: string) => {
    setError('')

    let validatedEmail

    try {
      validatedEmail = EmailSchema.parse({ email })
    } catch (err) {
      setError(t('zod.errors.emailInvalid'))
      return
    }

    try {
      const user = await authLogin(email, '', pin)
      login(user)
      navigate('/')
      toast.success(t('login.otpSubmitDescription'))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('login.error'))
    }
  }

  const form = useForm<z.infer<typeof PinSchema>>({
    resolver: zodResolver(PinSchema),
    defaultValues: {
      pin: '',
    },
  })

  function onSubmit(data: z.infer<typeof PinSchema>) {
    handleSubmit(data.pin)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full md:w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('login.otpLabel')}</FormLabel>
              <FormControl>
                <InputOTP maxLength={6} {...field}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSeparator />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription>{t('login.otpDescription')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between gap-3">
          <Button className="w-1/2" type="submit">
            {t('login.otpSubmit')}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export function EnterIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
      />
    </svg>
  )
}

export function Divider() {
  const { t } = useTranslation()

  return (
    <div className="grid grid-rows-1 my-10">
      <span className="text-left text-xs text-gray-300 dark:text-gray-400">{t('login.or')}</span>
      <hr className="border-gray-200 dark:border-gray-700" />
    </div>
  )
}

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [emailOtp, setEmailOtp] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'password' | 'otp'>('password')
  const [isOpen, setIsOpen] = useState(false)

  const formFieldsRegisterNewUser: ModalFormField[] = [
    {
      id: 'name',
      label: t('login.form.name'),
      type: 'text',
      required: true,
      placeholder: t('login.form.namePlaceholder'),
      validation: {
        minLength: 3,
        maxLength: 50,
        message: t('login.form.nameValidation'),
      },
    },
    {
      id: 'email',
      label: t('login.form.email'),
      type: 'email',
      required: true,
      placeholder: t('login.form.emailPlaceholder'),
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const user = await authLogin(email, password, '')
      login(user)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('login.error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 px-4">
      <Toaster />

      <div className="w-full max-w-xl md:max-w-4xl">
        {/* Centralized Tailwind Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('login.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{t('login.subtitle')}</p>
          </div>

          {/* Desktop/Tablet layout */}
          <div className="hidden md:grid grid-cols-2 gap-30">
            <div className="hidden md:grid grid-row-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2"
                  >
                    {t('login.email')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none autofill:shadow-[inset_0_0_0px_1000px_var(--tw-shadow-color,rgb(21_22_51/_74%))]"
                    placeholder={t('login.emailPlaceholder')}
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2"
                  >
                    {t('login.password')}
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none autofill:shadow-[inset_0_0_0px_1000px_var(--tw-shadow-color,rgb(21_22_51/_74%))]"
                    placeholder={t('login.passwordPlaceholder')}
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? t('login.signingIn') : t('login.signIn')}
                </Button>
              </form>

              <div className="mt-6 flex items-center justify-center space-x-4">
                <Button
                  onClick={() => {}}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <EnterIcon />
                    {t('login.google')}
                  </div>
                </Button>
                <Button
                  onClick={() => {}}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <EnterIcon />
                    {t('login.github')}
                  </div>
                </Button>
              </div>

              <Divider />

              <div className="flex items-center justify-center">
                <Button
                  onClick={() => setIsOpen(true)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <EnterIcon />
                    {t('login.signin')}
                  </div>
                </Button>
              </div>
            </div>
            <div className="mt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('login.otp')}</p>
              </div>
              <div className="mt-6 flex items-center justify-center">
                <InputEmailResendForm onSubmitEmail={setEmailOtp} />
              </div>
              <div className="mt-6 flex items-center justify-center">
                <InputOTPForm email={emailOtp} />
              </div>
            </div>
          </div>

          {/* Mobile layout with tabs */}
          <div className="md:hidden">
            <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('password')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors focus:outline-none ${
                  activeTab === 'password'
                    ? 'bg-gray-900 text-white dark:bg-gray-700'
                    : 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                }`}
                aria-selected={activeTab === 'password'}
                role="tab"
              >
                {t('login.emailPasswordTab') ?? 'Email & Password'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('otp')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-l border-gray-200 dark:border-gray-700 focus:outline-none ${
                  activeTab === 'otp'
                    ? 'bg-gray-900 text-white dark:bg-gray-700'
                    : 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                }`}
                aria-selected={activeTab === 'otp'}
                role="tab"
              >
                {t('login.otpTab') ?? 'One-Time Code'}
              </button>
            </div>

            {activeTab === 'password' && (
              <form onSubmit={handleSubmit} className="space-y-6" role="tabpanel">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2"
                  >
                    {t('login.email')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none autofill:shadow-[inset_0_0_0px_1000px_var(--tw-shadow-color,rgb(21_22_51/_74%))]"
                    placeholder={t('login.emailPlaceholder')}
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2"
                  >
                    {t('login.password')}
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none autofill:shadow-[inset_0_0_0px_1000px_var(--tw-shadow-color,rgb(21_22_51/_74%))]"
                    placeholder={t('login.passwordPlaceholder')}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gray-600 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {isLoading ? t('login.signingIn') : t('login.signIn')}
                </Button>

                <div className="mt-6 flex items-center justify-center space-x-4">
                  <Button
                    onClick={() => {}}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <div className="flex items-center gap-2">
                      <EnterIcon />
                      {t('login.google')}
                    </div>
                  </Button>
                  <Button
                    onClick={() => {}}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <div className="flex items-center gap-2">
                      <EnterIcon />
                      {t('login.github')}
                    </div>
                  </Button>
                </div>

                <Divider />

                <div className="mt-6 flex items-center justify-center space-x-4">
                  <Button
                    onClick={() => {}}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <div className="flex items-center gap-2">
                      <EnterIcon />
                      {t('login.signin')}
                    </div>
                  </Button>
                </div>
              </form>
            )}

            {activeTab === 'otp' && (
              <div role="tabpanel">
                <Divider />
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('login.otp')}</p>
                </div>
                <div className="mt-6 flex items-center justify-center">
                  <InputEmailResendForm onSubmitEmail={setEmailOtp} />
                </div>
                <div className="mt-6 flex items-center justify-center">
                  <InputOTPForm email={emailOtp} />
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('login.demo')}</p>
          </div>
        </div>
      </div>

      <GenericModalForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={t('login.form.title')}
        fields={formFieldsRegisterNewUser}
        onSubmit={(data) => console.log(data)}
        submitText={t('login.form.submitText')}
        initialData={{ name: '', email: '' }}
      />
    </div>
  )
}
