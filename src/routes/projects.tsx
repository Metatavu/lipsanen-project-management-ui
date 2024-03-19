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

// TODO: Update from generated files
interface Project {
  id: string;
  name: string;
  type: string;
  start_estimate: string;
  complete_estimate: string;
  status: string;
}

const mockData: Project[] = [
  {
    id: "e51a0d62-83f3-4ff3-a327-9386f2f1a5f9",
    name: "Project A",
    type: "project type",
    start_estimate: "2024-03-15",
    complete_estimate: "2024-04-30",
    status: "Kynnissä",
  },
  {
    id: "f7d0a10a-89c2-4c14-9c26-6c870320c92f",
    name: "Project B",
    type: "project type",
    start_estimate: "2024-04-01",
    complete_estimate: "2024-05-15",
    status: "Tarjousvalmistelu",
  },
  {
    id: "30a5df02-0910-479b-9c90-34b26a161b0d",
    name: "Project C",
    type: "project type",
    start_estimate: "2024-03-20",
    complete_estimate: "2024-06-30",
    status: "Tarjous",
  },
  {
    id: "8c91495a-1203-4c35-a005-5e5f038187e0",
    name: "Project D",
    type: "project type",
    start_estimate: "2024-04-10",
    complete_estimate: "2024-08-20",
    status: "Valmis",
  },
  {
    id: "e4ff3e77-1c10-4b55-94f3-6b38bcab11c3",
    name: "Project E",
    type: "project type",
    start_estimate: "2024-03-25",
    complete_estimate: "2024-06-10",
    status: "Kynnissä",
  },
  {
    id: "9e13167b-1ac7-441d-8138-3a74a4305ad0",
    name: "Project F",
    type: "project type",
    start_estimate: "2024-04-05",
    complete_estimate: "2024-07-15",
    status: "Tarjousvalmistelu",
  },
  {
    id: "12592ee6-fb95-4f32-a792-4d1b27c51729",
    name: "Project G",
    type: "project type",
    start_estimate: "2024-03-18",
    complete_estimate: "2024-05-25",
    status: "Tarjous",
  },
  {
    id: "5f4c44de-29f7-4f26-8bb3-316fbf1d6d90",
    name: "Project H",
    type: "project type",
    start_estimate: "2024-04-12",
    complete_estimate: "2024-08-30",
    status: "Valmis",
  },
  {
    id: "b0704951-8da5-4be6-8d44-2b4b542c5e5f",
    name: "Project I",
    type: "project type",
    start_estimate: "2024-03-22",
    complete_estimate: "2024-06-20",
    status: "Kynnissä",
  },
  {
    id: "ac0f3514-49e5-4e0f-8276-9be201c73b38",
    name: "Project J",
    type: "project type",
    start_estimate: "2024-04-08",
    complete_estimate: "2024-07-05",
    status: "Tarjousvalmistelu",
  },
];

const ProjectsIndexRoute = () => {
  const { t } = useTranslation();
  const { projectsApi } = useApi();
  const [projects, setProject] = useAtom(projectsAtom);
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);

  /**
   * Get projects list
   */
  const getProjectsList = () => {
    const projects = projectsApi.listProjects();
    console.log(projects);
  };

  useEffect(() => {
    getProjectsList();
  }, [getProjectsList]);

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
   * Render projects Datagrid table
   */
  const renderProjectsTable = () => {
    return (
      <Box sx={{ height: "auto", width: "100%" }}>
        <DataGrid
          rows={mockData}
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
      <NewProjectDialog open={newProjectDialogOpen} handleClose={() => setNewProjectDialogOpen(false)} />
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
