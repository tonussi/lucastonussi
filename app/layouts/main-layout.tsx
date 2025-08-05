import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Outlet, useLocation } from 'react-router'
import { AuthProvider } from '../lib/auth-context'
import { ProtectedRoute } from '../components/protected-route'

export function MainLayout() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  return (
    <AuthProvider>
      {isLoginPage ? (
        <Outlet />
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
