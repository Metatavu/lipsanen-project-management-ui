import {
  Button,
  AppBar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Toolbar,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ConstructionIcon from "@mui/icons-material/Construction";
import { Company, Project, User } from "generated/client";
import { useApi } from "../../../hooks/use-api";
import LoaderWrapper from "components/generic/loader-wrapper";
import ProjectHelpers from "components/helpers/project-helpers";
import AssignUserToProjectDialog from "./assign-user-to-project-dialog";
import { useQuery } from "@tanstack/react-query";
import { logQueryError } from "utils";

/**
 * Component Props
 */
interface Props {
  open: boolean;
  user: User;
  companies: Company[];
  handleClose: () => void;
}

/**
 * User info dialog component
 *
 * @param props component properties
 */
const UserInfoDialog = ({ open, user, companies, handleClose }: Props) => {
  const { t } = useTranslation();
  const { projectsApi, usersApi } = useApi();
  const [name, setName] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [role, setRole] = useState("");
  const [assignProjectDialogOpen, setAssignProjectDialogOpen] = useState(false);

  const findUserQuery = useQuery({
    queryKey: ["user"],
    queryFn: () =>
      // TODO: Is there a way to not need the assertion here?
      usersApi
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        .findUser({ userId: user!.id! })
        .catch(logQueryError(t("errorHandling.errorFindingUser"))),
    enabled: !!user,
  });

  const listUserProjectsQuery = useQuery({
    // TODO: Is this correct or should it be ["user", "projects"]
    queryKey: ["userProjects"],
    queryFn: async () => {
      const userProjectIds = findUserQuery.data?.projectIds;
      const projects: Project[] = [];

      if (userProjectIds) {
        await Promise.all(
          userProjectIds.map(async (projectId) => {
            try {
              const project = await projectsApi.findProject({ projectId });
              projects.push(project);
            } catch (error) {
              logQueryError(t("errorHandling.errorListingUserProjects"));
            }
          }),
        );
      }

      return projects;
    },
    enabled: !!findUserQuery.data?.projectIds,
  });

  // TODO: This works but I'm sure it's not correct. How to get the findUserQuery and listUserProjectQuery to update when the selected user changes?
  useEffect(() => {
    findUserQuery.refetch();
  }, [user]);

  useEffect(() => {
    listUserProjectsQuery.refetch();
  }, [findUserQuery.data]);

  /**
   * Use effect to set user info
   */
  useEffect(() => {
    if (!findUserQuery.data) return;

    setName(`${findUserQuery.data.firstName} ${findUserQuery.data.lastName}`);
    setOrganisation(findUserQuery.data.companyId || "");
  }, [findUserQuery.data]);

  /**
   * Handles user info change
   *
   * TODO: remove if not needed
   *
   * @param field field id
   */
  const handleUserInfoChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (field === "name") setName(value);
    else if (field === "organisation") setOrganisation(value);
    else if (field === "role") setRole(value);
  };

  /**
   * Renders user info section
   */
  const renderUserInfoSection = () => (
    <div style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}>
      <Grid container spacing={1} padding={2}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            disabled
            id="name"
            name="name"
            label={t("userInfoDialog.name")}
            placeholder={t("userInfoDialog.name")}
            variant="outlined"
            value={name}
            onChange={handleUserInfoChange("name")}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            disabled
            id="role"
            name="role"
            label={t("userInfoDialog.role")}
            placeholder={t("userInfoDialog.role")}
            variant="outlined"
            value={role}
            onChange={handleUserInfoChange("role")}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            fullWidth
            disabled
            id="organisation"
            name="organisation"
            label={t("userInfoDialog.organisation")}
            placeholder={t("userInfoDialog.organisation")}
            variant="outlined"
            value={companies.find((company) => company.id === organisation)?.name ?? organisation}
            onChange={handleUserInfoChange("organisation")}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            fullWidth
            disabled
            id="lastLogin"
            name="lastLogin"
            label={t("userInfoDialog.lastLogin")}
            placeholder={t("userInfoDialog.lastLogin")}
            variant="outlined"
            value={findUserQuery.data?.lastLoggedIn?.toLocaleString() || ""}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            fullWidth
            disabled
            id="estimatesAccuracy"
            name="estimatesAccuracy"
            label={t("userInfoDialog.projectEstimatesAccuracy")}
            placeholder={t("userInfoDialog.projectEstimatesAccuracy")}
            variant="outlined"
            value=""
            onChange={() => {}}
          />
        </Grid>
      </Grid>
    </div>
  );

  /**
   * Renders user projects table
   *
   * TODO: Once Project status is implemented in the API - add the status logic support
   */
  const renderUserProjectsTable = () => (
    <TableContainer>
      <Table style={{ width: "100%" }}>
        <TableHead>
          <TableRow>
            <TableCell style={{ width: "60%", border: "1px solid rgba(0, 0, 0, 0.1)" }}>
              {t("userInfoDialog.projectName")}
            </TableCell>
            <TableCell style={{ width: "20%", border: "1px solid rgba(0, 0, 0, 0.1)" }}>
              {t("userInfoDialog.projectEstimatesAccuracy")}
            </TableCell>
            <TableCell style={{ width: "20%", border: "1px solid rgba(0, 0, 0, 0.1)" }}>
              {t("userInfoDialog.projectStatus")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {listUserProjectsQuery.data?.map((project) => (
            <TableRow key={project.id}>
              <TableCell style={{ border: "1px solid rgba(0, 0, 0, 0.1)" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <ConstructionIcon fontSize="small" sx={{ marginRight: 1, color: "#000000", opacity: 0.5 }} />
                  {project.name}
                </div>
              </TableCell>
              <TableCell style={{ border: "1px solid rgba(0, 0, 0, 0.1)" }}>80%</TableCell>
              <TableCell style={{ border: "1px solid rgba(0, 0, 0, 0.1)" }}>
                {ProjectHelpers.renderStatusElement(project.status)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const loading =
    listUserProjectsQuery.isPending ||
    findUserQuery.isPending ||
    listUserProjectsQuery.isFetching ||
    findUserQuery.isFetching;

  /**
   * Main component render
   */
  return (
    <Dialog fullWidth maxWidth="lg" open={open} onClose={handleClose}>
      <AppBar sx={{ position: "relative" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <DialogTitle>
            {user?.firstName} {user?.lastName}
          </DialogTitle>
          <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      {renderUserInfoSection()}
      <DialogContentText sx={{ padding: 2 }} variant={"h5"}>
        {t("userInfoDialog.projects")}
      </DialogContentText>
      <DialogContent style={{ padding: 0 }}>
        <LoaderWrapper loading={loading}>{renderUserProjectsTable()}</LoaderWrapper>
        <DialogActions sx={{ justifyContent: "end" }}>
          <Button
            onClick={() => setAssignProjectDialogOpen(true)}
            sx={{ borderRadius: 25 }}
            variant="text"
            color="primary"
            size="medium"
          >
            <AddIcon />
            {t("createNewProject")}
          </Button>
        </DialogActions>
      </DialogContent>
      <AssignUserToProjectDialog
        open={assignProjectDialogOpen}
        user={findUserQuery.data ?? user}
        userProjects={listUserProjectsQuery.data ?? []}
        handleClose={() => setAssignProjectDialogOpen(false)}
      />
    </Dialog>
  );
};

export default UserInfoDialog;
