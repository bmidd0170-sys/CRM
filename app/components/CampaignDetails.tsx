"use client";
import React from "react";

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
    donor: string;
    amount: number;
    date: string;
    method: string;
    campaign: string;
    status: string;
  }>;
  onClose: () => void;
}

export default function CampaignDetails({ campaign, donations, onClose }: CampaignDetailsProps) {
  const campaignDonations = donations.filter(d => d.campaign === campaign.name);
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
        <div className="mb-2 text-[#64748B]">
          <span>Start: {campaign.startDate}</span> | <span>End: {campaign.endDate}</span>
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
        <h3 className="text-lg font-semibold mb-2">Donations</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-[#E2E8F0] rounded-lg">
            <thead>
              <tr className="bg-[#F1F5F9] text-[#334155]">
                <th className="py-2 px-4 border-b">Donor</th>
                <th className="py-2 px-4 border-b">Amount</th>
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">Method</th>
                <th className="py-2 px-4 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {campaignDonations.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-gray-500 py-4">No donations for this campaign.</td></tr>
              ) : campaignDonations.map(donation => (
                <tr key={donation.id} className="text-[#334155] hover:bg-[#F8FAFC] transition">
                  <td className="py-2 px-4 border-b">{donation.donor}</td>
                  <td className="py-2 px-4 border-b">${donation.amount.toLocaleString()}</td>
                  <td className="py-2 px-4 border-b">{donation.date}</td>
                  <td className="py-2 px-4 border-b">{donation.method}</td>
                  <td className="py-2 px-4 border-b">{donation.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
