import React, { useState } from "react";

interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
  restrictions: string[];
  online: boolean;
  changes: string[];
  organizationName?: string;
}

interface LoginFormProps {
  onLogin?: (admin: Admin) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/logins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.success && data.admin) {
        // Clear temp data if needed
        if (data.clearTempData) {
          await fetch("/api/clear-temp-data", { method: "POST" });
        }
        
        // Store admin data in localStorage
        localStorage.setItem("admin", JSON.stringify(data.admin));
        
        if (onLogin) onLogin(data.admin);
      } else {
        throw new Error("Login failed");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          name="email" 
          value={form.email} 
          onChange={handleChange} 
          placeholder="Email" 
          required 
          type="email" 
          className="border p-2 w-full" 
        />
        <input 
          name="password" 
          value={form.password} 
          onChange={handleChange} 
          placeholder="Password" 
          required 
          type="password" 
          className="border p-2 w-full" 
        />
        <button 
          type="submit" 
          disabled={loading} 
          className="bg-[#0F766E] text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      <p className="text-sm text-gray-600 mt-4">
        First time? Just enter your email and a password to create an account.
      </p>
    </div>
  );
}
