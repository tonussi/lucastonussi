import { Outlet } from 'react-router'
import { Navbar } from '../components/navbar'

export function MainLayout() {
  return (
    <main className="w-full flex items-center justify-center overflow-hidden">
      <Navbar />
      <div className="grid grid-cols-1 h-full max-w-7xl mx-auto mt-20">
        <Outlet />
      </div>
    </main>
  )
}
