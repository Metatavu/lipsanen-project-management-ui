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
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";
import { CreateProjectRequest, ProjectStatus } from "generated/client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useApi } from "hooks/use-api";

/**
 * New project dialog component
 *
 * @param props Props
 */
const NewProjectDialog = () => {
  const { t } = useTranslation();
  const { projectsApi } = useApi();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const createProjectMutation = useMutation({
    mutationFn: (params: CreateProjectRequest) => projectsApi.createProject(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setOpen(false);
    },
    onError: (error) => console.error(t("errorHandling.errorCreatingNewProject"), error),
  });

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="contained" color="primary" size="large">
        <AddIcon />
        {t("addNewProject")}
      </Button>
      <Dialog fullWidth maxWidth="md" open={open} onClose={() => setOpen(false)}>
        <AppBar sx={{ position: "relative" }}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <DialogTitle sx={{ paddingLeft: 0 }}>{t("creation/ImportOfANewProject")}</DialogTitle>
            <IconButton edge="start" color="inherit" onClick={() => setOpen(false)} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <DialogContentText sx={{ backgroundColor: "#2196F314", padding: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <InfoOutlinedIcon sx={{ marginRight: 1 }} />
            <Typography variant="subtitle2">{t("createNewProjectDescription")}</Typography>
          </Box>
        </DialogContentText>
        <DialogContent sx={{ flexDirection: "column" }}>
          <DialogActions sx={{ justifyContent: "center" }}>
            <TextField
              fullWidth
              id="project-name"
              name="name"
              label={t("projectName")}
              placeholder={t("enterProjectName")}
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
              {t("createNewProject")}
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewProjectDialog;
