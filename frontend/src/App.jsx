import { useState } from "react";
import AuthPage from "./AuthPage";
import Dashboard from "./Dashboard";

export default function App() {
  const savedUser = localStorage.getItem("interntrack_user");
  const [user, setUser] = useState(savedUser ? JSON.parse(savedUser) : null);
  return user ? <Dashboard user={user} onLogout={() => setUser(null)} /> : <AuthPage onAuthenticated={setUser} />;
}
