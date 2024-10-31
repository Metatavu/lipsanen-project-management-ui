import AddIcon from "@mui/icons-material/Add";
import { LoadingButton } from "@mui/lab";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Skeleton,
  TextField,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateUserRequest } from "generated/client";
import { useFindUserQuery, useListProjectsQuery } from "hooks/api-queries";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useApi } from "../../hooks/use-api";

/**
 * Component Props
 */
interface Props {
  userId?: string;
}

/**
 * Assign user to a single project dialog component
 *
 * @param props component properties
 */
const AssignUserToProjectDialog = ({ userId }: Props) => {
  const { t } = useTranslation();
  const { usersApi } = useApi();
  const queryClient = useQueryClient();
  const findUserQuery = useFindUserQuery({ userId });
  const listProjectsQuery = useListProjectsQuery();
  const projects = listProjectsQuery.data?.projects;

  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>();

  /**
   * Update user mutation
   */
  const updateUserMutation = useMutation({
    mutationFn: (params: UpdateUserRequest) => usersApi.updateUser(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => console.error(t("errorHandling.errorUpdatingUser"), error),
  });

  /**
   * Assigns user to project
   */
  const assignUserToProject = async () => {
    if (!userId || !findUserQuery.data || !selectedProjectId) return;

    try {
      const updatedProjectIds = [...(findUserQuery.data.projectIds || []), selectedProjectId];
      await updateUserMutation.mutateAsync({
        userId: userId,
        user: {
          ...findUserQuery.data,
          projectIds: updatedProjectIds,
        },
      });

      setSelectedProjectId(undefined);
      setOpen(false);
    } catch (error) {
      console.error(t("errorHandling.errorAssigningUserToProject"), error);
    }
  };

  /**
   * Renders projects dropdown select
   */
  const renderProjectsDropdownSelect = () => {
    if (findUserQuery.isFetching || listProjectsQuery.isFetching) {
      return <Skeleton height={56} variant="rounded" sx={{ my: 2 }} />;
    }

    if (!findUserQuery.data || !listProjectsQuery.data) return null;

    const userProjectIds = new Set(findUserQuery.data.projectIds ?? []);
    const unassignedProjects = projects?.filter((project) => project.id && !userProjectIds.has(project.id)) ?? [];

    return (
      <TextField
        select
        fullWidth
        label={t("projectName")}
        value={selectedProjectId || ""}
        onChange={(event) => setSelectedProjectId(event.target.value)}
        variant="outlined"
        margin="normal"
      >
        {unassignedProjects.map((project) => (
          <MenuItem key={project.id} value={project.id}>
            {project.name}
          </MenuItem>
        ))}
      </TextField>
    );
  };

  const renderDialog = () => {
    if (!userId) return null;

    const fetchingData = findUserQuery.isFetching || listProjectsQuery.isFetching;

    return (
      <Dialog
        open={open}
        onClose={() => !updateUserMutation.isPending && setOpen(false)}
        disableEscapeKeyDown={updateUserMutation.isPending}
      >
        <DialogTitle>{t("assignUserToProjectDialog.title")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("assignUserToProjectDialog.selectProject")}</DialogContentText>
          {renderProjectsDropdownSelect()}
        </DialogContent>
        <DialogActions>
          <Button
            disabled={fetchingData || updateUserMutation.isPending}
            onClick={() => setOpen(false)}
            color="primary"
          >
            {t("assignUserToProjectDialog.cancel")}
          </Button>
          <LoadingButton
            onClick={assignUserToProject}
            color="primary"
            loading={fetchingData || updateUserMutation.isPending}
          >
            {t("assignUserToProjectDialog.assign")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    );
  };

  /**
   * Main component render
   */
  return (
    <>
      <Button variant="text" color="primary" sx={{ borderRadius: 25 }} onClick={() => setOpen(true)}>
        <AddIcon />
        {t("userInfoDialog.assignToNewProject")}
      </Button>
      {renderDialog()}
    </>
  );
};

export default AssignUserToProjectDialog;
