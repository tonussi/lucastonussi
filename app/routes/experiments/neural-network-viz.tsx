import type { Route } from '../+types/experiments'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Neural Network Visualization - Experiments' },
    {
      name: 'description',
      content: 'Real-time visualization of neural networks and machine learning algorithms',
    },
  ]
}

export default function NeuralNetworkViz() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-900 dark:to-green-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Neural Network Visualization
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Explore the inner workings of neural networks through interactive visualizations. Watch
            how data flows through layers, see weights update in real-time, and understand the
            learning process.
          </p>
        </div>

        {/* Network Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-lg mb-4 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-2">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-white rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  ></div>
                ))}
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Feedforward Networks
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Visualize how data flows through fully connected layers
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="h-32 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg mb-4 flex items-center justify-center">
              <div className="flex flex-col space-y-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex space-x-1">
                    {[...Array(6)].map((_, j) => (
                      <div
                        key={j}
                        className="w-2 h-2 bg-white rounded-sm animate-pulse"
                        style={{ animationDelay: `${(i * 6 + j) * 0.05}s` }}
                      ></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Convolutional Networks
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              See how CNNs process images with filters and pooling
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="h-32 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg mb-4 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex flex-col space-y-1">
                    <div
                      className="w-2 h-8 bg-white rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    ></div>
                    <div
                      className="w-2 h-4 bg-white/70 rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 0.2 + 0.1}s` }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Recurrent Networks
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Understand how RNNs handle sequential data
            </p>
          </div>
        </div>

        {/* Interactive Visualization */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Interactive Neural Network
          </h2>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg h-96 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(16)].map((_, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 bg-green-500 rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    ></div>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-2">Neural Network Canvas</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Interactive neural network visualization will be rendered here
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex flex-wrap gap-4">
            <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
              Start Training
            </button>
            <button className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
              Reset Network
            </button>
            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
              Load Sample Data
            </button>
          </div>
        </div>

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
    </div>
  )
}
