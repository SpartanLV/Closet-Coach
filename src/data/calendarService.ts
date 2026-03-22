import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import {
  CalendarPermissionState,
  CalendarService,
  InferredOccasion,
  Occasion,
} from '../types';

const workKeywords = ['meeting', 'client', 'office', 'interview', 'presentation', 'sync'];
const socialKeywords = ['party', 'dinner', 'date', 'wedding', 'birthday', 'hangout', 'brunch'];
const activeKeywords = ['gym', 'run', 'workout', 'yoga', 'training', 'sport', 'pilates'];

export function inferOccasionFromEventTitle(title: string): Occasion {
  const normalizedTitle = title.toLowerCase();

  if (workKeywords.some((keyword) => normalizedTitle.includes(keyword))) {
    return 'Work meeting';
  }
  if (socialKeywords.some((keyword) => normalizedTitle.includes(keyword))) {
    return 'Social';
  }
  if (activeKeywords.some((keyword) => normalizedTitle.includes(keyword))) {
    return 'Active';
  }
  return 'Casual';
}

function mapPermissionStatus(
  status: Calendar.PermissionStatus | 'unavailable',
): CalendarPermissionState {
  if (status === 'unavailable') {
    return 'unavailable';
  }
  if (status === 'granted') {
    return 'granted';
  }
  if (status === 'denied') {
    return 'denied';
  }
  return 'unknown';
}

export async function getCalendarPermissionStatus(): Promise<CalendarPermissionState> {
  if (Platform.OS === 'web') {
    return 'unavailable';
  }

  try {
    const permission = await Calendar.getCalendarPermissionsAsync();
    return mapPermissionStatus(permission.status);
  } catch {
    return 'unknown';
  }
}

export async function requestCalendarPermission(): Promise<CalendarPermissionState> {
  if (Platform.OS === 'web') {
    return 'unavailable';
  }

  try {
    const permission = await Calendar.requestCalendarPermissionsAsync();
    return mapPermissionStatus(permission.status);
  } catch {
    return 'unknown';
  }
}

export const expoCalendarService: CalendarService = {
  async getNextOccasion(): Promise<InferredOccasion | null> {
    if (Platform.OS === 'web') {
      return null;
    }

    try {
      const permission = await Calendar.getCalendarPermissionsAsync();
      if (permission.status !== 'granted') {
        return null;
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      if (!calendars.length) {
        return null;
      }

      const start = new Date();
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      const events = await Calendar.getEventsAsync(
        calendars.map((calendar) => calendar.id),
        start,
        end,
      );
      if (!events.length) {
        return null;
      }

      const nextEvent = events
        .filter((event) => event.startDate)
        .sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
        )[0];

      if (!nextEvent) {
        return null;
      }

      const eventTitle = nextEvent.title?.trim() || 'Upcoming event';
      return {
        occasion: inferOccasionFromEventTitle(eventTitle),
        eventTitle,
        startsAt: new Date(nextEvent.startDate).toISOString(),
      };
    } catch {
      return null;
    }
  },
};

