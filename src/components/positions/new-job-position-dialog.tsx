import {
  AppBar,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  TextField,
  Toolbar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useApi } from "hooks/use-api";
import { CreateJobPositionRequest } from "generated/client";
import ColorSelector from "components/generic/color-selector";
import { theme } from "theme";
import IconSelector from "./icon-selector";

const DEFAULT_COLOR = theme.palette.primary.main;

/**
 * New job position dialog component
 *
 * @param props Props
 */
const NewJobPositionDialog = () => {
  const { t } = useTranslation();
  const { jobPositionsApi } = useApi();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [jobPositionData, setJobPositionData] = useState({
    name: "",
    color: theme.palette.primary.main,
    iconName: "",
  });

  /**
   * Create job position mutation
   */
  const createJobPositionMutation = useMutation({
    mutationFn: (params: CreateJobPositionRequest) => jobPositionsApi.createJobPosition(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobPositions"] });
      setOpen(false);
    },
    onError: (error) => console.error(t("errorHandling.errorCreatingJobPosition"), error),
  });

  /**
   * Handles icon change
   *
   * @param iconName string
   */
  const handleIconChange = (iconName: string) => {
    setJobPositionData({ ...jobPositionData, iconName });
  };

  /**
   * Handles form change
   *
   * @param field string
   */
  const handleFormChange = (field: keyof typeof jobPositionData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setJobPositionData({ ...jobPositionData, [field]: event.target.value });
  };

  /**
   * Handles form submit
   */
  const handleJobPositionFormSubmit = async () => {
    await createJobPositionMutation.mutateAsync({
      jobPosition: jobPositionData,
    });

    setJobPositionData({ name: "", color: DEFAULT_COLOR, iconName: "" });
    setOpen(false);
  };

  /**
   * Disables form submit based on required form fields
   */
  const isDisabled = !(!!jobPositionData.name && !!jobPositionData.color && !!jobPositionData.iconName);

  /**
   * Renders color selector white box with label
   *
   * @param label string
   */
  const renderColorSelectorWhiteBoxWithLabel = (label: string) => {
    return (
      <div style={{ backgroundColor: "#fff", padding: "10px", borderRadius: "5px" }}>
        <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "10px" }}>{label}</div>
        <ColorSelector
          color={jobPositionData.color}
          onChange={(color) => setJobPositionData({ ...jobPositionData, color })}
        />
      </div>
    );
  };

  /**
   * Main component render
   */
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="contained" color="primary" size="large">
        <AddIcon />
        {t("jobPositionDialog.addNewJobPosition")}
      </Button>
      <Dialog fullWidth maxWidth="sm" open={open} onClose={() => setOpen(false)}>
        <AppBar sx={{ position: "relative" }}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <DialogTitle sx={{ paddingLeft: 0 }}>{t("jobPositionDialog.title")}</DialogTitle>
            <IconButton edge="start" color="inherit" onClick={() => setOpen(false)} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <DialogContent sx={{ backgroundColor: "#2196F314", display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            fullWidth
            id="job-position-name"
            label={t("jobPositionDialog.name")}
            placeholder={t("jobPositionDialog.enterName")}
            value={jobPositionData.name}
            onChange={handleFormChange("name")}
            sx={{ "& fieldset": { border: "none" } }}
            required
          />
          {renderColorSelectorWhiteBoxWithLabel(t("jobPositionDialog.color"))}
          <IconSelector icon={jobPositionData.iconName} onChange={handleIconChange} />
          <Button
            fullWidth
            onClick={handleJobPositionFormSubmit}
            variant="contained"
            color="primary"
            size="large"
            disabled={isDisabled}
          >
            <AddIcon />
            {t("jobPositionDialog.create")}
          </Button>
          {createJobPositionMutation.isPending && <LinearProgress />}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewJobPositionDialog;
