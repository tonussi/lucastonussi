import { Outlet } from 'react-router'
import { Navbar } from '../components/navbar'

export function MainLayout() {
  return (
    <main className="w-full flex items-center justify-center overflow-hidden">
      <Navbar />
      <div className="h-full max-w-7xl mt-50">
        <Outlet />
      </div>
    </main>
  )
}
