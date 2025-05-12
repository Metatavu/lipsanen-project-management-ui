import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { FlexColumnLayout } from "components/generic/flex-column-layout";
import GanttViewModesSlider from "components/generic/gantt-view-mode-slider";
import LoadingTableCell from "components/generic/loading-table-cell";
import { MilestoneRow } from "components/milestones/milestone-row";
import NewMilestoneDialog from "components/milestones/new-milestone-dialog";
import { DeleteProjectMilestoneRequest, Milestone, UpdateProjectMilestoneRequest } from "generated/client";
import { useListProjectMilestonesQuery } from "hooks/api-queries";
import { useApi } from "hooks/use-api";
import { useConfirmDialog } from "providers/confirm-dialog-provider";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TaskStatusColor } from "types";
import ChartHelpers from "utils/chart-helpers";
import { parseDDMMYYYY } from "utils/date-time-utils";
import { useSetError } from "utils/error-handling";
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
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { projectMilestonesApi } = useApi();
  const queryClient = useQueryClient();
  const setError = useSetError();
  const showConfirmDialog = useConfirmDialog();
  const { projectId } = Route.useParams();

  const listProjectMilestonesQuery = useListProjectMilestonesQuery({ projectId });
  const milestones = listProjectMilestonesQuery.data;
  const viewDate = useMemo(() => new Date(), []);
  const [viewMode, setViewMode] = useState(ViewMode.Day);

  /**
   * Delete project milestone mutation
   */
  const deleteProjectMilestoneMutation = useMutation({
    mutationFn: (params: DeleteProjectMilestoneRequest) => projectMilestonesApi.deleteProjectMilestone(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "milestones"] });
    },
    onError: (error) => setError(t("errorHandling.errorDeletingProjectMilestone"), error),
  });

  /**
   * Update project milestone mutation
   */
  const updateProjectMilestoneMutation = useMutation({
    mutationFn: (params: UpdateProjectMilestoneRequest) => projectMilestonesApi.updateProjectMilestone(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "milestones"] });
    },
    onError: (error) => setError(t("errorHandling.errorUpdatingProjectMilestone"), error),
  });

  /**
   * Handles delete milestone
   */
  const handleDeleteMilestone = (milestoneId: string) => {
    deleteProjectMilestoneMutation.mutate({
      projectId,
      milestoneId: milestoneId,
    });
  };

  /**
   * Handles editing a milestone
   * Supports editing name, start date and end date
   * 
   * @param milestone milestone
   * @param field field
   * @param value new value
   */
  const handleEditMilestone = (milestone: Milestone, field: "name" | "startDate" | "endDate", value: string) => {
    if (!milestone.id) {
      return;
    }

    updateProjectMilestoneMutation.mutate({
      projectId,
      milestoneId: milestone.id,
      milestone: {
        ...milestone,
        [field]: field === "name" ? value : parseDDMMYYYY(value),
      },
    });
  };

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

    return (milestones ?? []).map((milestone) => (
      <MilestoneRow
        key={milestone.id}
        milestone={milestone}
        projectId={projectId}
        showConfirmDialog={showConfirmDialog}
        handleDeleteMilestone={handleDeleteMilestone}
        handleEditMilestone={handleEditMilestone}
      />
    ));
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
        <Table>
          <TableBody>
            <TableRow>
              <LoadingTableCell loading />
            </TableRow>
          </TableBody>
        </Table>
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
            onClick={(task) => {
              if (task.type === "custom-milestone") {
                navigate({
                  to: "$milestoneId/tasks",
                  params: {
                    milestoneId: task.id,
                  },
                });
              }
            }}
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
