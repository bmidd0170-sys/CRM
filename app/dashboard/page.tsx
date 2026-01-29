"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { handleLogout, getAdminData, getAdminId } from "@/lib/admin-storage";

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

export default function Dashboard() {
    const [adminName, setAdminName] = useState("");
    const [adminId, setAdminId] = useState("");
    const [recentDonors, setRecentDonors] = useState<any[]>([]);
    const [topDonations, setTopDonations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalDonors: 0, totalDonations: "$0", activeCampaigns: 0 });

    useEffect(() => {
        // Get logged-in admin data
        const admin = getAdminData();
        if (admin) {
            setAdminName(admin.name);
            setAdminId(admin.id.toString());
        }
    }, []);

    useEffect(() => {
        // Fetch donor and donation data for this admin
        const fetchData = async () => {
            setLoading(true);
            try {
                const [donorsRes, donationsRes] = await Promise.all([
                    fetch(`/api/donors`),
                    fetch(`/api/donations`)
                ]);

                if (donorsRes.ok) {
                    const donors = await donorsRes.json();
                    const sortedDonors = Array.isArray(donors)
                        ? donors.slice(0, 5)
                        : [];
                    setRecentDonors(sortedDonors);
                    setStats(prev => ({ ...prev, totalDonors: Array.isArray(donors) ? donors.length : 0 }));
                }

                if (donationsRes.ok) {
                    const donations = await donationsRes.json();
                    const sortedDonations = Array.isArray(donations)
                        ? donations.sort((a, b) => (b.amount || 0) - (a.amount || 0)).slice(0, 5)
                        : [];
                    setTopDonations(sortedDonations);
                    
                    const totalAmount = Array.isArray(donations)
                        ? donations.reduce((sum, d) => sum + (d.amount || 0), 0)
                        : 0;
                    setStats(prev => ({ 
                        ...prev, 
                        totalDonations: `$${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    }));
                } else {
                    console.error("Failed to fetch donations:", donationsRes.status);
                    setTopDonations([]);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setRecentDonors([]);
                setTopDonations([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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
                        <span className="text-[#1C1917] font-semibold">{adminName || "Loading..."}</span>
                        <span className="text-[#57534E] text-base">ID: {adminId || "—"}</span>
                        <button onClick={handleLogout} className="bg-[#0F766E] text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-[#0D5B54] transition">Logout</button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* KPI Cards */}
                    <section className="mb-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                            <div className="bg-white rounded-xl border border-[#E2E8F0] p-7 shadow-sm animate-fadeInUp">
                                <div className="text-[#57534E] text-sm font-medium mb-2">Total Donors</div>
                                <div className="font-bricolage text-3xl font-bold text-[#0F766E]">{stats.totalDonors}</div>
                            </div>
                            <div className="bg-white rounded-xl border border-[#E2E8F0] p-7 shadow-sm animate-fadeInUp">
                                <div className="text-[#57534E] text-sm font-medium mb-2">Total Donations</div>
                                <div className="font-bricolage text-3xl font-bold text-[#10B981]">{stats.totalDonations}</div>
                            </div>
                            <div className="bg-white rounded-xl border border-[#E2E8F0] p-7 shadow-sm animate-fadeInUp">
                                <div className="text-[#57534E] text-sm font-medium mb-2">Active Campaigns</div>
                                <div className="font-bricolage text-3xl font-bold text-[#3B82F6]">{stats.activeCampaigns}</div>
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
                                    {recentDonors.length > 0 ? (
                                        recentDonors.map((donor) => (
                                            <tr key={donor.id || donor.email} className="hover:bg-[#F8FAFC] transition">
                                                <td className="py-4 px-6 font-semibold text-[#0F766E]">{donor.name}</td>
                                                <td className="py-4 px-6 text-[#1C1917]">{donor.email}</td>
                                                <td className="py-4 px-6 text-[#1C1917]">{donor.lastDonation ? new Date(donor.lastDonation).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "—"}</td>
                                                <td className="py-4 px-6 font-semibold text-[#10B981]">${(donor.total || 0).toFixed(2)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="py-4 px-6 text-center text-[#57534E]">No donors yet. Create your first donor to get started.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Top Donations */}
                    <section className="animate-fadeInUp">
                        <h2 className="font-bricolage text-xl font-semibold text-[#1C1917] mb-4">Top Donations This Month</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {loading ? (
                                <div className="col-span-2 text-center py-8 text-[#57534E]">Loading donations...</div>
                            ) : topDonations.length > 0 ? (
                                topDonations.map((donation, idx) => (
                                    <div key={idx} className="bg-white border border-[#E2E8F0] rounded-lg p-6 flex justify-between items-center hover:border-[#14B8A6] transition">
                                        <div>
                                            <div className="font-semibold text-[#1C1917]">{donation.donorName || donation.donor?.name || donation.name || "—"}</div>
                                            <div className="text-xs text-[#78716C]">{donation.date ? new Date(donation.date).toLocaleDateString() : "—"}</div>
                                        </div>
                                        <div className="font-bricolage text-xl font-bold text-[#10B981]">${(donation.amount || 0).toFixed(2)}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 text-center py-8 text-[#57534E]">No donations yet. Create your first donation to see it here.</div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
