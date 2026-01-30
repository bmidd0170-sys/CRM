"use client";
import React, { useState, useEffect } from "react";
import { AdminList, AdminProfile } from "../components/AdminList";
import Sidebar from "../components/Sidebar";
import { getAdminId, handleLogout } from "@/lib/admin-storage";

const allRestrictions = [
    "No Delete",
    "No Edit Donors",
    "No Access Reports",
    "No Manage Events",
    "No Manage Admins"
];

interface AdminFormState {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: "Admin" | "Super Admin";
    restrictions: string[];
}

export default function SettingsPage() {
    const [admins, setAdmins] = useState<any[]>([]);
    const [form, setForm] = useState<AdminFormState>({ name: "", email: "", password: "", confirmPassword: "", role: "Admin", restrictions: [] });
    const [applyToAll, setApplyToAll] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<null | any>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Fetch admins from database
    useEffect(() => {
        fetchAdmins();
    }, []);

    async function fetchAdmins() {
        try {
            const currentAdminId = getAdminId();
            const response = await fetch("/api/admins", {
                headers: {
                    'x-admin-id': currentAdminId?.toString() || ''
                }
            });
            if (response.ok) {
                const data = await response.json();
                setAdmins(data);
            }
        } catch (error) {
            console.error("Failed to fetch admins:", error);
        }
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    }

    function handleRestrictionChange(restriction: string) {
        setForm((prev) => ({
            ...prev,
            restrictions: prev.restrictions.includes(restriction)
                ? prev.restrictions.filter(r => r !== restriction)
                : [...prev.restrictions, restriction],
        }));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage(null);

        if (!form.name || !form.email || !form.password) {
            setMessage({ type: "error", text: "Name, email, and password are required" });
            return;
        }

        if (form.password !== form.confirmPassword) {
            setMessage({ type: "error", text: "Passwords do not match" });
            return;
        }

        if (form.password.length < 6) {
            setMessage({ type: "error", text: "Password must be at least 6 characters" });
            return;
        }

        setLoading(true);

        try {
            const adminId = getAdminId();
            const response = await fetch("/api/admins", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'x-admin-id': adminId?.toString() || ''
                },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    role: form.role,
                    restrictions: form.restrictions,
                }),
            });

            if (response.ok) {
                const newAdmin = await response.json();
                setAdmins([...admins, newAdmin]);
                setForm({ name: "", email: "", password: "", confirmPassword: "", role: "Admin", restrictions: [] });
                setMessage({ type: "success", text: "Admin created successfully!" });
            } else {
                const error = await response.json();
                setMessage({ type: "error", text: error.error || "Failed to create admin" });
            }
        } catch (error) {
            console.error("Error creating admin:", error);
            setMessage({ type: "error", text: "An error occurred. Please try again." });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar active="Settings" />
            <main className="flex-1 min-h-screen ml-[260px]">
                <div className="bg-white border-b border-[#E2E8F0] px-8 py-5 flex justify-between items-center sticky top-0 z-40 animate-slideInDown">
                    <h1 className="font-bricolage text-2xl font-bold text-[#1C1917]">Settings</h1>
                    <button onClick={handleLogout} className="bg-[#0F766E] text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-[#0D5B54] transition">Logout</button>
                </div>
                <div className="p-8 max-w-2xl mx-auto">
                    <h2 className="text-xl font-semibold text-[#1C1917] mb-6">Manage Admins</h2>
                    {message && (
                        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-[#A7F3D0] text-[#047857]" : "bg-[#FECACA] text-[#991B1B]"}`}>
                            {message.text}
                        </div>
                    )}
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
                            <label className="block font-medium mb-2 text-[#1C1917]">Password</label>
                            <input
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                className="border rounded px-3 py-2 w-full text-sm text-[#1C1917] bg-white"
                                placeholder="Password (min 6 characters)"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block font-medium mb-2 text-[#1C1917]">Confirm Password</label>
                            <input
                                name="confirmPassword"
                                type="password"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                className="border rounded px-3 py-2 w-full text-sm text-[#1C1917] bg-white"
                                placeholder="Confirm Password"
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
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[#0F766E] text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-[#0D5B54] transition disabled:opacity-50"
                        >
                            {loading ? "Creating Admin..." : "Create Admin"}
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
