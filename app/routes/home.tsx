import { Welcome } from "~/components/welcome/welcome";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Home" }, { name: "description", content: "Home" }];
}

export default function Home() {
  return <Welcome />;
}
