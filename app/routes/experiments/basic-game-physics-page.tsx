import BasicGamePhysics from '@/components/basic-game-physics/components'
import type { Route } from '../+types/experiments'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Basic Game Physics - Experiments' },
    {
      name: 'description',
      content: 'Interactive physics simulations and game mechanics demonstrations',
    },
  ]
}

export default function BasicGamePhysicsPage() {
  return (
    <div className="relative">
      {/* Car Build Share Component */}
      <BasicGamePhysics />

      {/* Back to Experiments */}
      <div className="mt-12 text-center">
        <a
          href="/experiments"
          className="inline-flex items-center text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Experiments
        </a>
      </div>
    </div>
  )
}
