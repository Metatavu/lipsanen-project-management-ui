import { DateTime, DateTimeUnit, Interval } from "luxon";

/**
 * Splits an interval into a list of durations of the given unit.
 * This function will also take into account the possibly partial unit at the beginning and the end of interval.
 *
 * @param interval The interval to split
 * @param unit The unit to split the interval by
 * @returns A list of durations of the given unit
 * @throws Error if the interval is invalid
 */
export const splitIntervalByDuration = (interval: Interval, unit: DateTimeUnit) => {
  if (!interval.isValid || !interval.start || !interval.end) throw Error("Invalid interval");

  const splitIntervals = interval
    ?.set({ start: interval.start.startOf(unit), end: interval.end?.endOf(unit) })
    .splitBy({ [unit]: 1 });
  splitIntervals[0] = splitIntervals[0].set({ start: interval.start });
  splitIntervals[splitIntervals.length - 1] = splitIntervals[splitIntervals.length - 1].set({ end: interval.end });
  return splitIntervals;
};

/**
 * Get earliest date from a list of dates
 *
 * @param dates dates
 */
export const getEarliestDate = (dates: Date[]) => {
  return dates.reduce((earliest, date) => (date < earliest ? date : earliest), dates[0]);
};

/**
 * Returns valid datetime from given date or throws an error
 *
 * @param date date
 * @returns valid datetime
 * @throws Error if date is invalid
 */
export const getValidDateTimeOrThrow = (date: Date) => {
  const dateTime = DateTime.fromJSDate(date);
  if (!dateTime.isValid) throw Error(`Invalid date ${date}`);
  return dateTime;
};

/**
 * Converts a date string dd.MM.yyyy to a date object
 * 
 * @param dateStr date string in format "dd.MM.yyyy"
 * @returns date JS object
 */
export const parseDDMMYYYY = (dateStr: string) => {
  const [day, month, year] = dateStr.split(".");
  // Create the date at midnight *UTC* so no local offset is applied
  return new Date(Date.UTC(+year, +month - 1, +day));
};

/**
 * Returns the number of whole days between two dates, excluding the end date.
 * 
 * The result is always at least 1, even if the dates are the same.
 *
 * @param a Start date (inclusive)
 * @param b End date (exclusive)
 */
export const differenceInDays = (a: DateTime<true>, b: DateTime<true>) => {
  const interval = Interval.fromDateTimes(a, b);
  return Math.max(interval.count("days") - 1, 1);
};


/**
 * Returns the number of days between two dates, inclusive of both start and end.
 * 
 * Used when calculating estimated durations, where both the start and end dates count as full days.
 * The result is always at least 1.
 *
 * @param a Start date (inclusive)
 * @param b End date (inclusive)
 */
export const differenceInDaysInclusive = (a: DateTime<true>, b: DateTime<true>) => {
  const start = a.startOf("day");
  const end = b.startOf("day");
  const interval = Interval.fromDateTimes(start, end);
  return Math.max(interval.count("days") + 1, 1);
};