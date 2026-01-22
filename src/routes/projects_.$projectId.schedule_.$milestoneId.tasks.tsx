import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import {
  Avatar,
  Box,
  Card,
  FormControlLabel,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FlexColumnLayout } from "components/generic/flex-column-layout";
import GanttViewModesSlider from "components/generic/gantt-view-mode-slider";
import JobPositionAvatar from "components/generic/job-position-avatar";
import LoadingTableCell from "components/generic/loading-table-cell";
import ProgressBadge from "components/generic/progress-badge";
import ChangeProposalsDrawer from "components/tasks/change-proposals-drawer";
import NewTaskButton from "components/tasks/new-task-button";
import TaskDialog from "components/tasks/task-dialog";
import { GANTT_MEASUREMENTS } from "consts";
import {
  ChangeProposalStatus,
  type Task,
  type TaskConnection,
  type UpdateTaskRequest,
  type User,
} from "generated/client";
import {
  useFindProjectMilestoneQuery,
  useListChangeProposalsQuery,
  useListJobPositionsQuery,
  useListTaskConnectionsQuery,
  useListTasksQuery,
  useListUsersQuery,
} from "hooks/api-queries";
import { useApi } from "hooks/use-api";
import { DateTime } from "luxon";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { theme } from "theme";
import { TaskStatusColor } from "types";
import { useResizeObserver } from "usehooks-ts";
import ChartHelpers from "utils/chart-helpers";
import { useSetError } from "utils/error-handling";
import UserUtils from "utils/users";
import { Gantt } from "../../lipsanen-project-management-gantt-chart/src/components/gantt/gantt";
import type * as GanttTypes from "../../lipsanen-project-management-gantt-chart/src/types/public-types";
import { ViewMode } from "../../lipsanen-project-management-gantt-chart/src/types/public-types";

const {
  cardHeaderHeight,
  headerHeight,
  rowHeight,
  horizontalScrollbarHeight,
  objectiveCellWidth,
  durationCellWidth,
  startCellWidth,
  readyCellWidth,
  readinessCellWidth,
  taskListWidth,
} = GANTT_MEASUREMENTS;

/**
 * Milestone tasks file route
 */
export const Route = createFileRoute("/projects/$projectId/schedule/$milestoneId/tasks")({
  component: MilestoneTasksListRoute,
});

/**
 * Milestone tasks list route component
 */
function MilestoneTasksListRoute() {
  const { t } = useTranslation();
  const { projectId, milestoneId } = Route.useParams();
  const { tasksApi } = useApi();
  const queryClient = useQueryClient();
  const setError = useSetError();

  const findProjectMilestoneQuery = useFindProjectMilestoneQuery({ projectId, milestoneId });
  const milestone = findProjectMilestoneQuery.data;
  const listMilestoneTasksQuery = useListTasksQuery({ projectId, milestoneId });
  const tasks = listMilestoneTasksQuery.data;
  const listChangeProposalsQuery = useListChangeProposalsQuery({ projectId, milestoneId });
  const changeProposals = listChangeProposalsQuery.data;
  const listTaskConnectionsQuery = useListTaskConnectionsQuery({ projectId });
  const taskConnections = listTaskConnectionsQuery.data;
  const pendingChangeProposals = changeProposals?.filter(
    (proposal) => proposal.status === ChangeProposalStatus.Pending,
  );
  const listJobPositionsQuery = useListJobPositionsQuery();
  const jobPositions = listJobPositionsQuery.data?.jobPositions;

  const listProjectUsersQuery = useListUsersQuery({ projectId, max: 1000 });
  const projectUsers = useMemo(() => listProjectUsersQuery.data?.users ?? [], [listProjectUsersQuery.data]);

  const [open, setOpen] = useState(false);
  const [task, setTask] = useState<null | Task>(null);
  const [viewMode, setViewMode] = useState(ViewMode.Day);
  const [taskConnectionsVisible, setTaskConnectionsVisible] = useState(ChartHelpers.getTaskConnectionsVisibleSetting);
  const [selectedChangeProposalId, setSelectedChangeProposalId] = useState<string>();
  const taskIdForSelectedChangeProposal = changeProposals?.find(
    (proposal) => proposal.id === selectedChangeProposalId,
  )?.taskId;
  const cardRef = useRef<HTMLDivElement | null>(null);
  const { height: cardHeight = 0 } = useResizeObserver({
    ref: cardRef,
    box: "content-box",
  });

  const ganttHeight = useMemo(
    () => cardHeight - cardHeaderHeight - headerHeight - horizontalScrollbarHeight,
    [cardHeight],
  );

  const changeProposalTasksPreviewListQuery = useListTasksQuery(
    selectedChangeProposalId ? { changeProposalId: selectedChangeProposalId } : {},
  );
  const changeProposalTasksPreviewList = useMemo(
    () => changeProposalTasksPreviewListQuery.data,
    [changeProposalTasksPreviewListQuery.data],
  );

  /**
   * View date for the gantt chart
   */
  const viewDate = useMemo(() => new Date(), []);

  /**
   * Save task connections visible setting to local storage
   */
  useEffect(() => {
    ChartHelpers.saveTaskConnectionsVisibleSetting(taskConnectionsVisible);
  }, [taskConnectionsVisible]);

  /**
   * Tasks for gantt chart with change proposal preview dates
   */
  const tasksForGantt = useMemo(() => {
    const tasksInitial = ChartHelpers.convertTasksToGanttTasks(tasks ?? [], taskConnections);
    const changeProposalTasksMap = new Map(changeProposalTasksPreviewList?.map((task) => [task.id, task]));

    return tasksInitial.map((task) => {
      const changeProposalTask = changeProposalTasksMap.get(task.id);
      if (changeProposalTask && selectedChangeProposalId) {
        return {
          ...task,
          changePreviewDates: {
            start: changeProposalTask.startDate ?? task.start,
            end: changeProposalTask.endDate ?? task.end,
          },
        };
      }
      return task;
    });
  }, [tasks, taskConnections, changeProposalTasksPreviewList, selectedChangeProposalId]);

  /**
   * Task connections for gantt chart with full type definitions for improved arrow rendering
   */
  const taskConnectionsForGantt = useMemo(
    () =>
      taskConnections
        ?.filter((c): c is TaskConnection & { id: string } => !!c.id)
        .map((c) => ({
          id: c.id,
          sourceTaskId: c.sourceTaskId,
          targetTaskId: c.targetTaskId,
          type: c.type,
        })),
    [taskConnections],
  );

  /**
   * Handles task select
   *
   * @param task task
   */
  const onTaskSelect = (task: Task) => {
    setTask(task);
    setOpen(true);
  };

  /**
   * Handles task close
   */
  const onTaskClose = () => {
    setTask(null);
    setOpen(false);
  };

  /**
   * Handles change proposal select
   *
   * @param changeProposalId change proposal id
   */
  const onChangeProposalSelect = (changeProposalId: string | undefined) => {
    setSelectedChangeProposalId((prevId) => (prevId === changeProposalId ? undefined : changeProposalId));
  };

  /**
   * Update task mutation
   */
  const updateTaskMutation = useMutation({
    mutationFn: (params: UpdateTaskRequest) => tasksApi.updateTask(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
    },
    onError: (error) => setError(t("errorHandling.errorUpdatingMilestoneTask"), error),
  });

  /**
   * Returns either user display name or given placeholder text
   *
   * @param user user
   * @param placeholder placeholder text
   */
  const getUserDisplayName = (user: User | undefined, placeholder: string) => {
    return user ? `${user.firstName} ${user.lastName}` : placeholder;
  };

  /**
   * Renders the milestone row above the tasks
   */
  const renderMilestoneRow = () => {
    if (!milestone) {
      return;
    }

    const startDate = DateTime.fromJSDate(milestone.startDate);
    const endDate = DateTime.fromJSDate(milestone.endDate);
    const difference = Math.ceil(endDate.diff(startDate, "days").days);
    const formattedStartDate = startDate.toFormat("dd.MM.yyyy");
    const formattedEndDate = endDate.toFormat("dd.MM.yyyy");

    return (
      <TableRow key={milestone.id}>
        <TableCell
          style={{
            width: objectiveCellWidth,
            minWidth: objectiveCellWidth,
            maxWidth: objectiveCellWidth,
            borderLeft: "none",
            overflow: "hidden",
          }}
        >
          <Stack direction="row" alignItems="center" gap={1}>
            <Avatar sx={{ backgroundColor: "#0079BF", width: 30, height: 30 }}>
              <FlagOutlinedIcon fontSize="medium" sx={{ color: "#fff" }} />
            </Avatar>
            <Box mx={1}>
              <Tooltip placement="top" title={milestone.name}>
                <Typography maxWidth={300} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                  {milestone.name}
                </Typography>
              </Tooltip>
              <Typography variant="body2">{t("scheduleScreen.objective")}</Typography>
            </Box>
          </Stack>
        </TableCell>
        <TableCell style={{ width: durationCellWidth }}>{`${difference} ${t("scheduleScreen.days")}`}</TableCell>
        <TableCell style={{ width: startCellWidth }}>{formattedStartDate}</TableCell>
        <TableCell style={{ width: readyCellWidth }}>{formattedEndDate}</TableCell>
        <TableCell style={{ width: readinessCellWidth }}>
          {/* TODO: Add progress calculation when data available*/}
          <ProgressBadge progress={milestone.estimatedReadiness ?? 0} />
        </TableCell>
      </TableRow>
    );
  };

  /**
   * Renders the milestone tasks rows
   */
  const renderMilestoneTasksRows = () => {
    if (listMilestoneTasksQuery.isFetching) {
      return (
        <TableRow>
          <LoadingTableCell style={{ width: objectiveCellWidth }} loading />
          <LoadingTableCell style={{ width: durationCellWidth }} loading />
          <LoadingTableCell style={{ width: startCellWidth }} loading />
          <LoadingTableCell style={{ width: readyCellWidth }} loading />
          <LoadingTableCell style={{ width: readinessCellWidth }} loading />
        </TableRow>
      );
    }

    return (tasks ?? []).map((task) => {
      const startDate = DateTime.fromJSDate(task.startDate);
      const endDate = DateTime.fromJSDate(task.endDate);
      const difference = Math.ceil(endDate.diff(startDate, "days").days);
      const formattedStartDate = startDate.toFormat("dd.MM.yyyy");
      const formattedEndDate = endDate.toFormat("dd.MM.yyyy");
      const taskAssignee = projectUsers.find((user) => user.id === task.assigneeIds?.at(0));

      return (
        <TableRow
          key={task.id}
          sx={{ backgroundColor: taskIdForSelectedChangeProposal === task.id ? "#0079BF1A" : undefined }}
        >
          <TableCell
            sx={{ overflow: "hidden", cursor: "pointer" }}
            style={{
              width: objectiveCellWidth,
              minWidth: objectiveCellWidth,
              maxWidth: objectiveCellWidth,
              borderLeft: "none",
            }}
            onClick={() => onTaskSelect(task)}
          >
            <Stack direction="row" alignItems="center" gap={1}>
              <JobPositionAvatar jobPosition={UserUtils.getUserJobPosition(jobPositions, taskAssignee)} />
              <Box mx={1}>
                <Tooltip placement="top" title={task.name}>
                  <Typography maxWidth={300} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                    {task.name}
                  </Typography>
                </Tooltip>
                <Typography variant="body2">
                  {getUserDisplayName(taskAssignee, t("scheduleScreen.noAssignee"))}
                </Typography>
              </Box>
            </Stack>
          </TableCell>
          <TableCell style={{ width: durationCellWidth }}>{`${difference} ${t("scheduleScreen.days")}`}</TableCell>
          <TableCell style={{ width: startCellWidth }}>{formattedStartDate}</TableCell>
          <TableCell style={{ width: readyCellWidth }}>{formattedEndDate}</TableCell>
          <TableCell style={{ width: readinessCellWidth }}>
            {/* TODO: Add progress calculation when data available*/}
            <ProgressBadge progress={task.estimatedReadiness ?? 0} />
          </TableCell>
        </TableRow>
      );
    });
  };

  const _getTaskChildren = (taskId: string) =>
    (taskConnections ?? []).filter((connection) => connection.targetTaskId === taskId);

  /**
   * Handles updating a task
   *
   * @param task chart task
   * TODO: enable if a customer wants to update tasks by dragging them in the gantt chart
   */
  const _onUpdateTask = async (task: GanttTypes.Task) => {
    const foundTask = tasks?.find((t) => t.id === task.id);
    if (!foundTask) {
      return;
    }

    const updatedTask = {
      ...foundTask,
      startDate: task.start,
      endDate: task.end,
    };

    await updateTaskMutation.mutateAsync({
      taskId: task.id,
      task: updatedTask,
    });
  };

  /**
   * Renders the task Gantt chart
   *
   */
  const renderGanttChart = () => {
    if (!ganttHeight) return;

    if (listMilestoneTasksQuery.isFetching || listTaskConnectionsQuery.isFetching) {
      return (
        <TableContainer>
          <Table style={{ width: "100%" }}>
            <TableHead>
              <TableRow>
                <LoadingTableCell loading />
              </TableRow>
            </TableHead>
          </Table>
        </TableContainer>
      );
    }

    const oneMilestoneForGantt =
      milestone &&
      ({
        start: milestone.startDate,
        end: milestone.endDate,
        name: milestone.name,
        id: milestone.id ?? "0",
        type: "custom-milestone",
        progress: milestone.estimatedReadiness ?? 0,
        styles: {
          backgroundColor: TaskStatusColor.NOT_STARTED,
          backgroundSelectedColor: TaskStatusColor.NOT_STARTED_SELECTED,
          progressColor: ChartHelpers.getMilestoneColorBasedOnReadiness(milestone),
          progressSelectedColor: ChartHelpers.getMilestoneSelectedColorBasedOnReadiness(milestone),
        },
      } as GanttTypes.Task);

    return (
      <Gantt
        tasks={tasksForGantt}
        milestone={oneMilestoneForGantt}
        todayColor={"rgba(255, 247, 163, 0.6)"}
        viewMode={viewMode}
        viewDate={viewDate}
        //TODO: enable if a customer wants to update tasks by dragging them in the gantt chart
        // onDateChange={onUpdateTask}
        arrowColor={theme.palette.primary.main}
        // 0.5 to take into account SVG stroke width
        headerHeight={headerHeight + 0.5}
        ganttHeight={ganttHeight}
        rowHeight={rowHeight}
        onProgressChange={() => {}}
        arrowsVisible={taskConnectionsVisible}
        taskConnections={taskConnectionsForGantt}
        TaskListHeader={() => (
          <TableContainer>
            <Table
              sx={{
                width: taskListWidth,
                borderCollapse: "separate",
                "& .MuiTableCell-root": { borderLeft: "none", p: 1, height: headerHeight },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: objectiveCellWidth, borderBottom: "none", borderLeft: "none" }}>
                    {t("scheduleScreen.objective")}
                  </TableCell>
                  <TableCell sx={{ width: durationCellWidth, borderBottom: "none" }}>
                    {t("scheduleScreen.duration")}
                  </TableCell>
                  <TableCell sx={{ width: startCellWidth, borderBottom: "none" }}>
                    {t("scheduleScreen.start")}
                  </TableCell>
                  <TableCell sx={{ width: readyCellWidth, borderBottom: "none" }}>
                    {t("scheduleScreen.ready")}
                  </TableCell>
                  <TableCell sx={{ width: readinessCellWidth, borderBottom: "none" }}>
                    {t("scheduleScreen.readiness")}
                  </TableCell>
                </TableRow>
              </TableHead>
            </Table>
          </TableContainer>
        )}
        TaskListTable={() => (
          <TableContainer>
            <Table
              sx={{
                width: taskListWidth,
                borderCollapse: "separate",
                borderBottom: "1px solid",
                borderBottomColor: "divider",
                "& .MuiTableCell-root": { borderLeft: "none", borderBottom: "none", p: 1, height: rowHeight },
              }}
            >
              <TableBody>
                {renderMilestoneRow()}
                {renderMilestoneTasksRows()}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      />
    );
  };

  /**
   * Renders the breadcrumb with objectives link and a current milestone name
   */
  const renderBreadcrumb = () => {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, padding: "1rem" }}>
          <Link to={`/projects/${projectId}/schedule`} style={{ textDecoration: "none", color: "#0079BF" }}>
            <Typography variant="h5">{t("scheduleScreen.objectives")}</Typography>
          </Link>
          <Typography variant="h5">{t("scheduleScreen.breadcrumbSeparator")}</Typography>
          <Typography variant="h5">{milestone?.name}</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: "1rem" }}>
          <FormControlLabel
            control={
              <Switch
                size="medium"
                value={taskConnectionsVisible}
                defaultChecked={taskConnectionsVisible}
                onChange={() => setTaskConnectionsVisible(!taskConnectionsVisible)}
              />
            }
            label={t("scheduleScreen.showConnections")}
          />
          <GanttViewModesSlider viewMode={viewMode} onViewModeChange={setViewMode} />
        </Box>
      </Box>
    );
  };

  /**
   * Main component render
   */
  return (
    <>
      <FlexColumnLayout>
        <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
          <Typography component="h1" variant="h5">
            {t("scheduleScreen.title")}
          </Typography>
          <Box sx={{ display: "flex", gap: "1rem" }}>
            <ChangeProposalsDrawer
              changeProposals={pendingChangeProposals}
              tasks={tasks}
              selectedChangeProposalId={selectedChangeProposalId}
              setSelectedChangeProposalId={onChangeProposalSelect}
              loading={listChangeProposalsQuery.isPending}
            />
            <NewTaskButton projectId={projectId} milestoneId={milestoneId} />
          </Box>
        </Toolbar>
        <Card ref={cardRef} sx={{ flex: 1, minWidth: 0 }}>
          {renderBreadcrumb()}
          {renderGanttChart()}
        </Card>
      </FlexColumnLayout>
      <TaskDialog
        projectId={projectId}
        milestoneId={milestoneId}
        open={open}
        task={task ?? undefined}
        onClose={onTaskClose}
        changeProposals={changeProposals}
      />
    </>
  );
}
