import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import api from "../apiClient";

// Form field component for reuse
function AuthField({ type = "text", value, onChange, placeholder }) {
  return (
    <input
      className="border p-2 w-full rounded"
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={type === "password" ? "current-password" : "username"}
    />
  );
}

// Toggle button for switching between login/register
function ToggleAuthModeButton({ isLogin, onClick }) {
  return (
    <button
      type="button"
      className="text-blue-500 underline w-full"
      onClick={onClick}
    >
      {isLogin ? "Need an account? Register" : "Already have an account? Login"}
    </button>
  );
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  // Handles login or registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLogin) {
        const res = await api.post("/login/", { username, password });
        localStorage.setItem("token", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);
        setUser(res.data.access);
        navigate("/");
      } else {
        await api.post("/register/", { username, password });
        setIsLogin(true);
      }
    } catch (err) {
      setError("Authentication failed. Please check your credentials.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-xs">
        <h2 className="text-xl font-bold text-center">
          {isLogin ? "Login" : "Register"}
        </h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-center">
            {error}
          </div>
        )}
        <AuthField
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username"
        />
        <AuthField
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          type="submit"
        >
          {isLogin ? "Login" : "Register"}
        </button>
        <ToggleAuthModeButton
          isLogin={isLogin}
          onClick={() => setIsLogin(!isLogin)}
        />
      </form>
    </div>
  );
}