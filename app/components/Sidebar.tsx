"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { isSuperAdmin, canAccessScreen, getAdminId } from "@/lib/admin-storage";

const baseMenu = [
    { icon: "📊", label: "Dashboard", href: "/dashboard" },
    { icon: "👥", label: "Donors", href: "/donors" },
    { icon: "💰", label: "Donations", href: "/donations" },
    { icon: "📢", label: "Campaigns", href: "/campaigns" },
    { icon: "📅", label: "Events", href: "/events" },
    { icon: "📈", label: "Reports", href: "/reports" },
    { icon: "🔔", label: "Notifications", href: "/notifications" },
    { icon: "⚙️", label: "Settings", href: "/settings" },
];

const superAdminMenu = [
    { icon: "🤖", label: "Admins", href: "/admins" },
    { icon: "🛠️", label: "AI policy page", href: "/ai-policy" }
];

interface MenuItem {
    icon: string;
    label: string;
    href: string;
}

export default function Sidebar({ active }: { active: string }) {
    const [organizationName, setOrganizationName] = useState(() => {
        // Initialize from localStorage to prevent flicker
        if (typeof window !== 'undefined') {
            return localStorage.getItem('organizationName') || "Helping Hands";
        }
        return "Helping Hands";
    });
    const [showSuperAdminLinks, setShowSuperAdminLinks] = useState(false);
    const [visibleMenu, setVisibleMenu] = useState<MenuItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Fetch the first admin's organization name
        const currentAdminId = getAdminId();
        fetch("/api/admins", {
            headers: {
                'x-admin-id': currentAdminId?.toString() || ''
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0 && data[0].organizationName) {
                    const orgName = data[0].organizationName;
                    setOrganizationName(orgName);
                    localStorage.setItem('organizationName', orgName);
                }
            })
            .catch(err => console.error("Failed to fetch organization name:", err));
    }, []);

    useEffect(() => {
        // Only render super admin links client-side after storage check
        const isSuperAdminUser = isSuperAdmin();
        setShowSuperAdminLinks(isSuperAdminUser);

        // Filter menu items based on access restrictions
        const allItems = isSuperAdminUser ? [...baseMenu, ...superAdminMenu] : baseMenu;
        const accessibleItems = allItems.filter(item => canAccessScreen(item.label));
        setVisibleMenu(accessibleItems);
    }, []);

    useEffect(() => {
        const currentAdminId = getAdminId();
        if (!currentAdminId) return;

        fetch("/api/notifications?unread=true", {
            headers: {
                'x-admin-id': currentAdminId?.toString() || ''
            }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setUnreadCount(data.length);
                } else {
                    setUnreadCount(0);
                }
            })
            .catch(() => setUnreadCount(0));
    }, []);

    return (
        <aside className="w-[260px] bg-[#1E293B] text-white flex flex-col fixed h-full z-50 animate-slideInLeft">
            <div className="py-7 px-6 border-b border-white/10">
                <Link href="/dashboard" className="font-bricolage text-2xl font-bold text-white">{organizationName}</Link>
            </div>
            <nav className="flex-1 py-6">
                {visibleMenu.map(item => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={`flex items-center gap-3 px-6 py-3 text-[0.97rem] border-l-4 transition-all ${active === item.label ? "bg-[#334155] border-[#14B8A6] font-semibold" : "border-transparent hover:bg-[#334155] hover:border-[#14B8A6]"}`}
                    >
                        <span className="w-5 h-5 flex items-center justify-center text-lg">{item.icon}</span>
                        <span className="flex items-center gap-2">
                            {item.label}
                            {item.label === "Notifications" && unreadCount > 0 && (
                                <span className="min-w-[20px] h-[20px] px-1 flex items-center justify-center rounded-full bg-[#14B8A6] text-white text-[0.7rem] font-bold">
                                    {unreadCount}
                                </span>
                            )}
                        </span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
}