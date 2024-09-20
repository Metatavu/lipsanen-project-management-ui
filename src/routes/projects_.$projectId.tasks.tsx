import AddIcon from "@mui/icons-material/Add";
import { Button, Card, FormControlLabel, Stack, Switch, Toolbar, Typography } from "@mui/material";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import FilterDrawerButton from "components/generic/filter-drawer";
import { FlexColumnLayout } from "components/generic/flex-column-layout";
import ResizablePanel from "components/generic/resizable-panel";
import LastPlannerView from "components/last-planner/last-planner-view";
import TaskList from "components/tasks/task-list";
import TasksFilterForm from "components/tasks/tasks-filter-form";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { tasksSearchSchema } from "schemas/search";

/**
 * Tasks index route
 */
export const Route = createFileRoute("/projects/$projectId/tasks")({
  component: TasksIndexRoute,
  validateSearch: (search) => tasksSearchSchema.parse(search),
});

/**
 * Tasks index route component
 */
function TasksIndexRoute() {
  const { t } = useTranslation();
  const { milestoneId } = Route.useSearch();
  const { projectId } = Route.useParams();
  const navigate = Route.useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  const [editMode, setEditMode] = useState(false);

  /**
   * Main component render
   */
  return (
    <FlexColumnLayout>
      <Toolbar disableGutters sx={{ gap: 2 }}>
        <Typography component="h1" variant="h5" sx={{ mr: "auto" }}>
          {t("tasksScreen.title")}
        </Typography>
        <FilterDrawerButton route={Route.fullPath} title={t("taskFilters.title")}>
          {(props) => <TasksFilterForm projectId={projectId} {...props} />}
        </FilterDrawerButton>
        <Button startIcon={<AddIcon />} variant="contained" size="large" onClick={() => navigate({ to: "new" })}>
          {t("scheduleScreen.addANewTask")}
        </Button>
      </Toolbar>
      <Card ref={cardRef} sx={{ flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
        <Stack flex={1} minHeight={0}>
          <TaskList
            projectId={projectId}
            filters={{ milestoneId }}
            onTaskClick={(task) => navigate({ to: "$taskId", params: { taskId: task.id as string } })}
          />
        </Stack>
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
