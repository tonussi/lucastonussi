import { NavLink } from 'react-router'

export function Navbar() {
  return (
    <div className="z-50 fixed top-4 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full px-6 py-2 shadow-lg border border-gray-200 dark:border-gray-800">
      <nav className="flex items-center gap-6">
        <NavLink
          to="/"
          className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Home
        </NavLink>
        <NavLink
          to="/about"
          className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          About
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
      </nav>
    </div>
  )
}
