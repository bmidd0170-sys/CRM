import React, { useState } from "react";

export default function LoginForm({ onLogin }: { onLogin?: (admin: any) => void }) {
  const [form, setForm] = useState({ email: "" });
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
        body: JSON.stringify({ email: form.email })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Login failed");
      if (onLogin) onLogin(data.admin);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="email" value={form.email} onChange={handleChange} placeholder="Admin Email" required type="email" className="border p-2 w-full" />
      <button type="submit" disabled={loading} className="bg-[#0F766E] text-white px-4 py-2 rounded">{loading ? "Logging in..." : "Login"}</button>
      {error && <div className="text-red-500">{error}</div>}
    </form>
  );
}
