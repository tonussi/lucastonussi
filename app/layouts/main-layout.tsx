import { Outlet } from 'react-router'
import { Navbar } from '../components/navbar'

export function MainLayout() {
  return (
    <main className="w-full flex items-center justify-center overflow-hidden">
      <Navbar />
      <div className="h-fit w-fit">
        <Outlet />
      </div>
    </main>
  )
}
