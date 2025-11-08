// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/Button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("parola123");
  const [role] = useState("teacher"); // role default, selector removed from UI
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      await login({ email, password, role });
      const dest = loc.state?.from?.pathname || "/dashboard";
      nav(dest, { replace: true });
    } catch (err) {
      console.error(err);
      setError("Adresa de e-mail sau parola incorectă");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4 relative overflow-hidden" style={{
      background: 'linear-gradient(120deg, #ff9a9e, #a18cd1, #84fab0, #8fd3f4)',
      backgroundSize: '300% 300%',
      animation: 'loginGradient 12s ease infinite'
    }}>
      {/* subtle overlay for readability */}
      <div className="absolute inset-0 backdrop-blur-[2px] opacity-70" />

      <form onSubmit={onSubmit} className="card w-full max-w-md relative z-10">
        <div className="card-header">
          <div className="text-lg font-semibold">Autentificare</div>
        </div>

        <div className="card-content grid gap-4">

          <div>
            <label className="label">Email</label>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="profesor@demo.ro"
              type="email"
              required
            />
          </div>

          <div>
            <label className="label">Parolă</label>
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>

          {/* Removed role toggle buttons (Profesor/Student) per request */}

          {/* Mesaj de eroare */}
          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <Button type="submit" disabled={busy}>
            {busy ? "Se conectează..." : "Intră"}
          </Button>
        </div>
      </form>
    </div>
  );
}
