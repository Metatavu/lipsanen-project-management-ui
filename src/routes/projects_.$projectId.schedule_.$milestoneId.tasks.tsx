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
} from "@mui/material";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import { Link, createFileRoute } from "@tanstack/react-router";
import { FlexColumnLayout } from "components/generic/flex-column-layout";
import LoadingTableCell from "components/generic/loading-table-cell";
import { useFindProjectMilestoneQuery, useListMilestoneTasksQuery } from "hooks/api-queries";
import { useTranslation } from "react-i18next";
import { DateTime } from "luxon";
import ProgressBadge from "components/generic/progress-badge";
import TaskButton from "components/tasks/new-task-button";
import TaskDialog from "components/tasks/task-dialog";
import React from "react";
import { Task } from "generated/client";

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

  const findProjectMilestoneQuery = useFindProjectMilestoneQuery(projectId, milestoneId);
  const milestone = findProjectMilestoneQuery.data;
  const listMilestoneTasksQuery = useListMilestoneTasksQuery({ projectId, milestoneId });
  const tasks = listMilestoneTasksQuery.data;

  const [open, setOpen] = React.useState(false);
  const [task, setTask] = React.useState<null | Task>(null);

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
  }

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

      return (
        <TableRow key={task.id}>
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
                <Typography variant="body2">{t("scheduleScreen.objective")}</Typography>
              </Box>
            </div>
          </TableCell>
          <TableCell>{`${difference} ${t("scheduleScreen.days")}`}</TableCell>
          <TableCell>{formattedStartDate}</TableCell>
          <TableCell>{formattedEndDate}</TableCell>
          <TableCell>
            {/* TODO: Add progress calculation when data available*/}
            <ProgressBadge progress={50} />
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
            <TableBody>{renderMilestoneTasksRows()}</TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  /**
   * Renders the task Gantt chart
   *
   * TODO: implement a gantt chart
   */
  const renderGanttChart = () => {
    return (
      <Box sx={{ width: "auto", padding: 0 }} p={2}>
        <Typography variant="body1">Chart placeholder content</Typography>
      </Box>
    );
  };

  /**
   * Renders the breadcrumb with objectives link and a current milestone name 
   */
  const renderBreadcrumb = () => {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, padding: "1rem" }}>
        <Link
          to={`/projects/${projectId}/schedule` as string}
          style={{ textDecoration: "none", color: "#0079BF" }}
        >
          <Typography variant="h5">{t("scheduleScreen.objectives")}</Typography>
        </Link>
        <Typography variant="h5">{t("scheduleScreen.breadcrumbSeparator")}</Typography>
        <Typography variant="h5">{milestone?.name}</Typography>
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
      { task &&
        <TaskDialog projectId={projectId} milestoneId={milestoneId} open={open} task={task} onClose={onTaskClose} />
      }
    </>
  );
}