"use client";

import { useEffect, useState } from 'react';
import { getAdminData, isAdminLoggedIn, isSuperAdmin } from '@/lib/admin-storage';

export default function DebugAuthPage() {
  const [authInfo, setAuthInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dbAdmins, setDbAdmins] = useState<any[]>([]);

  useEffect(() => {
    // Get auth info from session storage
    const adminData = getAdminData();
    const loggedIn = isAdminLoggedIn();
    const superAdmin = isSuperAdmin();

    setAuthInfo({
      loggedIn,
      superAdmin,
      adminData
    });

    // Fetch admins from database
    fetch('/api/debug/admins')
      .then(res => res.json())
      .then(data => {
        setDbAdmins(data.admins || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching admins:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Authentication Debug Page</h1>
        
        {/* Current Login Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Login Status</h2>
          <div className="space-y-2">
            <p><strong>Logged In:</strong> {authInfo?.loggedIn ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Is Super Admin:</strong> {authInfo?.superAdmin ? '✅ Yes' : '❌ No'}</p>
            {authInfo?.adminData && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h3 className="font-semibold mb-2">Logged In As:</h3>
                <pre className="text-sm">{JSON.stringify(authInfo.adminData, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Database Admins */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Admins in Database</h2>
          {dbAdmins.length === 0 ? (
            <div className="text-gray-600">
              <p className="mb-2">No admins found in the database.</p>
              <p className="text-sm">To create an admin:</p>
              <ol className="list-decimal list-inside text-sm mt-2 space-y-1">
                <li>Go to the <a href="/" className="text-blue-600 hover:underline">home page</a></li>
                <li>Click "Register"</li>
                <li>Fill in the form to create a Super Admin account</li>
              </ol>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Found {dbAdmins.length} admin(s)</p>
              {dbAdmins.map((admin, idx) => (
                <div key={admin.id} className="p-4 border border-gray-200 rounded">
                  <h3 className="font-semibold">{admin.name}</h3>
                  <div className="text-sm text-gray-600 space-y-1 mt-2">
                    <p><strong>Email:</strong> {admin.email}</p>
                    <p><strong>Role:</strong> {admin.role}</p>
                    <p><strong>Organization:</strong> {admin.organizationName}</p>
                    <p><strong>ID:</strong> {admin.id}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 What to do next:</h3>
          {!authInfo?.loggedIn && dbAdmins.length > 0 && (
            <div className="text-blue-800 text-sm space-y-2">
              <p>You have admins in the database but you're not logged in.</p>
              <p><strong>To fix this:</strong></p>
              <ol className="list-decimal list-inside ml-4 space-y-1">
                <li>Go to the <a href="/" className="text-blue-600 hover:underline font-medium">home page</a></li>
                <li>Click "Register" button (top right)</li>
                <li>Switch to "Login" mode in the modal</li>
                <li>Enter your email and password</li>
              </ol>
            </div>
          )}
          {!authInfo?.loggedIn && dbAdmins.length === 0 && (
            <div className="text-blue-800 text-sm space-y-2">
              <p>No admins found and you're not logged in.</p>
              <p><strong>To get started:</strong></p>
              <ol className="list-decimal list-inside ml-4 space-y-1">
                <li>Go to the <a href="/" className="text-blue-600 hover:underline font-medium">home page</a></li>
                <li>Click "Register" button</li>
                <li>Fill in the registration form</li>
                <li>This will create your first Super Admin account</li>
              </ol>
            </div>
          )}
          {authInfo?.loggedIn && !authInfo?.superAdmin && (
            <div className="text-blue-800 text-sm">
              <p>You're logged in but not as a Super Admin. Only Super Admins can access the admin management page.</p>
            </div>
          )}
          {authInfo?.loggedIn && authInfo?.superAdmin && (
            <div className="text-green-800 text-sm">
              <p>✅ You're logged in as a Super Admin! You can now access the <a href="/admins" className="text-green-600 hover:underline font-medium">admin management page</a>.</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex gap-4">
          <a href="/" className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700">← Home</a>
          {authInfo?.superAdmin && (
            <a href="/admins" className="bg-teal-700 text-white px-6 py-2 rounded hover:bg-teal-800">Go to Admin Management</a>
          )}
          {!authInfo?.loggedIn && (
            <a href="/" className="bg-teal-700 text-white px-6 py-2 rounded hover:bg-teal-800">Login / Register</a>
          )}
        </div>
      </div>
    </div>
  );
}
