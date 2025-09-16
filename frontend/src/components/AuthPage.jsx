import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../apiClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Label } from "./ui/label"

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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (isLogin) => {
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
        // Show success message or automatically log in
        const res = await api.post("/login/", { username, password });
        localStorage.setItem("token", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);
        setUser(res.data.access);
        navigate("/");
      }
    } catch (err) {
      setError("Authentication failed. Please check your credentials.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Welcome to FitApp</CardTitle>
          <CardDescription>Track your fitness journey</CardDescription>
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(true); }}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button className="w-full" type="submit">
                    Sign In
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="register-username">Username</Label>
                    <Input 
                      id="register-username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose username"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input 
                      id="register-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button className="w-full" type="submit">
                    Create Account
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}