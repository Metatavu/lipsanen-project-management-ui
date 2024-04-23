import { Box, Card, Toolbar, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { FlexColumnLayout } from "components/generic/flex-column-layout";
import NewProjectDialog from "components/projects/new-project-dialog";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/projects/$projectId/schedule")({
  component: ScheduleIndexRoute,
});

function ScheduleIndexRoute() {
  const { t } = useTranslation();
  const { projectId } = Route.useParams();

  /**
   * Renders the milestone list table
   */
  const renderMilestonesList = () => {
    return (
      <Box sx={{ width: "50%", padding: 0 }} p={2}>
        <Typography variant="body1">Milestone table placeholder</Typography>
      </Box>
    );
  };

  /**
   * Renders the milestone list table
   */
  const renderGanttChart = () => {
    return (
      <Box sx={{ width: "50%", padding: 0 }} p={2}>
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
          <NewProjectDialog />
        </Box>
      </Toolbar>
      <Card sx={{ flex: 1, minWidth: 0, padding: "1rem" }}>
        <Typography component="h2" variant="h6" gutterBottom>
          {t("scheduleScreen.objectives")}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "row" }}>
          {renderMilestonesList()}
          {renderGanttChart()}
        </Box>
      </Card>
    </FlexColumnLayout>
  );
}
