import React, { useState } from "react";
import { getAdminId } from "@/lib/admin-storage";

interface EventFormProps {
  onCreate?: (data: {
    name: string;
    date: string;
    description: string;
    image?: string | null;
    campaignId?: number | null;
    notify?: string[];
  }) => void;
  onClose?: () => void;
  recipients?: string[];
  event?: {
    id: number;
    name: string;
    date: string;
    description: string;
    image?: string | null;
    campaignId?: number | null;
  } | null;
}

export default function EventForm({ onCreate, onClose, event }: EventFormProps) {
  const isEdit = !!event;
  const [form, setForm] = useState({
    name: event?.name || "",
    date: event?.date ? new Date(event.date).toISOString().split('T')[0] : "",
    description: event?.description || "",
    image: event?.image || "",
    campaignId: event?.campaignId?.toString() || ""
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
        image: form.image && form.image.trim() ? form.image : null,
        campaignId: form.campaignId ? Number(form.campaignId) : null
      };
      if (onCreate) {
        onCreate(data);
        setForm({ name: "", date: "", description: "", image: "", campaignId: "" });
        return;
      }
      
      const adminId = getAdminId();
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'x-admin-id': adminId?.toString() || ''
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errorData = await res.json();
        const details = errorData.details
          ? (Array.isArray(errorData.details) ? errorData.details.map((d: any) => `${d.field}: ${d.message}`).join(', ') : errorData.details)
          : errorData.error;
        throw new Error(details || "Failed to create event");
      }
      setForm({ name: "", date: "", description: "", image: "", campaignId: "" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 shadow-sm mb-6">
      {onClose && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{isEdit ? "Edit Event" : "Create New Event"}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      )}
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="name" value={form.name} onChange={handleChange} placeholder="Event Name" required className="border p-2 w-full" />
      <input name="date" value={form.date} onChange={handleChange} placeholder="Date" required type="date" className="border p-2 w-full" />
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" required className="border p-2 w-full" />
      <input name="image" value={form.image} onChange={handleChange} placeholder="Image URL (optional)" className="border p-2 w-full" />
      <input name="campaignId" value={form.campaignId} onChange={handleChange} placeholder="Campaign ID (optional)" type="number" className="border p-2 w-full" />
      <button type="submit" disabled={loading} className="bg-[#0F766E] text-white px-4 py-2 rounded">{loading ? (isEdit ? "Updating..." : "Adding...") : (isEdit ? "Update Event" : "Add Event")}</button>
      {error && <div className="text-red-500">{error}</div>}
    </form>
    </div>
  );
}
