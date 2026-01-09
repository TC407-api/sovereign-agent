/**
 * Smart Scheduler - AI-assisted meeting time optimization
 *
 * Analyzes busy patterns, finds optimal meeting slots,
 * and suggests best times for multi-attendee meetings.
 */

export interface SchedulingPreferences {
  /** Start of working hours (0-23) */
  workingHoursStart?: number;
  /** End of working hours (0-23) */
  workingHoursEnd?: number;
  /** Preferred time of day */
  preferredTime?: 'morning' | 'afternoon' | 'evening';
  /** Buffer time between meetings in minutes */
  bufferMinutes?: number;
  /** Avoid scheduling on certain days (0=Sunday, 6=Saturday) */
  avoidDays?: number[];
}

export interface TimeSlot {
  start: Date;
  end: Date;
  score: number;
  reason?: string;
}

export interface CalendarEvent {
  id: string;
  start: Date;
  end: Date;
  title: string;
}

export interface BusyPattern {
  type: 'summary' | 'peakHours' | 'busyDay' | 'freeDay';
  avgDuration?: number;
  totalMeetings?: number;
  hours?: number[];
  dayOfWeek?: number;
}

interface FindSlotOptions {
  duration: number; // minutes
  date: Date;
  events: CalendarEvent[];
  preferences?: SchedulingPreferences;
}

interface SuggestMeetingOptions {
  duration: number; // minutes
  attendeeCalendars: CalendarEvent[][];
  dateRange: { start: Date; end: Date };
  preferences?: SchedulingPreferences;
}

const DEFAULT_PREFERENCES: SchedulingPreferences = {
  workingHoursStart: 9,
  workingHoursEnd: 18,
  bufferMinutes: 0,
  avoidDays: [0, 6], // weekends
};

/**
 * Find the optimal time slot for a meeting on a specific date
 */
export function findOptimalSlot(options: FindSlotOptions): TimeSlot | null {
  const { duration, date, events, preferences = {} } = options;
  const prefs = { ...DEFAULT_PREFERENCES, ...preferences };

  // Set up working hours for the day
  const dayStart = new Date(date);
  dayStart.setHours(prefs.workingHoursStart!, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(prefs.workingHoursEnd!, 0, 0, 0);

  // Filter events for this day (checking if event overlaps with working hours)
  const dayEvents = events.filter((e) => {
    const eventStart = e.start.getTime();
    const eventEnd = e.end.getTime();
    // Check if event overlaps with any part of the day
    return eventStart < dayEnd.getTime() && eventEnd > dayStart.getTime();
  });

  // Sort events by start time
  const sortedEvents = [...dayEvents].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );

  const durationMs = duration * 60 * 1000;
  const bufferMs = (prefs.bufferMinutes || 0) * 60 * 1000;

  // Collect available slots
  const availableSlots: TimeSlot[] = [];
  let currentTime = dayStart.getTime();

  for (const event of sortedEvents) {
    const eventStart = event.start.getTime();
    const eventEnd = event.end.getTime();

    // Check for gap before this event
    const availableGap = eventStart - currentTime - bufferMs;
    if (availableGap >= durationMs) {
      const slotStart = new Date(currentTime + bufferMs);
      const slotEnd = new Date(currentTime + bufferMs + durationMs);

      availableSlots.push({
        start: slotStart,
        end: slotEnd,
        score: calculateSlotScore(slotStart, prefs),
      });
    }

    currentTime = Math.max(currentTime, eventEnd);
  }

  // Check for slot after last event
  const remainingTime = dayEnd.getTime() - currentTime - bufferMs;
  if (remainingTime >= durationMs) {
    const slotStart = new Date(currentTime + bufferMs);
    const slotEnd = new Date(currentTime + bufferMs + durationMs);

    availableSlots.push({
      start: slotStart,
      end: slotEnd,
      score: calculateSlotScore(slotStart, prefs),
    });
  }

  if (availableSlots.length === 0) {
    return null;
  }

  // Filter by preference and return best slot
  let filteredSlots = availableSlots;

  if (prefs.preferredTime === 'morning') {
    const morningSlots = availableSlots.filter((s) => s.start.getHours() < 12);
    if (morningSlots.length > 0) filteredSlots = morningSlots;
  } else if (prefs.preferredTime === 'afternoon') {
    const afternoonSlots = availableSlots.filter((s) => s.start.getHours() >= 12);
    if (afternoonSlots.length > 0) filteredSlots = afternoonSlots;
  }

  // Sort by score and return best
  filteredSlots.sort((a, b) => b.score - a.score);
  return filteredSlots[0];
}

/**
 * Calculate a preference score for a time slot
 */
function calculateSlotScore(slotStart: Date, prefs: SchedulingPreferences): number {
  const hour = slotStart.getHours();
  let score = 1.0;

  // Prefer mid-morning (10-11) and mid-afternoon (14-15)
  if ((hour >= 10 && hour <= 11) || (hour >= 14 && hour <= 15)) {
    score += 0.2;
  }

  // Penalize early morning and late afternoon
  if (hour < 9 || hour >= 17) {
    score -= 0.3;
  }

  // Apply preference bonus
  if (prefs.preferredTime === 'morning' && hour < 12) {
    score += 0.3;
  } else if (prefs.preferredTime === 'afternoon' && hour >= 12) {
    score += 0.3;
  }

  return Math.max(0, Math.min(1, score));
}

/**
 * Analyze calendar patterns to identify busy trends
 */
export function analyzeBusyPatterns(events: CalendarEvent[]): BusyPattern[] {
  const patterns: BusyPattern[] = [];

  if (events.length === 0) {
    return patterns;
  }

  // Calculate summary statistics
  let totalDuration = 0;
  const hourCounts: Record<number, number> = {};
  const dayCounts: Record<number, number> = {};

  for (const event of events) {
    const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60);
    totalDuration += duration;

    const hour = event.start.getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;

    const day = event.start.getDay();
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  }

  // Summary pattern
  patterns.push({
    type: 'summary',
    avgDuration: totalDuration / events.length,
    totalMeetings: events.length,
  });

  // Peak hours pattern
  const peakHours = Object.entries(hourCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour]) => parseInt(hour));

  patterns.push({
    type: 'peakHours',
    hours: peakHours,
  });

  // Busiest day pattern
  const busiestDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
  if (busiestDay) {
    patterns.push({
      type: 'busyDay',
      dayOfWeek: parseInt(busiestDay[0]),
    });
  }

  return patterns;
}

/**
 * Suggest optimal meeting times for multiple attendees
 */
export function suggestMeetingTime(options: SuggestMeetingOptions): TimeSlot[] {
  const { duration, attendeeCalendars, dateRange, preferences = {} } = options;
  const prefs = { ...DEFAULT_PREFERENCES, ...preferences };

  const suggestions: TimeSlot[] = [];
  const durationMs = duration * 60 * 1000;

  // Merge all events from all attendees
  const allEvents = attendeeCalendars.flat();

  // Iterate through each day in the date range
  const currentDate = new Date(dateRange.start);
  currentDate.setHours(0, 0, 0, 0);

  const endDate = new Date(dateRange.end);
  endDate.setHours(23, 59, 59, 999);

  while (currentDate <= endDate && suggestions.length < 5) {
    // Skip avoided days
    if (prefs.avoidDays?.includes(currentDate.getDay())) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    // Get events for this day from all calendars
    const dayEvents = allEvents.filter((e) => {
      return e.start.toDateString() === currentDate.toDateString();
    });

    // Find available slots for this day
    const daySlots = findDaySlots(
      new Date(currentDate),
      durationMs,
      dayEvents,
      prefs
    );

    suggestions.push(...daySlots);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Sort by score and return top 5
  suggestions.sort((a, b) => b.score - a.score);
  return suggestions.slice(0, 5);
}

/**
 * Find all available slots for a specific day
 */
function findDaySlots(
  date: Date,
  durationMs: number,
  events: CalendarEvent[],
  prefs: SchedulingPreferences
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const bufferMs = (prefs.bufferMinutes || 0) * 60 * 1000;

  const dayStart = new Date(date);
  dayStart.setHours(prefs.workingHoursStart!, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(prefs.workingHoursEnd!, 0, 0, 0);

  // Sort events
  const sortedEvents = [...events].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );

  let currentTime = dayStart.getTime();

  for (const event of sortedEvents) {
    const eventStart = event.start.getTime();
    const eventEnd = event.end.getTime();

    // Check for gap before this event
    const gapStart = currentTime + bufferMs;
    const gapEnd = eventStart - bufferMs;

    if (gapEnd - gapStart >= durationMs) {
      const slotStart = new Date(gapStart);
      const slotEnd = new Date(gapStart + durationMs);

      slots.push({
        start: slotStart,
        end: slotEnd,
        score: calculateSlotScore(slotStart, prefs),
      });
    }

    currentTime = Math.max(currentTime, eventEnd);
  }

  // Check for slot after last event
  const gapStart = currentTime + bufferMs;
  const gapEnd = dayEnd.getTime();

  if (gapEnd - gapStart >= durationMs) {
    const slotStart = new Date(gapStart);
    const slotEnd = new Date(gapStart + durationMs);

    slots.push({
      start: slotStart,
      end: slotEnd,
      score: calculateSlotScore(slotStart, prefs),
    });
  }

  return slots;
}
