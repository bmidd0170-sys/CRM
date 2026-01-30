import React, { useState, useEffect } from "react";
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

interface Campaign {
  id: number;
  name: string;
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
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch campaigns
    const adminId = getAdminId();
    fetch("/api/campaigns", {
      headers: {
        'x-admin-id': adminId?.toString() || ''
      }
    })
      .then(res => res.json())
      .then(data => setCampaigns(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching campaigns:', err));
  }, []);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-semibold mb-4 text-[#1C1917]">{isEdit ? "Edit Event" : "Create New Event"}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="border rounded px-3 py-2 text-sm text-[#1C1917]"
            placeholder="Event Name"
            required
          />
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className="border rounded px-3 py-2 text-sm text-[#1C1917]"
            required
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="border rounded px-3 py-2 text-sm text-[#1C1917]"
            placeholder="Description"
            required
          />
          <input
            name="image"
            value={form.image}
            onChange={handleChange}
            className="border rounded px-3 py-2 text-sm text-[#1C1917]"
            placeholder="Image URL (optional)"
          />
          <select
            name="campaignId"
            value={form.campaignId}
            onChange={handleChange}
            className="border rounded px-3 py-2 text-sm text-[#1C1917]"
          >
            <option value="">Select Campaign (optional)</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-[#0F766E] text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-[#0D5B54] transition"
            disabled={loading}
          >
            {loading ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Event" : "Create Event")}
          </button>
          {error && <div className="text-red-500">{error}</div>}
        </form>
      </div>
    </div>
  );
}
