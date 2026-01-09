'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, MapPin } from 'lucide-react';
import { useMemo } from 'react';

export default function CalendarPage() {
  // Memoize dates to prevent infinite re-renders
  const dateRange = useMemo(() => {
    const now = Date.now();
    return {
      startDate: now - 7 * 24 * 60 * 60 * 1000,
      endDate: now + 30 * 24 * 60 * 60 * 1000,
    };
  }, []);

  const events = useQuery(api.calendar.listEvents, {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    limit: 50,
  });

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-white mb-6">Calendar</h1>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          {events === undefined ? (
            <div className="text-slate-400 text-center py-8">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No events yet</h3>
              <p className="text-slate-400">Sync your Google Calendar to see your events here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
                >
                  <h3 className="font-semibold text-white mb-2">{event.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(event.start).toLocaleDateString()} {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </div>
                    )}
                  </div>
                  {event.description && (
                    <p className="mt-2 text-sm text-slate-400 line-clamp-2">{event.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
