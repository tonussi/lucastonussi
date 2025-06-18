import { NavLink } from 'react-router'

export function Footer() {
  return (
    <footer className="w-full py-8 px-4 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Tonussi Labs. All rights reserved.
          </div>
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
      </div>
    </footer>
  )
}
