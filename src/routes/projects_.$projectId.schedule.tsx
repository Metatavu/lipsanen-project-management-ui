import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
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
import { Link, createFileRoute } from "@tanstack/react-router";
import { FlexColumnLayout } from "components/generic/flex-column-layout";
import GanttViewModesSlider from "components/generic/gantt-view-mode-slider";
import LoadingTableCell from "components/generic/loading-table-cell";
import ProgressBadge from "components/generic/progress-badge";
import NewMilestoneDialog from "components/milestones/new-milestone-dialog";
import { useListProjectMilestonesQuery } from "hooks/api-queries";
import { DateTime } from "luxon";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TaskStatusColor } from "types";
import ChartHelpers from "utils/chart-helpers";
import { Gantt } from "../../lipsanen-project-management-gantt-chart/src/components/gantt/gantt";
import { Task, ViewMode } from "../../lipsanen-project-management-gantt-chart/src/types/public-types";

/**
 * Schedule file route
 */
export const Route = createFileRoute("/projects/$projectId/schedule")({
  component: ScheduleIndexRoute,
});

/**
 * Schedule index route component
 */
function ScheduleIndexRoute() {
  const { t } = useTranslation();
  const { projectId } = Route.useParams();

  const listProjectMilestonesQuery = useListProjectMilestonesQuery({ projectId });
  const milestones = listProjectMilestonesQuery.data;
  const viewDate = useMemo(() => new Date(), []);
  const [viewMode, setViewMode] = useState(ViewMode.Day);

  /**
   * Renders the project milestones rows
   */
  const renderProjectMilestonesRows = () => {
    if (listProjectMilestonesQuery.isFetching) {
      return (
        <TableRow>
          <LoadingTableCell loading />
          <LoadingTableCell loading />
          <LoadingTableCell loading />
        </TableRow>
      );
    }

    return (milestones ?? []).map((milestone) => {
      const startDate = DateTime.fromJSDate(milestone.startDate);
      const endDate = DateTime.fromJSDate(milestone.endDate);
      const difference = endDate.diff(startDate, "days").days;
      const formattedStartDate = startDate.toFormat("dd.MM.yyyy");
      const formattedEndDate = endDate.toFormat("dd.MM.yyyy");

      return (
        <TableRow key={milestone.id}>
          <TableCell style={{ overflow: "hidden" }}>
            <Link
              to={`/projects/${projectId}/schedule/${milestone.id}/tasks` as string}
              style={{ textDecoration: "none", color: "#000" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <Avatar sx={{ backgroundColor: "#0079BF", width: 30, height: 30 }}>
                  <FlagOutlinedIcon fontSize="medium" sx={{ color: "#fff" }} />
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
            </Link>
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
    });
  };

  /**
   * Renders the project milestones table
   */
  const renderProjectMilestonesTable = () => {
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
            <TableBody>{renderProjectMilestonesRows()}</TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  /**
   * Renders the milestone Gantt chart
   */
  const renderGanttChart = () => {
    if (!listProjectMilestonesQuery.data?.length) {
      return;
    }

    if (listProjectMilestonesQuery.isFetching) {
      return (
        <TableRow>
          <LoadingTableCell loading />
        </TableRow>
      );
    }

    const milestonesForGantt = (milestones ?? []).map<Task>((milestone, index) => ({
      start: milestone.startDate,
      end: milestone.endDate,
      name: milestone.name,
      id: milestone.id ?? index.toString(),
      type: "custom-milestone",
      progress: milestone.estimatedReadiness ?? 0,
      styles: {
        backgroundColor: TaskStatusColor.NOT_STARTED,
        backgroundSelectedColor: TaskStatusColor.NOT_STARTED_SELECTED,
        progressColor: ChartHelpers.getMilestoneColorBasedOnReadiness(milestone),
        progressSelectedColor: ChartHelpers.getMilestoneSelectedColorBasedOnReadiness(milestone),
      },
    }));

    return (
      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <Box sx={{ width: "auto", padding: 0 }} p={2}>
          <Gantt
            tasks={milestonesForGantt}
            todayColor={"rgba(100, 100, 300, 0.3)"}
            viewMode={viewMode}
            viewDate={viewDate}
            //TODO: Add proper height and row height
            headerHeight={58}
            rowHeight={77}
            taskListHidden
          />
        </Box>
      </Box>
    );
  };

  /**
   * Main component render
   */
  return (
    <FlexColumnLayout>
      <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
        <Typography component="h1" variant="h5">
          {t("scheduleScreen.title")}
        </Typography>
        <Box sx={{ display: "flex", gap: "1rem" }}>
          <NewMilestoneDialog />
        </Box>
      </Toolbar>
      <Card sx={{ flex: 1, minWidth: 0, overflow: "auto" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography component="h2" variant="h6" sx={{ padding: "1rem" }}>
            {t("scheduleScreen.objectives")}
          </Typography>
          <GanttViewModesSlider viewMode={viewMode} onViewModeChange={setViewMode} />
        </Box>
        <Box sx={{ display: "flex", flexDirection: "row" }}>
          {renderProjectMilestonesTable()}
          {renderGanttChart()}
        </Box>
      </Card>
    </FlexColumnLayout>
  );
}
