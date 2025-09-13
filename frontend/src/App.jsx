import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate,
  useNavigate
} from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import WorkoutListPage from "./components/WorkoutListPage";
import WorkoutLoggerPage from "./components/workoutLogger/WorkoutLoggerPage";
import AuthPage from "./components/AuthPage";
import Layout from "./components/Layout";
import AnalyticsPage from "./components/analytics/AnalyticsPage";
import { ExerciseProvider } from './contexts/ExerciseContext';
import ExerciseSelectorPage from './components/workoutLogger/ExerciseSelectorPage';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

function App() {
  const [user, setUser] = useState(() => localStorage.getItem("token") || null);

  useEffect(() => {
    if (user) localStorage.setItem("token", user);
    else localStorage.removeItem("token");
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <ExerciseProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<WorkoutListPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
            </Route>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/log" element={<WorkoutLoggerPage />} />
            <Route path="/workout/exercise-selector" element={<ExerciseSelectorPage />} />
          </Routes>
        </Router>
      </ExerciseProvider>
    </AuthContext.Provider>
  );
}

export default App;