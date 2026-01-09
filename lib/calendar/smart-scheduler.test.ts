import { describe, it, expect } from 'vitest';
import {
  findOptimalSlot,
  analyzeBusyPatterns,
  suggestMeetingTime,
  SchedulingPreferences,
  BusyPattern,
  TimeSlot,
} from './smart-scheduler';

describe('Smart Scheduler', () => {
  const mockEvents = [
    {
      id: 'evt-1',
      start: new Date('2026-01-10T09:00:00'),
      end: new Date('2026-01-10T10:00:00'),
      title: 'Morning Standup',
    },
    {
      id: 'evt-2',
      start: new Date('2026-01-10T12:00:00'),
      end: new Date('2026-01-10T13:00:00'),
      title: 'Lunch',
    },
    {
      id: 'evt-3',
      start: new Date('2026-01-10T14:00:00'),
      end: new Date('2026-01-10T15:30:00'),
      title: 'Project Review',
    },
  ];

  describe('findOptimalSlot', () => {
    it('should find available slot between meetings', () => {
      const slot = findOptimalSlot({
        duration: 60, // 1 hour
        date: new Date('2026-01-10'),
        events: mockEvents,
      });

      expect(slot).toBeDefined();
      expect(slot!.start.getHours()).toBeGreaterThanOrEqual(9);
      expect(slot!.end.getHours()).toBeLessThanOrEqual(18);
    });

    it('should respect working hours', () => {
      const preferences: SchedulingPreferences = {
        workingHoursStart: 10,
        workingHoursEnd: 16,
      };

      const slot = findOptimalSlot({
        duration: 30,
        date: new Date('2026-01-10'),
        events: mockEvents,
        preferences,
      });

      expect(slot).toBeDefined();
      expect(slot!.start.getHours()).toBeGreaterThanOrEqual(10);
      expect(slot!.end.getHours()).toBeLessThanOrEqual(16);
    });

    it('should return null when no slot is available', () => {
      // Create a date for tomorrow with all-day blocking
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayStart = new Date(tomorrow);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(tomorrow);
      dayEnd.setHours(23, 59, 59, 999);

      const busyDay = [
        { id: '1', start: dayStart, end: dayEnd, title: 'All day busy' },
      ];

      const slot = findOptimalSlot({
        duration: 60,
        date: tomorrow,
        events: busyDay,
      });

      expect(slot).toBeNull();
    });

    it('should prefer morning slots when preference is set', () => {
      const preferences: SchedulingPreferences = {
        preferredTime: 'morning',
      };

      const slot = findOptimalSlot({
        duration: 30,
        date: new Date('2026-01-10'),
        events: mockEvents,
        preferences,
      });

      expect(slot).toBeDefined();
      expect(slot!.start.getHours()).toBeLessThan(12);
    });

    it('should prefer afternoon slots when preference is set', () => {
      // Create a date for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(12, 0, 0, 0);

      // Block morning (9-12), leave afternoon free
      const morningStart = new Date(tomorrow);
      morningStart.setHours(9, 0, 0, 0);

      const morningEnd = new Date(tomorrow);
      morningEnd.setHours(12, 0, 0, 0);

      const morningOnlyEvents = [
        { id: 'evt-1', start: morningStart, end: morningEnd, title: 'Morning block' },
      ];

      const preferences: SchedulingPreferences = {
        preferredTime: 'afternoon',
      };

      const slot = findOptimalSlot({
        duration: 30,
        date: tomorrow,
        events: morningOnlyEvents,
        preferences,
      });

      expect(slot).toBeDefined();
      // Should find a slot (afternoon preference but morning is blocked anyway)
      expect(slot!.start.getHours()).toBeGreaterThanOrEqual(12);
    });

    it('should add buffer time between meetings', () => {
      const preferences: SchedulingPreferences = {
        bufferMinutes: 15,
      };

      const slot = findOptimalSlot({
        duration: 30,
        date: new Date('2026-01-10'),
        events: mockEvents,
        preferences,
      });

      expect(slot).toBeDefined();
      // Slot should not start immediately after another meeting
      const endTimes = mockEvents.map(e => e.end.getTime());
      const slotStartTime = slot!.start.getTime();

      for (const endTime of endTimes) {
        if (slotStartTime >= endTime) {
          expect(slotStartTime - endTime).toBeGreaterThanOrEqual(15 * 60 * 1000);
        }
      }
    });
  });

  describe('analyzeBusyPatterns', () => {
    const weekEvents = [
      // Monday mornings busy
      { id: '1', start: new Date('2026-01-06T09:00:00'), end: new Date('2026-01-06T11:00:00'), title: 'Mon AM' },
      { id: '2', start: new Date('2026-01-13T09:00:00'), end: new Date('2026-01-13T11:00:00'), title: 'Mon AM' },
      // Friday afternoons busy
      { id: '3', start: new Date('2026-01-09T14:00:00'), end: new Date('2026-01-09T17:00:00'), title: 'Fri PM' },
      { id: '4', start: new Date('2026-01-16T14:00:00'), end: new Date('2026-01-16T17:00:00'), title: 'Fri PM' },
    ];

    it('should identify busy patterns', () => {
      const patterns = analyzeBusyPatterns(weekEvents);

      expect(patterns).toBeDefined();
      expect(patterns.length).toBeGreaterThan(0);
    });

    it('should calculate average meeting duration', () => {
      const patterns = analyzeBusyPatterns(weekEvents);
      const summary = patterns.find(p => p.type === 'summary');

      expect(summary).toBeDefined();
      expect(summary!.avgDuration).toBeGreaterThan(0);
    });

    it('should identify peak busy hours', () => {
      const patterns = analyzeBusyPatterns(weekEvents);
      const peakHours = patterns.find(p => p.type === 'peakHours');

      expect(peakHours).toBeDefined();
      expect(peakHours!.hours).toBeDefined();
    });
  });

  describe('suggestMeetingTime', () => {
    it('should suggest multiple time options', () => {
      const suggestions = suggestMeetingTime({
        duration: 30,
        attendeeCalendars: [mockEvents],
        dateRange: {
          start: new Date('2026-01-10'),
          end: new Date('2026-01-12'),
        },
      });

      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.length).toBeLessThanOrEqual(5);
    });

    it('should avoid conflicts for all attendees', () => {
      const attendee1Events = [
        { id: '1', start: new Date('2026-01-10T10:00:00'), end: new Date('2026-01-10T11:00:00'), title: 'A1' },
      ];
      const attendee2Events = [
        { id: '2', start: new Date('2026-01-10T11:00:00'), end: new Date('2026-01-10T12:00:00'), title: 'A2' },
      ];

      const suggestions = suggestMeetingTime({
        duration: 30,
        attendeeCalendars: [attendee1Events, attendee2Events],
        dateRange: {
          start: new Date('2026-01-10'),
          end: new Date('2026-01-10'),
        },
      });

      // All suggestions should not conflict with either attendee
      for (const slot of suggestions) {
        const slotStart = slot.start.getTime();
        const slotEnd = slot.end.getTime();

        for (const event of [...attendee1Events, ...attendee2Events]) {
          const eventStart = event.start.getTime();
          const eventEnd = event.end.getTime();

          // No overlap
          expect(slotStart >= eventEnd || slotEnd <= eventStart).toBe(true);
        }
      }
    });

    it('should rank suggestions by score', () => {
      const suggestions = suggestMeetingTime({
        duration: 30,
        attendeeCalendars: [mockEvents],
        dateRange: {
          start: new Date('2026-01-10'),
          end: new Date('2026-01-12'),
        },
      });

      // Should be sorted by score descending
      for (let i = 1; i < suggestions.length; i++) {
        expect(suggestions[i - 1].score).toBeGreaterThanOrEqual(suggestions[i].score);
      }
    });
  });

  describe('TimeSlot', () => {
    it('should have all required fields', () => {
      const slot: TimeSlot = {
        start: new Date(),
        end: new Date(),
        score: 0.8,
      };

      expect(slot).toHaveProperty('start');
      expect(slot).toHaveProperty('end');
      expect(slot).toHaveProperty('score');
    });
  });

  describe('BusyPattern', () => {
    it('should have all required fields', () => {
      const pattern: BusyPattern = {
        type: 'summary',
        avgDuration: 60,
        totalMeetings: 10,
      };

      expect(pattern).toHaveProperty('type');
    });
  });
});
