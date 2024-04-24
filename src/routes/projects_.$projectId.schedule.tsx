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
import { createFileRoute } from "@tanstack/react-router";
import { FlexColumnLayout } from "components/generic/flex-column-layout";
import LoadingTableCell from "components/generic/loading-table-cell";
import NewMilestoneDialog from "components/milestones/new-milestone-dialog";
import { useListProjectMilestonesQuery } from "hooks/api-queries";
import { useTranslation } from "react-i18next";
import { DateTime } from "luxon";
import ProgressBadge from "components/generic/progress-badge";

export const Route = createFileRoute("/projects/$projectId/schedule")({
  component: ScheduleIndexRoute,
});

function ScheduleIndexRoute() {
  const { t } = useTranslation();
  const { projectId } = Route.useParams();

  const listProjectMilestonesQuery = useListProjectMilestonesQuery({ projectId });
  const milestones = listProjectMilestonesQuery.data;

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
            <ProgressBadge progress={50} />
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
    return (
      <Box sx={{ width: "auto", padding: 0 }} p={2}>
        <Typography variant="body1">Chart placeholder content</Typography>
      </Box>
    );
  };

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
        <Typography component="h2" variant="h6" sx={{ padding: "1rem" }}>
          {t("scheduleScreen.objectives")}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "row" }}>
          {renderProjectMilestonesTable()}
          {renderGanttChart()}
        </Box>
      </Card>
    </FlexColumnLayout>
  );
}
