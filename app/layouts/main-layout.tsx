import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Outlet } from 'react-router'

export function MainLayout() {
  return (
    <>
      <Navbar />
      <main className="flex items-center justify-center overflow-x-hidden mt-30 mb-30">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
