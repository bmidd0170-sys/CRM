"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface LoginOverlayProps {
    show: boolean;
    onClose: () => void;
}

export default function LoginOverlay({ show, onClose }: LoginOverlayProps) {
    const [orgName, setOrgName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const router = useRouter();

    if (!show) return null;

    return (
        <>
            {/* Overlay background */}
            <div className="fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300 z-40" aria-hidden="true"></div>
            {/* Modal content */}
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeInUp text-[#1C1917]">
                    <button
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        &times;
                    </button>
                    <h2 className="text-2xl font-bold mb-6 text-center text-[#0F766E]">Register Organization</h2>
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={e => {
                            e.preventDefault();
                            // Here you would handle registration logic
                            // After successful registration:
                            router.push("/dashboard");
                            onClose();
                        }}
                    >
                        <div>
                            <label className="block text-sm font-medium mb-1">Organization's Name</label>
                            <input
                                type="text"
                                className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                                value={orgName}
                                onChange={e => setOrgName(e.target.value)}
                                placeholder="Enter organization name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Enter email"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Password</label>
                            <input
                                type="password"
                                className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Enter password"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Confirm Password</label>
                            <input
                                type="password"
                                className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="Confirm password"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="mt-4 bg-[#0F766E] text-white font-semibold py-2 rounded-lg hover:bg-[#0D5B54] transition"
                        >
                            Register
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}