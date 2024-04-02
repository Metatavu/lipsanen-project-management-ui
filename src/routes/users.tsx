import { Box, Button, Card, Toolbar, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import LoaderWrapper from "components/generic/loader-wrapper";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useApi } from "../hooks/use-api";
import { useAtom } from "jotai";
import { usersAtom } from "../atoms/users";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { User } from "generated/client";
import NewUserDialog from "components/layout/users/new-user-dialog";
import UserInfoDialog from "components/layout/users/user-info-dialog";

const UsersIndexRoute = () => {
  const { t } = useTranslation();
  const { usersApi } = useApi();
  const [users, setUsers] = useAtom(usersAtom);
  const [newUserDialogOpen, setNewUserDialogOpen] = useState(false);
  const [userInfoDialogOpen, setUserInfoDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User>();

  /**
   * Get users list
   */
  const getUsersList = async () => {
    setLoading(true);
    try {
      const users = await usersApi.listUsers();
      setUsers(users);
    } catch (error) {
      console.error(t("errorHandling.errorListingProjects"), error);
    }
    setLoading(false);
  };

  useEffect(() => {
    getUsersList();
  }, []);

  /**
   * Creates a new user
   *
   * @param user User
   */
  const createUser = async (user: User) => {
    setLoading(true);
    try {
      const newUser = await usersApi.createUser({ user });
      setUsers([...users, newUser]);
    } catch (error) {
      console.error(t("errorHandling.errorCreatingUser"), error);
    }
    setNewUserDialogOpen(false);
    setLoading(false);
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
        <a onClick={() => onUserSelect(params.row as User)} style={{ cursor: "pointer" }}>
          {params.row.firstName} {params.row.lastName}
        </a>
      )
    },
    {
      field: "company",
      headerName: t("company"),
      editable: true,
      flex: 1,
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
      renderCell: (params) => {
        if (!params.row.lastLoggedIn) return;

        const formattedDate = DateTime.fromJSDate(params.row.lastLoggedIn).toFormat("dd.MM.yyyy - HH:mm");

        return <div>{formattedDate}</div>;
      },
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
      <Box sx={{ height: "auto", width: "100%" }}>
        <DataGrid
          rows={users}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 20,
              },
            },
          }}
          pageSizeOptions={[20, 40, 60]}
          disableRowSelectionOnClick
          pagination
        />
      </Box>
    );
  };

  return (
    <div style={{ padding: "1rem" }}>
      <NewUserDialog open={newUserDialogOpen} handleClose={() => setNewUserDialogOpen(false)} createUser={createUser} />
      <UserInfoDialog open={userInfoDialogOpen} user={selectedUser} projects={undefined} handleClose={() => setUserInfoDialogOpen(false)} action={() => console.log("Action invoked")} />
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
      <LoaderWrapper loading={loading}>
        <Card>{renderUsersTable()}</Card>
      </LoaderWrapper>
    </div>
  );
};

export const Route = createFileRoute("/users")({
  component: UsersIndexRoute,
});
