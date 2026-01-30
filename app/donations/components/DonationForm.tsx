"use client";
import React, { useState, useEffect } from "react";
import { getAdminId } from "@/lib/admin-storage";

interface DonationFormProps {
  onSave?: (data: any) => void;
  onClose: () => void;
}

export default function DonationForm({ onSave, onClose }: DonationFormProps) {
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [form, setForm] = useState({
    donorId: "",
    amount: "",
    date: getLocalDateString(),
    campaignId: ""
  });
  const [donors, setDonors] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const adminId = getAdminId();
    // Fetch donors
    fetch("/api/donors", {
      headers: {
        'x-admin-id': adminId?.toString() || ''
      }
    })
      .then(res => res.json())
      .then(data => setDonors(data))
      .catch(err => console.error('Error fetching donors:', err));

    // Fetch campaigns
    fetch("/api/campaigns", {
      headers: {
        'x-admin-id': adminId?.toString() || ''
      }
    })
      .then(res => res.json())
      .then(data => setCampaigns(data))
      .catch(err => console.error('Error fetching campaigns:', err));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.donorId || !form.amount || !form.date) {
      setError("Please fill in all required fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const adminId = getAdminId();
      // Create a date at noon to avoid timezone issues
      const [year, month, day] = form.date.split('-');
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
      
      const data = {
        donorId: parseInt(form.donorId),
        amount: parseFloat(form.amount),
        date: dateObj.toISOString(),
        campaignId: form.campaignId ? parseInt(form.campaignId) : null
      };

      const res = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'x-admin-id': adminId?.toString() || ''
        },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create donation");
      }

      if (onSave) {
        onSave(data);
      }
      onClose();
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
        <h2 className="text-xl font-semibold mb-4">Create New Donation</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <select
            name="donorId"
            value={form.donorId}
            onChange={handleChange}
            className="border rounded px-3 py-2 text-sm text-[#1C1917]"
            required
          >
            <option value="">Select a Donor</option>
            {donors.map((donor) => (
              <option key={donor.id} value={donor.id}>
                {donor.name} ({donor.email})
              </option>
            ))}
          </select>
          <input
            name="amount"
            type="number"
            step="0.01"
            value={form.amount}
            onChange={handleChange}
            className="border rounded px-3 py-2 text-sm text-[#1C1917]"
            placeholder="Donation Amount"
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
          <select
            name="campaignId"
            value={form.campaignId}
            onChange={handleChange}
            className="border rounded px-3 py-2 text-sm text-[#1C1917]"
          >
            <option value="">Select a Campaign (Optional)</option>
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
            {loading ? "Creating..." : "Create Donation"}
          </button>
          {error && <div className="text-red-500">{error}</div>}
        </form>
      </div>
    </div>
  );
}
