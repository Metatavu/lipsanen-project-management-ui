import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  LinearProgress,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateProjectRequest, ProjectStatus } from "generated/client";
import { useApi } from "hooks/use-api";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSetError } from "utils/error-handling";

/**
 * New project dialog component
 *
 * @param props Props
 */
const NewProjectDialog = () => {
  const { t } = useTranslation();
  const { projectsApi } = useApi();
  const queryClient = useQueryClient();
  const setError = useSetError();

  const [open, setOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  /**
   * Create project mutation
   */
  const createProjectMutation = useMutation({
    mutationFn: (params: CreateProjectRequest) => projectsApi.createProject(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setOpen(false);
    },
    onError: (error) => setError(t("errorHandling.errorCreatingNewProject"), error),
  });

  /**
   * Main component render
   */
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="contained" color="primary" size="large">
        <AddIcon />
        {t("newProjectDialog.addNewProject")}
      </Button>
      <Dialog fullWidth maxWidth="md" open={open} onClose={() => setOpen(false)}>
        <AppBar sx={{ position: "relative" }}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <DialogTitle sx={{ paddingLeft: 0 }}>{t("newProjectDialog.creation/ImportOfANewProject")}</DialogTitle>
            <IconButton edge="start" color="inherit" onClick={() => setOpen(false)} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <DialogContentText sx={{ backgroundColor: "#2196F314", padding: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <InfoOutlinedIcon sx={{ marginRight: 1 }} />
            <Typography variant="subtitle2">{t("newProjectDialog.createNewProjectDescription")}</Typography>
          </Box>
        </DialogContentText>
        <DialogContent sx={{ flexDirection: "column" }}>
          <DialogActions sx={{ justifyContent: "center" }}>
            <TextField
              fullWidth
              id="project-name"
              name="name"
              label={t("projectName")}
              placeholder={t("newProjectDialog.enterProjectName")}
              variant="outlined"
              value={newProjectName}
              onChange={(event) => setNewProjectName(event.target.value)}
            />
            <Button
              fullWidth
              onClick={() =>
                newProjectName &&
                createProjectMutation.mutateAsync({
                  project: {
                    name: newProjectName,
                    status: ProjectStatus.Initiation,
                  },
                })
              }
              variant="contained"
              color="primary"
              size="large"
              disabled={!newProjectName}
            >
              <AddIcon />
              {t("newProjectDialog.createNewProject")}
            </Button>
          </DialogActions>
          {createProjectMutation.isPending && <LinearProgress />}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewProjectDialog;
