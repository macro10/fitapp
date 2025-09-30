import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate
} from "react-router-dom";
import WorkoutListPage from "./components/WorkoutListPage";
import WorkoutLoggerPage from "./components/workoutLogger/WorkoutLoggerPage";
import AuthPage from "./components/AuthPage";
import Layout from "./components/Layout";
import AnalyticsPage from "./components/analytics/AnalyticsPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { WorkoutProvider } from "./contexts/WorkoutContext";
import { ExerciseProvider } from "./contexts/ExerciseContext";
import ExerciseSelectorPage from "./components/workoutLogger/ExerciseSelectorPage";
import { Toaster } from "./components/ui/toaster";

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <ExerciseProvider>
          <Router>
            <Routes>
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <Layout />
                  </RequireAuth>
                }
              >
                <Route index element={<WorkoutListPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
              </Route>

              <Route path="/auth" element={<AuthPage />} />
              
              <Route
                path="/log"
                element={
                  <RequireAuth>
                    <WorkoutLoggerPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/workout/exercise-selector"
                element={
                  <RequireAuth>
                    <ExerciseSelectorPage />
                  </RequireAuth>
                }
              />
            </Routes>
          </Router>
          <Toaster />
        </ExerciseProvider>
      </WorkoutProvider>
    </AuthProvider>
  );
}

export default App;