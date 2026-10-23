import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Outlet, useLocation } from 'react-router'
import { ProtectedRoute } from '../components/protected-route'
import { AuthProvider } from '../lib/auth-context'

// Pages reachable without signing in (legal/marketing content).
const PUBLIC_PATHS = ['/', '/how-to-delete-your-user', '/purchasing-inventory']

export function MainLayout() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  const isPublicPage = PUBLIC_PATHS.includes(location.pathname)

  return (
    <AuthProvider>
      {isLoginPage ? (
        <Outlet />
      ) : isPublicPage ? (
        <>
          <Navbar />
          <main>
            <Outlet />
          </main>
          <Footer />
        </>
      ) : (
        <ProtectedRoute>
          <Navbar />
          <main>
            <Outlet />
          </main>
          <Footer />
        </ProtectedRoute>
      )}
    </AuthProvider>
  )
}
