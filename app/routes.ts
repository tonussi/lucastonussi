import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("experiments", "routes/experiments.tsx"),
  route("docs", "routes/docs.tsx"),
  route("contact", "routes/contact.tsx"),
] satisfies RouteConfig;
