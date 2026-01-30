"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import CampaignForm from "../components/CampaignForm";
import CampaignDetails from "../components/CampaignDetails";
import { donations } from "./donationsData";
import { canDelete, canCreate, canEdit, getAdminId, handleLogout, getAdminData } from "@/lib/admin-storage";

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<any | null>(null);
    const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
    const [canDeleteCampaigns, setCanDeleteCampaigns] = useState(false);
    const [canCreateCampaigns, setCanCreateCampaigns] = useState(false);
    const [canEditCampaigns, setCanEditCampaigns] = useState(false);
    const [adminName, setAdminName] = useState("");
    const [adminId, setAdminId] = useState("");

    useEffect(() => {
        setCanDeleteCampaigns(canDelete('campaigns'));
        setCanCreateCampaigns(canCreate('campaigns'));
        setCanEditCampaigns(canEdit('campaigns'));

        // Get logged-in admin data
        const admin = getAdminData();
        if (admin) {
            setAdminName(admin.name);
            setAdminId(admin.id.toString());
        }
    }, []);

    // Fetch campaigns from API
    function fetchCampaigns() {
        const currentAdminId = getAdminId();
        fetch("/api/campaigns", {
            headers: {
                'x-admin-id': currentAdminId?.toString() || ''
            }
        })
            .then(res => res.json())
            .then(data => setCampaigns(data));
    }

    useEffect(() => {
        fetchCampaigns();
    }, []);

    function handleCreated() {
        setShowForm(false);
        fetchCampaigns(); // Refresh after adding
    }

    function handleEdited() {
        setEditingCampaign(null);
        setShowForm(false);
        setSelectedCampaign(null);
        fetchCampaigns(); // Refresh after editing
    }

    function handleEditClick(campaign: any, event: React.MouseEvent) {
        event.stopPropagation();
        setEditingCampaign(campaign);
        setShowForm(true);
    }

    function handleDelete(campaignId: number, event: React.MouseEvent) {
        event.stopPropagation();
        if (!confirm('Are you sure you want to delete this campaign? This will also delete all related donations and events.')) {
            return;
        }

        const adminId = getAdminId();
        fetch(`/api/campaigns?id=${campaignId}`, {
            method: 'DELETE',
            headers: {
                'x-admin-id': adminId?.toString() || ''
            }
        })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(err => {
                        throw new Error(err.error || 'Failed to delete campaign');
                    });
                }
                return res.json();
            })
            .then(() => {
                fetchCampaigns(); // Refresh the list
            })
            .catch(error => {
                alert(`Error: ${error.message}`);
                console.error('Error deleting campaign:', error);
            });
    }

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar active="Campaigns" />
            <main className="flex-1 min-h-screen ml-[260px]">
                <div className="bg-white border-b border-[#E2E8F0] px-8 py-5 flex justify-between items-center sticky top-0 z-40 animate-slideInDown">
                    <h1 className="font-bricolage text-2xl font-bold text-[#1C1917]">Campaigns</h1>
                    <div className="flex items-center gap-6">
                        <span className="text-[#1C1917] font-semibold">{adminName || "Loading..."}</span>
                        <span className="text-[#57534E] text-base">ID: {adminId || "—"}</span>
                        <button onClick={handleLogout} className="bg-[#0F766E] text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-[#0D5B54] transition">Logout</button>
                    </div>
                </div>
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-semibold text-[#1C1917]">Active Campaigns</h2>
                        {canCreateCampaigns && (
                            <button
                                className="bg-[#0F766E] text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-[#0D5B54] transition"
                                onClick={() => setShowForm(true)}
                            >
                                + Create Campaign
                            </button>
                        )}
                    </div>
                    {showForm && (
                        <CampaignForm
                            onCreate={handleCreated}
                            onEdit={(id, data) => handleEdited()}
                            onClose={() => {
                                setShowForm(false);
                                setEditingCampaign(null);
                            }}
                            campaign={editingCampaign}
                        />
                    )}
                    <div className="grid gap-6 md:grid-cols-2">
                        {campaigns.map(c => (
                            <div
                                key={c.id}
                                className="bg-white border border-[#E2E8F0] rounded-lg p-6 shadow-sm cursor-pointer hover:shadow-md transition relative"
                                onClick={() => setSelectedCampaign(c)}
                            >
                                {canDeleteCampaigns && (
                                    <button
                                        onClick={(e) => handleDelete(c.id, e)}
                                        className="absolute top-4 right-16 bg-rose-500 text-white px-3 py-1 rounded-md text-xs hover:bg-rose-600 transition"
                                        title="Delete Campaign"
                                    >
                                        Delete
                                    </button>
                                )}
                                {canEditCampaigns && (
                                    <button
                                        onClick={(e) => handleEditClick(c, e)}
                                        className="absolute top-4 right-4 bg-[#0F766E] text-white px-3 py-1 rounded-md text-xs hover:bg-[#0D5B54] transition"
                                        title="Edit Campaign"
                                    >
                                        Edit
                                    </button>
                                )}
                                <h3 className="text-lg font-bold text-[#1C1917] mb-2">{c.name}</h3>
                                <p className="mb-3 text-[#334155]">{c.description}</p>
                                <span className="text-sm font-semibold text-[#0F766E] block mb-3">{c.startDate?.slice(0, 10)} - {c.endDate?.slice(0, 10)}</span>
                                <div className="mb-2">
                                    <span className="font-semibold text-[#0F766E]">${c.raised?.toLocaleString()}</span>
                                    <span className="text-[#64748B]"> / ${c.goal?.toLocaleString()} raised</span>
                                </div>
                                <div className="w-full bg-[#E2E8F0] rounded h-3 overflow-hidden">
                                    <div
                                        className="bg-[#14B8A6] h-3"
                                        style={{ width: `${Math.min(100, (c.raised / c.goal) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    {selectedCampaign && (
                        <CampaignDetails
                            campaign={selectedCampaign}
                            donations={donations}
                            onClose={() => setSelectedCampaign(null)}
                            onDeleted={() => {
                                setSelectedCampaign(null);
                                fetchCampaigns();
                            }}
                            onEdit={() => handleEditClick(selectedCampaign, {} as any)}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}
