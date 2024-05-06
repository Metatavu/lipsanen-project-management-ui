import FilterListIcon from "@mui/icons-material/FilterList";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Button, Card, Toolbar, Typography } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridPaginationModel } from "@mui/x-data-grid";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { FlexColumnLayout } from "components/generic/flex-column-layout";
import NewUserDialog from "components/users/new-user-dialog";
import UserInfoDialog from "components/users/user-info-dialog";
import { DeleteUserRequest, User } from "generated/client";
import { useListCompaniesQuery, useListUsersQuery } from "hooks/api-queries";
import { useApi } from "hooks/use-api";
import { useCachedMaxResultsFromQuery } from "hooks/use-cached-max-results";
import { usePaginationToFirstAndMax } from "hooks/use-pagination-to-first-and-max";
import { DateTime } from "luxon";
import { useConfirmDialog } from "providers/confirm-dialog-provider";
import { useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Users file route
 */
export const Route = createFileRoute("/users")({ component: UsersIndexRoute });

/**
 * Users index route component
 */
function UsersIndexRoute() {
  const { t } = useTranslation();
  const { usersApi } = useApi();
  const queryClient = useQueryClient();
  const showConfirmDialog = useConfirmDialog();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [first, max] = usePaginationToFirstAndMax(paginationModel);
  const [selectedUser, setSelectedUser] = useState<User>();

  const listUsersQuery = useListUsersQuery({ first, max });
  const maxResults = useCachedMaxResultsFromQuery(listUsersQuery);
  const listCompaniesQuery = useListCompaniesQuery();

  const loading = listUsersQuery.isFetching || listCompaniesQuery.isFetching;

  const users = listUsersQuery.data?.users;
  const companies = listCompaniesQuery.data?.companies;

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
          <Button variant="contained" color="primary" size="large">
            <FilterListIcon />
            {t("generic.showFilters")}
          </Button>
          <NewUserDialog />
        </Box>
      </Toolbar>
      <Card sx={{ flex: 1, minWidth: 0 }}>
        <DataGrid
          sx={{ width: "100%", height: "100%" }}
          rows={users ?? []}
          rowCount={maxResults}
          columns={[
            {
              field: "name",
              headerName: t("users"),
              editable: true,
              flex: 1,
              renderCell: (params) => {
                const user: User = params.row;

                return (
                  <Button variant="text" sx={{ height: 32, px: 2 }} onClick={() => setSelectedUser(user)}>
                    {user.firstName} {user.lastName}
                  </Button>
                );
              },
            },
            {
              field: "companyId",
              headerName: t("usersScreen.company"),
              editable: true,
              flex: 1,
              valueFormatter: ({ value }) => companies?.find((company) => company.id === value)?.name ?? "",
            },
            {
              field: "role",
              headerName: t("usersScreen.role"),
              editable: true,
              flex: 1,
            },
            {
              field: "lastLoggedIn",
              headerName: t("usersScreen.lastLoggedIn"),
              flex: 1,
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
          pageSizeOptions={[10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </Card>
    </FlexColumnLayout>
  );
}
