"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ProtectedPage from "../components/ProtectedPage";
import { handleLogout, getAdminData } from "@/lib/admin-storage";

interface DonorReport {
    id: number;
    name: string;
    email: string;
    lastDonation: string | null;
    lastContacted: string | null;
    total: number;
    needsFollowUp: boolean;
    needsCall: boolean;
    needsThankYou: boolean;
    neverContacted: boolean;
}

export default function ReportsPage() {
    const [donors, setDonors] = useState<DonorReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function markAsContacted(donorId: number) {
        try {
            const currentAdmin = getAdminData();
            if (!currentAdmin) {
                alert("User not authenticated");
                return;
            }

            const response = await fetch(`/api/donors?id=${donorId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-id': currentAdmin.id?.toString() || ''
                }
            });

            if (!response.ok) {
                throw new Error('Failed to mark donor as contacted');
            }

            // Refresh the donors list
            fetchDonors();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to mark donor as contacted');
        }
    }

    async function fetchDonors() {
        try {
            const currentAdmin = getAdminData();
            if (!currentAdmin) {
                setError("User not authenticated");
                setLoading(false);
                return;
            }

            const response = await fetch('/api/donors', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-id': currentAdmin.id?.toString() || ''
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch donors');
            }

            const data = await response.json();
            const donorsList = Array.isArray(data) ? data : (data.donors || []);

            // Transform donors into report format
            const donorReports: DonorReport[] = donorsList.map((donor: any) => {
                const lastDonation = donor.lastDonation ? new Date(donor.lastDonation).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : null;
                const lastContacted = donor.lastContacted ? new Date(donor.lastContacted).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : null;
                const daysSinceLastDonation = donor.lastDonation ? Math.floor((Date.now() - new Date(donor.lastDonation).getTime()) / (1000 * 60 * 60 * 24)) : null;
                const daysSinceLastContacted = donor.lastContacted ? Math.floor((Date.now() - new Date(donor.lastContacted).getTime()) / (1000 * 60 * 60 * 24)) : null;
                const neverContacted = !donor.lastContacted;

                return {
                    id: donor.id,
                    name: donor.name,
                    email: donor.email,
                    lastDonation: lastDonation,
                    lastContacted: lastContacted,
                    total: donor.total,
                    needsFollowUp: daysSinceLastDonation !== null && daysSinceLastDonation > 30,
                    needsCall: donor.status === 'inactive' || (daysSinceLastDonation !== null && daysSinceLastDonation > 60),
                    needsThankYou: daysSinceLastDonation !== null && daysSinceLastDonation < 7,
                    neverContacted: neverContacted
                };
            });

            setDonors(donorReports);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load donors');
            setDonors([]);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchDonors();
    }, []);

    return (
        <ProtectedPage screenName="Reports">
            <div className="flex min-h-screen bg-[#F8FAFC]">
                <Sidebar active="Reports" />
                <main className="flex-1 min-h-screen ml-[260px]">
                <div className="bg-white border-b border-[#E2E8F0] px-8 py-5 flex justify-between items-center sticky top-0 z-40 animate-slideInDown">
                    <h1 className="font-bricolage text-2xl font-bold text-[#1C1917]">Reports</h1>
                    <button onClick={handleLogout} className="bg-[#0F766E] text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-[#0D5B54] transition">Logout</button>
                </div>
                <div className="p-8">
                    <h2 className="text-xl font-semibold text-[#1C1917] mb-6">Donor Follow-Up & Actions</h2>
                    
                    {loading && (
                        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center">
                            <p className="text-[#64748B]">Loading reports...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="text-5xl">⚠️</div>
                            </div>
                            <p className="text-[#1C1917] text-lg font-semibold mb-2">Unable to Load Reports</p>
                            <p className="text-red-600 text-base">{error}</p>
                        </div>
                    )}

                    {!loading && !error && donors.length === 0 && (
                        <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="text-5xl">📊</div>
                            </div>
                            <p className="text-[#1C1917] text-lg font-semibold mb-2">No Reports Available</p>
                            <p className="text-[#64748B] text-base">There are no donors in your organization yet. Add donors to see follow-up reports and action items.</p>
                        </div>
                    )}

                    {!loading && !error && donors.length > 0 && (
                        <div className="space-y-8">
                            {/* Never Contacted Section */}
                            {donors.some(d => d.neverContacted) && (
                                <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
                                    <div className="bg-[#FEE2E2] border-b border-[#FECACA] px-6 py-4">
                                        <h3 className="text-lg font-semibold text-[#991B1B]">🔴 Never Contacted</h3>
                                        <p className="text-sm text-[#7F1D1D] mt-1">Donors who have never been contacted</p>
                                    </div>
                                    <table className="w-full text-left">
                                        <thead className="bg-[#F8FAFC]">
                                            <tr>
                                                <th className="py-4 px-6 text-[#1C1917] text-xs font-semibold uppercase">Name</th>
                                                <th className="py-4 px-6 text-[#1C1917] text-xs font-semibold uppercase">Email</th>
                                                <th className="py-4 px-6 text-[#1C1917] text-xs font-semibold uppercase">Last Donation</th>
                                                <th className="py-4 px-6 text-[#1C1917] text-xs font-semibold uppercase">Total Donated</th>
                                                <th className="py-4 px-6 text-[#1C1917] text-xs font-semibold uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {donors.filter(d => d.neverContacted).map((donor) => (
                                                <tr key={donor.id} className="hover:bg-[#F8FAFC] transition border-b border-[#E2E8F0]">
                                                    <td className="py-4 px-6 font-semibold text-[#0F766E]">{donor.name}</td>
                                                    <td className="py-4 px-6 text-[#1C1917]">{donor.email}</td>
                                                    <td className="py-4 px-6 text-[#1C1917]">{donor.lastDonation || 'No donations'}</td>
                                                    <td className="py-4 px-6 text-[#1C1917]">${donor.total.toFixed(2)}</td>
                                                    <td className="py-4 px-6">
                                                        <button
                                                            onClick={() => markAsContacted(donor.id)}
                                                            className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FEE2E2] text-[#991B1B] hover:bg-[#FECACA] transition cursor-pointer"
                                                        >
                                                            Mark Contacted
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Inactive/Lapsed Section */}
                            <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-[#F8FAFC]">
                                    <tr>
                                        <th className="py-4 px-6 text-[#1C1917] text-xs font-semibold uppercase">Name</th>
                                        <th className="py-4 px-6 text-[#1C1917] text-xs font-semibold uppercase">Email</th>
                                        <th className="py-4 px-6 text-[#1C1917] text-xs font-semibold uppercase">Last Donation</th>
                                        <th className="py-4 px-6 text-[#1C1917] text-xs font-semibold uppercase">Total Donated</th>
                                        <th className="py-4 px-6 text-[#1C1917] text-xs font-semibold uppercase">Follow-Up Email</th>
                                        <th className="py-4 px-6 text-[#1C1917] text-xs font-semibold uppercase">Call Needed</th>
                                        <th className="py-4 px-6 text-[#1C1917] text-xs font-semibold uppercase">Thank You Letter</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {donors
                                        .filter(donor => (donor.needsFollowUp || donor.needsCall || donor.needsThankYou) && !donor.neverContacted)
                                        .map((donor) => (
                                            <tr key={donor.id} className="hover:bg-[#F8FAFC] transition border-b border-[#E2E8F0]">
                                                <td className="py-4 px-6 font-semibold text-[#0F766E]">
                                                    <div className="font-bold text-lg">{donor.name}</div>
                                                    <div className="text-xs text-[#64748B]">{donor.email}</div>
                                                </td>
                                                <td className="py-4 px-6 text-[#1C1917]">{donor.email}</td>
                                                <td className="py-4 px-6 text-[#1C1917]">{donor.lastDonation || 'No donations'}</td>
                                                <td className="py-4 px-6 text-[#1C1917]">${donor.total.toFixed(2)}</td>
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
                                                </td>
                                            </tr>
                                        ))}
                                    {donors.filter(donor => (donor.needsFollowUp || donor.needsCall || donor.needsThankYou) && !donor.neverContacted).length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="py-8 px-6 text-center text-[#64748B]">
                                                No donors requiring follow-up at this time.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            </div>
        </ProtectedPage>
    );
}
