import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import axios from "axios";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const res = await axios.post("http://localhost:8000/api/login/", { username, password });
        setUser(res.data.access);
        navigate("/");
      } else {
        await axios.post("http://localhost:8000/api/register/", { username, password });
        setIsLogin(true);
      }
    } catch (err) {
      alert("Auth failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-bold">{isLogin ? "Login" : "Register"}</h2>
        <input className="border p-2" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input className="border p-2" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">{isLogin ? "Login" : "Register"}</button>
        <button type="button" className="text-blue-500 underline" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Need an account? Register" : "Already have an account? Login"}
        </button>
      </form>
    </div>
  );
}