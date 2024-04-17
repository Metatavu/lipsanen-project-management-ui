import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  Button,
  MenuItem,
} from "@mui/material";
import { User, Project, UpdateUserRequest } from "generated/client";
import { useApi } from "../../../hooks/use-api";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import LoaderWrapper from "components/generic/loader-wrapper";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { logQueryError } from "utils";

/**
 * Component Props
 */
interface Props {
  open: boolean;
  user: User;
  userProjects: Project[];
  handleClose: () => void;
}

/**
 * Assign user to a single project dialog component
 *
 * @param props component properties
 */
const AssignUserToProjectDialog = ({ open, user, userProjects, handleClose }: Props) => {
  const { t } = useTranslation();
  const { projectsApi, usersApi } = useApi();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const updateUserMutation = useMutation({
    mutationFn: (requestParams: UpdateUserRequest) => usersApi.updateUser(requestParams),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["user", "projects"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => console.error(t("errorHandling.errorUpdatingUser"), error),
  });

  const listProjectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsApi.listProjects().catch(logQueryError(t("errorHandling.errorListingProjects"))),
  });

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
    if (!user.id || !selectedProject?.id) return;

    setLoading(true);
    try {
      const updatedProjectIds = [...(user.projectIds || []), selectedProject.id];
      await updateUserMutation.mutateAsync({
        userId: user.id,
        user: {
          ...user,
          projectIds: updatedProjectIds,
        },
      });
      setSelectedProject(null);
      handleClose();
    } catch (error) {
      console.error(t("errorHandling.errorAssigningUserToProject"), error);
    }
    setLoading(false);
  };

  /**
   * Renders projects dropdown select
   */
  const renderProjectsDropdownSelect = () => {
    const filteredProjects =
      listProjectsQuery.data?.filter((project) => !userProjects.find((p) => p.id === project.id)) ?? [];

    return (
      <TextField
        select
        label={t("projectName")}
        value={selectedProject?.id || ""}
        onChange={(e) => {
          const project = filteredProjects.find((p) => p.id === e.target.value);
          project && onProjectSelect(project);
        }}
        fullWidth
        variant="outlined"
      >
        {filteredProjects.map((project) => (
          <MenuItem key={project.id} value={project.id}>
            {project.name}
          </MenuItem>
        ))}
      </TextField>
    );
  };

  /**
   * Main component render
   */
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{t("assignUserToProjectDialog.title")}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t("assignUserToProjectDialog.selectProject")}</DialogContentText>
        <LoaderWrapper loading={loading}>{renderProjectsDropdownSelect()}</LoaderWrapper>
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
};

export default AssignUserToProjectDialog;
