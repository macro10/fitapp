import { useState } from 'react';

export const useCancelWorkout = (hasUnsavedWork, onCancel) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleCancelWorkout = () => {
    if (hasUnsavedWork) {
      setShowCancelDialog(true);
    } else {
      // Even if no unsaved work, we should still clear state
      onCancel();
    }
  };

  return {
    showCancelDialog,
    setShowCancelDialog,
    handleCancelWorkout
  };
};