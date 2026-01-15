"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const menu = [
    { icon: "📊", label: "Dashboard", href: "/dashboard" },
    { icon: "👥", label: "Donors", href: "/donors" },
    { icon: "💰", label: "Donations", href: "/donations" },
    { icon: "📢", label: "Campaigns", href: "/campaigns" },
    { icon: "📅", label: "Events", href: "/events" },
    { icon: "📈", label: "Reports", href: "/reports" },
    { icon: "🔔", label: "Notifications", href: "/notifications" },
    { icon: "⚙️", label: "Settings", href: "/settings" },
];

export default function Sidebar({ active }: { active: string }) {
    const [organizationName, setOrganizationName] = useState("Helping Hands");

    useEffect(() => {
        // Fetch the first admin's organization name
        fetch("/api/admins")
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0 && data[0].organizationName) {
                    setOrganizationName(data[0].organizationName);
                }
            })
            .catch(err => console.error("Failed to fetch organization name:", err));
    }, []);

    return (
        <aside className="w-[260px] bg-[#1E293B] text-white flex flex-col fixed h-full z-50 animate-slideInLeft">
            <div className="py-7 px-6 border-b border-white/10">
                <Link href="/dashboard" className="font-bricolage text-2xl font-bold text-white">{organizationName}</Link>
            </div>
            <nav className="flex-1 py-6">
                {menu.map(item => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={`flex items-center gap-3 px-6 py-3 text-[0.97rem] border-l-4 transition-all ${active === item.label ? "bg-[#334155] border-[#14B8A6] font-semibold" : "border-transparent hover:bg-[#334155] hover:border-[#14B8A6]"}`}
                    >
                        <span className="w-5 h-5 flex items-center justify-center text-lg">{item.icon}</span>
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
}