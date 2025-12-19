"use client";
import React from "react";

interface CampaignFormProps {
    onCreate: (data: {
        name: string;
        goal: number;
        startDate: string;
        endDate: string;
        description: string;
    }) => void;
    onClose: () => void;
}

export default function CampaignForm({ onCreate, onClose }: CampaignFormProps) {
    const [form, setForm] = React.useState({
        name: "",
        goal: "",
        startDate: "",
        endDate: "",
        description: ""
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!form.name || !form.goal || !form.startDate || !form.endDate) return;
        setLoading(true);
        setError("");
        try {
            const data = {
                name: form.name,
                goal: Number(form.goal),
                startDate: new Date(form.startDate).toISOString(),
                endDate: new Date(form.endDate).toISOString(),
                description: form.description
            };
            const res = await fetch("/api/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to create campaign");
            setForm({ name: "", goal: "", startDate: "", endDate: "", description: "" });
            onCreate(data);
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
                <h2 className="text-xl font-semibold mb-4">Create New Campaign</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="border rounded px-3 py-2 text-sm text-[#1C1917]"
                        placeholder="Campaign Name"
                        required
                    />
                    <input
                        name="goal"
                        type="number"
                        value={form.goal}
                        onChange={handleChange}
                        className="border rounded px-3 py-2 text-sm text-[#1C1917]"
                        placeholder="Goal Amount"
                        required
                    />
                    <input
                        name="startDate"
                        type="date"
                        value={form.startDate}
                        onChange={handleChange}
                        className="border rounded px-3 py-2 text-sm text-[#1C1917]"
                        required
                    />
                    <input
                        name="endDate"
                        type="date"
                        value={form.endDate}
                        onChange={handleChange}
                        className="border rounded px-3 py-2 text-sm text-[#1C1917]"
                        required
                    />
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="border rounded px-3 py-2 text-sm text-[#1C1917]"
                        placeholder="Description (optional)"
                    />
                    <button
                        type="submit"
                        className="bg-[#0F766E] text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-[#0D5B54] transition"
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create Campaign"}
                    </button>
                    {error && <div className="text-red-500">{error}</div>}
                </form>
            </div>
        </div>
    );
}