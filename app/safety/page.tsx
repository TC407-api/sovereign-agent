'use client';

import { SafetyDashboard } from '@/components/SafetyDashboard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SafetyPage() {
  // TODO: Wire up to real Convex queries when backend is ready
  const pendingApprovals: never[] = [];
  const recentAuditEntries: never[] = [];
  const rateLimitStatus = null;

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-white mb-6">Safety Dashboard</h1>
        <div className="bg-slate-800 rounded-xl border border-slate-700">
          <SafetyDashboard
            pendingApprovals={pendingApprovals}
            recentAuditEntries={recentAuditEntries}
            rateLimitStatus={rateLimitStatus}
          />
        </div>
      </div>
    </div>
  );
}
