import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Outlet } from 'react-router'

export function MainLayout() {
  return (
    <main className="flex items-center justify-center overflow-x-hidden ">
      <Navbar />

      <div className="h-fit mt-30">
        <Outlet />
      </div>

      <Footer />
    </main>
  )
}
