import ConstructionIcon from "@mui/icons-material/Construction";
import DeleteIcon from "@mui/icons-material/Delete";
import { Card, Chip, Toolbar, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { DataGrid, GridActionsCellItem, GridPaginationModel } from "@mui/x-data-grid";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import FilterDrawerButton from "components/generic/filter-drawer";
import { FlexColumnLayout } from "components/generic/flex-column-layout";
import NewProjectDialog from "components/projects/new-project-dialog";
import ProjectsFilterForm from "components/projects/projects-filter-form";
import { DATE_WITH_LEADING_ZEROS } from "consts";
import { DeleteProjectRequest, Project } from "generated/client";
import { useListProjectsQuery } from "hooks/api-queries";
import { useApi } from "hooks/use-api";
import { useCachedMaxResultsFromQuery } from "hooks/use-cached-max-results";
import { usePaginationToFirstAndMax } from "hooks/use-pagination-to-first-and-max";
import { DateTime } from "luxon";
import { useConfirmDialog } from "providers/confirm-dialog-provider";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { projectsSearchSchema } from "schemas/search";
import { useSetError } from "utils/error-handling";

/**
 * Projects file route
 */
export const Route = createFileRoute("/projects")({
  component: ProjectsIndexRoute,
  validateSearch: (search) => projectsSearchSchema.parse(search),
});

/**
 * Projects index route component
 */
function ProjectsIndexRoute() {
  const { t } = useTranslation();
  const { projectsApi } = useApi();
  const queryClient = useQueryClient();
  const showConfirmDialog = useConfirmDialog();
  const search = Route.useSearch();
  const setError = useSetError();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [first, max] = usePaginationToFirstAndMax(paginationModel);
  const listProjectsQuery = useListProjectsQuery({ first, max });
  const maxResults = useCachedMaxResultsFromQuery(listProjectsQuery);
  const allProjects = useMemo(() => listProjectsQuery.data?.projects ?? [], [listProjectsQuery.data]);

  const projects = allProjects.filter((project) => {
    if (search.status && project.status !== search.status) return false;
    return true;
  });

  /**
   * Delete project mutation
   */
  const deleteProjectMutation = useMutation({
    mutationFn: (params: DeleteProjectRequest) => projectsApi.deleteProject(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => setError(t("errorHandling.errorDeletingProject"), error),
  });

  /**
   * Handle project deletion
   *
   * @params projectId string
   */
  const handleProjectDelete = (projectId?: string) => {
    projectId && deleteProjectMutation.mutateAsync({ projectId: projectId });
  };

  /**
   * Main component render
   */
  return (
    <FlexColumnLayout>
      <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
        <Typography component="h1" variant="h5">
          {t("projects")}
        </Typography>
        <Box sx={{ display: "flex", gap: "1rem" }}>
          <FilterDrawerButton route={Route.fullPath} title={t("projectFilters.title")}>
            {(props) => <ProjectsFilterForm {...props} />}
          </FilterDrawerButton>
          <NewProjectDialog />
        </Box>
      </Toolbar>
      <Card sx={{ flex: 1, minWidth: 0 }}>
        <DataGrid<Project>
          paginationMode="server"
          loading={listProjectsQuery.isLoading}
          sx={{ height: "100%", width: "100%" }}
          rows={projects}
          rowCount={maxResults}
          columns={[
            {
              field: "name",
              headerName: t("projects"),
              flex: 1,
              disableColumnMenu: true,
              renderCell: (params) => (
                <Link
                  to={`/projects/${params.id}/tracking` as string}
                  style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "#0079BF" }}
                >
                  <ConstructionIcon fontSize="small" sx={{ marginRight: 1, color: "#0079BF" }} />
                  {params.value}
                </Link>
              ),
            },
            {
              field: "start_estimate",
              headerName: t("project.estimatedStart"),
              flex: 1,
              disableColumnMenu: true,
              valueGetter: ({ row: { estimatedStartDate } }) =>
                estimatedStartDate
                  ? DateTime.fromJSDate(estimatedStartDate).toLocaleString(DATE_WITH_LEADING_ZEROS)
                  : null,
            },
            {
              field: "complete_estimate",
              headerName: t("project.estimatedEnd"),
              flex: 1,
              disableColumnMenu: true,
              valueGetter: ({ row: { estimatedEndDate } }) =>
                estimatedEndDate ? DateTime.fromJSDate(estimatedEndDate).toLocaleString(DATE_WITH_LEADING_ZEROS) : null,
            },
            {
              field: "status",
              headerName: t("project.status"),
              flex: 1,
              disableColumnMenu: true,
              renderCell: (params) => (
                <Chip
                  size="small"
                  sx={{ bgcolor: (theme) => theme.palette.projectStatus[params.row.status], color: "white" }}
                  label={t(`projectStatuses.${params.row.status}`)}
                />
              ),
            },
            {
              field: "actions",
              type: "actions",
              getActions: (params) => [
                <GridActionsCellItem
                  label={t("generic.delete")}
                  icon={<DeleteIcon color="error" />}
                  showInMenu
                  onClick={() =>
                    showConfirmDialog({
                      title: t("project.deleteProject"),
                      description: t("project.confirmProjectDeleteDescription", { projectName: params.row.name }),
                      cancelButtonEnabled: true,
                      confirmButtonText: t("generic.delete"),
                      onConfirmClick: () => handleProjectDelete(params.row.id),
                    })
                  }
                />,
              ],
            },
          ]}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          disableRowSelectionOnClick
        />
      </Card>
    </FlexColumnLayout>
  );
}
