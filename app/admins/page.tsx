"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { isSuperAdmin, getAdminId, handleLogout, getAdminData } from "@/lib/admin-storage";

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
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminRecord | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "Admin", restrictions: "" });
  const [adminName, setAdminName] = useState("");

  // Get logged-in admin data
  useEffect(() => {
    const admin = getAdminData();
    if (admin) {
      setAdminName(admin.name);
    }
  }, []);

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
    const currentAdminId = getAdminId();
    fetch("/api/admins", {
      headers: {
        'x-admin-id': currentAdminId?.toString() || ''
      }
    })
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
  

  function handleEditClick(admin: AdminRecord) {
    setEditingAdmin(admin);
    setEditForm({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      restrictions: admin.restrictions.join(", ")
    });
  }

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingAdmin) return;

    const currentAdminId = getAdminId();
    const updateData = {
      id: editingAdmin.id,
      name: editForm.name,
      email: editForm.email,
      role: editForm.role,
      restrictions: editForm.restrictions ? editForm.restrictions.split(",").map(r => r.trim()) : []
    };

    try {
      const res = await fetch("/api/admins", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'x-admin-id': currentAdminId?.toString() || ''
        },
        body: JSON.stringify(updateData)
      });

      if (!res.ok) {
        return res.json().then(err => {
          throw new Error(err.error || "Failed to update admin");
        });
      }

      alert("Admin updated successfully!");
      setEditingAdmin(null);
      fetchAdmins();
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  function handleEditCancel() {
    setEditingAdmin(null);
  }

  function handleDeleteAdmin(id: number) {
    if (!confirm("Are you sure you want to delete this admin?")) {
      return;
    }

    const currentAdminId = getAdminId();
    fetch(`/api/admins?id=${id}`, {
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
          <div className="flex items-center gap-6">
            <span className="text-[#1C1917] font-semibold">{adminName || "Loading..."}</span>
            <button onClick={handleLogout} className="bg-[#0F766E] text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-[#0D5B54] transition">Logout</button>
          </div>
        </div>
        <div className="p-8">
          {editingAdmin && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4 text-[#1C1917]">Edit Admin</h2>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1C1917] mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      className="border border-[#E2E8F0] rounded-md px-3 py-2 w-full text-[#1C1917]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1C1917] mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleEditChange}
                      className="border border-[#E2E8F0] rounded-md px-3 py-2 w-full text-[#1C1917]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1C1917] mb-1">Role</label>
                    <select
                      name="role"
                      value={editForm.role}
                      onChange={handleEditChange}
                      className="border border-[#E2E8F0] rounded-md px-3 py-2 w-full text-[#1C1917]"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Super Admin">Super Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1C1917] mb-1">Restrictions (comma separated)</label>
                    <input
                      type="text"
                      name="restrictions"
                      value={editForm.restrictions}
                      onChange={handleEditChange}
                      placeholder="e.g., No Delete, No Edit"
                      className="border border-[#E2E8F0] rounded-md px-3 py-2 w-full text-[#1C1917]"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-[#0F766E] text-white px-4 py-2 rounded-md font-medium hover:bg-[#0D5B54] transition"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={handleEditCancel}
                      className="flex-1 bg-[#E2E8F0] text-[#1C1917] px-4 py-2 rounded-md font-medium hover:bg-[#D1D5DB] transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
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
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${admin.role === "Super Admin"
                                ? "bg-[#DCFCE7] text-[#166534]"
                                : "bg-[#FEF3C7] text-[#92400E]"
                              }`}
                          >
                            {admin.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${admin.online
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
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditClick(admin)}
                              className="bg-blue-500 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-600 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAdmin(admin.id)}
                              className="bg-rose-500 text-white px-3 py-1 rounded-md text-xs hover:bg-rose-600 transition"
                            >
                              Delete
                            </button>
                          </div>
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
