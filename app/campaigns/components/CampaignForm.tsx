import React, { useState } from "react";
import { getAdminId } from "@/lib/admin-storage";

export default function CampaignForm({ onCreate = () => { }, onClose }: { onCreate?: () => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: "",
    goal: "",
    startDate: "",
    endDate: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.goal || !form.startDate || !form.endDate || !form.description) return;
    setLoading(true);
    setError("");
    try {
      const adminId = getAdminId();
      console.log('[CampaignForm] Admin ID from storage:', adminId);
      const startDate = new Date(form.startDate).toISOString();
      const endDate = new Date(form.endDate).toISOString();
      console.log('[CampaignForm] Form data:', form);
      console.log('[CampaignForm] Dates:', { startDate, endDate });

      const payload = {
        name: form.name,
        goal: Number(form.goal),
        startDate: startDate,
        endDate: endDate,
        description: form.description
      };
      console.log('[CampaignForm] Sending payload:', payload);

      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'x-admin-id': adminId?.toString() || ''
        },
        body: JSON.stringify(payload)
      });
      console.log('[CampaignForm] Response status:', res.status);
      if (!res.ok) {
        const errorData = await res.json();
        console.error('[CampaignForm] Error response:', errorData);
        throw new Error(errorData.error || "Failed to create campaign");
      }
      setForm({ name: "", goal: "", startDate: "", endDate: "", description: "" });
      onCreate();
      onClose();
    } catch (err: any) {
      console.error('[CampaignForm] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="name" value={form.name} onChange={handleChange} placeholder="Campaign Name" required className="border p-2 w-full" />
      <input name="goal" value={form.goal} onChange={handleChange} placeholder="Goal Amount" required type="number" className="border p-2 w-full" />
      <input name="startDate" value={form.startDate} onChange={handleChange} placeholder="Start Date" required type="date" className="border p-2 w-full" />
      <input name="endDate" value={form.endDate} onChange={handleChange} placeholder="End Date" required type="date" className="border p-2 w-full" />
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" required className="border p-2 w-full" />
      <button type="submit" disabled={loading} className="bg-[#0F766E] text-white px-4 py-2 rounded">{loading ? "Adding..." : "Add Campaign"}</button>
      {error && <div className="text-red-500">{error}</div>}
    </form>
  );
}

