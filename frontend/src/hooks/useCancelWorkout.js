import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useCancelWorkout = (hasUnsavedWork) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const navigate = useNavigate();

  const handleCancelWorkout = () => {
    if (hasUnsavedWork) {
      setShowCancelDialog(true);
    } else {
      navigate("/");
    }
  };

  return {
    showCancelDialog,
    setShowCancelDialog,
    handleCancelWorkout
  };
};