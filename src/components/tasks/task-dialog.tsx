import { useState, useMemo, ChangeEvent } from "react";
import {
  AppBar,
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { DateTime } from "luxon";
import { useTranslation } from "react-i18next";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useApi } from "hooks/use-api";
import { TaskFormData } from "types";
import { useListProjectUsersQuery } from "hooks/api-queries";
import GenericDatePicker from "components/generic/generic-date-picker";
import { CreateTaskRequest, Task, TaskStatus, UpdateTaskRequest } from "generated/client";

/**
 * Task dialog properties
 */
interface Props {
  projectId: string;
  milestoneId: string;
  open: boolean;
  task?: Task; // Existing task to edit
  onClose: () => void;
}

/**
 * Task dialog component
 */
const TaskDialog = ({ projectId, milestoneId, open, task, onClose }: Props) => {
  const { t } = useTranslation();
  const { milestoneTasksApi } = useApi();
  const queryClient = useQueryClient();
  const listProjectUsersQuery = useListProjectUsersQuery(projectId);
  const projectUsers = useMemo(() => listProjectUsersQuery.data ?? [], [listProjectUsersQuery.data]);

  // Existing or new task data depending on task existence
  // For now TaskData and Task objects are different since Task doesn't support all required fields
  // TODO: add Task object support for all missing parameters
  const existingOrNewTaskData = task ? {
    name: task.name,
    startDate: DateTime.fromJSDate(task.startDate),
    endDate: DateTime.fromJSDate(task.endDate),
    assignees: [],
    status: task.status,
    type: "",
    estimatedDuration: "",
    estimatedReadiness: "",
  } : {
    name: "",
    startDate: null,
    endDate: null,
    assignees: [],
    status: TaskStatus.NotStarted,
    type: "",
    estimatedDuration: "",
    estimatedReadiness: "",
  };

  const [taskData, setTaskData] = useState<TaskFormData>(existingOrNewTaskData);

  /**
   * Create task mutation
   */
  const createTaskMutation = useMutation({
    mutationFn: (params: CreateTaskRequest) => milestoneTasksApi.createTask(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["milestoneTasks", projectId, milestoneId] });
      onClose();
    },
    onError: (error) => console.error(t("errorHandling.errorCreatingMilestoneTask"), error),
  });

  /**
   * Update task mutation
   */
  const updateTaskMutation = useMutation({
    mutationFn: (params: UpdateTaskRequest) => milestoneTasksApi.updateTask(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["milestoneTasks", projectId, milestoneId] });
      onClose();
    },
    onError: (error) => console.error(t("errorHandling.errorUpdatingMilestoneTask"), error),
  });

  /**
   * Handles task creation form change
   *
   * @param field string
   * @param event event
   */
  const handleFormChange = (field: keyof typeof taskData) => (event: ChangeEvent<HTMLInputElement>) => {
    setTaskData({ ...taskData, [field]: event.target.value });
  };

  /**
   * Handles task creation form date change
   *
   * @param field string
   * @param value date
   */
  const handleDateFormChange = (field: keyof typeof taskData) => (value: DateTime<boolean> | null) => {
    setTaskData({ ...taskData, [field]: value });
  };

  /**
   * Handles task update or task create form submit
   */
  const handleTaskFormSubmit = async () => {
    if (!taskData.startDate || !taskData.endDate) return;

    // Convert DateTime objects to JavaScript Date objects
    const startDateIsoConverted = new Date(taskData.startDate.toISODate()!);
    const endDateIsoConverted = new Date(taskData.endDate.toISODate()!);
    
    if (task && task.id) {
      await updateTaskMutation.mutateAsync({
        projectId: projectId,
        milestoneId: milestoneId,
        taskId: task.id,
        task: {
          name: taskData.name,
          startDate: startDateIsoConverted,
          endDate: endDateIsoConverted,
          status: taskData.status,
          milestoneId: milestoneId,
        }
      });
    } else {
      await createTaskMutation.mutateAsync({
        projectId: projectId,
        milestoneId: milestoneId,
        task: {
          name: taskData.name,
          startDate: startDateIsoConverted,
          endDate: endDateIsoConverted,
          status: taskData.status,
          milestoneId: milestoneId,
        }
      });
    }

    setTaskData({
      name: "",
      startDate: null,
      endDate: null,
      assignees: [],
      status: TaskStatus.NotStarted,
      type: "",
      estimatedDuration: "",
      estimatedReadiness: ""
    });
    onClose();
  };

  /**
   * Renders task data select dropdown picker with multiple select option
   * 
   * @param field field
   * @param label dropdown label
   * @param options dropdown options
   * @param multipleSelect multiple select option
   */
  const renderTaskDataDropdownPicker = (field: keyof typeof taskData, label: string, options: string[], multipleSelect: boolean) => {
    return (
      <TextField
        select
        fullWidth
        label={label}
        value={taskData[field]}
        onChange={handleFormChange(field)}
        SelectProps={
          multipleSelect
            ? {
              multiple: true,
              renderValue: (selected) => (selected as string[]).join(", "),
            }
            : undefined
        }
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>
    );
  };

  /**
   * Renders task info section
   */
  const renderNewTaskInfoSection = () => {
    return (
      <div style={{ backgroundColor: "rgba(33, 150, 243, 0.08)" }}>
        <Grid container spacing={1} padding={2}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label={t("newMilestoneTaskDialog.name")}
              value={taskData.name}
              onChange={handleFormChange("name")}
            />
          </Grid>
          <Grid item xs={6}>
            {renderTaskDataDropdownPicker(
              "status",
              t("newMilestoneTaskDialog.status"),
              Object.values(TaskStatus),
              false
            )}
          </Grid>
          <Grid item xs={6}>
            {renderTaskDataDropdownPicker(
              "assignees",
              t("newMilestoneTaskDialog.assignees"),
              projectUsers.map(user => user.firstName + " " + user.lastName),
              true
            )}
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label={t("newMilestoneTaskDialog.type")}
              value={taskData.type}
              onChange={handleFormChange("type")}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              label={t("newMilestoneTaskDialog.estimatedDuration")}
              value={taskData.estimatedDuration}
              onChange={handleFormChange("estimatedDuration")}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              label={t("newMilestoneTaskDialog.estimatedReadiness")}
              value={taskData.estimatedReadiness}
              onChange={handleFormChange("estimatedReadiness")}
            />
          </Grid>
          <Grid item xs={3}>
            <GenericDatePicker
              fullWidth
              label={t("newMilestoneTaskDialog.start")}
              value={taskData.startDate}
              onChange={handleDateFormChange("startDate")}
            />
          </Grid>
          <Grid item xs={3}>
            <GenericDatePicker
              fullWidth
              label={t("newMilestoneTaskDialog.end")}
              value={taskData.endDate}
              onChange={handleDateFormChange("endDate")}
            />
          </Grid>
        </Grid>
      </div>
    );
  };

  /**
   * Renders task connections table
   * 
   * TODO: Implement task connections table logic and add new connection functionality
   */
  const renderTaskConnectionsTable = () => {
    return (
      <>
        <DialogContentText sx={{ padding: 2 }} variant="h5">
          {t("newMilestoneTaskDialog.taskConnectionsTable.title")}
        </DialogContentText>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t("newMilestoneTaskDialog.taskConnectionsTable.type")}</TableCell>
                <TableCell>{t("newMilestoneTaskDialog.taskConnectionsTable.task")}</TableCell>
                <TableCell>{t("newMilestoneTaskDialog.taskConnectionsTable.status")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Type 1</TableCell>
                <TableCell>Task name</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Button variant="text" color="primary" sx={{ borderRadius: 25 }} onClick={() => { }} disabled>
          <AddIcon />
          {t("newMilestoneTaskDialog.taskConnectionsTable.addButton")}
        </Button>
      </>
    );
  };

  /**
   * Renders task attachments table
   * 
   * TODO: Implement task attachments table logic and add new attachment functionality
   */
  const renderTaskAttachmentsTable = () => {
    return (
      <>
        <DialogContentText sx={{ padding: 2 }} variant="h5">
          {t("newMilestoneTaskDialog.taskAttachmentsTable.title")}
        </DialogContentText>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t("newMilestoneTaskDialog.taskAttachmentsTable.type")}</TableCell>
                <TableCell>{t("newMilestoneTaskDialog.taskAttachmentsTable.name")}</TableCell>
                <TableCell>{t("newMilestoneTaskDialog.taskAttachmentsTable.size")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Attachment name</TableCell>
                <TableCell>Size</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Button variant="text" color="primary" sx={{ borderRadius: 25 }} onClick={() => { }} disabled>
          <AddIcon />
          {t("newMilestoneTaskDialog.taskAttachmentsTable.addButton")}
        </Button>
      </>
    );
  }


  /**
   * Disables form submit based on required form fields
   */
  const isDisabled = !(!!taskData.name && !!taskData.startDate && !!taskData.endDate && !!taskData.status);

  /**
   * Main component render
   */
  return (
    <>
      <Dialog
        PaperProps={{ sx: { minHeight: "90vh", maxHeight: "90vh", minWidth: 1200, maxWidth: 1200 } }}
        open={open}
        onClose={onClose}
      >
        <AppBar sx={{ position: "relative" }} elevation={0}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <DialogTitle>
              { task ? task.name : t("newMilestoneTaskDialog.title") }
            </DialogTitle>
            <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        {renderNewTaskInfoSection()}
        <DialogContent style={{ padding: 0 }}>
          {renderTaskConnectionsTable()}
          {renderTaskAttachmentsTable()}
          <Button
            fullWidth
            onClick={handleTaskFormSubmit}
            variant="contained"
            color="primary"
            size="large"
            disabled={isDisabled}
          >
            <AddIcon />
            {task ? "Update task" : t("newMilestoneTaskDialog.createButton")}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskDialog;
