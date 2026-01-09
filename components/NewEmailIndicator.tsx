"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function NewEmailIndicator() {
  const emails = useQuery(api.emails.listEmails, { limit: 1 });
  const [lastEmailId, setLastEmailId] = useState<string | null>(null);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (emails && emails.length > 0) {
      const currentLatestId = emails[0]._id;

      if (lastEmailId && lastEmailId !== currentLatestId) {
        // New email arrived!
        setShowIndicator(true);
        const timer = setTimeout(() => setShowIndicator(false), 3000);
        return () => clearTimeout(timer);
      }

      setLastEmailId(currentLatestId);
    }
  }, [emails, lastEmailId]);

  if (!showIndicator) return null;

  return (
    <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-top-2 fade-in duration-300 z-50">
      New email received!
    </div>
  );
}
