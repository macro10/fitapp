import { useState, useEffect } from "react";
import { Timer } from "lucide-react";

const REST_TIMER_KEY = "workout_rest_timer_start";

export function RestTimer() {
  const [elapsedTime, setElapsedTime] = useState(0);
  
  useEffect(() => {
    // Get the stored start time or set current time as start time
    const storedStartTime = localStorage.getItem(REST_TIMER_KEY);
    const startTime = storedStartTime ? parseInt(storedStartTime) : Date.now();
    
    if (!storedStartTime) {
      localStorage.setItem(REST_TIMER_KEY, startTime.toString());
    }
    
    // Update elapsed time immediately
    setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    
    // Set up interval to update every second
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Format time as MM:SS
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Timer className="h-4 w-4" />
      <span className="font-mono">{formattedTime}</span>
    </div>
  );
}