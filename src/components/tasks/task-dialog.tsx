import { useState, useMemo, ChangeEvent } from "react";
import {
  AppBar,
  Box,
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
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { DateTime } from "luxon";
import { useTranslation } from "react-i18next";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useApi } from "hooks/use-api";
import { TaskFormData } from "types";
import { useListProjectUsersQuery } from "hooks/api-queries";
import GenericDatePicker from "components/generic/generic-date-picker";
import { CreateTaskRequest, Task, TaskStatus, UpdateTaskRequest, UserRole } from "generated/client";
import FileUploader from "components/generic/file-upload";
import { filesApi } from "api/files";
import { useConfirmDialog } from "providers/confirm-dialog-provider";

const TASK_ATTACHMENT_UPLOAD_PATH = "task-attachments";

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
  const showConfirmDialog = useConfirmDialog();

  // Set initial task data based on existing task or new task
  const existingOrNewTaskData = task ? {
    name: task.name,
    startDate: DateTime.fromJSDate(task.startDate),
    endDate: DateTime.fromJSDate(task.endDate),
    status: task.status,
    assigneeIds: task.assigneeIds ?? [],
    userRole: task.userRole,
    estimatedDuration: task.estimatedDuration,
    estimatedReadiness: task.estimatedReadiness,
    attachmentUrls: task.attachmentUrls ?? [],
  } : {
    name: "",
    startDate: null,
    endDate: null,
    status: TaskStatus.NotStarted,
    assigneeIds: [],
    userRole: UserRole.User,
    estimatedDuration: "",
    estimatedReadiness: "",
    attachmentUrls: []
  };

  const [taskData, setTaskData] = useState<TaskFormData>(existingOrNewTaskData);
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [fileUploadLoaderVisible, setFileUploadLoaderVisible] = useState(false);

  /**
   * Project users map
   */
  const projectUsersMap = useMemo(() => {
    const users = listProjectUsersQuery.data ?? [];
    return users.reduce((acc, user) => {
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      acc[user.id!] = `${user.firstName} ${user.lastName}`;
      return acc;
    }, {} as Record<string, string>);
  }, [listProjectUsersQuery.data]);

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
   * Upload task attachment handler function
   * 
   * @param file file to upload
   */
  const handleUploadNewAttachment = async (file: File) => {
    try {
      setFileUploadLoaderVisible(true);
      const url = await filesApi.uploadFile(file, TASK_ATTACHMENT_UPLOAD_PATH);
      const newAttachmentUrls = [...taskData.attachmentUrls, url];

      setTaskData({ ...taskData, attachmentUrls: newAttachmentUrls });
      setFileUploadLoaderVisible(false);
      setAttachmentDialogOpen(false);
    } catch (error) {
      console.error(t("errorHandling.errorUploadingNewTaskAttachment"), error);
    }
  };

  /**
   * Handles existing attachment upload
   * 
   * @param attachmentUrl attachment url
   */
  const handleUploadExistingAttachment = async (attachmentUrl: string) => {
    try {
      setFileUploadLoaderVisible(true);
      const newAttachmentUrlsIfDoesntExist = taskData.attachmentUrls.includes(attachmentUrl) ? taskData.attachmentUrls : taskData.attachmentUrls.concat(attachmentUrl);
      setTaskData({ ...taskData, attachmentUrls: newAttachmentUrlsIfDoesntExist });
      setAttachmentDialogOpen(false);
      setFileUploadLoaderVisible(false);
    } catch (error) {
      console.error(t("errorHandling.errorUploadingExistingTaskAttachment"), error);
    }
  };

  /**
   * Handles task attachment delete
   * 
   * @param attachmentUrl attachment url
   */
  const handleDeleteAttachment = async (attachmentUrl: string) => {
    try {
      const newAttachmentUrls = taskData.attachmentUrls.filter(url => url !== attachmentUrl);
      setTaskData({ ...taskData, attachmentUrls: newAttachmentUrls });
    } catch (error) {
      console.error(t("errorHandling.errorDeletingTaskAttachment"), error);
    }
  };

  /**
   * Handles task creation form change
   *
   * @param field string
   * @param multipleSelect boolean
   */
  const handleFormChange = (field: keyof TaskFormData, multipleSelect = false) => (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    if (multipleSelect) {
      setTaskData({ ...taskData, [field]: Array.isArray(value) ? value : [value] });
    } else {
      setTaskData({ ...taskData, [field]: value });
    }
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
    // biome-ignore lint/style/noNonNullAssertion: We make sure startDate is not null before converting
    const  startDateIsoConverted = new Date(taskData.startDate.toISODate()!);
    // biome-ignore lint/style/noNonNullAssertion: We make sure endDate is not null before converting
    const endDateIsoConverted = new Date(taskData.endDate.toISODate()!);
    
    if (task?.id) {
      await updateTaskMutation.mutateAsync({
        projectId: projectId,
        milestoneId: milestoneId,
        taskId: task.id,
        task: {
          milestoneId: milestoneId,
          name: taskData.name,
          startDate: startDateIsoConverted,
          endDate: endDateIsoConverted,
          status: taskData.status,
          assigneeIds: taskData.assigneeIds,
          userRole: taskData.userRole,
          estimatedDuration: taskData.estimatedDuration,
          estimatedReadiness: taskData.estimatedReadiness,
          attachmentUrls: taskData.attachmentUrls
        }
      });
    } else {
      await createTaskMutation.mutateAsync({
        projectId: projectId,
        milestoneId: milestoneId,
        task: {
          milestoneId: milestoneId,
          name: taskData.name,
          startDate: startDateIsoConverted,
          endDate: endDateIsoConverted,
          status: taskData.status,
          assigneeIds: taskData.assigneeIds,
          userRole: taskData.userRole,
          estimatedDuration: taskData.estimatedDuration,
          estimatedReadiness: taskData.estimatedReadiness,
          attachmentUrls: taskData.attachmentUrls
        }
      });
    }

    setTaskData({
      name: "",
      startDate: null,
      endDate: null,
      status: TaskStatus.NotStarted,
      assigneeIds: [],
      userRole: UserRole.User,
      estimatedDuration: "",
      estimatedReadiness: "",
      attachmentUrls: []
    });
    onClose();
  };

  /**
   * Infers attachment type from url
   * 
   * TODO: It is not perfect as it takes any string after the last dot as attachment type
   * @param url attachment url
   */
  const getAttachmentTypeFromUrlCapitals = (url: string) => {
    const urlParts = url.split(".");
    return urlParts[urlParts.length - 1].toUpperCase();
  };

  /**
   * Get dropdown render value
   *
   * @param options string array or object
   */
  const getDropdownRenderValue = (options: string[] | Record<string, string>) => {
    if (Array.isArray(options)) {
      return (selected: unknown) => (selected as string[]).join(", ");
    }
    
    return (selected: unknown) => (selected as string[]).map(id => (options as Record<string, string>)[id]).join(", ");
  };

  /**
   * Renders a dropdown picker with multiple select option
   *
   * @param field field
   * @param label dropdown label
   * @param options dropdown options
   * @param multipleSelect multiple select option
   */
  const renderDropdownPicker = (
    field: keyof TaskFormData,
    label: string,
    options: string[] | Record<string, string>,
    multipleSelect: boolean
  ) => {

    return (
      <TextField
        select
        fullWidth
        label={label}
        value={taskData[field]}
        onChange={handleFormChange(field, multipleSelect)}
        SelectProps={
          multipleSelect
            ? {
              multiple: true,
              renderValue: getDropdownRenderValue(options),
            }
            : undefined
        }
      >
        {Array.isArray(options)
          ? options.map(option => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))
          : Object.entries(options).map(([id, name]) => (
            <MenuItem key={id} value={id}>
              {name}
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
            {renderDropdownPicker(
              "status",
              t("newMilestoneTaskDialog.status"),
              Object.values(TaskStatus),
              false
            )}
          </Grid>
          <Grid item xs={6}>
            {renderDropdownPicker(
              "assigneeIds",
              t("newMilestoneTaskDialog.assignees"),
              projectUsersMap,
              true
            )}
          </Grid>
          <Grid item xs={6}>
            {renderDropdownPicker(
              "userRole",
              t("newMilestoneTaskDialog.userRole"),
              Object.values(UserRole),
              false
            )
            }
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
                <TableCell>{t("newMilestoneTaskDialog.taskAttachmentsTable.preview")}</TableCell>
                <TableCell>{t("newMilestoneTaskDialog.taskAttachmentsTable.delete")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {taskData.attachmentUrls.map(attachment => (
                <TableRow key={attachment}>
                  <TableCell>{getAttachmentTypeFromUrlCapitals(attachment)}</TableCell>
                  <TableCell>{attachment}</TableCell>
                  <TableCell>
                    <Button variant="text" color="primary" sx={{ borderRadius: 25 }} onClick={() => {
                      window.open(attachment.toString(), "_blank");
                     }}>
                      {t("newMilestoneTaskDialog.taskAttachmentsTable.clickToPreview")}
                    </Button>
                  </TableCell>
                  <TableCell
                    style={{ maxWidth: 50, textDecorationColor: "red", textAlign: "center"}}
                  >
                    <Button
                      variant="text"
                      color="primary"
                      sx={{ borderRadius: 25 }}
                      onClick={() =>
                        showConfirmDialog({
                          title: t("newMilestoneTaskDialog.taskAttachmentsTable.deleteConfirmationDialog.title"),
                          description: t("newMilestoneTaskDialog.taskAttachmentsTable.deleteConfirmationDialog.description", {
                            attachmentName: attachment
                          }),
                          cancelButtonEnabled: true,
                          confirmButtonText: t("generic.delete"),
                          onConfirmClick: () => handleDeleteAttachment(attachment)
                        })
                      }
                    >
                      <DeleteIcon color="error" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Button variant="text" color="primary" sx={{ borderRadius: 25 }} onClick={() => setAttachmentDialogOpen(true)}>
          <AddIcon />
          {t("newMilestoneTaskDialog.taskAttachmentsTable.addButton")}
        </Button>
      </>
    );
  };

  /**
   * Renders upload task attachment dialog
   */
  const renderUploadTaskAttachmentDialog = () => {
    return (
      <Dialog open={attachmentDialogOpen} onClose={() => setAttachmentDialogOpen(false)}>
        <Box sx={{ padding: "1rem" }}>
          <Typography variant="h5">{t("newMilestoneTaskDialog.taskAttachmentsTable.uploadDialogTitle")}</Typography>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "row", gap: "5rem", justifyContent: "center", padding: "1rem" }}>
          <FileUploader
            allowedFileTypes={[".png", ".svg", ".jpg", ".jpeg", ".pdf", ".doc", ".docx"]}
            uploadFile={handleUploadNewAttachment}
            existingFiles={taskData.attachmentUrls}
            existingFilesPath={TASK_ATTACHMENT_UPLOAD_PATH}
            width={400}
            loaderVisible={fileUploadLoaderVisible}
            uploadExistingFile={handleUploadExistingAttachment}
          />
        </Box>
      </Dialog>
    );
  };


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
            sx={{ minHeight: 50, marginTop: 2, marginBottom: 2}}
            disabled={isDisabled}
          >
            {!task && <AddIcon />}
            {task ? t("newMilestoneTaskDialog.updateButton") : t("newMilestoneTaskDialog.createButton")}
          </Button>
        </DialogContent>
      </Dialog>
      { renderUploadTaskAttachmentDialog() }
    </>
  );
};

export default TaskDialog;