import ConstructionIcon from "@mui/icons-material/Construction";
import FilterListIcon from "@mui/icons-material/FilterList";
import { Button, Card, Toolbar, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { DataGrid, GridActionsCellItem, GridPaginationModel } from "@mui/x-data-grid";
import { Link, createFileRoute } from "@tanstack/react-router";
import { FlexColumnLayout } from "components/generic/flex-column-layout";
import ProjectUtils from "utils/project";
import NewProjectDialog from "components/projects/new-project-dialog";
import { useListProjectsQuery } from "hooks/api-queries";
import { usePaginationToFirstAndMax } from "hooks/use-pagination-to-first-and-max";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCachedMaxResultsFromQuery } from "hooks/use-cached-max-results";

/**
 * Projects file route
 */
export const Route = createFileRoute("/projects")({ component: ProjectsIndexRoute });

/**
 * Projects index route component
 */
function ProjectsIndexRoute() {
  const { t } = useTranslation();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [first, max] = usePaginationToFirstAndMax(paginationModel);
  const listProjectsQuery = useListProjectsQuery({ first, max });
  const maxResults = useCachedMaxResultsFromQuery(listProjectsQuery);
  const projects = listProjectsQuery.data?.projects;

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
          <Button variant="contained" color="primary" size="large">
            <FilterListIcon />
            {t("showFilters")}
          </Button>
          <NewProjectDialog />
        </Box>
      </Toolbar>
      <Card sx={{ flex: 1, minWidth: 0 }}>
        <DataGrid
          loading={listProjectsQuery.isLoading}
          sx={{ height: "100%", width: "100%" }}
          rows={projects ?? []}
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
              renderCell: (params) => ProjectUtils.renderStatusElement(params.value),
            },
            {
              field: "actions",
              type: "actions",
              getActions: () => [<GridActionsCellItem label="" showInMenu />],
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
