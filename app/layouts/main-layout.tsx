import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Outlet, useLocation } from 'react-router'
import { ProtectedRoute } from '../components/protected-route'
import { AuthProvider } from '../lib/auth-context'

export function MainLayout() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  const isPublicPage = location.pathname === '/how-to-delete-your-user'

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
