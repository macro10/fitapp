import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => localStorage.getItem("token") || null);

  // keep axios auth header in sync
  useEffect(() => {
    if (user) {
      localStorage.setItem("token", user);
      api.defaults.headers.common["Authorization"] = `Bearer ${user}`;
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
      delete api.defaults.headers.common["Authorization"];
    }
  }, [user]);

  const login = async (username, password) => {
    const res = await api.post("login/", { username, password });
    const { access, refresh } = res.data;
    localStorage.setItem("token", access);
    localStorage.setItem("refresh", refresh);
    api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
    setUser(access);
  };

  const register = async (username, password) => {
    await api.post("register/", { username, password });
    // auto-login after register
    await login(username, password);
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
