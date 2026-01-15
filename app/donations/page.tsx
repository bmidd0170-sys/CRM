"use client";

import React, { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import { handleLogout } from "@/lib/admin-storage";

export default function DonationsPage() {
    const [donations, setDonations] = useState<any[]>([]);

    // Filter states
    const [date, setDate] = useState("");
    const [campaign, setCampaign] = useState("");
    const [status, setStatus] = useState("");
    const [donor, setDonor] = useState("");
    const [method, setMethod] = useState("");

    // Fetch donations from API
    useEffect(() => {
        fetch("/api/donations")
            .then(res => res.json())
            .then(data => setDonations(data))
            .catch(error => console.error('Error fetching donations:', error));
    }, []);

    // Get unique campaigns and methods from data
    const campaigns = Array.from(new Set(donations.map(d => d.campaign?.name).filter(Boolean)));
    const statuses = ["Completed", "Pending", "Failed"]; // Add statuses as needed

    // Filter logic
    const filtered = donations.filter(d => {
        const donationDate = new Date(d.date).toISOString().split('T')[0];
        const donorName = d.donor?.name || '';
        const campaignName = d.campaign?.name || '';

        return (
            (date ? donationDate === date : true) &&
            (campaign ? campaignName === campaign : true) &&
            (donor ? donorName.toLowerCase().includes(donor.toLowerCase()) : true)
        );
    });

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar active="Donations" />
            <main className="flex-1 min-h-screen ml-[260px]">
                <div className="bg-white border-b border-[#E2E8F0] px-8 py-5 flex justify-between items-center sticky top-0 z-40 animate-slideInDown">
                    <h1 className="font-bricolage text-2xl font-bold text-[#1C1917]">Donations</h1>
                    <div className="flex items-center gap-6">
                        <span className="text-[#1C1917] font-semibold">Sarah Johnson</span>
                        <span className="text-[#57534E] text-base">ID: 12341</span>
                        <button onClick={handleLogout} className="bg-[#0F766E] text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-[#0D5B54] transition">Logout</button>
                    </div>
                </div>
                <div className="p-8">
                    <h2 className="text-xl font-semibold mb-4">All Donations</h2>
                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 mb-6">
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="border rounded px-3 py-2 text-sm text-[#1C1917]"
                            placeholder="Date"
                        />
                        <input
                            type="text"
                            value={donor}
                            onChange={e => setDonor(e.target.value)}
                            className="border rounded px-3 py-2 text-sm text-[#1C1917]"
                            placeholder="Donor Name"
                        />
                        <select
                            value={campaign}
                            onChange={e => setCampaign(e.target.value)}
                            className="border rounded px-3 py-2 text-sm text-[#1C1917]"
                        >
                            <option value="">All Campaigns</option>
                            {campaigns.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-[#E2E8F0] rounded-lg">
                            <thead>
                                <tr className="bg-[#F1F5F9] text-[#334155]">
                                    <th className="py-2 px-4 border-b">ID</th>
                                    <th className="py-2 px-4 border-b">Donor</th>
                                    <th className="py-2 px-4 border-b">Amount</th>
                                    <th className="py-2 px-4 border-b">Date</th>
                                    <th className="py-2 px-4 border-b">Campaign</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((donation) => (
                                    <tr key={donation.id} className="text-[#334155] hover:bg-[#F8FAFC] transition">
                                        <td className="py-2 px-4 border-b text-center">{donation.id}</td>
                                        <td className="py-2 px-4 border-b">{donation.donor?.name || 'Unknown'}</td>
                                        <td className="py-2 px-4 border-b">${donation.amount.toLocaleString()}</td>
                                        <td className="py-2 px-4 border-b">{new Date(donation.date).toLocaleDateString()}</td>
                                        <td className="py-2 px-4 border-b">{donation.campaign?.name || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filtered.length === 0 && (
                            <div className="text-center text-gray-500 py-8">No donations found for selected filters.</div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}