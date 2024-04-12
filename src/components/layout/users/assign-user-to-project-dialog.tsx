import { Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button, MenuItem } from "@mui/material";
import { User, Project } from "generated/client";
import { useApi } from "../../../hooks/use-api";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LoaderWrapper from "components/generic/loader-wrapper";

interface Props {
  open: boolean;
  user: User;
  handleClose: () => void;
  refetchData: () => void;
}

/**
 * Assign user to a single project dialog component
 */
const AssignUserToProjectDialog = ({ open, user, handleClose, refetchData }: Props) => {
  const { t } = useTranslation();
  const { projectsApi, usersApi } = useApi();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Fetches all projects
   */
  const getAllProjects = async () => {
    setLoading(true);
    try {
      const projects = await projectsApi.listProjects();

      setProjects(projects);
    } catch (error) {
      console.error(t("errorHandling.errorListingProjects"), error);
    }
    setLoading(false);
  };

  /**
   * Use effect to fetch all projects
   */
  useEffect(() => {
    getAllProjects();
  }, []);

  /**
   * Handles project select event
   *
   * @param project Project
   */
  const onProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };

  /**
   * Assigns user to project
   */
  const assignUserToProject = async () => {
    if (!user || !selectedProject) return;

    setLoading(true);
    try {
      const updatedProjectIds = [...user.projectIds || [], selectedProject.id!];
      await usersApi.updateUser({
        userId: user.id!,
        user: {
          ...user,
          projectIds: updatedProjectIds
        }
      });
      handleClose();
      refetchData();
    } catch (error) {
      console.error(t("errorHandling.errorAssigningUserToProject"), error);
    }
    setLoading(false);
  };

  /**
   * Renders projects dropdown select
   */
  const renderProjectsDropdownSelect = () => {
    return (
      <TextField
        select
        label={t("projectName")}
        value={selectedProject?.id || ''}
        onChange={(e) => {
          const project = projects.find((p) => p.id === e.target.value);
          project && onProjectSelect(project);
        }}
        fullWidth
        variant="outlined"
      >
        {projects.map((project) => (
          <MenuItem key={project.id} value={project.id}>
            {project.name}
          </MenuItem>
        ))}
      </TextField>
    );
  }

  /**
   * Main component render
   */
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{t("assignUserToProjectDialog.title")}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t("assignUserToProjectDialog.selectProject")}</DialogContentText>
        <LoaderWrapper loading={loading}>
          {renderProjectsDropdownSelect()}
        </LoaderWrapper>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
        {t("assignUserToProjectDialog.cancel")}
        </Button>
        <Button onClick={assignUserToProject} color="primary">
        {t("assignUserToProjectDialog.assign")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AssignUserToProjectDialog;