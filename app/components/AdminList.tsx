import React, { useState } from "react";

interface Admin {
    name: string;
    email: string;
    role: string;
    restrictions: string[];
    online: boolean;
    changes: string[];
}

interface AdminListProps {
    admins: Admin[];
    onSelect: (admin: Admin) => void;
}

export function AdminList({ admins, onSelect }: AdminListProps) {
    return (
        <div className="space-y-4">
            {admins.map((admin, idx) => (
                <div
                    key={idx}
                    className={`bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between cursor-pointer hover:shadow-md transition ${admin.online ? 'ring-2 ring-[#0F766E]' : ''}`}
                    onClick={() => onSelect(admin)}
                >
                    <div>
                        <div className="font-bold text-[#0F766E] flex items-center gap-2">
                            {admin.name}
                            {admin.online && <span className="inline-block w-2 h-2 bg-[#10B981] rounded-full" title="Online"></span>}
                        </div>
                        <div className="text-sm text-[#64748B]">{admin.email}</div>
                        <div className="text-xs text-[#64748B] mt-1">Role: {admin.role}</div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                        {admin.restrictions.length === 0 ? (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#A7F3D0] text-[#047857]">No Restrictions</span>
                        ) : (
                            admin.restrictions.map(r => (
                                <span key={r} className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FDE68A] text-[#92400E]">{r}</span>
                            ))
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

interface AdminProfileProps {
    admin: Admin;
    onClose: () => void;
}

export function AdminProfile({ admin, onClose }: AdminProfileProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeInUp text-[#1C1917]">
                <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                    onClick={onClose}
                    aria-label="Close"
                >
                    &times;
                </button>
                <h2 className="text-2xl font-bold mb-4 text-center text-[#0F766E]">Admin Profile</h2>
                <div className="mb-2"><span className="font-semibold">Name:</span> {admin.name}</div>
                <div className="mb-2"><span className="font-semibold">Email:</span> {admin.email}</div>
                <div className="mb-2"><span className="font-semibold">Role:</span> {admin.role}</div>
                <div className="mb-2"><span className="font-semibold">Online:</span> {admin.online ? 'Yes' : 'No'}</div>
                <div className="mb-2"><span className="font-semibold">Restrictions:</span> {admin.restrictions.length === 0 ? 'None' : admin.restrictions.join(', ')}</div>
                <div className="mt-4">
                    <h3 className="font-semibold mb-2">Recent Changes</h3>
                    <ul className="list-disc pl-5 text-sm">
                        {admin.changes.length === 0 ? (
                            <li>No changes recorded.</li>
                        ) : (
                            admin.changes.map((change, idx) => <li key={idx}>{change}</li>)
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
