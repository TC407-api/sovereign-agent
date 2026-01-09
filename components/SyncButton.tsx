"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { RefreshCw, Check, AlertCircle } from "lucide-react";

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
    } catch (error) {
      console.error("Sync failed:", error);
      setResult({ synced: 0, errors: 1 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleSync}
        disabled={isLoading || !session?.accessToken}
        variant="outline"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
        {isLoading ? "Syncing..." : "Sync Gmail"}
      </Button>

      {result && (
        <span className="text-sm flex items-center gap-1">
          {result.errors === 0 ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-green-600">Synced {result.synced} emails</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-600">Sync had errors</span>
            </>
          )}
        </span>
      )}
    </div>
  );
}
