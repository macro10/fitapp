import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate
} from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import WorkoutListPage from "./components/WorkoutListPage";
import WorkoutLoggerPage from "./components/workoutLogger/WorkoutLoggerPage";
import AuthPage from "./components/AuthPage";
import Layout from "./components/Layout";
import AnalyticsPage from "./components/AnalyticsPage";

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
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<WorkoutListPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/log" element={<WorkoutLoggerPage />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;