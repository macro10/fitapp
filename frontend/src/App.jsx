import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate,
  useNavigate,
  Outlet
} from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import WorkoutListPage from "./components/WorkoutListPage";
import WorkoutLoggerPage from "./components/workoutLogger/WorkoutLoggerPage";
import AuthPage from "./components/AuthPage";
import Layout from "./components/Layout";
import AnalyticsPage from "./components/analytics/AnalyticsPage";
import { ExerciseProvider } from './contexts/ExerciseContext';
import { AuthProvider } from './contexts/AuthContext';
import ExerciseSelectorPage from './components/workoutLogger/ExerciseSelectorPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth route outside of ExerciseProvider */}
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Protected routes wrapped in ExerciseProvider */}
          <Route element={
            <ExerciseProvider>
              <Outlet />
            </ExerciseProvider>
          }>
            <Route path="/" element={<Layout />}>
              <Route index element={<WorkoutListPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
            </Route>
            <Route path="/log" element={<WorkoutLoggerPage />} />
            <Route path="/workout/exercise-selector" element={<ExerciseSelectorPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;