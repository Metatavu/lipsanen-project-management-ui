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
import { Project, User } from "generated/client";
import { useApi } from "../../../hooks/use-api";
import LoaderWrapper from "components/generic/loader-wrapper";
import ProjectHelpers from "components/helpers/project-helpers";
import AssignUserToProjectDialog from "./assign-user-to-project-dialog";

/**
 * Component Props
 */
interface Props {
  open: boolean;
  user?: User;
  handleClose: () => void;
  action?: () => void;
}

/**
 * User info dialog component
 */
const UserInfoDialog = ({ open, user, handleClose, action }: Props) => {
  const { t } = useTranslation();
  const { projectsApi, usersApi } = useApi();
  const [name, setName] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [assignProjectDialogOpen, setAssignProjectDialogOpen] = useState(false);

  /**
   * Fetches user projects
   */
  const getUserProjects = async (user: User) => {
    setLoading(true);
    try {
      const userProjectIds = user.projectIds;
      const projects: Project[] = [];

      if (userProjectIds) {
        for (let i = 0; i < userProjectIds.length; i++) {
          const project = await projectsApi.findProject({ projectId: userProjectIds[i] });
          projects.push(project);
        }

        setUserProjects(projects);
      }
    } catch (error) {
      console.error(t("errorHandling.errorListingUserProjects"), error);
    }
    setLoading(false);
  };

  /**
   * Initially gets user projects
   */
  const initiateUserProjects = async () => {
    if (!user) return;

    getUserProjects(user);
  };

  /**
   * Refetches user projects
   */
  const updateUserProjects = async () => {
    if (!user?.id) return;

    const foundUser = await usersApi.findUser({ userId: user.id });
    getUserProjects(foundUser);
  };

  /**
   * Use effect to set user info
   */
  useEffect(() => {
    if (!user) return;

    setName(`${user.firstName} ${user.lastName}`);
    setOrganisation(user.companyId || "");

    // Fetch user projects
    initiateUserProjects();
  }, [user]);

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
            value={organisation}
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
            value={user?.lastLoggedIn?.toLocaleString() || ""}
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
          {userProjects.map((project, index) => (
            <TableRow key={index}>
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
          <Button onClick={() => setAssignProjectDialogOpen(true)} sx={{ borderRadius: 25 }} variant="text" color="primary" size="medium">
            <AddIcon />
            {t("createNewProject")}
          </Button>
        </DialogActions>
      </DialogContent>
      <AssignUserToProjectDialog open={assignProjectDialogOpen} user={user!} userProjects={userProjects} handleClose={() => setAssignProjectDialogOpen(false)} refetchData={updateUserProjects} />
    </Dialog>
  );
};

export default UserInfoDialog;
