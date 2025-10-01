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
      <AlertDialogHeader className="text-center space-y-2">
        <div className="mx-auto h-10 w-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <X className="h-5 w-5" />
        </div>
        <AlertDialogTitle>Cancel Workout?</AlertDialogTitle>
        <AlertDialogDescription className="max-w-[32ch] mx-auto">
          This action can’t be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="gap-3">
        <AlertDialogCancel autoFocus className="flex-1 h-12 rounded-xl">
          Continue Workout
        </AlertDialogCancel>
        <AlertDialogAction 
          className="flex-1 h-12 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
          onClick={onConfirm}
        >
          Cancel Workout
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);