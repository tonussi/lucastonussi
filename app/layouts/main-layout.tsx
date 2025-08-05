import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Outlet, useLocation } from 'react-router'
import { ProtectedRoute } from '../components/protected-route'
import { AuthProvider } from '../lib/auth-context'

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
