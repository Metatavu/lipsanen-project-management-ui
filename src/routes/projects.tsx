import { Button, Card, Toolbar, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import NewProjectDialog from "components/layout/projects/new-project-dialog";
import ConstructionIcon from "@mui/icons-material/Construction";
import { useApi } from "../hooks/use-api";
import { CreateProjectRequest } from "generated/client";
import ProjectHelpers from "components/helpers/project-helpers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { logQueryError } from "utils";
import { FlexColumnLayout } from "components/generic/flex-column-layout";

const ProjectsIndexRoute = () => {
  const { t } = useTranslation();
  const { projectsApi } = useApi();
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const listProjectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsApi.listProjects().catch(logQueryError(t("errorHandling.errorListingProjects"))),
  });

  const createProjectMutation = useMutation({
    mutationFn: (requestParams: CreateProjectRequest) => projectsApi.createProject(requestParams),
    onSuccess: () => {
      setNewProjectDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => console.error(t("errorHandling.errorCreatingNewProject"), error),
  });

  /**
   * Grid column definitions for projects table
   */
  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: t("projects"),
      editable: true,
      flex: 1,
      renderCell: (params) => (
        <a style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "#0079BF" }}>
          <ConstructionIcon fontSize="small" sx={{ marginRight: 1, color: "#0079BF" }} />
          {params.value}
        </a>
      ),
    },
    {
      field: "type",
      headerName: t("type"),
      editable: true,
      flex: 1,
    },
    {
      field: "start_estimate",
      headerName: t("estimatedStart"),
      editable: true,
      flex: 1,
    },
    {
      field: "complete_estimate",
      headerName: t("estimatedStart"),
      flex: 1,
    },
    {
      field: "status",
      headerName: t("status"),
      flex: 1,
      renderCell: (params) => ProjectHelpers.renderStatusElement(params.value),
    },
    {
      field: "actions",
      type: "actions",
      getActions: () => [<GridActionsCellItem label="" showInMenu />],
    },
  ];

  /**
   * Renders projects Datagrid table
   */
  const renderProjectsTable = () => {
    return (
      <DataGrid
        loading={listProjectsQuery.isLoading}
        sx={{ height: "100%", width: "100%" }}
        rows={listProjectsQuery.data ?? []}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
      />
    );
  };

  return (
    <FlexColumnLayout>
      <NewProjectDialog
        open={newProjectDialogOpen}
        handleClose={() => setNewProjectDialogOpen(false)}
        createProject={createProjectMutation}
      />
      <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
        <Typography component="h1" variant="h5">
          {t("projects")}
        </Typography>
        <Box sx={{ display: "flex", gap: "1rem" }}>
          <Button variant="contained" color="primary" size="large">
            <FilterListIcon />
            {t("showFilters")}
          </Button>
          <Button onClick={() => setNewProjectDialogOpen(true)} variant="contained" color="primary" size="large">
            <AddIcon />
            {t("addNewProject")}
          </Button>
        </Box>
      </Toolbar>
      <Card sx={{ flex: 1, minWidth: 0 }}>{renderProjectsTable()}</Card>
    </FlexColumnLayout>
  );
};

export const Route = createFileRoute("/projects")({
  component: ProjectsIndexRoute,
});
