import React, { useState } from "react";

interface EventFormProps {
  onCreated?: (data?: {
    name: string;
    date: string;
    description: string;
    image?: string | null;
    campaignId?: number | null;
  }) => void;
}

export default function EventForm({ onCreated }: EventFormProps) {
  const [form, setForm] = useState({
    name: "",
    date: "",
    description: "",
    image: "",
    campaignId: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    // Frontend validation
    if (!form.name || !form.date || !form.description) {
      setError("Please fill in all required fields: name, date, and description.");
      return;
    }
    // Validate date
    const eventDate = new Date(form.date);
    if (isNaN(eventDate.getTime())) {
      setError("Please enter a valid date.");
      return;
    }
    setLoading(true);
    try {
      const data = {
        name: form.name,
        date: eventDate.toISOString(),
        description: form.description,
        image: form.image || null,
        campaignId: form.campaignId ? Number(form.campaignId) : null
      };
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to create event");
      setForm({ name: "", date: "", description: "", image: "", campaignId: "" });
      if (onCreated) onCreated(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="name" value={form.name} onChange={handleChange} placeholder="Event Name" required className="border p-2 w-full" />
      <input name="date" value={form.date} onChange={handleChange} placeholder="Date" required type="date" className="border p-2 w-full" />
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" required className="border p-2 w-full" />
      <input name="image" value={form.image} onChange={handleChange} placeholder="Image URL (optional)" className="border p-2 w-full" />
      <input name="campaignId" value={form.campaignId} onChange={handleChange} placeholder="Campaign ID (optional)" type="number" className="border p-2 w-full" />
      <button type="submit" disabled={loading} className="bg-[#0F766E] text-white px-4 py-2 rounded">{loading ? "Adding..." : "Add Event"}</button>
      {error && <div className="text-red-500">{error}</div>}
    </form>
  );
}
