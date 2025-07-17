import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useCancelWorkout = (hasUnsavedWork, onCancel) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const navigate = useNavigate();

  const handleCancelWorkout = () => {
    if (hasUnsavedWork) {
      setShowCancelDialog(true);
    } else {
      // If no unsaved work, just navigate away
      navigate("/");
    }
  };

  return {
    showCancelDialog,
    setShowCancelDialog,
    handleCancelWorkout
  };
};