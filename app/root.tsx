import React, { useEffect, useState } from 'react'
import { isRouteErrorResponse, Links, Meta, Scripts, ScrollRestoration } from 'react-router'

import { Moon, Sun } from 'lucide-react'
import { I18nextProvider } from 'react-i18next'
import type { Route } from './+types/root'
import './app.css'
import './i18n'
import i18n from './i18n'
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
      return localStorage.getItem('language') ?? 'en-US'
    }
    return 'en-US'
  })

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
    <html>
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
                value="en-US"
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                English
              </option>
              <option
                value="pt-BR"
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                Português
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
import { Navbar } from './components/navbar'

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
  let message = 'Oops!'
  let details = 'An unexpected error occurred.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error'
    details =
      error.status === 404 ? 'The requested page could not be found.' : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <>
      <Navbar />
      <main className="flex items-center justify-center mt-30">
        <h1>{message}</h1>
        <p>{details}</p>
        {stack && (
          <pre className="flex items-center justify-center">
            <code>{stack}</code>
          </pre>
        )}
      </main>
    </>
  )
}

export default App
