"use client";
import React, { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import DonorStats from "../components/DonorStats";
import DonorForm from "./components/DonorForm";
import { handleLogout, canDelete, canEdit, getAdminId } from "@/lib/admin-storage";

export default function DonorsPage() {
    type Donor = {
        id?: number;
        name: string;
        email: string;
        total: string;
        lastDonation: string;
        status: string;
    };
    const [donors, setDonors] = useState<Donor[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");
    const [sort, setSort] = useState("Latest");
    const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
    const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [canDeleteDonors, setCanDeleteDonors] = useState(false);
    const [canEditDonors, setCanEditDonors] = useState(false);

    useEffect(() => {
        setCanDeleteDonors(canDelete('donors'));
        setCanEditDonors(canEdit('donors'));
    }, []);

    function fetchDonors() {
        fetch("/api/donors")
            .then((res) => res.json())
            .then((data) => {
                // Map backend data to Donor type if needed
                const mapped = data.map((d: any) => ({
                    id: d.id,
                    name: d.name,
                    email: d.email,
                    total: `$${d.total}`,
                    lastDonation: d.lastDonation ? new Date(d.lastDonation).toLocaleDateString() : "N/A",
                    status: d.status,
                }));
                setDonors(mapped);
            });
    }

    useEffect(() => {
        fetchDonors();
    }, []);

    function handleDelete(donorId: number, event: React.MouseEvent) {
        event.stopPropagation();
        if (!confirm('Are you sure you want to delete this donor? This will also delete all their donations.')) {
            return;
        }

        const adminId = getAdminId();
        fetch(`/api/donors?id=${donorId}`, {
            method: 'DELETE',
            headers: {
                'x-admin-id': adminId?.toString() || ''
            }
        })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(err => {
                        throw new Error(err.error || 'Failed to delete donor');
                    });
                }
                return res.json();
            })
            .then(() => {
                setSelectedDonor(null);
                fetchDonors(); // Refresh the list
            })
            .catch(error => {
                alert(`Error: ${error.message}`);
                console.error('Error deleting donor:', error);
            });
    }

    function handleEditClick(donor: Donor, event: React.MouseEvent) {
        event.stopPropagation();
        setEditingDonor(donor);
        setShowForm(true);
    }

    // Filter, search, and sort logic
    // Helper: parse currency string to number
    function parseCurrency(str: string) {
        return Number(str.replace(/[^\d.-]+/g, ""));
    }

    // Helper: check if donor is lapsed (no donation in last 12 months)
    function isLapsed(lastDonation: string) {
        const last = new Date(lastDonation);
        const now = new Date();
        const diffMonths = (now.getFullYear() - last.getFullYear()) * 12 + (now.getMonth() - last.getMonth());
        return diffMonths > 12;
    }

    let filteredDonors = donors.filter(donor => {
        // Text search
        const matchesSearch = donor.name.toLowerCase().includes(search.toLowerCase()) || donor.email.toLowerCase().includes(search.toLowerCase());
        // Status filter
        const statusOk = statusFilter === "All" || donor.status === statusFilter;
        // Type filter
        let typeOk = true;
        if (typeFilter === "Lapsed") typeOk = isLapsed(donor.lastDonation);
        else if (typeFilter === "Major") typeOk = parseCurrency(donor.total) >= 2000;
        // Combine all
        return matchesSearch && statusOk && typeOk;
    });
    if (sort === "Latest") {
        filteredDonors = filteredDonors.sort((a, b) => new Date(b.lastDonation).getTime() - new Date(a.lastDonation).getTime());
    } else if (sort === "Active") {
        filteredDonors = filteredDonors.sort((a, b) => b.status.localeCompare(a.status));
    }

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar active="Donors" />
            <main className="flex-1 min-h-screen ml-[260px]">
                {/* Top Bar */}
                <div className="bg-white border-b border-[#E2E8F0] px-8 py-5 flex justify-between items-center sticky top-0 z-40 animate-slideInDown">
                    <h1 className="font-bricolage text-2xl font-bold text-[#1C1917]">Donors</h1>
                    <div className="flex items-center gap-6">
                        <span className="text-[#1C1917] font-semibold">Sarah Johnson</span>
                        <span className="text-[#57534E] text-base">ID: 12341</span>
                        <button onClick={handleLogout} className="bg-[#0F766E] text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-[#0D5B54] transition">Logout</button>
                    </div>
                </div>
                {/* Content */}
                <div className="p-8">
                    <section className="mb-10 animate-fadeInUp">
                        <h2 className="font-bricolage text-xl font-semibold text-[#1C1917] mb-4">All Donors</h2>
                        <div className="flex gap-4 mb-6">
                            <input
                                type="text"
                                placeholder="Search donors..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="border border-[#E2E8F0] rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-[#0F766E] text-[#1C1917]"
                            />
                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="border border-[#E2E8F0] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0F766E] text-[#1C1917]"
                            >
                                <option value="All">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                            {/* Type Filter */}
                            <select
                                value={typeFilter}
                                onChange={e => setTypeFilter(e.target.value)}
                                className="border border-[#E2E8F0] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0F766E] text-[#1C1917]"
                            >
                                <option value="All">All Donor Types</option>
                                <option value="Lapsed">Lapsed Donors</option>
                                <option value="Major">Major Donors</option>
                            </select>
                            <select
                                value={sort}
                                onChange={e => setSort(e.target.value)}
                                className="border border-[#E2E8F0] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0F766E] text-[#1C1917]"
                            >
                                <option value="Latest">Latest Donation</option>
                                <option value="Active">Status</option>
                            </select>
                        </div>
                        <DonorStats donors={filteredDonors} isLapsed={isLapsed} />
                        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-[#F8FAFC]">
                                    <tr>
                                        <th className="py-4 px-6 text-[#1C1917] text-xs font-semibold uppercase">Name</th>
                                        <th className="py-4 px-6 text-[#1C1917] text-xs font-semibold uppercase">Email</th>
                                        <th className="py-4 px-6 text-[#1C1917] text-xs font-semibold uppercase">Total Donated</th>
                                        <th className="py-4 px-6 text-[#1C1917] text-xs font-semibold uppercase">Last Donation</th>
                                        <th className="py-4 px-6 text-[#1C1917] text-xs font-semibold uppercase">Status</th>
                                        {(canDeleteDonors || canEditDonors) && <th className="py-4 px-6 text-[#1C1917] text-xs font-semibold uppercase">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDonors.map((donor) => (
                                        <tr
                                            key={donor.email}
                                            className="hover:bg-[#F8FAFC] transition cursor-pointer"
                                            onClick={() => setSelectedDonor(donor)}
                                        >
                                            <td className="py-4 px-6 font-semibold text-[#0F766E]">{donor.name}</td>
                                            <td className="py-4 px-6 text-[#1C1917]">{donor.email}</td>
                                            <td className="py-4 px-6 font-semibold text-[#10B981]">{donor.total}</td>
                                            <td className="py-4 px-6 text-[#1C1917]">{donor.lastDonation}</td>
                                            <td className="py-4 px-6 flex gap-2 flex-wrap">
                                                {/* Status tag */}
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${donor.status === "Active" ? "bg-[#D1FAE5] text-[#065F46]" : "bg-[#FDE68A] text-[#92400E]"}`}>
                                                    {donor.status}
                                                </span>
                                                {/* Major tag */}
                                                {parseCurrency(donor.total) >= 2000 && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#A7F3D0] text-[#047857]">Major</span>
                                                )}
                                                {/* Lapsed tag */}
                                                {isLapsed(donor.lastDonation) && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E0E7FF] text-[#3730A3]">Lapsed</span>
                                                )}
                                            </td>
                                            {(canDeleteDonors || canEditDonors) && (
                                                <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                                                    {canEditDonors && (
                                                        <button
                                                            onClick={(e) => handleEditClick(donor, e)}
                                                            className="bg-[#0F766E] text-white px-3 py-1 rounded-md text-xs hover:bg-[#0D5B54] transition mr-3"
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                    {canDeleteDonors && (
                                                        <button
                                                            onClick={(e) => donor.id && handleDelete(donor.id, e)}
                                                            className="bg-rose-500 text-white px-3 py-1 rounded-md text-xs hover:bg-rose-600 transition"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Donor Details Modal */}
                        {selectedDonor && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeInUp text-[#1C1917]">
                                    <button
                                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                                        onClick={() => setSelectedDonor(null)}
                                        aria-label="Close"
                                    >
                                        &times;
                                    </button>
                                    <h2 className="text-2xl font-bold mb-4 text-center text-[#0F766E]">Donor Profile</h2>
                                    <div className="mb-2"><span className="font-semibold">Name:</span> {selectedDonor.name}</div>
                                    <div className="mb-2"><span className="font-semibold">Email:</span> {selectedDonor.email}</div>
                                    <div className="mb-2"><span className="font-semibold">Total Donated:</span> {selectedDonor.total}</div>
                                    <div className="mb-2"><span className="font-semibold">Last Donation:</span> {selectedDonor.lastDonation}</div>
                                    <div className="mb-2"><span className="font-semibold">Status:</span> {selectedDonor.status}</div>
                                    <div className="mt-4">
                                        <h3 className="font-semibold mb-2">Donation History</h3>
                                        <ul className="list-disc pl-5 text-sm">
                                            <li>Dec 15, 2024 - $500</li>
                                            <li>Nov 10, 2024 - $1,000</li>
                                            <li>Oct 5, 2024 - $1,000</li>
                                        </ul>
                                    </div>
                                    {(canDeleteDonors || canEditDonors) && (
                                        <div className="mt-6 pt-4 border-t border-gray-200 flex gap-2">
                                            {canEditDonors && selectedDonor.id && (
                                                <button
                                                    onClick={() => {
                                                        setEditingDonor(selectedDonor);
                                                        setShowForm(true);
                                                        setSelectedDonor(null);
                                                    }}
                                                    className="flex-1 bg-[#0F766E] text-white px-4 py-2 rounded-md font-medium hover:bg-[#0D5B54] transition"
                                                >
                                                    Edit Donor
                                                </button>
                                            )}
                                            {canDeleteDonors && selectedDonor.id && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(selectedDonor.id!, e);
                                                    }}
                                                    className="flex-1 bg-rose-500 text-white px-4 py-2 rounded-md font-medium hover:bg-rose-600 transition"
                                                >
                                                    Delete Donor
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </main>
            {showForm && (
                <DonorForm
                    donor={editingDonor ? {
                        id: editingDonor.id || 0,
                        name: editingDonor.name,
                        email: editingDonor.email,
                        status: editingDonor.status
                    } : null}
                    onSave={() => {
                        setShowForm(false);
                        setEditingDonor(null);
                        fetchDonors();
                    }}
                    onClose={() => {
                        setShowForm(false);
                        setEditingDonor(null);
                    }}
                />
            )}
        </div>
    );
}
