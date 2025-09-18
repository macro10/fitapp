import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { HomeIcon, BarChart2Icon, PlusIcon } from "lucide-react";
import { Button } from "./button";
import { WORKOUT_STORAGE_KEY, CURRENT_EXERCISE_STORAGE_KEY } from "../../hooks/useWorkoutLogger";

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background pb-[env(safe-area-inset-bottom,0px)]">
      <nav className="container mx-auto max-w-3xl px-4 relative">
        <div className="grid grid-cols-2 relative h-16">
          <div className="relative flex items-center justify-center">
            <Link
              to="/"
              className={cn(
                "flex flex-col items-center gap-1 py-2 rounded-lg transition-colors absolute",
                "left-1/2 -translate-x-1/2",
                location.pathname === "/" ? "text-primary" : "text-muted-foreground"
              )}
            >
              <HomeIcon className="h-6 w-6" />
              <span className="text-xs font-medium">Home</span>
            </Link>
          </div>
          <div className="relative flex items-center justify-center">
            <Link
              to="/analytics"
              className={cn(
                "flex flex-col items-center gap-1 py-2 rounded-lg transition-colors absolute",
                "left-1/2 -translate-x-1/2",
                location.pathname === "/analytics" ? "text-primary" : "text-muted-foreground"
              )}
            >
              <BarChart2Icon className="h-6 w-6" />
              <span className="text-xs font-medium">Progress</span>
            </Link>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-0">
            <Button
              className="h-14 w-14 rounded-full shadow-lg"
              onClick={() => {
                const hasInProgress = localStorage.getItem(WORKOUT_STORAGE_KEY) || localStorage.getItem(CURRENT_EXERCISE_STORAGE_KEY);
                navigate(hasInProgress ? "/log" : "/workout/exercise-selector");
              }}
              aria-label="Create new workout"
            >
              <PlusIcon className="h-7 w-7" />
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
}