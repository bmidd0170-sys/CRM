import React, { useState } from "react";

interface AdminFormProps {
  onCreated?: (data?: {
    name: string;
    email: string;
    role: string;
    restrictions: string[];
    online: boolean;
  }) => void;
}

export default function AdminForm({ onCreated }: AdminFormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Admin",
    restrictions: "",
    online: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = {
        name: form.name,
        email: form.email,
        role: form.role,
        restrictions: form.restrictions ? [form.restrictions] : [],
        online: form.online
      };
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to create admin");
      setForm({ name: "", email: "", role: "Admin", restrictions: "", online: false });
      if (onCreated) onCreated(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="name" value={form.name} onChange={handleChange} placeholder="Admin Name" required className="border p-2 w-full" />
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required type="email" className="border p-2 w-full" />
      <select name="role" value={form.role} onChange={handleChange} className="border p-2 w-full">
        <option value="Admin">Admin</option>
        <option value="Super Admin">Super Admin</option>
      </select>
      <input name="restrictions" value={form.restrictions} onChange={handleChange} placeholder="Restrictions (comma separated)" className="border p-2 w-full" />
      <label className="flex items-center"><input type="checkbox" name="online" checked={form.online} onChange={e => setForm({ ...form, online: e.target.checked })} /> Online</label>
      <button type="submit" disabled={loading} className="bg-[#0F766E] text-white px-4 py-2 rounded">{loading ? "Adding..." : "Add Admin"}</button>
      {error && <div className="text-red-500">{error}</div>}
    </form>
  );
}
