"use client";
import React from "react";
import { canDelete, canEdit, getAdminId } from "@/lib/admin-storage";

interface CampaignDetailsProps {
  campaign: {
    id: number;
    name: string;
    goal: number;
    raised: number;
    startDate: string;
    endDate: string;
    description: string;
  };
  donations: Array<{
    id: number;
    amount: number;
    date: string;
    campaignId?: number;
    donor?: {
      id: number;
      name: string;
      email: string;
    };
    donorId?: number;
  }>;
  onClose: () => void;
  onDeleted?: () => void;
  onEdit?: () => void;
}

export default function CampaignDetails({ campaign, donations, onClose, onDeleted, onEdit }: CampaignDetailsProps) {
  const campaignDonations = donations.filter(d => d.campaignId === campaign.id);
  const canDeleteCampaigns = canDelete('campaigns');
  const canEditCampaigns = canEdit('campaigns');

  function handleDelete() {
    if (!confirm('Are you sure you want to delete this campaign? This will also delete all related donations and events.')) {
      return;
    }

    const adminId = getAdminId();
    fetch(`/api/campaigns?id=${campaign.id}`, {
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
        onClose();
        if (onDeleted) onDeleted();
      })
      .catch(error => {
        alert(`Error: ${error.message}`);
        console.error('Error deleting campaign:', error);
      });
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-2 text-[#1C1917]">{campaign.name}</h2>
        <p className="mb-2 text-[#334155]">{campaign.description}</p>
        <div className="mb-2 text-[#334155]">
          <span>Start: {new Date(campaign.startDate).toLocaleDateString()}</span> | <span>End: {new Date(campaign.endDate).toLocaleDateString()}</span>
        </div>
        <div className="mb-4">
          <span className="font-semibold text-[#0F766E]">${campaign.raised.toLocaleString()}</span>
          <span className="text-[#64748B]"> / ${campaign.goal.toLocaleString()} raised</span>
        </div>
        <div className="w-full bg-[#E2E8F0] rounded h-3 overflow-hidden mb-6">
          <div
            className="bg-[#14B8A6] h-3"
            style={{ width: `${Math.min(100, (campaign.raised / campaign.goal) * 100)}%` }}
          />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-[#1C1917]">Donations</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-[#E2E8F0] rounded-lg">
            <thead>
              <tr className="bg-[#F1F5F9] text-[#334155]">
                <th className="py-2 px-4 border-b text-left">Donor</th>
                <th className="py-2 px-4 border-b text-center">Amount</th>
                <th className="py-2 px-4 border-b text-center">Date</th>
              </tr>
            </thead>
            <tbody>
              {campaignDonations.length === 0 ? (
                <tr><td colSpan={3} className="text-center text-gray-500 py-4">No donations for this campaign.</td></tr>
              ) : campaignDonations.map(donation => (
                <tr key={donation.id} className="text-[#334155] hover:bg-[#F8FAFC] transition">
                  <td className="py-2 px-4 border-b text-left">{donation.donor?.name || 'Unknown Donor'}</td>
                  <td className="py-2 px-4 border-b text-center">${donation.amount.toLocaleString()}</td>
                  <td className="py-2 px-4 border-b text-center">{new Date(donation.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {canDeleteCampaigns && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleDelete}
              className="w-full bg-red-500 text-white px-4 py-2 rounded-md font-medium hover:bg-red-600 transition"
            >
              Delete Campaign
            </button>
          
        {canEditCampaigns && (
          <div className={canDeleteCampaigns ? "mt-2" : "mt-6 pt-4 border-t border-gray-200"}>
            <button
              onClick={() => {
                if (onEdit) onEdit();
                onClose();
              }}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-600 transition"
            >
              Edit Campaign
            </button>
          </div>
        )}</div>
        )}
      </div>
    </div>
  );
}
