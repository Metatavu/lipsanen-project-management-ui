import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Tooltip,
  Typography,
  Switch,
  FormControlLabel,
} from "@mui/material";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import { Link, createFileRoute } from "@tanstack/react-router";
import { FlexColumnLayout } from "components/generic/flex-column-layout";
import LoadingTableCell from "components/generic/loading-table-cell";
import {
  useFindProjectMilestoneQuery,
  useFindUsersQuery,
  useListChangeProposalsQuery,
  useListMilestoneTasksQuery,
  useListTaskConnectionsQuery,
} from "hooks/api-queries";
import { useTranslation } from "react-i18next";
import { DateTime } from "luxon";
import ProgressBadge from "components/generic/progress-badge";
import TaskButton from "components/tasks/new-task-button";
import TaskDialog from "components/tasks/task-dialog";
import { ChangeProposal, ChangeProposalStatus, Task, UpdateChangeProposalRequest, UpdateTaskRequest } from "generated/client";
import ChangeProposalsDrawer from "components/tasks/change-proposals-drawer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "hooks/use-api";
import { Gantt } from "../../lipsanen-project-management-gantt-chart/src/components/gantt/gantt";
import { ViewMode } from "../../lipsanen-project-management-gantt-chart/src/types/public-types";
import * as GanttTypes from "../../lipsanen-project-management-gantt-chart/src/types/public-types";
import { TaskStatusColor } from "types";
import ChartHelpers from "utils/chart-helpers";
import { theme } from "theme";

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
  const { milestoneTasksApi, changeProposalsApi } = useApi();
  const queryClient = useQueryClient();

  const findProjectMilestoneQuery = useFindProjectMilestoneQuery({ projectId, milestoneId });
  const milestone = findProjectMilestoneQuery.data;
  const listMilestoneTasksQuery = useListMilestoneTasksQuery({ projectId, milestoneId });
  const tasks = listMilestoneTasksQuery.data;
  const listChangeProposalsQuery = useListChangeProposalsQuery({ projectId, milestoneId });
  const changeProposals = listChangeProposalsQuery.data;
  const listTaskConnectionsQuery = useListTaskConnectionsQuery({ projectId });
  const taskConnections = listTaskConnectionsQuery.data;
  const pendingChangeProposals = changeProposals?.filter(
    (proposal) => proposal.status === ChangeProposalStatus.Pending,
  );

  const taskCreatorUserIds = [
    ...new Set(
      tasks?.flatMap((task) => task.metadata?.creatorId).filter((userId): userId is string => userId !== undefined),
    ),
  ];
  const listCreatorUsersQuery = useFindUsersQuery(taskCreatorUserIds);
  const creatorUsers = (listCreatorUsersQuery.data ?? []).filter((user) => user);

  const [open, setOpen] = useState(false);
  const [task, setTask] = useState<null | Task>(null);
  const [taskConnectionsVisible, setTaskConnectionsVisible] = useState(ChartHelpers.getTaskConnectionsVisibleSetting);
  const [selectedChangeProposalId, setSelectedChangeProposalId] = useState("");
  const taskIdForSelectedChangeProposal = changeProposals?.find(
    (proposal) => proposal.id === selectedChangeProposalId,
  )?.taskId;

  const viewDate = useMemo(() => new Date(), []);

  /**
   * Save task connections visible setting to local storage
   */
  useEffect(() => {
    ChartHelpers.saveTaskConnectionsVisibleSetting(taskConnectionsVisible);
  }, [taskConnectionsVisible]);

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
   * Update change proposal mutation
   */
  const updateChangeProposal = useMutation({
    mutationFn: (params: UpdateChangeProposalRequest) => changeProposalsApi.updateChangeProposal(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["changeProposals", projectId, milestoneId] });
      queryClient.invalidateQueries({ queryKey: ["milestoneTasks", projectId, milestoneId] });
    },
    onError: (error) => console.error(t("errorHandling.errorUpdatingChangeProposal"), error),
  });

  /**
   * Update task mutation
   */
  const updateTaskMutation = useMutation({
    mutationFn: (params: UpdateTaskRequest) => milestoneTasksApi.updateTask(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["milestoneTasks", projectId, milestoneId] });
      queryClient.invalidateQueries({ queryKey: ["taskConnections", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projectMilestones", projectId] });
    },
    onError: (error) => console.error(t("errorHandling.errorUpdatingMilestoneTask"), error),
  });

  /**
   * Handler for updating change proposal status
   *
   * @param changeProposalId string
   * @param changeProposal ChangeProposal
   * @param status ChangeProposalStatus
   */
  const handleUpdateChangeProposalStatus = async (
    changeProposalId: string,
    changeProposal: ChangeProposal,
    status: ChangeProposalStatus,
  ) => {
    await updateChangeProposal.mutateAsync({
      changeProposal: {
        ...changeProposal,
        status: status,
      },
      projectId: projectId,
      milestoneId: milestoneId,
      changeProposalId: changeProposalId,
    });
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
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar sx={{ backgroundColor: "#0079BF" }}>
                <FlagOutlinedIcon fontSize="large" sx={{ color: "#fff" }} />
              </Avatar>
              {/* TODO: Handle overflowing name with maxWidth could be improved */}
              <Box sx={{ margin: "0 1rem", maxWidth: 300 }}>
                <Tooltip placement="top" title={milestone.name}>
                  <Typography sx={{ whiteSpace: "noWrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {milestone.name}
                  </Typography>
                </Tooltip>
                <Typography variant="body2">{t("scheduleScreen.objective")}</Typography>
              </Box>
            </div>
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
      const taskCreator = creatorUsers.find((user) => user.id === task.metadata?.creatorId);

      return (
        <TableRow
          key={task.id}
          sx={{ backgroundColor: taskIdForSelectedChangeProposal === task.id ? "#0079BF1A" : "" }}
        >
          <TableCell style={{ overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar sx={{ backgroundColor: "#0079BF" }}>
                <FlagOutlinedIcon fontSize="large" sx={{ color: "#fff" }} />
              </Avatar>
              {/* TODO: Handle overflowing name with maxWidth could be improved */}
              <Box sx={{ margin: "0 1rem", maxWidth: 300 }}>
                <Tooltip placement="top" title={task.name} onClick={() => onTaskSelect(task)}>
                  <Typography sx={{ whiteSpace: "noWrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {task.name}
                  </Typography>
                </Tooltip>
                <Typography variant="body2">{`${taskCreator?.firstName} ${taskCreator?.lastName}`}</Typography>
              </Box>
            </div>
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

  const getTaskChildren = (taskId: string) => {
    if (!taskConnections) {
      return [];
    }

    return taskConnections.filter((connection) => connection.targetTaskId === taskId);
  }

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
      projectId: projectId,
      milestoneId: milestoneId,
      taskId: task.id,
      task: updatedTask,
    });
  }

  /**
   * Renders the task Gantt chart
   *
   * TODO: implement a gantt chart
   */
  const renderGanttChart = () => {
    if (!listMilestoneTasksQuery.data?.length) {
      return;
    }

    if (listMilestoneTasksQuery.isFetching || listTaskConnectionsQuery.isFetching) {
      return (
        <TableRow>
          <LoadingTableCell loading />
        </TableRow>
      );
    }

    const tasksForGantt = (tasks ?? []).map<GanttTypes.Task>((task, index) => ({
      start: task.startDate,
      end: task.endDate,
      name: task.name,
      id: task.id ?? index.toString(),
      type: "task",
      progress: task.estimatedReadiness ?? 0,
      styles: {
        backgroundColor: TaskStatusColor.NOT_STARTED,
        backgroundSelectedColor: TaskStatusColor.NOT_STARTED_SELECTED,
        progressColor: ChartHelpers.getTaskColorBasedOnStatus(task),
        progressSelectedColor: ChartHelpers.getTaskSelectedColorBasedOnStatus(task),
      },
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      dependencies: getTaskChildren(task.id!).map((connection) => connection.sourceTaskId),
    }));

    const oneMilestoneForGantt = milestone && {
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
        progressSelectedColor: ChartHelpers.getMilestoneSelectedColorBasedOnReadiness(milestone)
      },
    } as GanttTypes.Task;

    return (
      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <Box sx={{ width: "auto", padding: 0 }} p={2}>
          <Gantt
            tasks={tasksForGantt}
            milestone={oneMilestoneForGantt}
            todayColor={"rgba(100, 100, 300, 0.3)"}
            viewMode={ViewMode.Day}
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
          <Link to={`/projects/${projectId}/schedule` as string} style={{ textDecoration: "none", color: "#0079BF" }}>
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
              setSelectedChangeProposalId={setSelectedChangeProposalId}
              loading={listChangeProposalsQuery.isPending}
              updateChangeProposalStatus={handleUpdateChangeProposalStatus}
            />
            <TaskButton projectId={projectId} milestoneId={milestoneId} />
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
      {task && !listChangeProposalsQuery.isPending && (
        <TaskDialog
          projectId={projectId}
          milestoneId={milestoneId}
          open={open}
          task={task}
          onClose={onTaskClose}
          changeProposals={changeProposals}
        />
      )}
    </>
  );
}
