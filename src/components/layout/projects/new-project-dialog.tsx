import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";
import { UseMutationResult } from "@tanstack/react-query";
import { CreateProjectRequest, Project, ProjectStatus } from "generated/client";

/**
 * Component Props
 */
interface Props {
  open: boolean;
  handleClose: () => void;
  createProject: UseMutationResult<Project, Error, CreateProjectRequest, unknown>;
}

/**
 * New project dialog component
 *
 * @param props Props
 */
const NewProjectDialog = ({ open, handleClose, createProject }: Props) => {
  const { t } = useTranslation();
  const [newProjectName, setNewProjectName] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);

  /**
   * Handles project name change event
   *
   * @param event event
   */
  const handleProjectNameChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    if (!value) setIsDisabled(true);
    else setIsDisabled(false);

    setNewProjectName(value);
  };

  /**
   * Create project handler
   */
  const handleCreateProject = async () => {
    if (!newProjectName) return;

    const newProject: Project = {
      name: newProjectName,
      status: ProjectStatus.Initiation,
    };

    createProject.mutateAsync({ project: newProject });
  };

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={handleClose}>
      <AppBar sx={{ position: "relative" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <DialogTitle sx={{ paddingLeft: 0 }}>{t("creation/ImportOfANewProject")}</DialogTitle>
          <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
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
            onChange={handleProjectNameChange}
          />
          <Button
            fullWidth
            onClick={handleCreateProject}
            variant="contained"
            color="primary"
            size="large"
            disabled={isDisabled}
          >
            <AddIcon />
            {t("createNewProject")}
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default NewProjectDialog;
