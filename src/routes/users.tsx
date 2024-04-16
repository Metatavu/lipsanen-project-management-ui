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
import { Company, Project, User } from "generated/client";
import NewUserDialog from "components/layout/users/new-user-dialog";
import UserInfoDialog from "components/layout/users/user-info-dialog";

const UsersIndexRoute = () => {
  const { t } = useTranslation();
  const { usersApi, projectsApi, companiesApi } = useApi();
  const [users, setUsers] = useAtom(usersAtom);
  const [projects, setProjects] = useState<Project[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
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

  /**
   * Get projects list
   */
  const getProjectsList = async () => {
    setLoading(true);
    try {
      const projects = await projectsApi.listProjects();
      setProjects(projects);
    } catch (error) {
      console.error(t("errorHandling.errorListingProjects"), error);
    }
    setLoading(false);
  }

  /**
   * Get companies list
   */
  const getCompaniesList = async () => {
    setLoading(true);
    try {
      const companies = await companiesApi.listCompanies();
      setCompanies(companies);
    } catch (error) {
      console.error(t("errorHandling.errorListingCompanies"), error);
    }
    setLoading(false);
  };

  /**
   * Refetches user data
   */
  const refetchUserData = async () => {
    getUsersList();

    if (selectedUser && selectedUser.id) {
      const user = await usersApi.findUser({ userId: selectedUser.id });
      setSelectedUser(user);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: Dependency not needed
  useEffect(() => {
    getUsersList();
    getProjectsList();
    getCompaniesList();
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
        <a onClick={() => onUserSelect(params.row as User)} style={{ cursor: "pointer" }}>
          {params.row.firstName} {params.row.lastName}
        </a>
      ),
    },
    {
      field: "company",
      headerName: t("company"),
      editable: true,
      flex: 1,
      renderCell: (params) => {
        const company = companies.find((company) => company.id === params.row.companyId);

        return <div>{company?.name}</div>;
      },
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
      <NewUserDialog
        open={newUserDialogOpen}
        users={users}
        companies={companies}
        projects={projects}
        handleClose={() => setNewUserDialogOpen(false)}
        createUser={createUser}
        createCompany={createCompany}
      />
      <UserInfoDialog open={userInfoDialogOpen} user={selectedUser} handleClose={() => setUserInfoDialogOpen(false)} refetchUserData={refetchUserData}/>
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
