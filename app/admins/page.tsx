"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import AdminForm from "./components/AdminForm";
import { isSuperAdmin, getAdminId, handleLogout } from "@/lib/admin-storage";

interface AdminRecord {
  id: number;
  name: string;
  email: string;
  role: string;
  restrictions: string[];
  online: boolean;
  changes: string[];
  organizationName: string;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Check if user is super admin
  useEffect(() => {
    const authorized = isSuperAdmin();
    console.log('Admin page - Authorization check:', authorized);
    if (authorized) {
      setIsAuthorized(true);
      fetchAdmins();
    } else {
      console.warn('Admin page - Access denied: User is not a Super Admin');
      setIsAuthorized(false);
      setLoading(false);
    }
  }, []);

  function fetchAdmins() {
    console.log('Fetching admins...');
    fetch("/api/admins")
      .then((res) => res.json())
      .then((data) => {
        console.log('Admins fetched successfully:', data.length, 'admins');
        setAdmins(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching admins:", err);
        setLoading(false);
      });
  }

  function handleAdminCreated() {
    console.log('Admin created, refreshing list...');
    setShowForm(false);
    fetchAdmins(); // Refresh the list
  }

  function handleDelete(adminId: number) {
    if (!confirm("Are you sure you want to delete this admin?")) {
      return;
    }

    const currentAdminId = getAdminId();
    fetch(`/api/admins?id=${adminId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        'x-admin-id': currentAdminId?.toString() || ''
      },
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(err.error || "Failed to delete admin");
          });
        }
        return res.json();
      })
      .then(() => {
        fetchAdmins(); // Refresh the list
      })
      .catch((error) => {
        alert(`Error: ${error.message}`);
        console.error("Error deleting admin:", error);
      });
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen bg-[#F8FAFC]">
        <Sidebar active="Admins" />
        <main className="flex-1 min-h-screen ml-[260px]">
          <div className="bg-white border-b border-[#E2E8F0] px-8 py-5 sticky top-0 z-40">
            <h1 className="font-bricolage text-2xl font-bold text-[#1C1917]">Admin Management</h1>
          </div>
          <div className="p-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-700 font-semibold">Access Denied</p>
              <p className="text-red-600 text-sm mt-2">Only Super Admins can access this page.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8FAFC]">
        <Sidebar active="Admins" />
        <main className="flex-1 min-h-screen ml-[260px]">
          <div className="bg-white border-b border-[#E2E8F0] px-8 py-5 sticky top-0 z-40">
            <h1 className="font-bricolage text-2xl font-bold text-[#1C1917]">Admin Management</h1>
          </div>
          <div className="p-8">
            <div className="text-center text-gray-600">Loading...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar active="Admins" />
      <main className="flex-1 min-h-screen ml-[260px]">
        <div className="bg-white border-b border-[#E2E8F0] px-8 py-5 flex justify-between items-center sticky top-0 z-40 animate-slideInDown">
          <h1 className="font-bricolage text-2xl font-bold text-[#1C1917]">Admin Management</h1>
          <div className="flex gap-3">
            <button
              className="bg-[#0F766E] text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-[#0D5B54] transition"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Cancel" : "+ Add Admin"}
            </button>
            <button onClick={handleLogout} className="bg-[#0F766E] text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-[#0D5B54] transition">Logout</button>
          </div>
        </div>
        <div className="p-8">
          {showForm && (
            <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 mb-8 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-[#1C1917]">Create New Admin</h2>
              <AdminForm onCreated={handleAdminCreated} />
            </div>
          )}

          <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F1F5F9] border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1C1917]">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1C1917]">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1C1917]">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1C1917]">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1C1917]">Organization</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1C1917]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-[#64748B]">
                        No admins found. Create one to get started.
                      </td>
                    </tr>
                  ) : (
                    admins.map((admin) => (
                      <tr
                        key={admin.id}
                        className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-[#1C1917]">
                          {admin.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#64748B]">{admin.email}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              admin.role === "Super Admin"
                                ? "bg-[#DCFCE7] text-[#166534]"
                                : "bg-[#FEF3C7] text-[#92400E]"
                            }`}
                          >
                            {admin.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              admin.online
                                ? "bg-[#D1FAE5] text-[#047857]"
                                : "bg-[#FECACA] text-[#991B1B]"
                            }`}
                          >
                            {admin.online ? "Online" : "Offline"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#64748B]">
                          {admin.organizationName}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleDelete(admin.id)}
                            className="bg-rose-500 text-white px-3 py-1 rounded-md text-xs hover:bg-rose-600 transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
