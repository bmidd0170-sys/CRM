"use client";
import React from "react";
import Sidebar from "../components/Sidebar";

const sidebarMenu = [
    { icon: "📊", label: "Dashboard", active: true },
    { icon: "👥", label: "Donors" },
    { icon: "💰", label: "Donations" },
    { icon: "📢", label: "Campaigns" },
    { icon: "📅", label: "Events" },
    { icon: "📈", label: "Reports" },
    { icon: "🔔", label: "Notifications" },
    { icon: "⚙️", label: "Settings" },
];

const recentDonors = [
    { name: "Sarah Johnson", email: "sarah.j@email.com", date: "Dec 15, 2024", amount: "$500" },
    { name: "Michael Chen", email: "m.chen@email.com", date: "Dec 14, 2024", amount: "$250" },
    { name: "Emily Rodriguez", email: "emily.r@email.com", date: "Dec 13, 2024", amount: "$1,000" },
    { name: "David Park", email: "d.park@email.com", date: "Dec 12, 2024", amount: "$750" },
    { name: "Jennifer Williams", email: "jen.w@email.com", date: "Dec 11, 2024", amount: "$300" },
];

const topDonations = [
    { name: "Emily Rodriguez", date: "December 13, 2024", amount: "$1,000" },
    { name: "David Park", date: "December 12, 2024", amount: "$750" },
    { name: "Sarah Johnson", date: "December 15, 2024", amount: "$500" },
    { name: "Jennifer Williams", date: "December 11, 2024", amount: "$300" },
    { name: "Michael Chen", date: "December 14, 2024", amount: "$250" },
];

export default function Dashboard() {
    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            {/* Sidebar */}
            <Sidebar active="Dashboard" />

            {/* Main Content */}
            <main className="flex-1 min-h-screen ml-[260px]">
                {/* Top Bar */}
                <div className="bg-white border-b border-[#E2E8F0] px-8 py-5 flex justify-between items-center sticky top-0 z-40 animate-slideInDown">
                    <h1 className="font-bricolage text-2xl font-bold text-[#1C1917]">Dashboard</h1>
                    <div className="flex items-center gap-6">
                        <span className="text-[#1C1917] font-semibold">Sarah Johnson</span>
                        <span className="text-[#57534E] text-base">ID: 12341</span>
                        <button className="bg-[#0F766E] text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-[#0D5B54] transition">Logout</button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* KPI Cards */}
                    <section className="mb-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                            <div className="bg-white rounded-xl border border-[#E2E8F0] p-7 shadow-sm animate-fadeInUp">
                                <div className="text-[#57534E] text-sm font-medium mb-2">Total Donors</div>
                                <div className="font-bricolage text-3xl font-bold text-[#0F766E]">1,247</div>
                            </div>
                            <div className="bg-white rounded-xl border border-[#E2E8F0] p-7 shadow-sm animate-fadeInUp">
                                <div className="text-[#57534E] text-sm font-medium mb-2">Total Donations</div>
                                <div className="font-bricolage text-3xl font-bold text-[#10B981]">$324,891</div>
                            </div>
                            <div className="bg-white rounded-xl border border-[#E2E8F0] p-7 shadow-sm animate-fadeInUp">
                                <div className="text-[#57534E] text-sm font-medium mb-2">Active Campaigns</div>
                                <div className="font-bricolage text-3xl font-bold text-[#3B82F6]">8</div>
                            </div>
                        </div>
                    </section>

                    {/* Recent Donors Table */}
                    <section className="mb-10 animate-fadeInUp">
                        <h2 className="font-bricolage text-xl font-semibold text-[#1C1917] mb-4">Recent Donors</h2>
                        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-[#F8FAFC]">
                                    <tr>
                                        <th className="py-4 px-6 text-[#57534E] text-xs font-semibold uppercase">Name</th>
                                        <th className="py-4 px-6 text-[#57534E] text-xs font-semibold uppercase">Email</th>
                                        <th className="py-4 px-6 text-[#57534E] text-xs font-semibold uppercase">Last Donation</th>
                                        <th className="py-4 px-6 text-[#57534E] text-xs font-semibold uppercase">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentDonors.map((donor) => (
                                        <tr key={donor.email} className="hover:bg-[#F8FAFC] transition">
                                            <td className="py-4 px-6 font-semibold text-[#0F766E]">{donor.name}</td>
                                            <td className="py-4 px-6">{donor.email}</td>
                                            <td className="py-4 px-6">{donor.date}</td>
                                            <td className="py-4 px-6 font-semibold text-[#10B981]">{donor.amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Top Donations */}
                    <section className="animate-fadeInUp">
                        <h2 className="font-bricolage text-xl font-semibold text-[#1C1917] mb-4">Top Donations This Month</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {topDonations.map((donation, idx) => (
                                <div key={idx} className="bg-white border border-[#E2E8F0] rounded-lg p-6 flex justify-between items-center hover:border-[#14B8A6] transition">
                                    <div>
                                        <div className="font-semibold text-[#1C1917]">{donation.name}</div>
                                        <div className="text-xs text-[#78716C]">{donation.date}</div>
                                    </div>
                                    <div className="font-bricolage text-xl font-bold text-[#10B981]">{donation.amount}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
