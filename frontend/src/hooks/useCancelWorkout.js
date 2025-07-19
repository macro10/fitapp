import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useCancelWorkout = (hasUnsavedWork, onCancel) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const navigate = useNavigate();

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