import { Footer } from '@/components/footer'
import { Outlet } from 'react-router'
import { Navbar } from '../components/navbar'

export function MainLayout() {
  return (
    <main className="w-full flex items-center justify-center overflow-hidden">
      <Navbar />
      <div className="h-full max-w-7xl mt-20">
        <Outlet />
        <div className="h-100" />
        <Footer />
      </div>
    </main>
  )
}
