import { Button, Card, Toolbar, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useEffect, useState } from "react";
import NewProjectDialog from "components/layout/projects/new-project-dialog";
import ConstructionIcon from "@mui/icons-material/Construction";
import { useApi } from "../hooks/use-api";
import { useAtom } from "jotai";
import { projectsAtom } from "../atoms/projects";
import { Project } from "generated/client";

const ProjectsIndexRoute = () => {
  const { t } = useTranslation();
  const { projectsApi } = useApi();
  const [projects, setProjects] = useAtom(projectsAtom);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);

  /**
   * Get projects list
   */
  const getProjectsList = async () => {
    const projects = await projectsApi.listProjects();
    setProjects(projects);
  };

  useEffect(() => {
    getProjectsList();
  }, [getProjectsList]);

  /**
   * Creates a new project
   */
  const createProject = async () => {
    if (!newProjectName) return;

    try {
      const newProject: Project = {
        name: newProjectName,
      };

      const createdProject = await projectsApi.createProject({ project: newProject });
      setProjects([...projects, createdProject]);

      setNewProjectDialogOpen(false);
    } catch (error) {
      console.error(t("errorHandling.errorCreatingNewProject"), error);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: t("projects"),
      editable: true,
      flex: 1,
      renderCell: (params) => (
        <a style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "#0079BF" }} href="/">
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
    },
    {
      field: " ",
      headerName: "",
      renderCell: () => (
        <Button style={{ marginLeft: "auto", color: "#000" }}>
          <MoreVertIcon />
        </Button>
      ),
    },
  ];

  /**
   * Renders projects Datagrid table
   */
  const renderProjectsTable = () => {
    return (
      <Box sx={{ height: "auto", width: "100%" }}>
        <DataGrid
          rows={projects}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10]}
          disableRowSelectionOnClick
        />
      </Box>
    );
  };

  return (
    <div style={{ padding: "1rem" }}>
      <NewProjectDialog
        open={newProjectDialogOpen}
        handleClose={() => setNewProjectDialogOpen(false)}
        newProjectName={newProjectName}
        setNewProjectName={setNewProjectName}
        createProject={createProject}
      />
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography component="h1" variant="h5">
          {t("projects")}
        </Typography>
        <Box sx={{ display: "flex", gap: "1rem" }}>
          <Button sx={{ borderRadius: 25 }} variant="contained" color="primary" size="large">
            <FilterListIcon />
            {t("showFilters")}
          </Button>
          <Button
            onClick={() => setNewProjectDialogOpen(true)}
            sx={{ borderRadius: 25 }}
            variant="contained"
            color="primary"
            size="large"
          >
            <AddIcon />
            {t("addNewProject")}
          </Button>
        </Box>
      </Toolbar>
      <Card>{renderProjectsTable()}</Card>
    </div>
  );
};

export const Route = createFileRoute("/projects")({
  component: ProjectsIndexRoute,
});
