import { Box, Button, Card, Toolbar, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import { useApi } from "../hooks/use-api";
import { useAtom } from "jotai";
import { usersAtom } from "../atoms/users";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { Company, User } from "generated/client";
import NewUserDialog from "components/layout/users/new-user-dialog";
import UserInfoDialog from "components/layout/users/user-info-dialog";
import { FlexColumnLayout } from "components/generic/flex-column-layout";

export const Route = createFileRoute("/users")({ component: UsersIndexRoute });

function UsersIndexRoute() {
  const { t } = useTranslation();
  const { usersApi, companiesApi } = useApi();
  const [users, setUsers] = useAtom(usersAtom);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [newUserDialogOpen, setNewUserDialogOpen] = useState(false);
  const [userInfoDialogOpen, setUserInfoDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User>();

  /**
   * Get users list
   */
  const getUsersList = async () => {
    try {
      const users = await usersApi.listUsers();
      setUsers(users);
    } catch (error) {
      console.error(t("errorHandling.errorListingUsers"), error);
    }
  };

  /**
   * Get companies list
   */
  const getCompaniesList = async () => {
    try {
      const companies = await companiesApi.listCompanies();
      setCompanies(companies);
    } catch (error) {
      console.error(t("errorHandling.errorListingCompanies"), error);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: Dependency not needed
  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.allSettled([getUsersList(), getCompaniesList()]);
      setLoading(false);
    })();
  }, []);

  /**
   * Creates a new user
   *
   * @param user User
   */
  const createUser = async (user: User) => {
    try {
      const newUser = await usersApi.createUser({ user });
      setUsers([...users, newUser]);
    } catch (error) {
      console.error(t("errorHandling.errorCreatingUser"), error);
    }
    setNewUserDialogOpen(false);
  };

  /**
   * Creates a new company
   *
   * @param selectedCompany Company
   */
  const createCompany = async (selectedCompany: Company) => {
    if (!selectedCompany) return;

    try {
      const newCompany: Company = {
        name: selectedCompany.name,
      };
      const createdCompany = await companiesApi.createCompany({ company: newCompany });
      setCompanies([...companies, createdCompany]);

      return createdCompany;
    } catch (error) {
      console.error(t("errorHandling.errorCreatingNewCompany"), error);
    }
  };

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
      valueFormatter: ({ value }) => companies.find((company) => company.id === value)?.name ?? "",
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
    return (
      <DataGrid
        sx={{ width: "100%", height: "100%" }}
        rows={users}
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
        handleClose={() => setNewUserDialogOpen(false)}
        users={users}
        createUser={createUser}
        companies={companies}
        createCompany={createCompany}
      />
      <UserInfoDialog open={userInfoDialogOpen} user={selectedUser} handleClose={() => setUserInfoDialogOpen(false)} />
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
