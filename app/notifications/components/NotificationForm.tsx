import React, { useState, ChangeEvent } from "react";

interface NotificationFormProps {
  onCreated?: (data?: {
    type: string;
    message: string;
    date: string;
    read: boolean;
  }) => void;
}

export default function NotificationForm({ onCreated }: NotificationFormProps) {
  const [form, setForm] = useState({
    type: "reminder",
    message: "",
    date: "",
    read: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm({
        ...form,
        [name]: (e.target as HTMLInputElement).checked
      });
    } else {
      setForm({
        ...form,
        [name]: value
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = {
        type: form.type,
        message: form.message,
        date: new Date(form.date).toISOString(),
        read: form.read
      };
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to create notification");
      setForm({ type: "reminder", message: "", date: "", read: false });
      if (onCreated) onCreated(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <select name="type" value={form.type} onChange={handleChange} className="border p-2 w-full">
        <option value="reminder">Reminder</option>
        <option value="admin">Admin</option>
      </select>
      <input name="date" value={form.date} onChange={handleChange} placeholder="Date" required type="date" className="border p-2 w-full" />
      <textarea name="message" value={form.message} onChange={handleChange} placeholder="Message" required className="border p-2 w-full" />
      <label className="flex items-center"><input type="checkbox" name="read" checked={form.read} onChange={handleChange} /> Read</label>
      <button type="submit" disabled={loading} className="bg-[#0F766E] text-white px-4 py-2 rounded">{loading ? "Adding..." : "Add Notification"}</button>
      {error && <div className="text-red-500">{error}</div>}
    </form>
  );
}
