'use client';
import { PlatformGuard } from '../../components/PlatformGuard';
import { PlatformShell } from '../../components/PlatformShell';

export default function PlatformHomePage() {
  return (
    <PlatformGuard>
      <PlatformShell>
        <div className="p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Overview</h1>
          <p className="text-gray-400">Platform metrics coming soon...</p>
        </div>
      </PlatformShell>
    </PlatformGuard>
  );
}
