"use client";
import React from "react";
import Sidebar from "../components/Sidebar";

// Example donor data for reports
const donors = [
    { name: "Sarah Johnson", email: "sarah.j@email.com", lastDonation: "Dec 15, 2024", needsFollowUp: true, needsCall: false, needsThankYou: true, reason: "Recent donation, needs thank you letter and follow-up." },
    { name: "Michael Chen", email: "m.chen@email.com", lastDonation: "Dec 14, 2024", needsFollowUp: false, needsCall: true, needsThankYou: false, reason: "No response after last donation, needs call." },
    { name: "Emily Rodriguez", email: "emily.r@email.com", lastDonation: "Dec 13, 2024", needsFollowUp: true, needsCall: true, needsThankYou: true, reason: "Major donor, needs all actions." },
    { name: "David Park", email: "d.park@email.com", lastDonation: "Dec 12, 2024", needsFollowUp: false, needsCall: false, needsThankYou: true, reason: "Thank you letter pending." },
    { name: "Jennifer Williams", email: "jen.w@email.com", lastDonation: "Dec 11, 2024", needsFollowUp: true, needsCall: false, needsThankYou: false, reason: "Follow-up required for engagement." },
];

export default function ReportsPage() {
    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar active="Reports" />
            <main className="flex-1 min-h-screen ml-[260px]">
                <div className="bg-white border-b border-[#E2E8F0] px-8 py-5 flex justify-between items-center sticky top-0 z-40 animate-slideInDown">
                    <h1 className="font-bricolage text-2xl font-bold text-[#1C1917]">Reports</h1>
                </div>
                <div className="p-8">
                    <h2 className="text-xl font-semibold text-[#1C1917] mb-6">Donor Follow-Up & Actions</h2>
                    <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-[#F8FAFC]">
                                <tr>
                                    <th className="py-4 px-6 text-[#1C1917] text-xs font-semibold uppercase">Name</th>
                                    <th className="py-4 px-6 text-[#1C1917] text-xs font-semibold uppercase">Email</th>
                                    <th className="py-4 px-6 text-[#1C1917] text-xs font-semibold uppercase">Last Donation</th>
                                    <th className="py-4 px-6 text-[#1C1917] text-xs font-semibold uppercase">Follow-Up Email</th>
                                    <th className="py-4 px-6 text-[#1C1917] text-xs font-semibold uppercase">Call Needed</th>
                                    <th className="py-4 px-6 text-[#1C1917] text-xs font-semibold uppercase">Thank You Letter</th>
                                </tr>
                            </thead>
                            <tbody>
                                {donors
                                    .filter(donor => donor.needsFollowUp || donor.needsCall || donor.needsThankYou)
                                    .map((donor) => (
                                        <tr key={donor.email} className="hover:bg-[#F8FAFC] transition">
                                            <td className="py-4 px-6 font-semibold text-[#0F766E]">
                                                <div className="font-bold text-lg">{donor.name}</div>
                                                <div className="text-xs text-[#64748B]">{donor.email}</div>
                                            </td>
                                            <td className="py-4 px-6 text-[#1C1917]">{donor.email}</td>
                                            <td className="py-4 px-6 text-[#1C1917]">{donor.lastDonation}</td>
                                            <td className="py-4 px-6">
                                                {donor.needsFollowUp ? (
                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FDE68A] text-[#92400E]">Needs Email</span>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#64748B]">No</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                {donor.needsCall ? (
                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E0E7FF] text-[#3730A3]">Needs Call</span>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#64748B]">No</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                {donor.needsThankYou ? (
                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#A7F3D0] text-[#047857]">Send Letter</span>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#64748B]">No</span>
                                                )}
                                                <div className="mt-2 text-xs text-[#0F766E] font-medium">Reason: {donor.reason}</div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
