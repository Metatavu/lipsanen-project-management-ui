import { Box, Button, Card, Toolbar, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import { useApi } from "../hooks/use-api";
import { useState } from "react";
import { DateTime } from "luxon";
import { CreateCompanyRequest, CreateUserRequest, User } from "generated/client";
import NewUserDialog from "components/layout/users/new-user-dialog";
import UserInfoDialog from "components/layout/users/user-info-dialog";
import { FlexColumnLayout } from "components/generic/flex-column-layout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { logQueryError } from "utils";

export const Route = createFileRoute("/users")({ component: UsersIndexRoute });

function UsersIndexRoute() {
  const { t } = useTranslation();
  const { usersApi, projectsApi, companiesApi } = useApi();
  const [newUserDialogOpen, setNewUserDialogOpen] = useState(false);
  const [userInfoDialogOpen, setUserInfoDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User>();
  const queryClient = useQueryClient();

  // TODO: Please note the refetchUserData function is now replaced by Query invalidations- please check.
  const listUsersQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => usersApi.listUsers().catch(logQueryError(t("errorHandling.errorListingUsers"))),
  });

  const listProjectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsApi.listProjects().catch(logQueryError(t("errorHandling.errorListingProjects"))),
  });

  const listCompaniesQuery = useQuery({
    queryKey: ["companies"],
    queryFn: () => companiesApi.listCompanies().catch(logQueryError(t("errorHandling.errorListingCompanies"))),
  });

  const createUserMutation = useMutation({
    mutationFn: (requestParams: CreateUserRequest) => usersApi.createUser(requestParams),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setNewUserDialogOpen(false);
    },
    onError: (error) => console.error(t("errorHandling.errorCreatingUser"), error),
  });

  const createCompanyMutation = useMutation({
    mutationFn: (requestParams: CreateCompanyRequest) => companiesApi.createCompany(requestParams),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["companies"] }),
    onError: (error) => console.error(t("errorHandling.errorCreatingNewCompany"), error),
  });

  /**
   * Grid column definitions for users table
   */
  const columns: GridColDef[] = [
    {
      field: "firstName",
      headerName: t("users"),
      editable: true,
      flex: 1,
      renderCell: (params) => (
        <Button variant="text" onClick={() => onUserSelect(params.row as User)} sx={{ height: 32, px: 2 }}>
          {params.row.firstName} {params.row.lastName}
        </Button>
      ),
    },
    {
      field: "companyId",
      headerName: t("company"),
      editable: true,
      flex: 1,
      valueFormatter: ({ value }) => listCompaniesQuery.data?.find((company) => company.id === value)?.name ?? "",
    },
    {
      field: "role",
      headerName: t("role"),
      editable: true,
      flex: 1,
    },
    {
      field: "lastLoggedIn",
      headerName: t("lastLoggedIn"),
      flex: 1,
      valueFormatter: ({ value }) => (value ? DateTime.fromJSDate(value).toFormat("dd.MM.yyyy - HH:mm") : ""),
    },
    {
      field: "actions",
      type: "actions",
      getActions: () => [<GridActionsCellItem label="" showInMenu />],
    },
  ];

  /**
   * Handles user select event
   *
   * @param user User
   */
  const onUserSelect = (user: User) => {
    setSelectedUser(user);
    setUserInfoDialogOpen(true);
  };

  /**
   * Renders users table
   */
  const renderUsersTable = () => {
    const loading = listUsersQuery.isLoading || listProjectsQuery.isLoading || listCompaniesQuery.isLoading;

    return (
      <DataGrid
        sx={{ width: "100%", height: "100%" }}
        rows={listUsersQuery.data ?? []}
        columns={columns}
        loading={loading}
        disableRowSelectionOnClick
        pagination
      />
    );
  };

  return (
    <FlexColumnLayout>
      <NewUserDialog
        open={newUserDialogOpen}
        users={listUsersQuery.data ?? []}
        companies={listCompaniesQuery.data ?? []}
        projects={listProjectsQuery.data ?? []}
        handleClose={() => setNewUserDialogOpen(false)}
        createUser={createUserMutation}
        createCompany={createCompanyMutation}
      />
      {selectedUser && (
        <UserInfoDialog
          open={userInfoDialogOpen}
          user={selectedUser}
          companies={listCompaniesQuery.data ?? []}
          handleClose={() => setUserInfoDialogOpen(false)}
        />
      )}
      <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
        <Typography component="h1" variant="h5">
          {t("users")}
        </Typography>
        <Box sx={{ display: "flex", gap: "1rem" }}>
          <Button variant="contained" color="primary" size="large">
            <FilterListIcon />
            {t("showFilters")}
          </Button>
          <Button onClick={() => setNewUserDialogOpen(true)} variant="contained" color="primary" size="large">
            <AddIcon />
            {t("addANewUser")}
          </Button>
        </Box>
      </Toolbar>
      <Card sx={{ flex: 1, minWidth: 0 }}>{renderUsersTable()}</Card>
    </FlexColumnLayout>
  );
}
