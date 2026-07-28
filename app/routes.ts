import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  route('login', 'routes/login.tsx'),
  route('basic-game-physics', 'routes/experiments/basic-game-physics-page.tsx'),
  route('docs', 'routes/docs.tsx'),
  route('contact', 'routes/contact.tsx'),
  route('atoms', 'routes/atoms.tsx'),
  route('how-to-delete-your-user', 'routes/how-to-delete-your-user.tsx'),
] satisfies RouteConfig
