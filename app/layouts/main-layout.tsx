import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Outlet } from 'react-router'

export function MainLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
