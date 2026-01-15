import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, User } from "firebase/auth";
import { auth } from "../../../lib/firebase";

interface LoginFormProps {
  onLogin?: (user: User) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (onLogin) onLogin(result.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
      if (onLogin) onLogin(userCredential.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required type="email" className="border p-2 w-full" />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Password" required type="password" className="border p-2 w-full" />
        <button type="submit" disabled={loading} className="bg-[#0F766E] text-white px-4 py-2 rounded">{loading ? "Logging in..." : "Login"}</button>
      </form>
      <button onClick={handleGoogleLogin} disabled={loading} className="bg-[#EA4335] text-white px-4 py-2 rounded w-full flex items-center justify-center gap-2">
        <svg width="20" height="20" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.22l6.85-6.85C35.82 2.7 30.28 0 24 0 14.82 0 6.73 5.48 2.69 13.44l7.98 6.2C12.2 13.13 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.03l7.18 5.59C43.93 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M9.67 28.09c-1.13-3.36-1.13-6.97 0-10.33l-7.98-6.2C-1.13 17.1-1.13 30.9 1.69 37.09l7.98-6.2z"/><path fill="#EA4335" d="M24 46c6.28 0 11.56-2.08 15.41-5.66l-7.18-5.59c-2.01 1.35-4.59 2.16-8.23 2.16-6.38 0-11.8-3.63-14.33-8.89l-7.98 6.2C6.73 42.52 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
        Continue with Google
      </button>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}
