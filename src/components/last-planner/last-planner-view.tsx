import { DndContext, type DragEndEvent, useDroppable } from "@dnd-kit/core";
import { FormControlLabel, LinearProgress, Stack, styled, Switch, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { MdiIconifyIconWithBackground } from "components/generic/mdi-icon-with-background";
import { NON_WORKING_DAY_COLOR, TODAY_HIGHLIGHT_COLOR } from "consts";
import { type JobPosition, type Task, TaskStatus, type User } from "generated/client";
import { useListJobPositionsQuery, useListTasksQuery, useListUsersQuery } from "hooks/api-queries";
import { useApi } from "hooks/use-api";
import { DateTime, type Interval } from "luxon";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { TaskWithInterval } from "types";
import { getContrastForegroundColor, hexFromString } from "utils";
import { getFinnishHolidaysForRange, splitIntervalByDuration } from "utils/date-time-utils";
import { useSetError } from "utils/error-handling";
import {
  distributeOverlappingTasksToRows,
  getApiErrorMessageAsync,
  getApiStatus,
  getTimelineIntervalByTasks,
  groupTasksByOverlap,
  mapTasksAndUsersByUserId,
  parseTaskDependencyConflict,
  renderTaskRows,
  sortTasksByStartTime,
} from "utils/last-planner-utils";
import { TaskRowCell } from "./task-row-cell";

const TOOLBAR_HEIGHT = 50;
const HEADER_ROW_HEIGHT = 30;
const CELL_WIDTH = 40;

/**
 * Styled wrapper element for the last planner table
 */
const LastPlannerTableWrapper = styled("div")(({ theme }) => ({
  position: "relative",
  paddingBottom: theme.spacing(2),
  "& table": {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    "& th": {
      borderTop: `1px solid ${theme.palette.grey[300]}`,
      borderBottom: `1px solid ${theme.palette.grey[300]}`,
      borderRight: `1px solid ${theme.palette.grey[300]}`,
    },
    "& td": {
      borderBottom: `1px solid ${theme.palette.grey[300]}`,
      borderRight: `1px solid ${theme.palette.grey[300]}`,
    },
  },
}));

const StyledToolbar = styled(Stack)(({ theme }) => ({
  height: TOOLBAR_HEIGHT,
  flexDirection: "row",
  alignItems: "center",
  gap: theme.spacing(2),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(1),
  position: "sticky",
  top: 0,
  left: 0,
  zIndex: 4,
  backgroundColor: theme.palette.grey[100],
  borderBottom: "1px solid",
  borderColor: theme.palette.divider,
}));

/**
 * Styled table row with fixed height
 */
const FixedHeightTableRow = styled("tr")({ height: 50 });

/**
 * Props for the sticky table cell
 */
type StickyTableCellProps = {
  top?: number;
  left?: number;
  colSpan?: number;
  constrainWidth?: boolean;
};

/**
 * Styled sticky table cell element
 */
const StickyTableCell = styled("td", {
  shouldForwardProp: (prop) => prop !== "top" && prop !== "left" && prop !== "constrainWidth",
})<StickyTableCellProps>(({ top, left, colSpan = 1, constrainWidth = false }) => ({
  position: "sticky",
  top: top,
  left: left,
  backgroundColor: "white",
  minWidth: 40,
  maxWidth: constrainWidth ? 40 * colSpan : undefined,
  verticalAlign: "middle",
  overflow: "hidden",
  textOverflow: "ellipsis",
  zIndex: 1,
}));

/**
 * Render user cell with job position icon and name
 *
 * @param user User
 * @param jobPositions JobPosition list
 * @param rowSpan number
 */
const renderUserCell = (user: User, jobPositions: JobPosition[], rowSpan?: number) => {
  if (!user.id) return null;

  const jobPosition = jobPositions.find((jp) => jp.id === user.jobPositionId);
  const backgroundColor = hexFromString(user.id);
  const foregroundColor = getContrastForegroundColor(backgroundColor);

  return (
    <StickyTableCell rowSpan={rowSpan} style={{ left: 0, zIndex: 2 }}>
      <Stack direction="row" alignItems="center" gap={2} px={2} textOverflow="ellipsis">
        <MdiIconifyIconWithBackground
          iconName={jobPosition?.iconName}
          backgroundColor={backgroundColor}
          color={foregroundColor}
        />
        <Typography noWrap>
          {user.firstName} {user.lastName}
        </Typography>
      </Stack>
    </StickyTableCell>
  );
};

/**
 * Props for user rows component
 */
type UserRowsProps = {
  user: User;
  tasksWithIntervals: TaskWithInterval[];
  timelineInterval: Interval<true>;
  editMode?: boolean;
  dragMode?: boolean;
  days: Interval[] | undefined;
  jobPositions: JobPosition[];
  onTaskClick: (taskId: string) => void;
  onSwitchTaskStatus: (task: Task) => void;
  nonWorkingDayFlags: boolean[];
  todayIndex: number;
};

/**
 * User rows component
 *
 * @param props UserRowsProps
 */
const UserRows = ({
  user,
  tasksWithIntervals,
  timelineInterval,
  editMode,
  dragMode,
  days,
  jobPositions,
  onTaskClick,
  onSwitchTaskStatus,
  nonWorkingDayFlags,
  todayIndex,
}: UserRowsProps) => {
  const { setNodeRef } = useDroppable({
    id: `user-${user.id}`,
    data: { userId: user.id },
  });

  const tasksGroupedByOverlap = groupTasksByOverlap(tasksWithIntervals);
  const tasksGroupedToRows = distributeOverlappingTasksToRows(tasksGroupedByOverlap);
  for (const tasksInRow of tasksGroupedToRows) {
    tasksInRow.sort(sortTasksByStartTime);
  }

  const filledTableRows = tasksGroupedToRows.map(
    renderTaskRows(timelineInterval, editMode, onTaskClick, onSwitchTaskStatus, nonWorkingDayFlags, todayIndex, {
      enableDrag: !!dragMode,
      assigneeId: user.id as string,
    }),
  );

  const [firstRow, ...otherRows] = filledTableRows;

  if (!otherRows.length) {
    return (
      <FixedHeightTableRow ref={setNodeRef}>
        {renderUserCell(user, jobPositions)}
        {firstRow ??
          days?.map((_, i) => (
            <TaskRowCell
              key={i.toString()}
              colSpan={1}
              isNonWorkingDay={nonWorkingDayFlags[i]}
              isToday={i === todayIndex}
            />
          ))}
      </FixedHeightTableRow>
    );
  }

  return (
    <>
      <FixedHeightTableRow ref={setNodeRef}>
        {renderUserCell(user, jobPositions, filledTableRows.length)}
        {firstRow}
      </FixedHeightTableRow>
      {otherRows.map((row, i) => (
        <FixedHeightTableRow key={i.toString()}>{row}</FixedHeightTableRow>
      ))}
    </>
  );
};

/**
 * Converts a Luxon DateTime to a JS Date that represents the same calendar day in UTC.
 *
 * Used when persisting `startDate` / `endDate` so we avoid timezone drift (e.g. local midnight -> previous/next day UTC).
 *
 * @param dt - DateTime
 * @returns A JS Date at 00:00:00 UTC for that calendar day.
 */
const toUtcDateOnly = (dt: DateTime) => new Date(Date.UTC(dt.year, dt.month - 1, dt.day));

/**
 * Last planner view component properties
 */
type Props = {
  projectId: string;
  editMode?: boolean;
  setEditMode?: (editMode: boolean) => void;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  dragMode?: boolean;
  setDragMode?: (dragMode: boolean) => void;
};

/**
 * Last planner view component
 *
 * @param props component properties
 */
const LastPlannerView = ({ projectId, editMode, setEditMode, dragMode, setDragMode, scrollContainerRef }: Props) => {
  const navigate = useNavigate({ from: "/projects/$projectId/tasks" });
  const { t } = useTranslation();
  const { tasksApi } = useApi();
  const queryClient = useQueryClient();
  const setError = useSetError();
  const didAutoScrollRef = useRef(false);

  const listTasksQuery = useListTasksQuery({ projectId });
  const tasks = useMemo(() => listTasksQuery.data ?? [], [listTasksQuery.data]);
  const listProjectUsersQuery = useListUsersQuery({ projectId });
  const users = useMemo(() => listProjectUsersQuery.data?.users ?? [], [listProjectUsersQuery.data]);
  const jobPositionsQuery = useListJobPositionsQuery({ max: 9999 });
  const jobPositions = useMemo(() => jobPositionsQuery.data?.jobPositions ?? [], [jobPositionsQuery.data]);

  const updateTaskMutation = useMutation({
    mutationFn: (task: Task) => tasksApi.updateTask({ taskId: task.id as string, task: task }),
    onMutate: async (taskToUpdate) => {
      const queryKey = ["projects", projectId, "tasks", {}];
      await queryClient.cancelQueries({ queryKey });
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey);
      const updatedTasks = previousTasks?.map((task) => (task.id === taskToUpdate.id ? taskToUpdate : task));
      queryClient.setQueryData<Task[]>(queryKey, updatedTasks);
      return { previousTasks };
    },
    onError: async (error, _, context) => {
      const status = getApiStatus(error);
      const apiMessage = await getApiErrorMessageAsync(error);

      if (status === 409 && apiMessage) {
        const parsed = parseTaskDependencyConflict(apiMessage);
        if (parsed) {
          const key =
            parsed.kind === "FINISH_TO_START"
              ? "errorHandling.taskDependencyFinishToStart"
              : parsed.kind === "START_TO_START"
                ? "errorHandling.taskDependencyStartToStart"
                : "errorHandling.taskDependencyFinishToFinish";

          setError(
            t("errorHandling.taskBlockedByDependenciesTitle"),
            new Error(t(key, { source: parsed.source, target: parsed.target })),
          );
        } else {
          setError(t("errorHandling.taskBlockedByDependenciesTitle"), new Error(apiMessage));
        }
      } else {
        setError(t("errorHandling.errorUpdatingTask"), error);
      }
      queryClient.setQueryData(["projects", projectId, "tasks", {}], context?.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const timelineInterval = useMemo(() => getTimelineIntervalByTasks(tasks), [tasks]);
  const years = useMemo(() => splitIntervalByDuration(timelineInterval, "year"), [timelineInterval]);
  const months = useMemo(() => splitIntervalByDuration(timelineInterval, "month"), [timelineInterval]);
  const weeks = useMemo(() => splitIntervalByDuration(timelineInterval, "week"), [timelineInterval]);
  const days = useMemo(() => splitIntervalByDuration(timelineInterval, "day"), [timelineInterval]);
  const todayIndex = useMemo(() => {
    if (!days?.length) return -1;
    const today = DateTime.now();
    return days.findIndex((day) => day.contains(today));
  }, [days]);
  const tasksByAssigneeIdMap = useMemo(() => mapTasksAndUsersByUserId(tasks, users), [tasks, users]);

  const holidays = useMemo(() => {
    if (!timelineInterval.start || !timelineInterval.end) {
      return [];
    }

    return getFinnishHolidaysForRange(timelineInterval.start, timelineInterval.end);
  }, [timelineInterval]);

  const nonWorkingDayFlags = useMemo(() => {
    if (!days?.length) return [];

    return days.map((day) => {
      const date = day.start;
      if (!date) return false;

      // Weekend (Sat = 6 / Sun = 7)
      const isWeekend = date.weekday === 6 || date.weekday === 7;

      const isHoliday = holidays.some((h) => DateTime.fromJSDate(h).hasSame(date, "day"));

      return isWeekend || isHoliday;
    });
  }, [days, holidays]);

  /**
   * Handles drag end for tasks.
   *
   * - Horizontal movement snaps to day columns and updates start/end dates.
   * - Vertical drop onto a user row updates `assigneeIds` only for single-assignee tasks.
   * - No-ops if nothing actually changed or the drop target isn't a user row.
   */
  const handleDragEnd = (event: DragEndEvent) => {
    if (!dragMode) return;

    const { active, over, delta } = event;

    const dragData = active.data.current as
      | {
          taskId: string;
          assigneeId: string;
          startDayIndex: number;
          durationDays: number;
          assigneeIds: string[];
        }
      | undefined;

    if (!dragData) return;

    const task = tasks.find((t) => t.id === dragData.taskId);
    if (!task || !days?.length) return;

    // Horizontal shift = date change
    const deltaDays = Math.round(delta.x / CELL_WIDTH);

    const originalStartIndex = dragData.startDayIndex;
    const duration = dragData.durationDays;
    const maxStartIndex = days.length - duration;

    let newStartIndex = originalStartIndex + deltaDays;
    if (newStartIndex < 0) newStartIndex = 0;
    if (newStartIndex > maxStartIndex) newStartIndex = maxStartIndex;

    const startInterval = days[newStartIndex];
    if (!startInterval?.start) return;

    const newStartDay = startInterval.start.startOf("day");
    const newEndDay = newStartDay.plus({ days: duration - 1 });

    // Vertical move = new assignee based on droppable user row
    const overData = over?.data.current as { userId?: string } | undefined;
    const dropUserId = overData?.userId;
    if (!dropUserId) return;

    // default: preserve existing assignees
    let nextAssigneeIds = dragData.assigneeIds?.length ? [...dragData.assigneeIds] : [...(task.assigneeIds ?? [])];

    // Only allow vertical (user) change if the task is single-assignee
    const isSingleAssignee = nextAssigneeIds.length <= 1;
    let didAssigneeChange = false;
    if (isSingleAssignee && dropUserId) {
      // Only change if actually dropped onto a different user row
      if (nextAssigneeIds[0] !== dropUserId) {
        nextAssigneeIds = [dropUserId];
        didAssigneeChange = true;
      }
    }

    if (deltaDays === 0 && !didAssigneeChange) return; // No change = no-op

    const updatedTask: Task = {
      ...task,
      startDate: toUtcDateOnly(newStartDay),
      endDate: toUtcDateOnly(newEndDay),
      assigneeIds: nextAssigneeIds,
    };

    updateTaskMutation.mutate(updatedTask);
  };

  // Scroll table to current day
  useEffect(() => {
    const el = scrollContainerRef?.current;
    if (!el) return;

    if (todayIndex < 0) return;

    // Only autoscroll once (prevents scroll after drag/drop updates)
    if (didAutoScrollRef.current) return;
    didAutoScrollRef.current = true;

    const cellWidth = CELL_WIDTH;
    const wrapperWidth = el.clientWidth;
    const scrollOffset = todayIndex * cellWidth - wrapperWidth / 2 + cellWidth * 3.5;

    el.scrollLeft = scrollOffset;
  }, [todayIndex, scrollContainerRef]);

  /**
   * Render year cells
   */
  const renderYears = () =>
    years?.map((year, i) => (
      <StickyTableCell
        key={i.toString()}
        colSpan={year.count("days")}
        top={TOOLBAR_HEIGHT}
        align="center"
        constrainWidth
      >
        {year.start?.year}
      </StickyTableCell>
    ));

  /**
   * Render month cells
   */
  const renderMonths = () =>
    months?.map((month, i) => (
      <StickyTableCell
        key={i.toString()}
        colSpan={month.count("days")}
        constrainWidth
        align="center"
        top={TOOLBAR_HEIGHT + HEADER_ROW_HEIGHT}
      >
        {month.start?.monthLong}
      </StickyTableCell>
    ));

  /**
   * Render week cells
   */
  const renderWeeks = () => {
    const today = DateTime.now();
    return weeks?.map((week, i) => {
      const isCurrentWeek = week.contains(today);
      return (
        <StickyTableCell
          key={i.toString()}
          colSpan={week.count("days")}
          constrainWidth
          align="center"
          top={TOOLBAR_HEIGHT + HEADER_ROW_HEIGHT * 2}
          style={{ backgroundColor: isCurrentWeek ? TODAY_HIGHLIGHT_COLOR : undefined }}
        >
          <Typography textOverflow="ellipsis" noWrap>
            {t("lastPlannerView.week")} {week.start?.weekNumber}
          </Typography>
        </StickyTableCell>
      );
    });
  };

  /**
   * Render day cells
   */
  const renderDays = () => {
    const today = DateTime.now();

    return days?.map((day, i) => {
      const isNonWorkingDay = nonWorkingDayFlags[i];
      const isToday = day.contains(today);

      let backgroundColor: string | undefined;

      if (isToday) {
        backgroundColor = TODAY_HIGHLIGHT_COLOR;
      } else if (isNonWorkingDay) {
        backgroundColor = NON_WORKING_DAY_COLOR;
      }

      return (
        <StickyTableCell
          key={i.toString()}
          constrainWidth
          align="center"
          top={TOOLBAR_HEIGHT + HEADER_ROW_HEIGHT * 3}
          style={{ backgroundColor }}
        >
          {day.start?.day}
        </StickyTableCell>
      );
    });
  };

  if (!listTasksQuery.data || !listProjectUsersQuery.data) {
    return <LinearProgress sx={{ height: 2 }} />;
  }

  /**
   * Component render
   */
  return (
    <>
      <StyledToolbar>
        <Typography component="h2" variant="h5" mr="auto">
          {t("lastPlannerView.title")}
        </Typography>
        <FormControlLabel
          control={<Switch checked={editMode} onChange={(event) => setEditMode?.(event.target.checked)} />}
          label={t("lastPlannerView.markTasks")}
        />
        <FormControlLabel
          control={<Switch checked={dragMode} onChange={(event) => setDragMode?.(event.target.checked)} />}
          label={t("lastPlannerView.dragTasks")}
        />
      </StyledToolbar>
      <DndContext onDragEnd={handleDragEnd}>
        <LastPlannerTableWrapper>
          <table style={{ borderCollapse: "separate" }}>
            <thead>
              <FixedHeightTableRow style={{ height: HEADER_ROW_HEIGHT }}>
                <StickyTableCell
                  rowSpan={4}
                  top={TOOLBAR_HEIGHT}
                  left={0}
                  style={{ verticalAlign: "bottom", zIndex: 3 }}
                >
                  <Typography component="h3" variant="body2" fontWeight="bold" mb={1} ml={2}>
                    {t("lastPlannerView.user")}
                  </Typography>
                </StickyTableCell>
                {renderYears()}
              </FixedHeightTableRow>
              <FixedHeightTableRow style={{ height: HEADER_ROW_HEIGHT }}>{renderMonths()}</FixedHeightTableRow>
              <FixedHeightTableRow style={{ height: HEADER_ROW_HEIGHT }}>{renderWeeks()}</FixedHeightTableRow>
              <FixedHeightTableRow style={{ height: HEADER_ROW_HEIGHT }}>{renderDays()}</FixedHeightTableRow>
            </thead>
            <tbody>
              {users.map((user) =>
                user.id ? (
                  <UserRows
                    key={user.id}
                    user={user}
                    tasksWithIntervals={tasksByAssigneeIdMap.get(user.id)?.tasks ?? []}
                    timelineInterval={timelineInterval}
                    editMode={editMode}
                    dragMode={dragMode}
                    days={days}
                    jobPositions={jobPositions}
                    onTaskClick={(taskId) => navigate({ to: "$taskId", params: { taskId } })}
                    onSwitchTaskStatus={(task) =>
                      updateTaskMutation.mutate({
                        ...task,
                        status: {
                          [TaskStatus.NotStarted]: TaskStatus.InProgress,
                          [TaskStatus.InProgress]: TaskStatus.Done,
                          [TaskStatus.Done]: TaskStatus.NotStarted,
                        }[task.status],
                      })
                    }
                    nonWorkingDayFlags={nonWorkingDayFlags}
                    todayIndex={todayIndex}
                  />
                ) : null,
              )}
            </tbody>
          </table>
        </LastPlannerTableWrapper>
      </DndContext>
    </>
  );
};

export default LastPlannerView;
