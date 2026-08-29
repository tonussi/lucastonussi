import React, { useEffect, useState } from 'react'
import { isRouteErrorResponse, Link, Links, Meta, Scripts, ScrollRestoration } from 'react-router'

import { Home, Moon, Sun } from 'lucide-react'
import { I18nextProvider } from 'react-i18next'
import type { Route } from './+types/root'
import './app.css'
import './i18n'
import i18n, { DEFAULT_LANGUAGE } from './i18n'
import { MainLayout } from './layouts/main-layout'

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },

  { rel: 'icon', type: 'image/png', href: '/favicon-96x96.png', sizes: '96x96' },
  { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  { rel: 'shortcut icon', href: '/favicon.ico' },
  { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
  { rel: 'manifest', href: '/site.webmanifest' },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      )
    }
    return 'dark'
  })

  const [language, setLanguage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('language') ?? DEFAULT_LANGUAGE
    }
    return DEFAULT_LANGUAGE
  })

  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language)
    }
    document.documentElement.lang = language
  }, [language])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <html lang={language} suppressHydrationWarning={true}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning={true}>
        <div className="bg-white dark:bg-black">
          <div className="fixed top-4 right-4 z-50">
            <select
              id="language-select"
              className="fixed bottom-4 right-16 z-50 p-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
              value={language ?? i18n.language}
              onChange={(e) => {
                const newLanguage = e.target.value
                i18n.changeLanguage(newLanguage)
                localStorage.setItem('language', newLanguage)
                setLanguage(newLanguage)
              }}
            >
              <option
                value="pt-BR"
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                Português
              </option>
              <option
                value="en-US"
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                English
              </option>
            </select>
          </div>
          <button
            onClick={toggleTheme}
            style={{ position: 'fixed', bottom: 1.6 * 16, right: 16, zIndex: 1000 }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Moon /> : <Sun />}
          </button>
          {children}
          <ScrollRestoration />
          <Scripts />
        </div>
      </body>
    </html>
  )
}

import { hydrateRoot } from 'react-dom/client'
import { useTranslation } from 'react-i18next'
import { Navbar } from './components/navbar'
import { AuthProvider } from './lib/auth-context'

const App = () => {
  const root = window.document.getElementById('root')
  if (root) {
    hydrateRoot(
      root,
      <React.StrictMode>
        <I18nextProvider i18n={i18n}>
          <MainLayout />
        </I18nextProvider>
      </React.StrictMode>
    )
  }

  return (
    <React.StrictMode>
      <I18nextProvider i18n={i18n}>
        <MainLayout />
      </I18nextProvider>
    </React.StrictMode>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const is404 = isRouteErrorResponse(error) && error.status === 404
  const isGenericRouteError = isRouteErrorResponse(error) && !is404

  return (
    <AuthProvider>
      <Navbar />
      {is404 ? (
        <NotFoundPage />
      ) : (
        <main className="flex flex-col items-center justify-center min-h-screen px-4">
          <h1 className="text-4xl font-bold text-foreground">
            {isGenericRouteError ? `Error ${error.status}` : 'Oops!'}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {isGenericRouteError
              ? error.statusText || 'An unexpected error occurred.'
              : 'An unexpected error occurred.'}
          </p>
          {import.meta.env.DEV && error instanceof Error && error.stack && (
            <pre className="mt-8 max-w-2xl overflow-x-auto rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              <code>{error.stack}</code>
            </pre>
          )}
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
          >
            <Home size={16} />
            Go Home
          </Link>
        </main>
      )}
    </AuthProvider>
  )
}

function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden px-4">
      <div
        className="absolute inset-0 opacity-20 dark:opacity-10"
        style={{
          background:
            'radial-gradient(circle at 30% 40%, #7ED4FD 0%, transparent 50%), radial-gradient(circle at 70% 60%, #4D78EF 0%, transparent 50%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        <h1
          className="animate-float text-[8rem] font-black leading-none tracking-tighter sm:text-[12rem]"
          style={{
            background:
              'radial-gradient(138.06% 1036.51% at 95.25% -2.54%, #7ED4FD 14.06%, #709DF7 51.02%, #4D78EF 79.09%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          404
        </h1>

        <div className="mt-2 rounded-2xl border border-border/50 bg-card/60 p-8 shadow-xl backdrop-blur-md sm:mt-4 sm:p-10">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            {t('notFound.title')}
          </h2>
          <p className="mt-3 max-w-md text-base text-muted-foreground">
            {t('notFound.description')}
          </p>

          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white transition-all hover:scale-105 hover:shadow-lg"
            style={{
              background:
                'linear-gradient(135deg, #7ED4FD 0%, #709DF7 50%, #4D78EF 100%)',
            }}
          >
            <Home size={16} />
            {t('notFound.goHome')}
          </Link>
        </div>
      </div>
    </main>
  )
}

export default App
