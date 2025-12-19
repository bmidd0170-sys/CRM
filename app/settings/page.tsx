"use client";
import React, { useState } from "react";
import { AdminList, AdminProfile } from "../components/AdminList";
import Sidebar from "../components/Sidebar";

const initialAdmins = [
    {
        name: "Alice Smith",
        email: "alice@email.com",
        role: "Super Admin",
        restrictions: [],
        online: true,
        changes: [
            "Created new donor: Sarah Johnson",
            "Updated campaign: Winter Relief",
            "Changed admin privileges for Bob Lee"
        ]
    },
    {
        name: "Bob Lee",
        email: "bob@email.com",
        role: "Admin",
        restrictions: ["No Delete"],
        online: false,
        changes: [
            "Edited donor: Michael Chen",
            "Viewed report: Lapsed Donors"
        ]
    },
];

const allRestrictions = [
    "No Delete",
    "No Edit Donors",
    "No Access Reports",
    "No Manage Events",
    "No Manage Admins"
];

export default function SettingsPage() {
    const [admins, setAdmins] = useState(initialAdmins);
    const [form, setForm] = useState({ name: "", email: "", role: "Admin", restrictions: [] as string[] });
    const [applyToAll, setApplyToAll] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<null | typeof admins[0]>(null);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function handleRestrictionChange(restriction: string) {
        setForm((prev) => ({
            ...prev,
            restrictions: prev.restrictions.includes(restriction)
                ? prev.restrictions.filter(r => r !== restriction)
                : [...prev.restrictions, restriction],
        }));
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!form.name || !form.email) return;
        if (applyToAll) {
            setAdmins(admins.map(a => ({ ...a, restrictions: form.restrictions })));
        } else {
            setAdmins([
                ...admins,
                {
                    ...form,
                    online: false,
                    changes: [],
                },
            ]);
        }
        setForm({ name: "", email: "", role: "Admin", restrictions: [] });
        setApplyToAll(false);
    }

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar active="Settings" />
            <main className="flex-1 min-h-screen ml-[260px]">
                <div className="bg-white border-b border-[#E2E8F0] px-8 py-5 flex justify-between items-center sticky top-0 z-40 animate-slideInDown">
                    <h1 className="font-bricolage text-2xl font-bold text-[#1C1917]">Settings</h1>
                </div>
                <div className="p-8 max-w-2xl mx-auto">
                    <h2 className="text-xl font-semibold text-[#1C1917] mb-6">Manage Admins</h2>
                    <form onSubmit={handleSubmit} className="bg-white border border-[#E2E8F0] rounded-lg p-6 mb-8">
                        <div className="mb-4">
                            <label className="block font-medium mb-2 text-[#1C1917]">Name</label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="border rounded px-3 py-2 w-full text-sm text-[#1C1917] bg-white"
                                placeholder="Admin Name"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block font-medium mb-2 text-[#1C1917]">Email</label>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                className="border rounded px-3 py-2 w-full text-sm text-[#1C1917] bg-white"
                                placeholder="Admin Email"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block font-medium mb-2 text-[#1C1917]">Role</label>
                            <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                className="border rounded px-3 py-2 w-full text-sm text-[#1C1917] bg-white"
                            >
                                <option value="Admin">Admin</option>
                                <option value="Super Admin">Super Admin</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block font-medium mb-2 text-[#1C1917]">Restrictions</label>
                            <div className="flex flex-wrap gap-3">
                                {allRestrictions.map(r => (
                                    <label key={r} className="flex items-center gap-2 text-[#1C1917]">
                                        <input
                                            type="checkbox"
                                            checked={form.restrictions.includes(r)}
                                            onChange={() => handleRestrictionChange(r)}
                                        />
                                        <span>{r}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="mb-4 flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={applyToAll}
                                onChange={() => setApplyToAll(v => !v)}
                                id="applyToAll"
                            />
                            <label htmlFor="applyToAll" className="text-[#1C1917]">Apply restrictions to all admins</label>
                        </div>
                        <button
                            type="submit"
                            className="bg-[#0F766E] text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-[#0D5B54] transition"
                        >
                            {applyToAll ? "Apply to All Admins" : "Add Admin"}
                        </button>
                    </form>
                    <h3 className="text-lg font-semibold text-[#1C1917] mb-4">Current Admins</h3>
                    <AdminList admins={admins} onSelect={setSelectedAdmin} />
                    {selectedAdmin && (
                        <AdminProfile admin={selectedAdmin} onClose={() => setSelectedAdmin(null)} />
                    )}
                </div>
            </main>
        </div>
    );
}
