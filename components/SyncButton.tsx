'use client';

import { useState } from 'react';
import { useAction } from 'convex/react';
import { useSession } from 'next-auth/react';
import { api } from '@/convex/_generated/api';
import { RefreshCw, Check, AlertCircle, Mail } from 'lucide-react';

export function SyncButton() {
  const { data: session } = useSession();
  const syncEmails = useAction(api.sync.syncEmails);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ synced: number; errors: number } | null>(null);

  const handleSync = async () => {
    if (!session?.accessToken) {
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const syncResult = await syncEmails({
        accessToken: session.accessToken,
        maxEmails: 50,
      });
      setResult(syncResult);

      // Clear result after 5 seconds
      setTimeout(() => setResult(null), 5000);
    } catch (error) {
      console.error('Sync failed:', error);
      setResult({ synced: 0, errors: 1 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleSync}
        disabled={isLoading || !session?.accessToken}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
          ${isLoading
            ? 'bg-blue-500/20 text-blue-400 cursor-wait'
            : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white hover:scale-105'
          }
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        `}
      >
        {isLoading ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Mail className="w-4 h-4" />
        )}
        {isLoading ? 'Syncing...' : 'Sync Gmail'}
      </button>

      {result && (
        <div className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
          ${result.errors === 0
            ? 'bg-green-500/20 text-green-400'
            : 'bg-red-500/20 text-red-400'
          }
        `}>
          {result.errors === 0 ? (
            <>
              <Check className="w-4 h-4" />
              <span>{result.synced} emails synced</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4" />
              <span>Sync failed</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
