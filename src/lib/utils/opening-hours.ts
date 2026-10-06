import { OpeningHourSlot } from "@/types/business";

export interface LiveStatusResult {
  isOpen: boolean;
  statusText: string;
  statusColor: "emerald" | "amber" | "rose";
  nextChangeText?: string;
  todayHoursText?: string;
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Formats "HH:MM" (24h) to "H:MM AM/PM" (12h).
 */
export function formatTime12h(timeStr?: string): string {
  if (!timeStr) return "";
  const parts = timeStr.split(":").map(Number);
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return timeStr;
  const [h, m] = parts;
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m.toString().padStart(2, "0");
  return `${displayH}:${displayM} ${period}`;
}

/**
 * Evaluates real-time open/closed status for a business given its weekly opening hours slots.
 * Supports custom reference date for deterministic testing & simulation.
 */
export function getLiveOpeningStatus(
  openingHours?: OpeningHourSlot[],
  referenceDate: Date = new Date()
): LiveStatusResult {
  if (!openingHours || openingHours.length === 0) {
    return {
      isOpen: true,
      statusText: "Hours not specified",
      statusColor: "amber",
      todayHoursText: "Hours not specified",
    };
  }

  const currentDay = referenceDate.getDay();
  const currentMinutes =
    referenceDate.getHours() * 60 + referenceDate.getMinutes();

  const todaySlot = openingHours.find((slot) => slot.dayOfWeek === currentDay);
  const yesterdaySlot = openingHours.find(
    (slot) => slot.dayOfWeek === (currentDay + 6) % 7
  );

  // 1. Check if we are currently in yesterday's overnight shift (e.g. 18:00 - 02:00, and it's 01:15 AM today)
  if (
    yesterdaySlot &&
    !yesterdaySlot.isClosed &&
    !yesterdaySlot.is24h &&
    yesterdaySlot.openTime &&
    yesterdaySlot.closeTime
  ) {
    const [yOpenH, yOpenM] = yesterdaySlot.openTime.split(":").map(Number);
    const [yCloseH, yCloseM] = yesterdaySlot.closeTime.split(":").map(Number);
    const yOpenMins = yOpenH * 60 + yOpenM;
    const yCloseMins = yCloseH * 60 + yCloseM;

    // Overnight slot from yesterday extending into today's early morning
    if (yCloseMins < yOpenMins && currentMinutes < yCloseMins) {
      const minsUntilClose = yCloseMins - currentMinutes;
      if (minsUntilClose <= 45) {
        return {
          isOpen: true,
          statusText: `Closing soon (${formatTime12h(yesterdaySlot.closeTime)})`,
          statusColor: "amber",
          nextChangeText: `Closes in ${minsUntilClose} min${minsUntilClose === 1 ? "" : "s"}`,
          todayHoursText: todaySlot?.is24h
            ? "Open 24 Hours"
            : todaySlot && !todaySlot.isClosed && todaySlot.openTime && todaySlot.closeTime
            ? `${formatTime12h(todaySlot.openTime)} - ${formatTime12h(todaySlot.closeTime)}`
            : "Closed Today",
        };
      }
      return {
        isOpen: true,
        statusText: `Open until ${formatTime12h(yesterdaySlot.closeTime)}`,
        statusColor: "emerald",
        nextChangeText: `Closes at ${formatTime12h(yesterdaySlot.closeTime)}`,
        todayHoursText: todaySlot?.is24h
          ? "Open 24 Hours"
          : todaySlot && !todaySlot.isClosed && todaySlot.openTime && todaySlot.closeTime
          ? `${formatTime12h(todaySlot.openTime)} - ${formatTime12h(todaySlot.closeTime)}`
          : "Closed Today",
      };
    }
  }

  // 2. Check today's slot
  if (!todaySlot || todaySlot.isClosed) {
    const nextOpen = findNextOpenSlot(openingHours, currentDay, currentMinutes);
    return {
      isOpen: false,
      statusText: nextOpen ? `Closed • ${nextOpen}` : "Closed Today",
      statusColor: "rose",
      todayHoursText: "Closed",
    };
  }

  if (todaySlot.is24h) {
    return {
      isOpen: true,
      statusText: "Open 24 Hours",
      statusColor: "emerald",
      todayHoursText: "Open 24 Hours",
    };
  }

  const [openHour, openMin] = (todaySlot.openTime || "00:00")
    .split(":")
    .map(Number);
  const [closeHour, closeMin] = (todaySlot.closeTime || "00:00")
    .split(":")
    .map(Number);

  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  const todayHoursFormatted = `${formatTime12h(todaySlot.openTime)} - ${formatTime12h(
    todaySlot.closeTime
  )}`;

  // Case A: Standard daytime shift (e.g., 08:00 - 22:00)
  if (closeMinutes > openMinutes) {
    if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
      const minsUntilClose = closeMinutes - currentMinutes;
      if (minsUntilClose <= 45) {
        return {
          isOpen: true,
          statusText: `Closing soon (${formatTime12h(todaySlot.closeTime)})`,
          statusColor: "amber",
          nextChangeText: `Closes in ${minsUntilClose} min${minsUntilClose === 1 ? "" : "s"}`,
          todayHoursText: todayHoursFormatted,
        };
      }
      return {
        isOpen: true,
        statusText: `Open until ${formatTime12h(todaySlot.closeTime)}`,
        statusColor: "emerald",
        todayHoursText: todayHoursFormatted,
      };
    } else if (currentMinutes < openMinutes) {
      const minsUntilOpen = openMinutes - currentMinutes;
      if (minsUntilOpen <= 60) {
        return {
          isOpen: false,
          statusText: `Opens soon (${formatTime12h(todaySlot.openTime)})`,
          statusColor: "amber",
          nextChangeText: `Opens in ${minsUntilOpen} min${minsUntilOpen === 1 ? "" : "s"}`,
          todayHoursText: todayHoursFormatted,
        };
      }
      return {
        isOpen: false,
        statusText: `Closed • Opens at ${formatTime12h(todaySlot.openTime)}`,
        statusColor: "rose",
        todayHoursText: todayHoursFormatted,
      };
    } else {
      const nextOpen = findNextOpenSlot(openingHours, currentDay, currentMinutes);
      return {
        isOpen: false,
        statusText: nextOpen ? `Closed • ${nextOpen}` : "Closed",
        statusColor: "rose",
        todayHoursText: todayHoursFormatted,
      };
    }
  } else {
    // Case B: Overnight shift starting today (e.g. 18:00 - 02:00)
    if (currentMinutes >= openMinutes) {
      return {
        isOpen: true,
        statusText: `Open until ${formatTime12h(todaySlot.closeTime)}`,
        statusColor: "emerald",
        todayHoursText: todayHoursFormatted,
      };
    } else {
      const minsUntilOpen = openMinutes - currentMinutes;
      if (minsUntilOpen <= 60) {
        return {
          isOpen: false,
          statusText: `Opens soon (${formatTime12h(todaySlot.openTime)})`,
          statusColor: "amber",
          nextChangeText: `Opens in ${minsUntilOpen} min${minsUntilOpen === 1 ? "" : "s"}`,
          todayHoursText: todayHoursFormatted,
        };
      }
      return {
        isOpen: false,
        statusText: `Closed • Opens at ${formatTime12h(todaySlot.openTime)}`,
        statusColor: "rose",
        todayHoursText: todayHoursFormatted,
      };
    }
  }
}

/**
 * Finds the humanized next opening slot when currently closed.
 */
function findNextOpenSlot(
  openingHours: OpeningHourSlot[],
  currentDay: number,
  currentMinutes: number
): string | null {
  for (let offset = 1; offset <= 7; offset++) {
    const targetDay = (currentDay + offset) % 7;
    const slot = openingHours.find((s) => s.dayOfWeek === targetDay);

    if (slot && !slot.isClosed) {
      if (slot.is24h) {
        return offset === 1
          ? "Opens tomorrow (24h)"
          : `Opens ${DAYS_SHORT[targetDay]} (24h)`;
      }
      if (slot.openTime) {
        const timeFormatted = formatTime12h(slot.openTime);
        if (offset === 1) return `Opens tomorrow at ${timeFormatted}`;
        return `Opens ${DAYS_SHORT[targetDay]} at ${timeFormatted}`;
      }
    }
  }
  return null;
}

/**
 * Formats a 7-day schedule breakdown for display in business detail pages.
 */
export function getFormattedWeekSchedule(
  openingHours?: OpeningHourSlot[],
  referenceDate: Date = new Date()
): Array<{ day: string; dayShort: string; hours: string; isToday: boolean; isClosed: boolean }> {
  const currentDay = referenceDate.getDay();
  return DAYS.map((dayName, idx) => {
    const slot = openingHours?.find((s) => s.dayOfWeek === idx);
    let hours = "Closed";
    if (slot) {
      if (slot.is24h) {
        hours = "Open 24 Hours";
      } else if (!slot.isClosed && slot.openTime && slot.closeTime) {
        hours = `${formatTime12h(slot.openTime)} - ${formatTime12h(slot.closeTime)}`;
      }
    }
    return {
      day: dayName,
      dayShort: DAYS_SHORT[idx],
      hours,
      isToday: idx === currentDay,
      isClosed: hours === "Closed",
    };
  });
}

/**
 * Quick boolean check if a business is currently open.
 */
export function isBusinessOpen(
  openingHours?: OpeningHourSlot[],
  date: Date = new Date()
): boolean {
  return getLiveOpeningStatus(openingHours, date).isOpen;
}

