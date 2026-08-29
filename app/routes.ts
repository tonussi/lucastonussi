import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('routes/purchasing-inventory.tsx'),
  route('home', 'routes/home.tsx'),
  route('login', 'routes/login.tsx'),
  route('basic-game-physics', 'routes/experiments/basic-game-physics-page.tsx'),
  route('docs', 'routes/docs.tsx'),
  route('contact', 'routes/contact.tsx'),
  route('atoms', 'routes/atoms.tsx'),
  route('how-to-delete-your-user', 'routes/how-to-delete-your-user.tsx'),
  // Kept so old links to the previous Purchasing Inventory URL still land on it.
  route('purchasing-inventory', 'routes/purchasing-inventory-redirect.tsx'),
] satisfies RouteConfig
