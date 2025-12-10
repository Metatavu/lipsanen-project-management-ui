import {
  Box,
  Card,
  Stack,
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
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FlexColumnLayout } from "components/generic/flex-column-layout";
import GanttViewModesSlider from "components/generic/gantt-view-mode-slider";
import LoadingTableCell from "components/generic/loading-table-cell";
import { MilestoneRow } from "components/milestones/milestone-row";
import NewMilestoneDialog from "components/milestones/new-milestone-dialog";
import { GANTT_MEASUREMENTS } from "consts";
import type { DeleteProjectMilestoneRequest, Milestone, UpdateProjectMilestoneRequest } from "generated/client";
import { useListProjectMilestonesQuery } from "hooks/api-queries";
import { useApi } from "hooks/use-api";
import { useConfirmDialog } from "providers/confirm-dialog-provider";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TaskStatusColor } from "types";
import { useResizeObserver } from "usehooks-ts";
import ChartHelpers from "utils/chart-helpers";
import { parseDDMMYYYY } from "utils/date-time-utils";
import { useSetError } from "utils/error-handling";
import { Gantt } from "../../lipsanen-project-management-gantt-chart/src/components/gantt/gantt";
import { type Task, ViewMode } from "../../lipsanen-project-management-gantt-chart/src/types/public-types";

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

  const cardRef = useRef<HTMLDivElement | null>(null);
  const { height: cardHeight = 0 } = useResizeObserver({
    ref: cardRef,
    box: "content-box",
  });
  const ganttHeight = useMemo(
    () => cardHeight - cardHeaderHeight - headerHeight - horizontalScrollbarHeight,
    [cardHeight],
  );

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
          <LoadingTableCell style={{ width: objectiveCellWidth }} loading />
          <LoadingTableCell style={{ width: durationCellWidth }} loading />
          <LoadingTableCell style={{ width: startCellWidth }} loading />
          <LoadingTableCell style={{ width: readyCellWidth }} loading />
          <LoadingTableCell style={{ width: readinessCellWidth }} loading />
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
   * Renders the milestone Gantt chart
   */
  const renderGanttChart = () => {
    if (!ganttHeight) return;

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
      <Gantt
        tasks={milestonesForGantt}
        todayColor={"rgba(255, 247, 163, 0.6)"}
        viewMode={viewMode}
        viewDate={viewDate}
        // 0.5 to take into account SVG stroke width
        headerHeight={headerHeight + 0.5}
        ganttHeight={ganttHeight}
        rowHeight={rowHeight}
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
              <TableBody>{renderProjectMilestonesRows()}</TableBody>
            </Table>
          </TableContainer>
        )}
        onClick={(task) => {
          if (task.type === "custom-milestone") {
            navigate({
              to: "/projects/$projectId/schedule/$milestoneId/tasks",
              params: { projectId: projectId, milestoneId: task.id },
            });
          }
        }}
      />
    );
  };

  /**
   * Main component render
   */
  return (
    <FlexColumnLayout>
      <Toolbar disableGutters sx={{ justifyContent: "space-between", height: cardHeaderHeight, px: 2 }}>
        <Typography component="h1" variant="h5">
          {t("scheduleScreen.title")}
        </Typography>
        <NewMilestoneDialog />
      </Toolbar>
      <Card ref={cardRef} sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} px={2}>
          <Typography component="h2" variant="h6">
            {t("scheduleScreen.objectives")}
          </Typography>
          <GanttViewModesSlider viewMode={viewMode} onViewModeChange={setViewMode} />
        </Stack>
        {renderGanttChart()}
      </Card>
    </FlexColumnLayout>
  );
}
