import { TaskRowCell } from "components/last-planner/task-row-cell";
import type { Task, User } from "generated/client";
import { DateTime, Interval } from "luxon";
import type { TaskWithInterval, UserWithTasks } from "types";

/**
 * Get the timeline interval by tasks. The interval will be from one day earlier of
 * the earliest start date to one day later than the latest end date. If there are
 * no tasks, the interval will be the current date.
 *
 * @param tasks the tasks
 * @returns the timeline interval
 */
export const getTimelineIntervalByTasks = (tasks: Task[]) => {
  // If the tasks list is empty, return the current week interval
  if (!tasks.length) {
    const startOfWeek = DateTime.now().startOf("week");
    const endOfWeek = DateTime.now().endOf("week");
    return Interval.fromDateTimes(startOfWeek, endOfWeek) as Interval<true>;
  }

  // If we wanted to ensure the current date is always rendered and therefore scrolled to we could do it here.
  const [earliestStartDate, latestEndDate] = tasks.reduce<[Date, Date]>(
    (dates, task) => {
      if (!task.startDate || !task.endDate) return dates;
      if (task.startDate < dates[0]) dates[0] = task.startDate;
      if (task.endDate > dates[1]) dates[1] = task.endDate;
      return dates;
    },
    [tasks[0].startDate, tasks[0].endDate],
  );

  return Interval.fromDateTimes(
    DateTime.fromJSDate(earliestStartDate).startOf("day").minus({ days: 1 }),
    DateTime.fromJSDate(latestEndDate).endOf("day").plus({ days: 1 }),
  ) as Interval<true>;
};

/**
 * Group tasks by overlap. Each group will contain tasks that overlap with each other.
 *
 * @param tasksWithIntervals list of tasks with their intervals
 */
export const groupTasksByOverlap = (tasksWithIntervals: TaskWithInterval[]) =>
  tasksWithIntervals.reduce<TaskWithInterval[][]>((groupedTasksWithIntervals, taskWithInterval) => {
    for (let i = 0; i < groupedTasksWithIntervals.length; i++) {
      const comparedTasks = groupedTasksWithIntervals[i];

      const taskOverlapsWithTasksInGroup = comparedTasks.some(({ interval: comparedInterval }) =>
        taskWithInterval.interval.overlaps(comparedInterval),
      );

      if (taskOverlapsWithTasksInGroup) {
        comparedTasks.push(taskWithInterval);
        return groupedTasksWithIntervals;
      }
    }

    groupedTasksWithIntervals.push([taskWithInterval]);
    return groupedTasksWithIntervals;
  }, []);

/**
 * Distribute overlapping tasks to rows. Each row will only contain tasks that do not overlap with each other.
 *
 * @param tasksByOverlap the tasks grouped by overlap
 */
export const distributeOverlappingTasksToRows = (tasksByOverlap: TaskWithInterval[][]) =>
  tasksByOverlap.reduce<TaskWithInterval[][]>((rows, tasksWithInterval) => {
    tasksWithInterval.forEach((task, index) => {
      rows[index] = [...(rows[index] || []), task];
    });

    return rows;
  }, []);

/**
 * Sort tasks by start time
 *
 * @param a task A
 * @param b task B
 */
export const sortTasksByStartTime = (a: TaskWithInterval, b: TaskWithInterval) =>
  a.interval.start.toMillis() - b.interval.start.toMillis();

/**
 * Fill the gaps between tasks in a row with empty cells. This is necessary to render the tasks in a row properly.
 *
 * @param timelineInterval the interval that wraps the tasks
 * @param editMode whether the tasks are in edit mode
 * @param onTaskClick the task click handler
 * @param onSwitchTaskStatus the task status switch handler
 * @param nonWorkingDayFlags flags indicating non-working days
 * @param todayIndex the index of today's date in the timeline interval
 */
export const renderTaskRows =
  (
    timelineInterval: Interval<true>,
    editMode: boolean | undefined,
    onTaskClick: (taskId: string) => void,
    onSwitchTaskStatus: (task: Task) => void,
    nonWorkingDayFlags: boolean[],
    todayIndex: number,
  ) =>
  (tasksInRow: TaskWithInterval[]) => {
    const filledRow = [];

    // Convert a DateTime to "day index since timeline start"
    const dayIndexFromTimelineStart = (date: DateTime) =>
      Math.floor(date.startOf("day").diff(timelineInterval.start.startOf("day"), "days").days);

    for (let i = 0; i < tasksInRow.length; i++) {
      const previousTask = i > 0 ? tasksInRow[i - 1] : undefined;
      const currentTaskData = tasksInRow[i];
      const isLastTask = i === tasksInRow.length - 1;

      const taskStartIndex = dayIndexFromTimelineStart(currentTaskData.interval.start);
      const taskEndIndex = dayIndexFromTimelineStart(currentTaskData.interval.end);
      const taskLength = taskEndIndex - taskStartIndex + 1;

      // Empty cells before the first task in this row
      if (!previousTask) {
        for (let dayIndex = 0; dayIndex < taskStartIndex; dayIndex++) {
          filledRow.push(
            <TaskRowCell
              key={`leading-${dayIndex}`}
              colSpan={1}
              cellStyle={dayIndex === 0 ? { borderLeft: "none" } : undefined}
              isNonWorkingDay={nonWorkingDayFlags[dayIndex] ?? false}
              isToday={dayIndex === todayIndex}
            />,
          );
        }
      } else {
        // Empty cells between previous task and this task
        const prevTaskEndIndex = dayIndexFromTimelineStart(previousTask.interval.end);

        for (let dayIndex = prevTaskEndIndex + 1; dayIndex < taskStartIndex; dayIndex++) {
          filledRow.push(
            <TaskRowCell
              key={`middle-${i}-${dayIndex}`}
              colSpan={1}
              isNonWorkingDay={nonWorkingDayFlags[dayIndex] ?? false}
              isToday={dayIndex === todayIndex}
            />,
          );
        }
      }

      // The task cell itself (can span multiple days)- no background color for non-working days
      filledRow.push(
        <TaskRowCell
          key={currentTaskData.task.id as string}
          colSpan={taskLength}
          task={currentTaskData.task}
          editMode={editMode}
          onTaskClick={(task) => onTaskClick(task.id as string)}
          onSwitchTaskStatus={(task) => onSwitchTaskStatus(task)}
        />,
      );

      // Empty cells after the last task in the row
      if (isLastTask) {
        const lastTaskEndIndex = taskEndIndex;
        const totalDays = nonWorkingDayFlags.length;

        for (let dayIndex = lastTaskEndIndex + 1; dayIndex < totalDays; dayIndex++) {
          filledRow.push(
            <TaskRowCell
              key={`trailing-${dayIndex}`}
              colSpan={1}
              isNonWorkingDay={nonWorkingDayFlags[dayIndex] ?? false}
              isToday={dayIndex === todayIndex}
            />,
          );
        }
      }
    }

    return filledRow;
  };

/**
 * Map users to user with tasks
 *
 * @param users the users
 * @returns the users with empty task lists
 */
const mapUsersToUserWithTasks = (users: User[]) => {
  const usersWithTasks = new Map<string, UserWithTasks>();
  for (const user of users) {
    if (!user.id) throw Error("User ID is missing.");
    usersWithTasks.set(user.id, { user: user, tasks: [] });
  }
  return usersWithTasks;
};

/**
 * Map tasks and users by user ID
 *
 * @param tasks the tasks
 * @param users the users
 * @returns the users with their tasks
 */
export const mapTasksAndUsersByUserId = (tasks: Task[], users: User[]) =>
  tasks?.reduce((acc, task) => {
    for (const userId of task.assigneeIds || []) {
      acc.get(userId)?.tasks.push({
        task: task,
        interval: Interval.fromDateTimes(
          DateTime.fromJSDate(task.startDate).startOf("day"),
          DateTime.fromJSDate(task.endDate).endOf("day"),
        ) as Interval<true>,
      });
    }

    return acc;
  }, mapUsersToUserWithTasks(users));
