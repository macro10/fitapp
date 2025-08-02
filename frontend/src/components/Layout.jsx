import { Outlet } from "react-router-dom";
import { BottomNav } from "./ui/BottomNav";

export default function Layout() {
  return (
    <div className="min-h-screen pt-[env(safe-area-inset-top,0px)] pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))]">
      <Outlet />
      <BottomNav />
    </div>
  );
}