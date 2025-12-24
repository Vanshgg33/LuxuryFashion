import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { StickyCartBar } from "./StickyCartBar";

export function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      {/* Spacer for fixed navbar - not needed on homepage as hero extends under navbar */}
      {!isHomePage && <div className="h-16 md:h-20" />}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <StickyCartBar />
    </div>
  );
}
