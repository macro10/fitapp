import { cn } from "../../lib/utils";

// Component prop types (new addition)
const StepIndicator = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 rounded-full flex-1 transition-all",
            i === currentStep ? "bg-primary" : "bg-muted"
          )}
        />
      ))}
    </div>
  );
};

export { StepIndicator }