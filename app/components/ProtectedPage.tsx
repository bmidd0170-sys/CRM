"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminRestrictions, isSuperAdmin, isAdminLoggedIn } from '@/lib/admin-storage';
import { canAccessScreen } from '@/lib/admin-storage';

interface ProtectedPageProps {
  screenName: string;
  children: React.ReactNode;
}

/**
 * Component to protect pages based on admin restrictions
 * Redirects to dashboard if admin doesn't have access
 */
export default function ProtectedPage({ screenName, children }: ProtectedPageProps) {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    if (!isAdminLoggedIn()) {
      router.push('/');
      return;
    }

    // Check if admin has access to this screen
    const access = canAccessScreen(screenName);
    setHasAccess(access);
    setIsChecking(false);

    if (!access) {
      // Redirect to dashboard after a short delay so user sees the message
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
  }, [screenName, router]);

  // While checking access
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F766E]"></div>
          <p className="mt-4 text-[#1C1917] font-medium">Checking access...</p>
        </div>
      </div>
    );
  }

  // If no access, show restriction message before redirect
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-[#1C1917] mb-2">Access Restricted</h1>
          <p className="text-[#64748B] mb-6">You don't have permission to access this page.</p>
          <p className="text-sm text-[#94A3B8]">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // Admin has access, render children
  return <>{children}</>;
}
