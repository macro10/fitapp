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
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;