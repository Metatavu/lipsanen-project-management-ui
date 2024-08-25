import { DateTimeUnit, Interval } from "luxon";

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

  const durations = interval
    ?.set({ start: interval.start.startOf(unit), end: interval.end?.endOf(unit) })
    .splitBy({ [unit]: 1 });
  durations[0] = durations[0].set({ start: interval.start });
  durations[durations.length - 1] = durations[durations.length - 1].set({ end: interval.end });
  return durations;
};

export const getEarliestDate = (dates: Date[]) => {
  return dates.reduce((earliest, date) => (date < earliest ? date : earliest), dates[0]);
};
