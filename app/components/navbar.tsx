import { NavLink } from 'react-router'
import { LogoutButton } from './logout-button'

export function Navbar() {
  return (
    <div className="z-50 fixed top-4 left-1/2 -translate-x-1/2 backdrop-blur-sm rounded-full px-6 py-2 shadow-lg border">
      <nav className="flex items-center gap-6">
        <NavLink
          to="/"
          className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Home
        </NavLink>
        <NavLink
          to="/basic-game-physics"
          className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Basic Game Physics
        </NavLink>
        <NavLink
          to="/purchasing-inventory"
          className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Purchasing Inventory
        </NavLink>
        <NavLink
          to="/docs"
          className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Docs
        </NavLink>
        <NavLink
          to="/contact"
          className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Contact
        </NavLink>
        <NavLink
          to="/atoms"
          className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Atoms
        </NavLink>
        <LogoutButton />
      </nav>
    </div>
  )
}
