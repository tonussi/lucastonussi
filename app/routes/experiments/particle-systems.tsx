import type { Route } from '../+types/experiments'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Particle Systems - Experiments' },
    {
      name: 'description',
      content: 'Advanced particle effects and simulation systems for web applications',
    },
  ]
}

export default function ParticleSystems() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 py-12 px-4">
      <div className="mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Particle Systems
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Create stunning visual effects with advanced particle systems. Explore fire, smoke,
            explosions, magic effects, and more through interactive simulations and customizable
            parameters.
          </p>
        </div>

        {/* Particle Effects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Fire Effect */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="h-32 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 rounded-lg mb-4 flex items-end justify-center pb-4 relative overflow-hidden">
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-4 bg-gradient-to-t from-red-500 to-yellow-300 rounded-full animate-pulse"
                    style={{
                      left: `${(i - 4) * 4}px`,
                      bottom: `${Math.random() * 20}px`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: `${0.8 + Math.random() * 0.4}s`,
                    }}
                  ></div>
                ))}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Fire & Flames
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-xs">
              Realistic fire effects with heat distortion
            </p>
          </div>

          {/* Smoke Effect */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="h-32 bg-gradient-to-t from-gray-600 to-gray-200 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-8 h-8 bg-gray-400/60 rounded-full animate-ping"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + (i % 2) * 40}%`,
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: `${2 + Math.random()}s`,
                  }}
                ></div>
              ))}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Smoke & Clouds
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-xs">
              Volumetric smoke and cloud simulations
            </p>
          </div>

          {/* Magic Effect */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="h-32 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                    top: `${10 + Math.random() * 80}%`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                ></div>
              ))}
              <div className="w-8 h-8 border-2 border-white rounded-full animate-spin"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Magic Effects
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-xs">
              Sparkles, glows, and magical auras
            </p>
          </div>

          {/* Explosion Effect */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="h-32 bg-gradient-to-br from-orange-500 via-red-500 to-yellow-400 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-red-500 rounded-full animate-ping"></div>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 bg-orange-400 rounded-full animate-bounce"
                  style={{
                    left: `${50 + Math.cos((i * Math.PI) / 4) * 30}%`,
                    top: `${50 + Math.sin((i * Math.PI) / 4) * 30}%`,
                    animationDelay: `${i * 0.05}s`,
                  }}
                ></div>
              ))}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Explosions</h3>
            <p className="text-gray-600 dark:text-gray-300 text-xs">
              Dynamic explosion and impact effects
            </p>
          </div>
        </div>

        {/* Interactive Particle Canvas */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Interactive Particle Playground
          </h2>
          <div className="bg-gray-900 rounded-lg h-96 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 relative overflow-hidden">
            {/* Animated background particles */}
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-purple-400 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              ></div>
            ))}
            <div className="text-center z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 animate-pulse"></div>
              <p className="text-white mb-2">Particle Canvas</p>
              <p className="text-sm text-gray-300">
                Interactive particle systems will be rendered here
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm">
              Fire Effect
            </button>
            <button className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm">
              Smoke Effect
            </button>
            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm">
              Magic Sparkles
            </button>
            <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm">
              Explosion
            </button>
          </div>
        </div>

        {/* Parameters Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Particle Parameters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Particle Count
              </label>
              <input
                type="range"
                min="10"
                max="1000"
                defaultValue="100"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Emission Rate
              </label>
              <input
                type="range"
                min="1"
                max="50"
                defaultValue="10"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Particle Size
              </label>
              <input
                type="range"
                min="1"
                max="20"
                defaultValue="5"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Back to Experiments */}
        <div className="mt-12 text-center">
          <a
            href="/experiments"
            className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
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
    </div>
  )
}
