import { MainSlogan } from "../ui/main-slogan";
import { Navbar } from "../ui/navbar";

export function Welcome() {
  return (
    <div className="w-screen h-screen flex items-center justify-center relative overflow-hidden">
      <main className="flex items-center justify-center pt-16 pb-4 relative z-10">
        <Navbar />
        <MainSlogan />
      </main>
    </div>
  );
}
