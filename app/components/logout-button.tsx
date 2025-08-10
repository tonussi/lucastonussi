import { useAuth } from '../lib/auth-context'

export function LogoutButton() {
  const { logout, user } = useAuth()

  if (!user) return null

  return (
    <button
      onClick={logout}
      className="bg-sky-200 hover:bg-sky-300 text-sky-800 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
    >
      Logout ({user.email})
    </button>
  )
}
