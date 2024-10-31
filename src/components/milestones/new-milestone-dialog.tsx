import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import GenericDatePicker from "components/generic/generic-date-picker";
import { CreateProjectMilestoneRequest } from "generated/client";
import { useApi } from "hooks/use-api";
import { DateTime } from "luxon";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Route } from "routes/projects_.$projectId.schedule";
import { MilestoneFormData } from "types";

/**
 * New milestone dialog component
 *
 * @param props Props
 */
const NewMilestoneDialog = () => {
  const { t } = useTranslation();
  const { projectMilestonesApi } = useApi();
  const queryClient = useQueryClient();
  const { projectId } = Route.useParams();
  const [open, setOpen] = useState(false);
  const [milestoneData, setMilestoneData] = useState<MilestoneFormData>({
    name: "",
    startDate: null,
    endDate: null,
  });

  /**
   * Create milestone mutation
   */
  const createMilestoneMutation = useMutation({
    mutationFn: (params: CreateProjectMilestoneRequest) => projectMilestonesApi.createProjectMilestone(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "milestones"] });
      setOpen(false);
    },
    onError: (error) => console.error(t("errorHandling.errorCreatingProjectMilestone"), error),
  });

  /**
   * Handles milestone creation form submit
   *
   * @param event event
   */
  const handleFormChange = (field: keyof typeof milestoneData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setMilestoneData({ ...milestoneData, [field]: event.target.value });
  };

  /**
   * Handles milestone creation form submit
   *
   * @param field string
   */
  const handleDateFormChange = (field: keyof typeof milestoneData) => (value: DateTime<boolean> | null) => {
    setMilestoneData({ ...milestoneData, [field]: value });
  };

  /**
   * Handles milestone creation form submit
   */
  const handleMilestoneFormSubmit = async () => {
    if (!milestoneData.startDate?.isValid || !milestoneData.endDate?.isValid) return;

    // Convert DateTime objects to JavaScript Date objects
    const startDateIsoConverted = new Date(milestoneData.startDate.toISODate());
    const endDateIsoConverted = new Date(milestoneData.endDate.toISODate());

    //TODO: check originalStartDate and originalEndDate
    await createMilestoneMutation.mutateAsync({
      projectId: projectId,
      milestone: {
        name: milestoneData.name,
        startDate: startDateIsoConverted,
        endDate: endDateIsoConverted,
        originalStartDate: startDateIsoConverted,
        originalEndDate: endDateIsoConverted,
      },
    });

    setMilestoneData({ name: "", startDate: null, endDate: null });
    setOpen(false);
  };

  /**
   * Disables form submit based on required form fields
   */
  const isDisabled = !(!!milestoneData.name && !!milestoneData.startDate && !!milestoneData.endDate);

  /**
   * Main component render
   */
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="contained" color="primary" size="large">
        <AddIcon />
        {t("scheduleScreen.addANewMilestone")}
      </Button>
      <Dialog fullWidth maxWidth="md" open={open} onClose={() => setOpen(false)}>
        <AppBar sx={{ position: "relative" }}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <DialogTitle sx={{ paddingLeft: 0 }}>{t("newProjectMilestoneDialog.title")}</DialogTitle>
            <IconButton edge="start" color="inherit" onClick={() => setOpen(false)} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <DialogContent sx={{ backgroundColor: "#2196F314", display: "flex", flexDirection: "column", gap: 1 }}>
          <TextField
            fullWidth
            id="project-name"
            label={t("newProjectMilestoneDialog.name")}
            placeholder={t("newProjectMilestoneDialog.enterName")}
            value={milestoneData.name}
            onChange={handleFormChange("name")}
            sx={{ "& fieldset": { border: "none" } }}
            required
          />
          <GenericDatePicker
            title={t("newProjectMilestoneDialog.startDate")}
            value={milestoneData.startDate}
            onChange={handleDateFormChange("startDate")}
            maxDate={milestoneData.endDate}
          />
          <GenericDatePicker
            title={t("newProjectMilestoneDialog.endDate")}
            value={milestoneData.endDate}
            onChange={handleDateFormChange("endDate")}
            minDate={milestoneData.startDate}
          />
          <Button
            fullWidth
            onClick={handleMilestoneFormSubmit}
            variant="contained"
            color="primary"
            size="large"
            disabled={isDisabled}
          >
            <AddIcon />
            {t("newProjectMilestoneDialog.create")}
          </Button>
          {createMilestoneMutation.isPending && <LinearProgress />}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewMilestoneDialog;
