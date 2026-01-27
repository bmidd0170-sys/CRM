"use client";
import React, { useState } from "react";
import { getAdminId } from "@/lib/admin-storage";

interface DonorFormProps {
  donor?: {
    id: number;
    name: string;
    email: string;
    status: string;
  } | null;
  onSave?: (data: {
    name: string;
    email: string;
    status: string;
  }) => void;
  onClose: () => void;
}

export default function DonorForm({ donor, onSave, onClose }: DonorFormProps) {
  const isEdit = !!donor;
  const [form, setForm] = useState({
    name: donor?.name || "",
    email: donor?.email || "",
    status: donor?.status || "Active"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name || !form.email || !form.status) return;
    setLoading(true);
    setError("");
    try {
      const data = {
        name: form.name,
        email: form.email,
        status: form.status
      };

      if (isEdit && donor?.id) {
        // Edit donor
        const adminId = getAdminId();
        const res = await fetch("/api/donors", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            'x-admin-id': adminId?.toString() || ''
          },
          body: JSON.stringify({ id: donor.id, ...data })
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to update donor");
        }
      } else {
        // Create donor
        const adminId = getAdminId();
        const res = await fetch("/api/donors", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'x-admin-id': adminId?.toString() || ''
          },
          body: JSON.stringify(data)
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to create donor");
        }
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
        <h2 className="text-xl font-semibold mb-4">{isEdit ? "Edit Donor" : "Create New Donor"}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="border rounded px-3 py-2 text-sm text-[#1C1917]"
            placeholder="Donor Name"
            required
          />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="border rounded px-3 py-2 text-sm text-[#1C1917]"
            placeholder="Email Address"
            required
          />
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border rounded px-3 py-2 text-sm text-[#1C1917]"
            required
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button
            type="submit"
            className="bg-[#0F766E] text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-[#0D5B54] transition"
            disabled={loading}
          >
            {loading ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Donor" : "Create Donor")}
          </button>
          {error && <div className="text-red-500">{error}</div>}
        </form>
      </div>
    </div>
  );
}
