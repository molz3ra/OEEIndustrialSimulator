import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export function AppShell() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}
