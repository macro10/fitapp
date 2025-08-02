import { Outlet } from "react-router-dom";
import { BottomNav } from "./ui/BottomNav";

export default function Layout() {
  return (
    <div className="min-h-screen pb-[4.5rem]">
      <Outlet />
      <BottomNav />
    </div>
  );
}