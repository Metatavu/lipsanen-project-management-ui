import { TaskRowCell } from "components/last-planner/task-row-cell";
import { Task, User } from "generated/client";
import { DateTime, Interval } from "luxon";
import { TaskWithInterval, UserWithTasks } from "types";

/**
 * Get the timeline interval by tasks. The interval will be from one day earlier of
 * the earliest start date to one day later than the latest end date. If there are
 * no tasks, the interval will be the current date.
 *
 * @param tasks the tasks
 * @returns the timeline interval
 */
export const getTimelineIntervalByTasks = (tasks: Task[]) => {
  if (!tasks.length) return Interval.fromDateTimes(new Date(), new Date()) as Interval<true>;

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
 */
export const distributeOverlappingTasksToRows = (tasksByOverlap: TaskWithInterval[][]) =>
  tasksByOverlap.reduce<TaskWithInterval[][]>((rows, tasksWithInterval) => {
    tasksWithInterval.forEach((task, index) => {
      rows[index] = [...(rows[index] || []), task];
    });

    return rows;
  }, []);

export const sortTasksByStartTime = (a: TaskWithInterval, b: TaskWithInterval) =>
  a.interval.start.toMillis() - b.interval.start.toMillis();

/**
 * Fill the gaps between tasks in a row with empty cells. This is necessary to render the tasks in a row properly.
 *
 * @param timelineInterval the interval that wraps the tasks
 * @param tasksInRow the tasks in the row
 */
export const renderTaskRows =
  (
    timelineInterval: Interval<true>,
    editMode: boolean | undefined,
    onTaskClick: (taskId: string) => void,
    onSwitchTaskStatus: (task: Task) => void,
  ) =>
  (tasksInRow: TaskWithInterval[]) => {
    const filledRow = [];

    for (let i = 0; i < tasksInRow.length; i++) {
      const previousTask = i > 0 ? tasksInRow[i - 1] : undefined;
      const currentTaskData = tasksInRow[i];
      const isLastTask = i === tasksInRow.length - 1;

      if (!previousTask) {
        const daysBetweenStartAndTaskStart = currentTaskData.interval.start.diff(timelineInterval.start, "days").days;
        for (let j = 0; j < daysBetweenStartAndTaskStart; j++)
          filledRow.push(
            <TaskRowCell key={`leading-${j}`} colSpan={1} cellStyle={{ borderLeft: j === 0 ? "none" : undefined }} />,
          );
      } else {
        const daysBetweenTasks = currentTaskData.interval.start.diff(previousTask.interval.end, "days").days - 1;
        for (let j = 0; j < daysBetweenTasks; j++) filledRow.push(<TaskRowCell key={`middle-${i}-${j}`} colSpan={1} />);
      }

      filledRow.push(
        <TaskRowCell
          key={currentTaskData.task.id as string}
          colSpan={currentTaskData.interval.count("days")}
          task={currentTaskData.task}
          editMode={editMode}
          onTaskClick={(task) => onTaskClick(task.id as string)}
          onSwitchTaskStatus={(task) => onSwitchTaskStatus(task)}
        />,
      );

      if (isLastTask) {
        const daysBetweenTaskEndAndTimelineEnd = timelineInterval.end.diff(currentTaskData.interval.end, "days").days;

        for (let j = 0; j < daysBetweenTaskEndAndTimelineEnd; j++)
          filledRow.push(<TaskRowCell key={`trailing-${j}`} colSpan={1} />);
      }
    }

    return filledRow;
  };

const mapUsersToUserWithTasks = (users: User[]) => {
  const usersWithTasks = new Map<string, UserWithTasks>();
  for (const user of users) {
    if (!user.id) throw Error("User ID is missing.");
    usersWithTasks.set(user.id, { user: user, tasks: [] });
  }
  return usersWithTasks;
};

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
