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
  const [form, setForm] = useState({ email: "", password: "", organizationName: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

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
        body: JSON.stringify({ 
          email: form.email, 
          password: form.password,
          organizationName: form.organizationName || undefined
        })
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
      <div className="mb-4">
        <button
          type="button"
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError("");
          }}
          className="text-[#0F766E] underline text-sm"
        >
          {isRegistering ? "Already have an account? Login" : "New organization? Register here"}
        </button>
      </div>
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
        {isRegistering && (
          <input 
            name="organizationName" 
            value={form.organizationName} 
            onChange={handleChange} 
            placeholder="Organization Name" 
            required={isRegistering}
            type="text" 
            className="border p-2 w-full" 
          />
        )}
        <button 
          type="submit" 
          disabled={loading} 
          className="bg-[#0F766E] text-white px-4 py-2 rounded w-full"
        >
          {loading ? (isRegistering ? "Registering..." : "Logging in...") : (isRegistering ? "Register" : "Login")}
        </button>
      </form>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      {isRegistering && (
        <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded mt-4">
          ℹ️ Registering a new organization will create a separate workspace. Each organization has its own isolated data.
        </p>
      )}
      {!isRegistering && (
        <p className="text-sm text-gray-600 mt-4">
          First time? Click "Register here" to create a new organization account.
        </p>
      )}
    </div>
  );
}
