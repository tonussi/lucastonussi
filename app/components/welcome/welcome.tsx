import { Layout } from "../ui/layout";
import { Navbar } from "../ui/navbar";

export function Welcome() {
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <Navbar />
      <Layout />
    </main>
  );
}
