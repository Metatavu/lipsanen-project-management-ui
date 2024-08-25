import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import { Button, Card, FormControlLabel, Stack, Switch, Toolbar, Typography } from "@mui/material";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { FlexColumnLayout } from "components/generic/flex-column-layout";
import ResizablePanel from "components/generic/resizable-panel";
import LastPlannerView from "components/last-planner/last-planner-view";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/projects/$projectId/tasks")({ component: TasksIndexRoute });

function TasksIndexRoute() {
  const { t } = useTranslation();
  const { projectId } = Route.useParams();
  const cardRef = useRef<HTMLDivElement>(null);

  const [editMode, setEditMode] = useState(false);

  return (
    <FlexColumnLayout>
      <Toolbar disableGutters sx={{ gap: 2 }}>
        <Typography component="h1" variant="h5" sx={{ mr: "auto" }}>
          {t("tasksScreen.title")}
        </Typography>
        <Button startIcon={<FilterListIcon />} variant="contained" size="large">
          {t("generic.showFilters")}
        </Button>
        <Button startIcon={<AddIcon />} variant="contained" size="large">
          {t("scheduleScreen.addANewTask")}
        </Button>
      </Toolbar>
      <Card ref={cardRef} sx={{ flex: 1, minWidth: 0, position: "relative" }}>
        <ResizablePanel
          containerRef={cardRef}
          storeLastPosition
          id="last-planner-panel"
          toolbar={
            <Stack direction="row" alignItems="center" gap={2} px={1} py={0.5} bgcolor="grey.100">
              <Typography component="h2" variant="h5" pl={1} mr="auto">
                {t("lastPlannerView.title")}
              </Typography>
              <FormControlLabel
                control={<Switch value={editMode} onChange={(event) => setEditMode(event.target.checked)} />}
                label={t("lastPlannerView.markTasks")}
              />
            </Stack>
          }
        >
          <LastPlannerView projectId={projectId} editMode={editMode} />
        </ResizablePanel>
      </Card>
      <Outlet />
    </FlexColumnLayout>
  );
}
