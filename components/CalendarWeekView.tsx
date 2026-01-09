"use client";

import { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
  description?: string;
  location?: string;
  status?: "confirmed" | "tentative" | "cancelled";
}

interface CalendarWeekViewProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

// Time slot configuration
const START_HOUR = 7;
const END_HOUR = 21;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
const HOUR_HEIGHT = 60; // pixels per hour

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    return day;
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function getEventPosition(event: CalendarEvent): { top: number; height: number } {
  const startHour = event.start.getHours() + event.start.getMinutes() / 60;
  const endHour = event.end.getHours() + event.end.getMinutes() / 60;

  // Clamp to visible range
  const visibleStart = Math.max(startHour, START_HOUR);
  const visibleEnd = Math.min(endHour, END_HOUR);

  const top = (visibleStart - START_HOUR) * HOUR_HEIGHT;
  const height = Math.max((visibleEnd - visibleStart) * HOUR_HEIGHT, 24); // Min height of 24px

  return { top, height };
}

function getEventColor(status?: string): string {
  switch (status) {
    case "tentative":
      return "bg-amber-100 border-amber-300 text-amber-800";
    case "cancelled":
      return "bg-slate-100 border-slate-300 text-slate-500 line-through";
    default:
      return "bg-blue-100 border-blue-300 text-blue-800";
  }
}

export function CalendarWeekView({ events, onEventClick }: CalendarWeekViewProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()));

  const weekDays = useMemo(() => getWeekDays(currentWeekStart), [currentWeekStart]);

  const { allDayEvents, timedEvents } = useMemo(() => {
    const allDay: CalendarEvent[] = [];
    const timed: CalendarEvent[] = [];

    events.forEach((event) => {
      if (event.isAllDay) {
        allDay.push(event);
      } else {
        timed.push(event);
      }
    });

    return { allDayEvents: allDay, timedEvents: timed };
  }, [events]);

  const getEventsForDay = (day: Date, eventList: CalendarEvent[]) => {
    return eventList.filter((event) => isSameDay(event.start, day));
  };

  const navigateWeek = (direction: number) => {
    setCurrentWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + direction * 7);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentWeekStart(getWeekStart(new Date()));
  };

  const isToday = (date: Date): boolean => {
    return isSameDay(date, new Date());
  };

  const weekLabel = useMemo(() => {
    const start = weekDays[0];
    const end = weekDays[6];
    const startMonth = start.toLocaleDateString("en-US", { month: "short" });
    const endMonth = end.toLocaleDateString("en-US", { month: "short" });
    const year = end.getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${year}`;
    }
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${year}`;
  }, [weekDays]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Header with navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateWeek(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateWeek(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>
        <h2 className="text-lg font-semibold text-slate-800">{weekLabel}</h2>
        <div className="w-[150px]" /> {/* Spacer for alignment */}
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-slate-200">
        <div className="border-r border-slate-200" /> {/* Time column header */}
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={`px-2 py-2 text-center border-r border-slate-200 last:border-r-0 ${
              isToday(day) ? "bg-blue-50" : ""
            }`}
          >
            <div className="text-xs text-slate-500 uppercase">
              {day.toLocaleDateString("en-US", { weekday: "short" })}
            </div>
            <div
              className={`text-lg font-semibold ${
                isToday(day) ? "text-blue-600" : "text-slate-800"
              }`}
            >
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* All-day events row */}
      {allDayEvents.length > 0 && (
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-slate-200 min-h-[40px]">
          <div className="px-2 py-1 text-xs text-slate-500 text-right pr-2 border-r border-slate-200">
            All day
          </div>
          {weekDays.map((day) => {
            const dayAllDayEvents = getEventsForDay(day, allDayEvents);
            return (
              <div
                key={day.toISOString()}
                className="px-1 py-1 border-r border-slate-200 last:border-r-0 space-y-1"
              >
                {dayAllDayEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => onEventClick?.(event)}
                    className={`w-full text-left text-xs px-2 py-1 rounded border truncate ${getEventColor(
                      event.status
                    )} hover:opacity-80 transition-opacity cursor-pointer`}
                    title={event.title}
                  >
                    {event.title}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Time grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-[60px_repeat(7,1fr)] relative">
          {/* Time labels column */}
          <div className="border-r border-slate-200">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-[60px] pr-2 text-right text-xs text-slate-500 -translate-y-2"
              >
                {formatHour(hour)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day) => {
            const dayEvents = getEventsForDay(day, timedEvents);
            return (
              <div
                key={day.toISOString()}
                className={`relative border-r border-slate-200 last:border-r-0 ${
                  isToday(day) ? "bg-blue-50/30" : ""
                }`}
                style={{ height: `${HOURS.length * HOUR_HEIGHT}px` }}
              >
                {/* Hour grid lines */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="absolute w-full border-t border-slate-100"
                    style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT}px` }}
                  />
                ))}

                {/* Events */}
                {dayEvents.map((event) => {
                  const { top, height } = getEventPosition(event);
                  return (
                    <button
                      key={event.id}
                      onClick={() => onEventClick?.(event)}
                      className={`absolute left-1 right-1 px-2 py-1 rounded border text-xs overflow-hidden ${getEventColor(
                        event.status
                      )} hover:opacity-80 transition-opacity cursor-pointer text-left`}
                      style={{ top: `${top}px`, height: `${height}px` }}
                      title={`${event.title}\n${event.start.toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })} - ${event.end.toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}`}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      {height > 40 && (
                        <div className="text-[10px] opacity-75">
                          {event.start.toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {event.end.toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </div>
                      )}
                      {height > 60 && event.location && (
                        <div className="text-[10px] opacity-75 truncate">{event.location}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
