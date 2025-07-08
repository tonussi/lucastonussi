import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("experiments", "routes/experiments.tsx", [
    route("basic-game-physics-page", "routes/experiments/basic-game-physics-page.tsx"),
    route("car-build-share", "routes/experiments/car-build-share.tsx"),
    route("neural-network-viz", "routes/experiments/neural-network-viz.tsx"),
    route("particle-systems", "routes/experiments/particle-systems.tsx"),
  ]),
  route("docs", "routes/docs.tsx"),
  route("contact", "routes/contact.tsx"),
  route("atoms", "routes/atoms.tsx"),
] satisfies RouteConfig;
