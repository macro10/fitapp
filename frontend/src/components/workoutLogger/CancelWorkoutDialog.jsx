import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { X } from "lucide-react";

export const CancelWorkoutDialog = ({
  open,
  onOpenChange,
  onConfirm
}) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent className="max-w-md">
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center gap-2">
          <X className="h-5 w-5 text-destructive" />
          Cancel Workout?
        </AlertDialogTitle>
        <AlertDialogDescription className="text-muted-foreground">
          Are you sure you want to cancel this workout? All progress will be lost.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="gap-2">
        <AlertDialogCancel className="flex-1">
          Continue Workout
        </AlertDialogCancel>
        <AlertDialogAction 
          className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
          onClick={onConfirm}
        >
          Cancel Workout
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
