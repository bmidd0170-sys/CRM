"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { clearTemporaryData } from "@/lib/temp-data-utils";

interface LoginOverlayProps {
    show: boolean;
    onClose: () => void;
}

export default function LoginOverlay({ show, onClose }: LoginOverlayProps) {
    const [isLoginMode, setIsLoginMode] = useState(false);
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
                    <h2 className="text-2xl font-bold mb-6 text-center text-[#0F766E]">
                        {isLoginMode ? "Login" : "Register Organization"}
                    </h2>
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={async (e) => {
                            e.preventDefault();
                            if (isLoginMode) {
                                // Handle login logic
                                try {
                                    const loginResponse = await fetch('/api/logins', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            email: email,
                                            password: password
                                        })
                                    });

                                    if (!loginResponse.ok) {
                                        const error = await loginResponse.json();
                                        alert(`Login failed: ${error.error || 'Invalid credentials'}`);
                                        return;
                                    }

                                    const loginData = await loginResponse.json();

                                    // Store admin data in sessionStorage for use in dashboard
                                    if (loginData.admin) {
                                        sessionStorage.setItem('currentAdmin', JSON.stringify(loginData.admin));
                                    }

                                    // Clear temporary data after successful login
                                    await clearTemporaryData();

                                    // Reset form
                                    setEmail("");
                                    setPassword("");

                                    // Navigate to dashboard
                                    router.push("/dashboard");
                                    onClose();
                                } catch (error) {
                                    console.error('Login error:', error);
                                    alert('Login failed. Please try again.');
                                }
                            } else {
                                // Handle registration logic
                                try {
                                    if (password !== confirmPassword) {
                                        alert('Passwords do not match');
                                        return;
                                    }
                                    // Create admin account
                                    const adminResponse = await fetch('/api/admins', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            name: email.split('@')[0] || 'Admin',
                                            email: email,
                                            role: 'Super Admin',
                                            restrictions: [],
                                            online: true,
                                            changes: ['Organization registered'],
                                            organizationName: orgName,
                                            password
                                        })
                                    });

                                    if (!adminResponse.ok) {
                                        const error = await adminResponse.json();
                                        alert(`Registration failed: ${error.error || 'Unknown error'}`);
                                        return;
                                    }

                                    const adminData = await adminResponse.json();

                                    // Store admin data in sessionStorage for use in dashboard
                                    if (adminData.admin || adminData.data) {
                                        const admin = adminData.admin || adminData.data;
                                        sessionStorage.setItem('currentAdmin', JSON.stringify(admin));
                                    }

                                    // Clear temporary data after successful registration
                                    await clearTemporaryData();

                                    // Reset form
                                    setOrgName("");
                                    setEmail("");
                                    setPassword("");
                                    setConfirmPassword("");

                                    // Navigate to dashboard
                                    router.push("/dashboard");
                                    onClose();
                                } catch (error) {
                                    console.error('Registration error:', error);
                                    alert('Registration failed. Please try again.');
                                }
                            }
                        }}
                    >
                        {!isLoginMode && (
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
                        )}
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
                        {!isLoginMode && (
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
                        )}
                        <button
                            type="submit"
                            className="mt-4 bg-[#0F766E] text-white font-semibold py-2 rounded-lg hover:bg-[#0D5B54] transition"
                        >
                            {isLoginMode ? "Login" : "Register"}
                        </button>
                        <div className="text-center mt-2">
                            <button
                                type="button"
                                className="text-[#0F766E] hover:underline text-sm"
                                onClick={() => setIsLoginMode(!isLoginMode)}
                            >
                                {isLoginMode ? "Don't have an account? Register" : "Already have an account? Login"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}