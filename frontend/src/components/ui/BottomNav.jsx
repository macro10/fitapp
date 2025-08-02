import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { HomeIcon, BarChart2Icon } from "lucide-react";

export function BottomNav() {
  const location = useLocation();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background">
      <nav className="container mx-auto max-w-3xl px-4">
        <div className="flex justify-around py-2">
          <Link
            to="/"
            className={cn(
              "flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors",
              location.pathname === "/" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <HomeIcon className="h-6 w-6" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          
          <Link
            to="/analytics"
            className={cn(
              "flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors",
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