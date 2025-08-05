import { useAuth } from '../lib/auth-context'

export function LogoutButton() {
  const { logout, user } = useAuth()

  if (!user) return null

  return (
    <button
      onClick={logout}
      className="bg-red-200 hover:bg-red-300 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
    >
      Logout ({user.email})
    </button>
  )
}
