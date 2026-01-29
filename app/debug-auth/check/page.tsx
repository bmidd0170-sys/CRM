"use client";
import { useState } from "react";
import { getAdminId, getAdminData } from "@/lib/admin-storage";

export default function DebugAuthPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function checkAuth() {
    setLoading(true);
    const adminId = getAdminId();
    const adminData = getAdminData();
    
    console.log('Client-side admin ID:', adminId);
    console.log('Client-side admin data:', adminData);

    const res = await fetch('/api/debug/check-auth', {
      headers: {
        'x-admin-id': adminId?.toString() || ''
      }
    });
    
    const data = await res.json();
    setResult({
      clientSide: {
        adminId,
        adminData
      },
      serverSide: data
    });
    setLoading(false);
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Debug</h1>
      
      <button 
        onClick={checkAuth}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {loading ? 'Checking...' : 'Check Authentication Status'}
      </button>

      {result && (
        <div className="mt-6 space-y-4">
          <div className="border p-4 rounded">
            <h2 className="font-bold text-lg mb-2">Client-Side (Browser)</h2>
            <pre className="bg-gray-100 p-3 rounded overflow-auto">
              {JSON.stringify(result.clientSide, null, 2)}
            </pre>
          </div>

          <div className="border p-4 rounded">
            <h2 className="font-bold text-lg mb-2">Server-Side (API)</h2>
            <pre className="bg-gray-100 p-3 rounded overflow-auto">
              {JSON.stringify(result.serverSide, null, 2)}
            </pre>
          </div>

          {result.serverSide.authenticated === false && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Issue Found:</strong> {result.serverSide.message}
              <br />
              <br />
              <strong>Solution:</strong> You need to log in first. Go to the home page and log in with your admin credentials.
            </div>
          )}

          {result.serverSide.authenticated === true && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <strong>✓ Authenticated</strong> as {result.serverSide.admin.role}
              <br />
              Role: {result.serverSide.admin.role}
              <br />
              Restrictions: {result.serverSide.admin.restrictions.length > 0 ? result.serverSide.admin.restrictions.join(', ') : 'None'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
