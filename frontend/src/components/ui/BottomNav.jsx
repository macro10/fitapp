import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { HomeIcon, BarChart2Icon, PlusIcon } from "lucide-react";
import { Button } from "./button";

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background">
      <nav className="container mx-auto max-w-3xl px-4 relative">
        <div className="flex justify-between items-center py-2">
          {/* Left item */}
          <Link
            to="/"
            className={cn(
              "flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors w-[100px]",
              location.pathname === "/" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <HomeIcon className="h-6 w-6" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          
          {/* Center item - Add button */}
          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-0">
            <Button
              className="h-14 w-14 rounded-full shadow-lg"
              onClick={() => navigate("/log")}
              aria-label="Create new workout"
            >
              <PlusIcon className="h-7 w-7" />
            </Button>
          </div>

          {/* Right item */}
          <Link
            to="/analytics"
            className={cn(
              "flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors w-[100px]",
              location.pathname === "/analytics" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <BarChart2Icon className="h-6 w-6" />
            <span className="text-xs font-medium">Analytics</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}