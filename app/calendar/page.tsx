"use client";

// Disable static generation for this page (requires Convex client)
export const dynamic = "force-dynamic";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CalendarWeekView, CalendarEvent } from "@/components/CalendarWeekView";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";
import { useMemo } from "react";

export default function CalendarPage() {
  // Fetch events for the next 60 days to cover week navigation
  const now = Date.now();
  const sixtyDaysAgo = now - 60 * 24 * 60 * 60 * 1000;
  const sixtyDaysAhead = now + 60 * 24 * 60 * 60 * 1000;

  const events = useQuery(api.calendar.listEvents, {
    startDate: sixtyDaysAgo,
    endDate: sixtyDaysAhead,
    limit: 500,
  });

  // Transform Convex events to CalendarEvent format
  const formattedEvents: CalendarEvent[] = useMemo(() => {
    if (!events) return [];

    return events.map((event: {
      _id: string;
      title: string;
      start: number;
      end: number;
      isAllDay: boolean;
      description?: string;
      location?: string;
      status: "confirmed" | "tentative" | "cancelled";
    }) => ({
      id: event._id,
      title: event.title,
      start: new Date(event.start),
      end: new Date(event.end),
      isAllDay: event.isAllDay,
      description: event.description,
      location: event.location,
      status: event.status,
    }));
  }, [events]);

  const handleEventClick = (event: CalendarEvent) => {
    console.log("Event clicked:", event);
    // TODO: Open event detail modal or navigate to event detail page
  };

  // Loading state
  if (events === undefined) {
    return (
      <div className="p-4 h-screen">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Calendar</h1>
        </div>
        <div className="h-[calc(100vh-120px)] bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex gap-2 mb-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (events.length === 0) {
    return (
      <div className="p-4 h-screen">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Calendar</h1>
        </div>
        <div className="flex flex-col items-center justify-center p-8 text-center h-[calc(100vh-120px)] bg-white rounded-lg border border-slate-200">
          <Calendar className="h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700">No events yet</h3>
          <p className="text-slate-500 mt-1">
            Sync your Google Calendar to see your events here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="text-sm text-slate-500">
          {events.length} event{events.length !== 1 ? "s" : ""}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <CalendarWeekView events={formattedEvents} onEventClick={handleEventClick} />
      </div>
    </div>
  );
}
