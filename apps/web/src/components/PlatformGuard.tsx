'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

export function PlatformGuard({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if there is truly no token in localStorage
    if (typeof window !== 'undefined' && !localStorage.getItem('spaas_token')) {
      router.push('/login');
    }
  }, [router]);

  // Still hydrating from localStorage
  if (!token || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading platform console...</p>
        </div>
      </div>
    );
  }

  // Not authorized
  if (!user.isPlatformAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-xl border border-red-900 text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-400 mb-2">403 Forbidden</h1>
          <p className="text-gray-400 mb-4">You do not have access to the platform console.</p>
          <p className="text-gray-500 text-xs mb-6">Only platform admins can see this page.</p>
          <button 
            onClick={() => router.push('/dashboard')} 
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-bold text-white"
          >
            Back to App
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
