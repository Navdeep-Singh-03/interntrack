import { useState } from "react";
import { login, register } from "./api";

export default function AuthPage({ onAuthenticated }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function change(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  async function submit(event) {
    event.preventDefault(); setError(""); setIsLoading(true);
    try {
      const data = isRegistering ? await register(form) : await login(form);
      localStorage.setItem("interntrack_token", data.access_token);
      localStorage.setItem("interntrack_user", JSON.stringify(data.user));
      onAuthenticated(data.user);
    } catch (err) { setError(err.message); } finally { setIsLoading(false); }
  }
  function switchMode() { setIsRegistering(!isRegistering); setError(""); }

  return <main className="auth-page"><section className="auth-card">
    <p className="eyebrow">InternTrack</p><h1>{isRegistering ? "Create your account" : "Welcome back"}</h1>
    <p className="subtext">{isRegistering ? "Start organizing your internship applications." : "Log in to view your application tracker."}</p>
    {error && <p className="alert error">{error}</p>}
    <form onSubmit={submit}>
      {isRegistering && <><label>Name</label><input name="name" value={form.name} onChange={change} required /></>}
      <label>Email</label><input type="email" name="email" value={form.email} onChange={change} required />
      <label>Password</label><input type="password" name="password" value={form.password} onChange={change} minLength="6" required />
      <button className="primary" disabled={isLoading}>{isLoading ? "Please wait..." : isRegistering ? "Create account" : "Log in"}</button>
    </form>
    <button className="link-button" onClick={switchMode}>{isRegistering ? "Already have an account? Log in" : "New here? Create an account"}</button>
  </section></main>;
}
