import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useCancelWorkout = (hasUnsavedWork, onCancel) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const navigate = useNavigate();

  const handleCancelWorkout = () => {
    if (hasUnsavedWork) {
      setShowCancelDialog(true);
    } else {
      onCancel?.(); // Call the onCancel callback if provided
      navigate("/");
    }
  };

  return {
    showCancelDialog,
    setShowCancelDialog,
    handleCancelWorkout
  };
};