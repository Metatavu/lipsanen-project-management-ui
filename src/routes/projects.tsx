import ConstructionIcon from "@mui/icons-material/Construction";
import DeleteIcon from "@mui/icons-material/Delete";
import { Card, Toolbar, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { DataGrid, GridActionsCellItem, GridPaginationModel } from "@mui/x-data-grid";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import FilterDrawerButton from "components/generic/filter-drawer";
import { FlexColumnLayout } from "components/generic/flex-column-layout";
import NewProjectDialog from "components/projects/new-project-dialog";
import ProjectsFilterForm from "components/projects/projects-filter-form";
import { DeleteProjectRequest } from "generated/client";
import { useListProjectsQuery } from "hooks/api-queries";
import { useApi } from "hooks/use-api";
import { useCachedMaxResultsFromQuery } from "hooks/use-cached-max-results";
import { usePaginationToFirstAndMax } from "hooks/use-pagination-to-first-and-max";
import { useConfirmDialog } from "providers/confirm-dialog-provider";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { projectsSearchSchema } from "schemas/search";
import ProjectUtils from "utils/project";

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

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [first, max] = usePaginationToFirstAndMax(paginationModel);
  const listProjectsQuery = useListProjectsQuery({ first, max });
  const maxResults = useCachedMaxResultsFromQuery(listProjectsQuery);
  const allProjects = listProjectsQuery.data?.projects ?? [];
  // TODO: Change to API based filtering
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
    onError: (error) => console.error(t("errorHandling.errorDeletingProject"), error),
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
        <DataGrid
          loading={listProjectsQuery.isLoading}
          sx={{ height: "100%", width: "100%" }}
          rows={projects}
          rowCount={maxResults}
          columns={[
            {
              field: "name",
              headerName: t("projects"),
              editable: true,
              flex: 1,
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
              field: "type",
              headerName: t("project.type"),
              editable: true,
              flex: 1,
            },
            {
              field: "start_estimate",
              headerName: t("project.estimatedStart"),
              editable: true,
              flex: 1,
            },
            {
              field: "complete_estimate",
              headerName: t("project.estimatedStart"),
              flex: 1,
            },
            {
              field: "status",
              headerName: t("project.status"),
              flex: 1,
              renderCell: (params) => ProjectUtils.renderStatusElement(params.value),
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
