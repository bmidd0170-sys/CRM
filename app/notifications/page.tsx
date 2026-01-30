"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ProtectedPage from "../components/ProtectedPage";
import { handleLogout, getAdminId, getAdminData } from "@/lib/admin-storage";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [adminName, setAdminName] = useState("");
    const [adminId, setAdminId] = useState("");

    useEffect(() => {
        // Get logged-in admin data
        const admin = getAdminData();
        if (admin) {
            setAdminName(admin.name);
            setAdminId(admin.id.toString());
        }
    }, []);

    useEffect(() => {
        const currentAdminId = getAdminId();
        fetch("/api/notifications", {
            headers: {
                'x-admin-id': currentAdminId?.toString() || ''
            }
        })
            .then(res => res.json())
            .then(data => setNotifications(data))
            .catch(error => console.error('Error fetching notifications:', error));
    }, []);
    return (
        <ProtectedPage screenName="Notifications">
            <div className="flex min-h-screen bg-[#F8FAFC]">
                <Sidebar active="Notifications" />
                <main className="flex-1 min-h-screen ml-[260px]">
                    <div className="bg-white border-b border-[#E2E8F0] px-8 py-5 flex justify-between items-center sticky top-0 z-40 animate-slideInDown">
                        <h1 className="font-bricolage text-2xl font-bold text-[#1C1917]">Notifications</h1>
                        <div className="flex items-center gap-6">
                            <span className="text-[#1C1917] font-semibold">{adminName || "Loading..."}</span>
                            <span className="text-[#57534E] text-base">ID: {adminId || "—"}</span>
                            <button onClick={handleLogout} className="bg-[#0F766E] text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-[#0D5B54] transition">Logout</button>
                        </div>
                    </div>
                    <div className="p-8">
                        <h2 className="text-xl font-semibold text-[#1C1917] mb-6">Reminders & Admin Alerts</h2>
                        <div className="space-y-4">
                            {notifications.map((note) => (
                                <div
                                    key={note.id}
                                    className={`flex items-center gap-4 p-4 rounded-lg border ${note.read ? 'bg-[#F1F5F9] border-[#E2E8F0]' : 'bg-white border-[#0F766E]'} shadow-sm animate-fadeInUp`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${note.read ? 'bg-[#CBD5E1]' : 'bg-[#0F766E]'}`}></div>
                                    <div className="flex-1">
                                        <div className="text-sm text-[#1C1917] font-medium">{note.message}</div>
                                        <div className="text-xs text-[#64748B] mt-1">{new Date(note.date).toLocaleDateString()}</div>
                                    </div>
                                    <div className={`text-xs px-3 py-1 rounded-full font-semibold ${note.type === 'admin' ? 'bg-[#E0E7FF] text-[#3730A3]' : 'bg-[#FDE68A] text-[#92400E]'}`}>
                                        {note.type === 'admin' ? 'Admin' : 'Reminder'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedPage>
    );
}
