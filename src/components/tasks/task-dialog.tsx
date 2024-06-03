import { useState, useMemo, ChangeEvent, useEffect } from "react";
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
import { TaskConnectionRelationship, TaskConnectionTableData, TaskFormData } from "types";
import { useListMilestoneTasksQuery, useListProjectUsersQuery, useListTaskAttachmentsQuery, useListTaskConnectionsQuery } from "hooks/api-queries";
import GenericDatePicker from "components/generic/generic-date-picker";
import { CreateTaskConnectionRequest, CreateTaskRequest, DeleteTaskConnectionRequest, Task, TaskConnectionType, TaskStatus, UpdateTaskConnectionRequest, UpdateTaskRequest, UserRole } from "generated/client";
import FileUploader from "components/generic/file-upload";
import { filesApi } from "api/files";
import { useConfirmDialog } from "providers/confirm-dialog-provider";
import TaskConnectionsTable from "./task-connections-table";

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
  const { milestoneTasksApi, taskConnectionsApi } = useApi();
  const queryClient = useQueryClient();
  const listProjectUsersQuery = useListProjectUsersQuery(projectId);
  const listMilestoneTasksQuery = useListMilestoneTasksQuery({ projectId, milestoneId });
  const listTaskConnectionsQuery = useListTaskConnectionsQuery({ projectId, taskId: task?.id });
  const listTaskAttachmentsQuery = useListTaskAttachmentsQuery(TASK_ATTACHMENT_UPLOAD_PATH);
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
  const [newTaskConnections, setNewTaskConnections] = useState<TaskConnectionTableData[]>([]);
  const [existingTaskConnections, setExistingTaskConnections] = useState<TaskConnectionTableData[]>([]);
  const [availableTaskConnectionTasks, setAvailableTaskConnectionTasks] = useState<Task[]>([]);
  const [taskConnectionsValid, setTaskConnectionsValid] = useState<boolean>(true);

  /**
   * Set initial tasks and available tasks for task connections
   */
  useEffect(() => {
    if (!task || !listTaskConnectionsQuery.data || !listMilestoneTasksQuery.data) {
      return;
    }
    const initialConnections = listTaskConnectionsQuery.data.map((connection) => ({
      connectionId: connection.id ?? "",
      type: connection.type,
      hierarchy: connection.sourceTaskId === task.id ? TaskConnectionRelationship.CHILD : TaskConnectionRelationship.PARENT,
      attachedTask: listMilestoneTasksQuery.data.find((taskElement) => taskElement.id === (connection.sourceTaskId === task.id ? connection.targetTaskId : connection.sourceTaskId)),
    }));
    setExistingTaskConnections(initialConnections);

    const availableTasks = listMilestoneTasksQuery.data?.filter((taskElement) => taskElement.id !== task.id).filter((taskElement) => !initialConnections.some((connection) => connection.attachedTask?.id === taskElement.id));
    setAvailableTaskConnectionTasks(availableTasks ?? []);
  }, [task, listMilestoneTasksQuery.data, listTaskConnectionsQuery.data]);

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
   * Create task connections mutation
   */
  const createTaskConnectionsMutation = useMutation({
    mutationFn: (params: CreateTaskConnectionRequest) => taskConnectionsApi.createTaskConnection(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskConnections", projectId, task?.id] });
    },
    onError: (error) => console.error(t("errorHandling.errorCreatingTaskConnection"), error),
  });

  /**
   * Update task connections mutation
   */
  const updateTaskConnectionsMutation = useMutation({
    mutationFn: (params: UpdateTaskConnectionRequest) => taskConnectionsApi.updateTaskConnection(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskConnections", projectId, task?.id] });
    },
    onError: (error) => console.error(t("errorHandling.errorUpdatingTaskConnection"), error),
  });

  /**
   * Delete task connections mutation
   */
  const deleteTaskConnectionsMutation = useMutation({
    mutationFn: (params: DeleteTaskConnectionRequest) => taskConnectionsApi.deleteTaskConnection(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskConnections", projectId, task?.id] });
    },
    onError: (error) => console.error(t("errorHandling.errorDeletingTaskConnection"), error),
  });

  /**
   * Persist new and edited task connections
   *
   * @param taskId task id
   */
  const persistNewAndEditedTaskConnections = async (taskId: string) => {
    const newConnections = newTaskConnections.map((connection) => ({
      projectId: projectId,
      taskConnection: {
        sourceTaskId:
          connection.hierarchy === TaskConnectionRelationship.CHILD ? taskId : connection.attachedTask?.id ?? "",
        targetTaskId:
          connection.hierarchy === TaskConnectionRelationship.CHILD ? connection.attachedTask?.id ?? "" : taskId,
        type: connection.type,
      },
    }));

    const editedConnections = existingTaskConnections.map((connection) => ({
      projectId: projectId,
      connectionId: connection.connectionId ?? "",
      taskConnection: {
        sourceTaskId:
          connection.hierarchy === TaskConnectionRelationship.CHILD ? taskId : connection.attachedTask?.id ?? "",
        targetTaskId:
          connection.hierarchy === TaskConnectionRelationship.CHILD ? connection.attachedTask?.id ?? "" : taskId,
        type: connection.type,
      },
    }));

    const connectionsToDelete = (listTaskConnectionsQuery.data ?? [])
      .filter((connection) => !existingTaskConnections.some((c) => c.connectionId === connection.id))
      .map((connection) => ({ projectId, connectionId: connection.id ?? "" }));

    await Promise.all([
      ...newConnections.map((params) => createTaskConnectionsMutation.mutateAsync(params)),
      ...editedConnections.map((params) => updateTaskConnectionsMutation.mutateAsync(params)),
      ...connectionsToDelete.map((params) => deleteTaskConnectionsMutation.mutateAsync(params)),
    ]);

    queryClient.invalidateQueries({ queryKey: ["taskConnections", projectId, task?.id] });
    setNewTaskConnections([]);
  };

  /**
   * Add new task connection row
   */
  const addNewTaskConnectionRow = () => {
    setNewTaskConnections([...newTaskConnections, { hierarchy: TaskConnectionRelationship.PARENT, type: TaskConnectionType.StartToStart, connectionId: "" }]);
  };

  /**
   * Remove new task connection row
   *
   * @param index row index
   */
  const removeNewTaskConnectionRow = (index: number) => {
    setNewTaskConnections((connections) => connections.filter((_, i) => i !== index));
  };

  /**
   * Handle edit connection
   *
   * @param connectionId connection id
   * @param field field
   * @param value value
   */
  const handleEditConnection = (connectionId: string, field: keyof TaskConnectionTableData, value: TaskConnectionType) => {
    const updatedConnections = existingTaskConnections.map((c) =>
      c.connectionId === connectionId ? { ...c, [field]: value } : c
    );
    setExistingTaskConnections(updatedConnections);
  };

  /**
   * Remove existing task connection row
   *
   * @param connectionId connection id
   */
  const removeExistingTaskConnecitonRow = (connectionId: string) => {
    setExistingTaskConnections((connections) => connections.filter((c) => c.connectionId !== connectionId));
  }

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

      await persistNewAndEditedTaskConnections(task.id);
    } else {
      const createdTask = await createTaskMutation.mutateAsync({
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

      if (createdTask.id) {
        await persistNewAndEditedTaskConnections(createdTask.id);
      }
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
            allFiles={listTaskAttachmentsQuery.data ?? []}
            existingFilesPath={TASK_ATTACHMENT_UPLOAD_PATH}
            width={400}
            loaderVisible={fileUploadLoaderVisible}
            uploadExistingFile={(file) =>
              showConfirmDialog({
                title: t("newMilestoneTaskDialog.taskAttachmentsTable.uploadExistingFileConfirmationDialog.title"),
                description: t("newMilestoneTaskDialog.taskAttachmentsTable.uploadExistingFileConfirmationDialog.description"),
                cancelButtonEnabled: true,
                confirmButtonText: t("newMilestoneTaskDialog.taskAttachmentsTable.uploadExistingFileConfirmationDialog.confirm"),
                onConfirmClick: () => handleUploadExistingAttachment(file)
              })
            }
          />
        </Box>
      </Dialog>
    );
  };


  /**
   * Disables form submit based on required form fields
   */
  const isDisabled = !(!!taskData.name && !!taskData.startDate && !!taskData.endDate && !!taskData.status && !!taskConnectionsValid);

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
          <TaskConnectionsTable
            existingTaskConnections={existingTaskConnections}
            newTaskConnections={newTaskConnections}
            milestoneTasks={listMilestoneTasksQuery.data ?? []}
            availableTaskConnectionTasks={availableTaskConnectionTasks}
            currentTask={task}
            setNewTaskConnections={setNewTaskConnections}
            handleEditConnection={handleEditConnection}
            addNewTaskConnectionRow={addNewTaskConnectionRow}
            removeNewTaskConnectionRow={removeNewTaskConnectionRow}
            removeExistingTaskConnecitonRow={removeExistingTaskConnecitonRow}
            setTaskConnectionsValid={setTaskConnectionsValid}
          />
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