import CarBuildShare from '@/components/car-build-share/components'
import type { Route } from '../+types/experiments'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Car Build Share - Experiments' },
    {
      name: 'description',
      content: 'Interactive 3D car building and sharing platform with community features',
    },
  ]
}

export default function CarBuildSharePage() {
  return (
    <div className="relative">
      {/* Car Build Share Component */}
      <CarBuildShare />

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
