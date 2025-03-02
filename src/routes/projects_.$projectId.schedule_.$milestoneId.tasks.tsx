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
import { Link, createFileRoute } from "@tanstack/react-router";
import { FlexColumnLayout } from "components/generic/flex-column-layout";
import GanttViewModesSlider from "components/generic/gantt-view-mode-slider";
import JobPositionAvatar from "components/generic/job-position-avatar";
import LoadingTableCell from "components/generic/loading-table-cell";
import ProgressBadge from "components/generic/progress-badge";
import ChangeProposalsDrawer from "components/tasks/change-proposals-drawer";
import NewTaskButton from "components/tasks/new-task-button";
import TaskDialog from "components/tasks/task-dialog";
import {
  ChangeProposalStatus,
  Task,
  UpdateTaskRequest,
  User,
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
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { theme } from "theme";
import { TaskStatusColor } from "types";
import ChartHelpers from "utils/chart-helpers";
import { useSetError } from "utils/error-handling";
import UserUtils from "utils/users";
import { Gantt } from "../../lipsanen-project-management-gantt-chart/src/components/gantt/gantt";
import { ViewMode } from "../../lipsanen-project-management-gantt-chart/src/types/public-types";
import * as GanttTypes from "../../lipsanen-project-management-gantt-chart/src/types/public-types";

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

  const changeProposalTasksPreviewListQuery = useListTasksQuery({ changeProposalId: selectedChangeProposalId });
  const changeProposalTasksPreviewList = changeProposalTasksPreviewListQuery.data;

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
    setSelectedChangeProposalId((prevId) => (prevId === changeProposalId ? "" : changeProposalId));
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
    const difference = endDate.diff(startDate, "days").days;
    const formattedStartDate = startDate.toFormat("dd.MM.yyyy");
    const formattedEndDate = endDate.toFormat("dd.MM.yyyy");

    return (
      <TableRow key={milestone.id}>
        <TableCell style={{ overflow: "hidden" }}>
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
        <TableCell>{`${difference} ${t("scheduleScreen.days")}`}</TableCell>
        <TableCell>{formattedStartDate}</TableCell>
        <TableCell>{formattedEndDate}</TableCell>
        <TableCell>
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
          <LoadingTableCell loading />
          <LoadingTableCell loading />
          <LoadingTableCell loading />
        </TableRow>
      );
    }

    return (tasks ?? []).map((task) => {
      const startDate = DateTime.fromJSDate(task.startDate);
      const endDate = DateTime.fromJSDate(task.endDate);
      const difference = endDate.diff(startDate, "days").days;
      const formattedStartDate = startDate.toFormat("dd.MM.yyyy");
      const formattedEndDate = endDate.toFormat("dd.MM.yyyy");
      const taskAssignee = projectUsers.find((user) => user.id === task.assigneeIds?.at(0));

      return (
        <TableRow
          key={task.id}
          sx={{ backgroundColor: taskIdForSelectedChangeProposal === task.id ? "#0079BF1A" : undefined }}
        >
          <TableCell sx={{ overflow: "hidden", cursor: "pointer" }} onClick={() => onTaskSelect(task)}>
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
          <TableCell>{`${difference} ${t("scheduleScreen.days")}`}</TableCell>
          <TableCell>{formattedStartDate}</TableCell>
          <TableCell>{formattedEndDate}</TableCell>
          <TableCell>
            {/* TODO: Add progress calculation when data available*/}
            <ProgressBadge progress={task.estimatedReadiness ?? 0} />
          </TableCell>
        </TableRow>
      );
    });
  };

  /**
   * Renders the milestone tasks table
   */
  const renderMilestoneTasksTable = () => {
    return (
      <Box sx={{ width: "auto", padding: 0 }} p={2}>
        <TableContainer>
          <Table style={{ width: "100%" }}>
            <TableHead>
              <TableRow>
                <TableCell style={{ width: "40%" }}>{t("scheduleScreen.objective")}</TableCell>
                <TableCell style={{ width: "15%" }}>{t("scheduleScreen.duration")}</TableCell>
                <TableCell style={{ width: "15%" }}>{t("scheduleScreen.start")}</TableCell>
                <TableCell style={{ width: "15%" }}>{t("scheduleScreen.ready")}</TableCell>
                <TableCell style={{ width: "15%" }}>{t("scheduleScreen.readiness")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {renderMilestoneRow()}
              {renderMilestoneTasksRows()}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const getTaskChildren = (taskId: string) =>
    (taskConnections ?? []).filter((connection) => connection.targetTaskId === taskId);

  /**
   * Handles updating a task
   *
   * @param task chart task
   * TODO: enable if a customer wants to update tasks by dragging them in the gantt chart
   */
  const onUpdateTask = async (task: GanttTypes.Task) => {
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
   * TODO: implement a gantt chart
   */
  const renderGanttChart = () => {
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
      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <Box sx={{ width: "auto", padding: 0 }} p={2}>
          <Gantt
            tasks={tasksForGantt}
            milestone={oneMilestoneForGantt}
            todayColor={"rgba(100, 100, 300, 0.3)"}
            viewMode={viewMode}
            viewDate={viewDate}
            //TODO: enable if a customer wants to update tasks by dragging them in the gantt chart
            // onDateChange={onUpdateTask}
            //TODO: Add proper height and row height
            arrowColor={theme.palette.primary.main}
            headerHeight={58}
            rowHeight={77}
            taskListHidden
            onProgressChange={() => {}}
            arrowsVisible={taskConnectionsVisible}
          />
        </Box>
      </Box>
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
        <Card sx={{ flex: 1, minWidth: 0, overflow: "auto" }}>
          {renderBreadcrumb()}
          <Box sx={{ display: "flex", flexDirection: "row" }}>
            {renderMilestoneTasksTable()}
            {renderGanttChart()}
          </Box>
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
