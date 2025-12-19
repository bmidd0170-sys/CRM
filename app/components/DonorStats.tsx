import React from "react";

interface DonorStatsProps {
    donors: Array<{
        name: string;
        email: string;
        total: string;
        lastDonation: string;
        status: string;
    }>;
    isLapsed: (lastDonation: string) => boolean;
}

export default function DonorStats({ donors, isLapsed }: DonorStatsProps) {
    const all = donors.length;
    const active = donors.filter(d => d.status === "Active").length;
    const inactive = donors.filter(d => d.status === "Inactive").length;
    const lapsed = donors.filter(d => isLapsed(d.lastDonation)).length;
    const major = donors.filter(d => Number(d.total.replace(/[^\\d.-]+/g, "")) >= 2000).length;

    return (
        <div className="flex justify-between gap-6 mb-8">
            <div className="bg-[#F1F5F9] rounded-lg px-6 py-4 text-center flex-1">
                <div className="text-2xl font-bold text-[#0F766E]">{all}</div>
                <div className="text-xs text-[#1C1917] font-semibold mt-1">All Donors</div>
            </div>
            <div className="bg-[#D1FAE5] rounded-lg px-6 py-4 text-center flex-1">
                <div className="text-2xl font-bold text-[#065F46]">{active}</div>
                <div className="text-xs text-[#065F46] font-semibold mt-1">Active</div>
            </div>
            <div className="bg-[#FDE68A] rounded-lg px-6 py-4 text-center flex-1">
                <div className="text-2xl font-bold text-[#92400E]">{inactive}</div>
                <div className="text-xs text-[#92400E] font-semibold mt-1">Inactive</div>
            </div>
            <div className="bg-[#E0E7FF] rounded-lg px-6 py-4 text-center flex-1">
                <div className="text-2xl font-bold text-[#3730A3]">{lapsed}</div>
                <div className="text-xs text-[#3730A3] font-semibold mt-1">Lapsed</div>
            </div>
            <div className="bg-[#A7F3D0] rounded-lg px-6 py-4 text-center flex-1">
                <div className="text-2xl font-bold text-[#047857]">{major}</div>
                <div className="text-xs text-[#047857] font-semibold mt-1">Major</div>
            </div>
        </div>
    );
}
