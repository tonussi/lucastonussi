import { Link, Outlet } from 'react-router'
import type { Route } from './+types/experiments'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Experiments' }, { name: 'description', content: 'Experiments' }]
}

const experiments = [
  {
    id: 'basic-game-physics',
    title: 'Basic Game Physics',
    description: 'Explore fundamental physics concepts in game development with interactive demos.',
    path: '/experiments/basic-game-physics-page',
    gradient: 'from-blue-500 to-purple-600',
    clipPath: 'polygon(0% 0%, 100% 0%, 85% 100%, 0% 100%)',
  },
  {
    id: 'car-build-share',
    title: 'Car Build Share',
    description: 'Interactive 3D car building and sharing platform with community features.',
    path: '/experiments/car-build-share',
    gradient: 'from-red-500 to-orange-500',
    clipPath: 'polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)',
  },
  // {
  //   id: 'neural-network-viz',
  //   title: 'Neural Network Visualization',
  //   description: 'Real-time visualization of neural networks and machine learning algorithms.',
  //   path: '/experiments/neural-network-viz',
  //   gradient: 'from-green-500 to-teal-500',
  //   clipPath: 'polygon(0% 0%, 85% 0%, 100% 100%, 15% 100%)',
  // },
  // {
  //   id: 'particle-systems',
  //   title: 'Particle Systems',
  //   description: 'Advanced particle effects and simulation systems for web applications.',
  //   path: '/experiments/particle-systems',
  //   gradient: 'from-purple-500 to-pink-500',
  //   clipPath: 'polygon(20% 0%, 100% 20%, 80% 100%, 0% 80%)',
  // },
]

export default function Experiments() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Experiments Lab</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore cutting-edge web technologies, interactive demos, and innovative concepts
            through hands-on experiments and prototypes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {experiments.map((experiment) => (
            <Link
              key={experiment.id}
              to={experiment.path}
              className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Clipped Figure Background */}
              <div className="relative h-48 overflow-hidden">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${experiment.gradient} opacity-80`}
                  style={{ clipPath: experiment.clipPath }}
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${experiment.gradient} opacity-20 group-hover:opacity-40 transition-opacity duration-300`}
                />

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-8 h-8 border-2 border-white/30 rounded-full" />
                <div className="absolute bottom-4 left-4 w-4 h-4 bg-white/20 rounded-full" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-white/20 rounded-lg rotate-45" />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {experiment.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {experiment.description}
                </p>

                {/* Arrow Icon */}
                <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                  <span>Explore</span>
                  <svg
                    className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            More Coming Soon
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Stay tuned for more experimental features and interactive demos.
          </p>
          <div className="flex justify-center">
            <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
          </div>
        </div>
        <div className="mt-12">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
