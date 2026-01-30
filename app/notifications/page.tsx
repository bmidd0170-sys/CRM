"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ProtectedPage from "../components/ProtectedPage";
import { handleLogout, getAdminId, getAdminData } from "@/lib/admin-storage";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [filteredNotifications, setFilteredNotifications] = useState<any[]>([]);
    const [adminName, setAdminName] = useState("");
    const [adminId, setAdminId] = useState("");
    const [selectedAdmin, setSelectedAdmin] = useState<string>("all");
    const [uniqueAdmins, setUniqueAdmins] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [showDropdown, setShowDropdown] = useState<boolean>(false);

    useEffect(() => {
        // Get logged-in admin data
        const admin = getAdminData();
        if (admin) {
            setAdminName(admin.name);
            setAdminId(admin.id.toString());
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.filter-dropdown-container')) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        // Extract unique admin names from notifications and filter
        const admins = Array.from(new Set(
            notifications.map(note => {
                const match = note.message.match(/\(by (.+?)\)$/);
                if (match) {
                    return match[1].replace(/\s*\[Super Admin\]$/, '');
                }
                return 'Unknown';
            })
        ));
        setUniqueAdmins(admins);

        const normalizedSearch = searchQuery.trim().toLowerCase();

        // Apply filter
        if (selectedAdmin === "all" && normalizedSearch === "") {
            setFilteredNotifications(notifications);
        } else {
            setFilteredNotifications(
                notifications.filter(note => {
                    const match = note.message.match(/\(by (.+?)\)$/);
                    const adminName = (match ? match[1] : 'Unknown').replace(/\s*\[Super Admin\]$/, '');

                    if (selectedAdmin !== "all") {
                        return adminName === selectedAdmin;
                    }

                    return adminName.toLowerCase().includes(normalizedSearch);
                })
            );
        }
    }, [notifications, selectedAdmin, searchQuery]);

    const filteredAdminList = uniqueAdmins.filter(admin => 
        admin.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectAdmin = (admin: string) => {
        setSelectedAdmin(admin);
        setSearchQuery(admin === "all" ? "" : admin);
        setShowDropdown(false);
    };

    const fetchNotifications = () => {
        const currentAdminId = getAdminId();
        fetch("/api/notifications", {
            headers: {
                'x-admin-id': currentAdminId?.toString() || ''
            }
        })
            .then(res => res.json())
            .then(data => setNotifications(data))
            .catch(error => console.error('Error fetching notifications:', error));
    };

    const handleMarkAllAsRead = async () => {
        const currentAdminId = getAdminId();
        const unreadNotifications = notifications.filter(note => !note.read);
        
        try {
            // Mark all unread notifications as read
            await Promise.all(unreadNotifications.map(note =>
                fetch('/api/notifications', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-admin-id': currentAdminId?.toString() || ''
                    },
                    body: JSON.stringify({
                        id: note.id,
                        read: true
                    })
                })
            ));
            
            // Refresh notifications list
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const handleMarkAsRead = async (notificationId: number, isRead: boolean) => {
        const currentAdminId = getAdminId();
        const nextReadState = !isRead;

        try {
            const response = await fetch('/api/notifications', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-id': currentAdminId?.toString() || ''
                },
                body: JSON.stringify({
                    id: notificationId,
                    read: nextReadState
                })
            });

            if (response.ok) {
                // Refresh notifications list
                fetchNotifications();
            }
        } catch (error) {
            console.error('Error toggling notification read state:', error);
        }
    };
    return (
        <ProtectedPage screenName="Notifications">
            <div className="flex min-h-screen bg-[#F8FAFC]">
                <Sidebar active="Notifications" />
                <main className="flex-1 min-h-screen ml-[260px]">
                    <div className="bg-white border-b border-[#E2E8F0] px-8 py-5 flex justify-between items-center sticky top-0 z-40 animate-slideInDown">
                        <h1 className="font-bricolage text-2xl font-bold text-[#1C1917]">Notifications</h1>
                        <div className="flex items-center gap-6">
                            <span className="text-[#1C1917] font-semibold">{adminName || "Loading..."}</span>
                            <button onClick={handleLogout} className="bg-[#0F766E] text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-[#0D5B54] transition">Logout</button>
                        </div>
                    </div>
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-[#1C1917]">Reminders & Admin Alerts</h2>
                            <div className="flex gap-3 items-center">
                                <div className="relative filter-dropdown-container">
                                    <input
                                        type="text"
                                        placeholder="Filter by admin..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setShowDropdown(true);
                                            if (e.target.value === "") {
                                                setSelectedAdmin("all");
                                            }
                                        }}
                                        onFocus={() => setShowDropdown(true)}
                                        className="w-64 px-4 py-2 border border-[#E2E8F0] rounded-md text-sm font-medium text-[#1C1917] bg-white hover:border-[#0F766E] focus:outline-none focus:border-[#0F766E] transition"
                                    />
                                    {showDropdown && (searchQuery || selectedAdmin === "all") && (
                                        <div className="absolute top-full mt-1 w-full bg-white border border-[#E2E8F0] rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
                                            <div
                                                onClick={() => handleSelectAdmin("all")}
                                                className="px-4 py-2 text-sm hover:bg-[#F1F5F9] cursor-pointer text-[#1C1917] font-medium"
                                            >
                                                All Admins
                                            </div>
                                            {filteredAdminList.map(admin => (
                                                <div
                                                    key={admin}
                                                    onClick={() => handleSelectAdmin(admin)}
                                                    className="px-4 py-2 text-sm hover:bg-[#F1F5F9] cursor-pointer text-[#1C1917]"
                                                >
                                                    {admin}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={handleMarkAllAsRead}
                                    className="bg-[#0F766E] text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-[#0D5B54] transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={notifications.filter(n => !n.read).length === 0}
                                >
                                    Mark All Read
                                </button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {filteredNotifications.map((note) => (
                                <div
                                    key={note.id}
                                    onClick={() => handleMarkAsRead(note.id, note.read)}
                                    className={`flex items-center gap-4 p-4 rounded-lg border ${note.read ? 'bg-[#F1F5F9] border-[#E2E8F0]' : 'bg-white border-[#0F766E]'} shadow-sm animate-fadeInUp cursor-pointer hover:opacity-80 transition`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${note.read ? 'bg-[#CBD5E1]' : 'bg-[#0F766E]'}`}></div>
                                    <div className="flex-1">
                                        <div className="text-sm text-[#1C1917] font-medium">
                                            {note.message.replace(/\s*\(by .+?\)$/, '')}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="text-xs text-[#64748B]">{new Date(note.date).toLocaleString()}</div>
                                            <span className="text-xs text-[#64748B]">•</span>
                                            <div className="text-xs font-semibold text-[#0F766E]">
                                                {(note.message.match(/\(by (.+?)\)$/)?.[1] || 'Unknown').replace(/\s*\[Super Admin\]$/, '')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`text-xs px-3 py-1 rounded-full font-semibold ${note.type === 'admin' ? 'bg-[#E0E7FF] text-[#3730A3]' : 'bg-[#FDE68A] text-[#92400E]'}`}>
                                        {note.type === 'admin'
                                            ? (note.message.includes('[Super Admin]') ? 'Super Admin' : 'Admin')
                                            : 'Reminder'}
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
