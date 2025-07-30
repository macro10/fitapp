import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import WorkoutListPage from "./components/WorkoutListPage";
import WorkoutLoggerPage from "./components/workoutLogger/WorkoutLoggerPage";
import AuthPage from "./components/AuthPage";
import Layout from "./components/Layout";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" />;
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
        <Layout>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <WorkoutListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/log"
              element={
                <ProtectedRoute>
                  <WorkoutLoggerPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;