import { LinearProgress, Stack, Typography, styled } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { MdiIconifyIconWithBackground } from "components/generic/mdi-icon-with-background";
import { Task, TaskStatus, User } from "generated/client";
import { useListJobPositionsQuery, useListTasksQuery, useListUsersQuery } from "hooks/api-queries";
import { useApi } from "hooks/use-api";
import { Fragment, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TaskWithInterval } from "types";
import { getContrastForegroundColor, hexFromString } from "utils";
import { splitIntervalByDuration } from "utils/date-time-utils";
import { useSetError } from "utils/error-handling";
import {
  distributeOverlappingTasksToRows,
  getTimelineIntervalByTasks,
  groupTasksByOverlap,
  mapTasksAndUsersByUserId,
  renderTaskRows,
  sortTasksByStartTime,
} from "utils/last-planner-utils";
import { TaskRowCell } from "./task-row-cell";

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
    "& th:first-of-type, & td:first-of-type": {
      borderLeft: `1px solid ${theme.palette.grey[300]}`,
    },
  },
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
  shouldForwardProp: (prop) =>
    prop !== "top" && prop !== "left" && prop !== "noLeftBorder" && prop !== "constrainWidth",
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
 * Last planner view component properties
 */
type Props = {
  projectId: string;
  editMode?: boolean;
};

/**
 * Last planner view component
 *
 * @param props component properties
 */
const LastPlannerView = ({ projectId, editMode }: Props) => {
  const navigate = useNavigate({ from: "/projects/$projectId/tasks" });
  const { t } = useTranslation();
  const { tasksApi } = useApi();
  const queryClient = useQueryClient();
  const setError = useSetError();

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
    onError: (error, _, context) => {
      setError(t("errorHandling.errorUpdatingTask"), error);
      queryClient.setQueryData(["projects", projectId, "tasks", {}], context?.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "tasks"] });
    },
  });

  const timelineInterval = useMemo(() => getTimelineIntervalByTasks(tasks), [tasks]);
  const years = useMemo(() => splitIntervalByDuration(timelineInterval, "year"), [timelineInterval]);
  const months = useMemo(() => splitIntervalByDuration(timelineInterval, "month"), [timelineInterval]);
  const weeks = useMemo(() => splitIntervalByDuration(timelineInterval, "week"), [timelineInterval]);
  const days = useMemo(() => splitIntervalByDuration(timelineInterval, "day"), [timelineInterval]);
  const tasksByAssigneeIdMap = useMemo(() => mapTasksAndUsersByUserId(tasks, users), [tasks, users]);

  /**
   * Render user cell
   *
   * @param user user
   * @param rowSpan rowSpan for the cell
   * @returns rendered cell for the user
   */
  const renderUserCell = (user: User, rowSpan?: number) => {
    if (!user.id) return null;

    const jobPosition = jobPositions.find((jobPosition) => jobPosition.id === user.jobPositionId);
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
   * Render table rows for user
   *
   * @param user user
   * @param tasksWithIntervals tasks and their intervals
   * @returns rendered table rows with tasks for the user
   */
  const renderTableRowsForUser = (user: User, tasksWithIntervals: TaskWithInterval[]) => {
    const tasksGroupedByOverlap = groupTasksByOverlap(tasksWithIntervals);
    const tasksGroupedToRows = distributeOverlappingTasksToRows(tasksGroupedByOverlap);
    for (const tasksInRow of tasksGroupedToRows) {
      tasksInRow.sort(sortTasksByStartTime);
    }
    const filledTableRows = tasksGroupedToRows.map(
      renderTaskRows(
        timelineInterval,
        editMode,
        (taskId) => navigate({ to: "$taskId", params: { taskId: taskId } }),
        (task) =>
          updateTaskMutation.mutate({
            ...task,
            status: {
              [TaskStatus.NotStarted]: TaskStatus.InProgress,
              [TaskStatus.InProgress]: TaskStatus.Done,
              [TaskStatus.Done]: TaskStatus.NotStarted,
            }[task.status],
          }),
      ),
    );

    const [firstRow, ...otherRows] = filledTableRows;

    if (!otherRows.length) {
      return (
        <FixedHeightTableRow key={user.id}>
          {renderUserCell(user)}
          {firstRow ?? days?.map((_, i) => <TaskRowCell key={i.toString()} colSpan={1} />)}
        </FixedHeightTableRow>
      );
    }

    return (
      <Fragment key={user.id}>
        <FixedHeightTableRow>
          {renderUserCell(user, filledTableRows.length)}
          {firstRow}
        </FixedHeightTableRow>
        {otherRows.map((row, i) => (
          <FixedHeightTableRow key={i.toString()}>{row}</FixedHeightTableRow>
        ))}
      </Fragment>
    );
  };

  /**
   * Render year cells
   */
  const renderYears = () =>
    years?.map((year, i) => (
      <StickyTableCell key={i.toString()} colSpan={year.count("days")} top={0} align="center" constrainWidth>
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
        top={30}
        style={{ borderLeft: i === 0 ? "none" : undefined }}
      >
        {month.start?.monthLong}
      </StickyTableCell>
    ));

  /**
   * Render week cells
   */
  const renderWeeks = () =>
    weeks?.map((week, i) => (
      <StickyTableCell
        key={i.toString()}
        colSpan={week.count("days")}
        constrainWidth
        align="center"
        top={60}
        style={{ borderLeft: i === 0 ? "none" : undefined }}
      >
        <Typography textOverflow="ellipsis" noWrap>
          {t("lastPlannerView.week")} {week.start?.weekNumber}
        </Typography>
      </StickyTableCell>
    ));

  /**
   * Render day cells
   */
  const renderDays = () =>
    days?.map((day, i) => (
      <StickyTableCell key={i.toString()} constrainWidth align="center" top={90}>
        {day.start?.day}
      </StickyTableCell>
    ));

  if (!listTasksQuery.data || !listProjectUsersQuery.data) {
    return <LinearProgress sx={{ height: 2 }} />;
  }

  /**
   * Component render
   */
  return (
    <LastPlannerTableWrapper>
      <table style={{ borderCollapse: "separate" }}>
        <thead>
          <FixedHeightTableRow style={{ height: 30 }}>
            <StickyTableCell rowSpan={4} top={0} left={0} style={{ verticalAlign: "bottom", zIndex: 3 }}>
              <Typography component="h3" variant="body2" fontWeight="bold" mb={1} ml={2}>
                {t("lastPlannerView.user")}
              </Typography>
            </StickyTableCell>
            {renderYears()}
          </FixedHeightTableRow>
          <FixedHeightTableRow style={{ height: 30 }}>{renderMonths()}</FixedHeightTableRow>
          <FixedHeightTableRow style={{ height: 30 }}>{renderWeeks()}</FixedHeightTableRow>
          <FixedHeightTableRow style={{ height: 30 }}>{renderDays()}</FixedHeightTableRow>
        </thead>
        <tbody>
          {users.map((user) =>
            user.id ? renderTableRowsForUser(user, tasksByAssigneeIdMap.get(user.id)?.tasks ?? []) : null,
          )}
        </tbody>
      </table>
    </LastPlannerTableWrapper>
  );
};

export default LastPlannerView;
