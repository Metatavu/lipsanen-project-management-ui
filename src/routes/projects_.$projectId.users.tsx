import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Card, Toolbar, Typography } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridPaginationModel } from "@mui/x-data-grid";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import FilterDrawerButton from "components/generic/filter-drawer";
import { FlexColumnLayout } from "components/generic/flex-column-layout";
import { MdiIconifyIconWithBackground } from "components/generic/mdi-icon-with-background";
import NewUserDialog from "components/users/new-user-dialog";
import ProjectUsersFiltersForm from "components/users/project-user-filters-form";
import UserInfoDialog from "components/users/user-info-dialog";
import { DEFAULT_USER_ICON } from "consts";
import { DeleteUserRequest, User } from "generated/client";
import {
  useListCompaniesQuery,
  useListJobPositionsQuery,
  useListProjectsQuery,
  useListUsersQuery,
} from "hooks/api-queries";
import { useApi } from "hooks/use-api";
import { useCachedMaxResultsFromQuery } from "hooks/use-cached-max-results";
import { usePaginationToFirstAndMax } from "hooks/use-pagination-to-first-and-max";
import { DateTime } from "luxon";
import { useConfirmDialog } from "providers/confirm-dialog-provider";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { projectUsersSearchSchema } from "schemas/search";
import { theme } from "theme";

/**
 * Tasks index route
 */
export const Route = createFileRoute("/projects/$projectId/users")({
  component: ProjectUsersIndexRoute,
  validateSearch: (search) => projectUsersSearchSchema.parse(search),
});

/**
 * Tasks index route component
 */
function ProjectUsersIndexRoute() {
  const { projectId } = Route.useParams();
  const search = Route.useSearch();
  const { t } = useTranslation();
  const { usersApi } = useApi();
  const queryClient = useQueryClient();
  const showConfirmDialog = useConfirmDialog();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [first, max] = usePaginationToFirstAndMax(paginationModel);
  const [selectedUser, setSelectedUser] = useState<User>();

  const listUsersQuery = useListUsersQuery({
    first,
    max,
    projectId: projectId,
    companyId: search.companyId,
    jobPositionId: search.jobPositionId,
  });

  const maxResults = useCachedMaxResultsFromQuery(listUsersQuery);
  const listProjectsQuery = useListProjectsQuery();
  const listCompaniesQuery = useListCompaniesQuery();
  const listJobPositionsQuery = useListJobPositionsQuery();

  const loading =
    listUsersQuery.isFetching ||
    listCompaniesQuery.isFetching ||
    listJobPositionsQuery.isFetching ||
    listProjectsQuery.isFetching;

  const users = useMemo(() => listUsersQuery.data?.users ?? [], [listUsersQuery.data]);
  const companies = useMemo(() => listCompaniesQuery.data?.companies ?? [], [listCompaniesQuery.data]);
  const jobPositions = useMemo(() => listJobPositionsQuery.data?.jobPositions ?? [], [listJobPositionsQuery.data]);

  /**
   * Delete user mutation
   */
  const deleteUserMutation = useMutation({
    mutationFn: (params: DeleteUserRequest) => usersApi.deleteUser(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => console.error(t("errorHandling.errorDeletingUser"), error),
  });

  /**
   * Handle user deletion
   *
   * @params userId string
   */
  const handleUserDelete = (userId?: string) => {
    userId && deleteUserMutation.mutateAsync({ userId: userId });
  };

  /**
   * Main component render
   */
  return (
    <FlexColumnLayout>
      <UserInfoDialog userId={selectedUser?.id} handleClose={() => setSelectedUser(undefined)} />
      <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
        <Typography component="h1" variant="h5">
          {t("users")}
        </Typography>
        <Box sx={{ display: "flex", gap: "1rem" }}>
          <FilterDrawerButton route={Route.fullPath} title={t("userFilters.title")}>
            {(props) => <ProjectUsersFiltersForm {...props} />}
          </FilterDrawerButton>
          <NewUserDialog projectId={projectId} />
        </Box>
      </Toolbar>
      <Card sx={{ flex: 1, minWidth: 0 }}>
        <DataGrid
          onRowClick={(params) => setSelectedUser(params.row as User)}
          sx={{ width: "100%", height: "100%", "& .MuiDataGrid-row": { cursor: "pointer" } }}
          rows={users}
          rowCount={maxResults}
          columns={[
            {
              field: "name",
              headerName: t("users"),
              disableColumnMenu: true,
              flex: 1,
              renderCell: (params) => {
                const user: User = params.row;
                const jobPosition = jobPositions?.find((position) => user.jobPositionId === position.id);
                const iconName = jobPosition?.iconName ?? DEFAULT_USER_ICON;
                const iconColor = jobPosition?.color ?? theme.palette.primary.main;

                return (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <MdiIconifyIconWithBackground iconName={iconName} backgroundColor={iconColor} />
                    {user.firstName} {user.lastName}
                  </div>
                );
              },
              valueGetter: (params) => params.row.firstName,
            },
            {
              field: "companyId",
              headerName: t("usersScreen.company"),
              disableColumnMenu: true,
              flex: 1,
              valueFormatter: ({ value }) => companies.find((company) => company.id === value)?.name ?? "",
            },
            {
              field: "jobPositionId",
              headerName: t("usersScreen.position"),
              disableColumnMenu: true,
              flex: 1,
              valueFormatter: ({ value }) => jobPositions.find((jobPosition) => jobPosition.id === value)?.name ?? "",
            },
            {
              field: "lastLoggedIn",
              headerName: t("usersScreen.lastLoggedIn"),
              flex: 1,
              disableColumnMenu: true,
              valueFormatter: ({ value }) => (value ? DateTime.fromJSDate(value).toFormat("dd.MM.yyyy - HH:mm") : ""),
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
                      title: t("usersScreen.deleteUser"),
                      description: t("usersScreen.confirmUserDeleteDescription", {
                        firstName: params.row.firstName,
                        lastName: params.row.lastName,
                      }),
                      cancelButtonEnabled: true,
                      confirmButtonText: t("generic.delete"),
                      onConfirmClick: () => handleUserDelete(params.row.id),
                    })
                  }
                />,
              ],
            },
          ]}
          loading={loading}
          disableRowSelectionOnClick
          paginationMode="server"
          pageSizeOptions={[10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </Card>
    </FlexColumnLayout>
  );
}
