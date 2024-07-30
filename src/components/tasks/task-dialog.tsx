import { useState, useMemo, ChangeEvent, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
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
import {
  useListTasksQuery,
  useListProjectUsersQuery,
  useListTaskAttachmentsQuery,
  useListTaskConnectionsQuery,
} from "hooks/api-queries";
import GenericDatePicker from "components/generic/generic-date-picker";
import {
  ChangeProposal,
  ChangeProposalStatus,
  CreateChangeProposalRequest,
  CreateTaskRequest,
  DeleteChangeProposalRequest,
  Task,
  TaskStatus,
  UpdateChangeProposalRequest,
  UpdateTaskRequest,
  UserRole,
  CreateTaskConnectionRequest,
  DeleteTaskConnectionRequest,
  TaskConnectionType,
  UpdateTaskConnectionRequest,
} from "generated/client";
import FileUploader from "components/generic/file-upload";
import { filesApi } from "api/files";
import { useConfirmDialog } from "providers/confirm-dialog-provider";
import ChangeProposalUtils from "utils/change-proposals";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { REASONS_FOR_CHANGE } from "constants/index";
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
  changeProposals?: ChangeProposal[];
}

/**
 * Task dialog component
 */
const TaskDialog = ({ projectId, milestoneId, open, task, onClose, changeProposals }: Props) => {
  const { t } = useTranslation();
  const { tasksApi: milestoneTasksApi, taskConnectionsApi, changeProposalsApi } = useApi();
  const queryClient = useQueryClient();
  const listProjectUsersQuery = useListProjectUsersQuery(projectId);
  const listMilestoneTasksQuery = useListTasksQuery({ projectId, milestoneId });
  const tasks = listMilestoneTasksQuery.data ?? [];
  const listTaskConnectionsQuery = useListTaskConnectionsQuery({ projectId, taskId: task?.id });
  const taskConnections = listTaskConnectionsQuery.data ?? [];
  const listTaskAttachmentsQuery = useListTaskAttachmentsQuery(TASK_ATTACHMENT_UPLOAD_PATH);
  const showConfirmDialog = useConfirmDialog();

  // Set initial task data based on existing task or new task
  const existingOrNewTaskData = task
    ? {
        name: task.name,
        startDate: DateTime.fromJSDate(task.startDate),
        endDate: DateTime.fromJSDate(task.endDate),
        status: task.status,
        assigneeIds: task.assigneeIds ?? [],
        userRole: task.userRole,
        estimatedDuration: task.estimatedDuration,
        estimatedReadiness: task.estimatedReadiness,
        attachmentUrls: task.attachmentUrls ?? [],
      }
    : {
        name: "",
        startDate: null,
        endDate: null,
        status: TaskStatus.NotStarted,
        assigneeIds: [],
        userRole: UserRole.User,
        estimatedDuration: 0,
        estimatedReadiness: 0,
        attachmentUrls: [],
      };

  const [taskData, setTaskData] = useState<TaskFormData>(existingOrNewTaskData);

  const [createChangeProposalData, setCreateChangeProposalData] = useState<ChangeProposal[]>([]);
  const [updateChangeProposalData, setUpdateChangeProposalData] = useState<ChangeProposal[]>(
    changeProposals?.filter((proposal) => proposal.taskId === task?.id) ?? [],
  );
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [fileUploadLoaderVisible, setFileUploadLoaderVisible] = useState(false);
  const [newTaskConnections, setNewTaskConnections] = useState<TaskConnectionTableData[]>([]);
  const [existingTaskConnections, setExistingTaskConnections] = useState<TaskConnectionTableData[]>([]);
  const [availableTaskConnectionTasks, setAvailableTaskConnectionTasks] = useState<Task[]>([]);
  const [taskConnectionsValid, setTaskConnectionsValid] = useState(true);
  const [loadingProposalsDeletion, setLoadingProposalsDeletion] = useState<Record<string, boolean>>({});

  /**
   * Use effect to update task specific change proposals on change proposals change
   */
  useEffect(() => {
    setUpdateChangeProposalData(changeProposals?.filter((proposal) => proposal.taskId === task?.id) ?? []);
  }, [changeProposals, task?.id]);

  /**
   * Set existing task connections
   */
  useEffect(() => {
    if (!task) {
      return;
    }
    const initialConnections = taskConnections.map((connection) => ({
      connectionId: connection.id ?? "",
      type: connection.type,
      hierarchy:
        connection.sourceTaskId === task.id ? TaskConnectionRelationship.CHILD : TaskConnectionRelationship.PARENT,
      attachedTask: tasks.find(
        (taskElement) =>
          taskElement.id === (connection.sourceTaskId === task.id ? connection.targetTaskId : connection.sourceTaskId),
      ),
    }));
    setExistingTaskConnections(initialConnections);
  }, [task, taskConnections, tasks]);

  /**
   * Set available tasks for task connections
   */
  useEffect(() => {
    if (!tasks) {
      return;
    }
    const availableTasks = task
      ? tasks
          .filter((taskElement) => taskElement.id !== task.id)
          .filter(
            (taskElement) =>
              !existingTaskConnections.some((connection) => connection.attachedTask?.id === taskElement.id),
          )
      : tasks;

    setAvailableTaskConnectionTasks(availableTasks);
  }, [task, tasks, existingTaskConnections]);

  /**
   * Project users map
   */
  const projectUsersMap = useMemo(() => {
    const users = listProjectUsersQuery.data ?? [];
    return users.reduce(
      (acc, user) => {
        if (user.id) acc[user.id] = `${user.firstName} ${user.lastName}`;
        return acc;
      },
      {} as Record<string, string>,
    );
  }, [listProjectUsersQuery.data]);

  /**
   * Create task mutation
   */
  const createTaskMutation = useMutation({
    mutationFn: (params: CreateTaskRequest) => milestoneTasksApi.createTask(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "milestones", milestoneId] });
    },
    onError: (error) => console.error(t("errorHandling.errorCreatingMilestoneTask"), error),
  });

  /**
   * Update task mutation
   */
  const updateTaskMutation = useMutation({
    mutationFn: (params: UpdateTaskRequest) => milestoneTasksApi.updateTask(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "milestones", milestoneId] });
    },
    onError: (error) => console.error(t("errorHandling.errorUpdatingMilestoneTask"), error),
  });

  /**
   * Create task mutation
   */
  const createChangeProposalMutation = useMutation({
    mutationFn: (params: CreateChangeProposalRequest) => changeProposalsApi.createChangeProposal(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "milestones", milestoneId, "changeProposals"],
      });
      onClose();
    },
    onError: (error) => console.error(t("errorHandling.errorCreatingChangeProposal"), error),
  });

  /**
   * Update change proposals mutation
   */
  const updateChangeProposalsMutation = useMutation({
    mutationFn: (params: UpdateChangeProposalRequest) => changeProposalsApi.updateChangeProposal(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "milestones", milestoneId, "changeProposals"],
      });
      onClose();
    },
    onError: (error) => console.error(t("errorHandling.errorUpdatingChangeProposal"), error),
  });

  /**
   * Delete change proposal mutation
   */
  const deleteChangeProposalMutation = useMutation({
    mutationFn: (params: DeleteChangeProposalRequest) => changeProposalsApi.deleteChangeProposal(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "milestones", milestoneId, "changeProposals"],
      });
    },
    onError: (error) => console.error(t("errorHandling.errorDeletingChangeProposal"), error),
  });

  /**
   * Create task connections mutation
   */
  const createTaskConnectionsMutation = useMutation({
    mutationFn: (params: CreateTaskConnectionRequest) => taskConnectionsApi.createTaskConnection(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "connections"] });
    },
    onError: (error) => console.error(t("errorHandling.errorCreatingTaskConnection"), error),
  });

  /**
   * Update task connections mutation
   */
  const updateTaskConnectionsMutation = useMutation({
    mutationFn: (params: UpdateTaskConnectionRequest) => taskConnectionsApi.updateTaskConnection(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "connections"] });
    },
    onError: (error) => console.error(t("errorHandling.errorUpdatingTaskConnection"), error),
  });

  /**
   * Delete task connections mutation
   */
  const deleteTaskConnectionsMutation = useMutation({
    mutationFn: (params: DeleteTaskConnectionRequest) => taskConnectionsApi.deleteTaskConnection(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "connections"] });
    },
    onError: (error) => console.error(t("errorHandling.errorDeletingTaskConnection"), error),
  });

  /**
   * Deletes removed task connections
   * Note: to be used only when editing existing task
   */
  const deleteRemovedTaskConnections = async () => {
    const connectionsToDelete = (listTaskConnectionsQuery.data ?? [])
      .filter((connection) => !existingTaskConnections.some((c) => c.connectionId === connection.id))
      .map((connection) => ({ projectId, connectionId: connection.id ?? "" }));

    await Promise.all([
      ...connectionsToDelete.map((connection) => deleteTaskConnectionsMutation.mutateAsync(connection)),
    ]);
  };

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

    await Promise.all([
      ...newConnections.map((connection) => createTaskConnectionsMutation.mutateAsync(connection)),
      ...editedConnections.map((connection) => updateTaskConnectionsMutation.mutateAsync(connection)),
    ]);
  };

  /**
   * Add new task connection row
   */
  const addNewTaskConnectionRow = () => {
    setNewTaskConnections([
      ...newTaskConnections,
      {
        hierarchy: TaskConnectionRelationship.PARENT,
        type: TaskConnectionType.StartToStart,
        connectionId: "",
        id: uuidv4(),
      },
    ]);
  };

  /**
   * Remove new task connection row
   *
   * @param id connection id
   * Note: only new task connections have id
   */
  const removeNewTaskConnectionRow = (id: string) => {
    setNewTaskConnections((connections) => connections.filter((c) => c.id !== id));
  };

  /**
   * Handle edit connection
   *
   * @param connectionId connection id
   * @param field field
   * @param value value
   */
  const handleEditConnection = (
    connectionId: string,
    field: keyof TaskConnectionTableData,
    value: TaskConnectionType,
  ) => {
    const updatedConnections = existingTaskConnections.map((c) =>
      c.connectionId === connectionId ? { ...c, [field]: value } : c,
    );
    setExistingTaskConnections(updatedConnections);
  };

  /**
   * Handle edit new connection
   *
   * @param id uuid of a new connection
   * @param field field
   * @param value value
   */
  const handleEditNewConnection = (
    id: string,
    field: keyof TaskConnectionTableData,
    value: TaskConnectionTableData[keyof TaskConnectionTableData],
  ) => {
    const updatedConnections = newTaskConnections.map((connection) =>
      connection.id === id ? { ...connection, [field]: value } : connection,
    );
    setNewTaskConnections(updatedConnections);
  };

  /**
   * Remove existing task connection row
   *
   * @param connectionId connection id
   */
  const removeExistingTaskConnectionRow = (connectionId: string) => {
    setExistingTaskConnections((connections) => connections.filter((c) => c.connectionId !== connectionId));
  };

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
      const updatedAttachmentUrls = taskData.attachmentUrls.includes(attachmentUrl)
        ? taskData.attachmentUrls
        : [...taskData.attachmentUrls, attachmentUrl];
      setTaskData({ ...taskData, attachmentUrls: updatedAttachmentUrls });
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
      const newAttachmentUrls = taskData.attachmentUrls.filter((url) => url !== attachmentUrl);
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
  const handleFormChange =
    (field: keyof TaskFormData, multipleSelect = false) =>
    (event: ChangeEvent<HTMLInputElement>) => {
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
   * Handles change proposal update form date change
   *
   * @param field string
   * @param changeProposalId string
   * @param value date
   */
  const handleUpdateChangeProposalDateFormChange =
    (field: keyof ChangeProposal, changeProposalId?: string) => (value: DateTime<boolean> | null) => {
      if (!changeProposalId || !value) return;

      const updatedProposals = updateChangeProposalData.map((proposal) => {
        if (proposal.id === changeProposalId) {
          return { ...proposal, [field]: value.toJSDate() };
        }
        return proposal;
      });

      setUpdateChangeProposalData(updatedProposals);
    };

  /**
   * Handles change event for updating change proposals
   *
   * @param field string
   * @param changeProposalId string
   * @param event ChangeEvent<HTMLInputElement>
   */
  const handleUpdateChangeProposalFormChange =
    (field: keyof ChangeProposal, changeProposalId?: string) => (event: ChangeEvent<HTMLInputElement>) => {
      if (!changeProposalId) return;

      const updatedProposals = updateChangeProposalData.map((proposal) => {
        if (proposal.id === changeProposalId) {
          return { ...proposal, [field]: event.target.value };
        }
        return proposal;
      });

      setUpdateChangeProposalData(updatedProposals);
    };

  /**
   * Handles change proposal creation forms date change
   *
   * @param field string
   * @param changeProposalId string
   * @param value date
   */
  const handleCreateChangeProposalDateFormChange =
    (field: keyof ChangeProposal, changeProposalId: string) => (value: DateTime<boolean> | null) => {
      if (!changeProposalId || !value) return;

      const newProposals = createChangeProposalData.map((proposal) => {
        if (proposal.id === changeProposalId) {
          return { ...proposal, [field]: value.toJSDate() };
        }
        return proposal;
      });

      setCreateChangeProposalData(newProposals);
    };

  /**
   * Handles change event for creating change proposals
   *
   * @param field string
   * @param changeProposalId string
   * @param event ChangeEvent<HTMLInputElement>
   */
  const handleCreateChangeProposalFormChange =
    (field: keyof ChangeProposal, changeProposalId: string) => (event: ChangeEvent<HTMLInputElement>) => {
      if (!changeProposalId) return;

      const newProposals = createChangeProposalData.map((proposal) => {
        if (proposal.id === changeProposalId) {
          return { ...proposal, [field]: event.target.value };
        }
        return proposal;
      });

      setCreateChangeProposalData(newProposals);
    };

  /**
   * Handles deleting a change proposal
   *
   * @param changeProposalId string
   */
  const handleDeleteChangeProposal = async (changeProposalId?: string) => {
    if (!changeProposalId) return;

    setLoadingProposalsDeletion((prev) => ({ ...prev, [changeProposalId]: true }));
    try {
      await deleteChangeProposalMutation.mutateAsync({
        projectId: projectId,
        milestoneId: milestoneId,
        changeProposalId: changeProposalId,
      });
    } finally {
      setUpdateChangeProposalData(
        updateChangeProposalData?.filter((proposal) => proposal.id !== changeProposalId) ?? [],
      );
      setLoadingProposalsDeletion((prev) => ({ ...prev, [changeProposalId]: false }));
    }
  };

  /**
   * Handles deleting an unsaved change proposal
   *
   * @param changeProposalId string
   */
  const handleDeleteUnsavedChangeProposal = async (changeProposalId?: string) => {
    if (!changeProposalId) return;

    const remainingProposals = createChangeProposalData.filter((proposal) => proposal.id !== changeProposalId);
    setCreateChangeProposalData(remainingProposals);
  };

  /**
   * Handles add new change propsal button click
   */
  const handleAddChangeProposalClick = () => {
    if (!task?.id) return;

    const newChangeProposal: ChangeProposal = {
      id: `new-proposal-${createChangeProposalData.length + 1}`,
      taskId: task.id,
      startDate: undefined,
      endDate: undefined,
      reason: "",
      comment: "",
      status: ChangeProposalStatus.Pending,
    };

    setCreateChangeProposalData([...createChangeProposalData, newChangeProposal]);
  };

  /**
   * Handles task update or task create form submit
   */
  const handleTaskFormSubmit = async () => {
    if (!taskData.startDate?.isValid || !taskData.endDate?.isValid) return;

    // Convert DateTime objects to JavaScript Date objects
    // These are required to ensure the API client sends correct date, as it doesn't take time zones into account.
    const startDateIsoConverted = new Date(taskData.startDate.toISODate());
    const endDateIsoConverted = new Date(taskData.endDate.toISODate());

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
          attachmentUrls: taskData.attachmentUrls,
        },
      });

      await deleteRemovedTaskConnections();
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
          attachmentUrls: taskData.attachmentUrls,
        },
      });

      if (createdTask.id) {
        await persistNewAndEditedTaskConnections(createdTask.id);
      }
    }

    persistChangeProposals();

    setTaskData({
      name: "",
      startDate: null,
      endDate: null,
      status: TaskStatus.NotStarted,
      assigneeIds: [],
      userRole: UserRole.User,
      estimatedDuration: 0,
      estimatedReadiness: 0,
      attachmentUrls: [],
    });
    setNewTaskConnections([]);
    setExistingTaskConnections([]);
    onClose();
  };

  /**
   * Persists created and updated change proposals.
   */
  const persistChangeProposals = async () => {
    if (!changeProposals && !createChangeProposalData.length) return;

    const createdChangeProposalPromises = createChangeProposalData.map(async (proposal) => {
      if (!proposal.startDate || !proposal.endDate) return;

      const startDate = DateTime.fromJSDate(proposal.startDate);
      const endDate = DateTime.fromJSDate(proposal.endDate);

      if (!startDate.isValid || !endDate.isValid) return;

      proposal.startDate = new Date(startDate.toISODate());
      proposal.endDate = new Date(endDate.toISODate());

      return await createChangeProposalMutation.mutateAsync({
        projectId: projectId,
        milestoneId: milestoneId,
        changeProposal: proposal,
      });
    });

    const updatedChangeProposals = changeProposals
      ? updateChangeProposalData.filter((updatedProposal) => {
          const originalProposal = changeProposals.find((proposal) => proposal.id === updatedProposal.id);

          return JSON.stringify(updatedProposal) !== JSON.stringify(originalProposal);
        })
      : [];

    const updatedChangeProposalPromises = updatedChangeProposals.map((proposal) => {
      if (!proposal.id) throw Error("No ID in change proposal");
      return updateChangeProposalsMutation.mutateAsync({
        changeProposal: proposal,
        projectId: projectId,
        milestoneId: milestoneId,
        changeProposalId: proposal.id,
      });
    });

    await Promise.all([...createdChangeProposalPromises, ...updatedChangeProposalPromises]);
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

    return (selected: unknown) =>
      (selected as string[]).map((id) => (options as Record<string, string>)[id]).join(", ");
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
    multipleSelect: boolean,
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
          ? options.map((option) => (
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
            {renderDropdownPicker("status", t("newMilestoneTaskDialog.status"), Object.values(TaskStatus), false)}
          </Grid>
          <Grid item xs={6}>
            {renderDropdownPicker("assigneeIds", t("newMilestoneTaskDialog.assignees"), projectUsersMap, true)}
          </Grid>
          <Grid item xs={6}>
            {renderDropdownPicker("userRole", t("newMilestoneTaskDialog.userRole"), Object.values(UserRole), false)}
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
              {taskData.attachmentUrls.map((attachment) => (
                <TableRow key={attachment}>
                  <TableCell>{getAttachmentTypeFromUrlCapitals(attachment)}</TableCell>
                  <TableCell>{attachment}</TableCell>
                  <TableCell>
                    <Button
                      variant="text"
                      color="primary"
                      sx={{ borderRadius: 25 }}
                      onClick={() => {
                        window.open(attachment.toString(), "_blank");
                      }}
                    >
                      {t("newMilestoneTaskDialog.taskAttachmentsTable.clickToPreview")}
                    </Button>
                  </TableCell>
                  <TableCell style={{ maxWidth: 50, textDecorationColor: "red", textAlign: "center" }}>
                    <Button
                      variant="text"
                      color="primary"
                      sx={{ borderRadius: 25 }}
                      onClick={() =>
                        showConfirmDialog({
                          title: t("newMilestoneTaskDialog.taskAttachmentsTable.deleteConfirmationDialog.title"),
                          description: t(
                            "newMilestoneTaskDialog.taskAttachmentsTable.deleteConfirmationDialog.description",
                            { attachmentName: attachment },
                          ),
                          cancelButtonEnabled: true,
                          confirmButtonText: t("generic.delete"),
                          onConfirmClick: () => handleDeleteAttachment(attachment),
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
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="text"
            color="primary"
            sx={{ borderRadius: 25 }}
            onClick={() => setAttachmentDialogOpen(true)}
          >
            <AddIcon />
            {t("newMilestoneTaskDialog.taskAttachmentsTable.addButton")}
          </Button>
        </div>
      </>
    );
  };

  /**
   * Renders a change proposal edit form
   *
   * @param changeProposal change proposal
   */
  const renderExistingChangeProposals = (changeProposal: ChangeProposal) => {
    if (!changeProposal?.id) return;

    const formattedStartDate = changeProposal.startDate ? DateTime.fromJSDate(changeProposal.startDate) : null;
    const formattedEndDate = changeProposal.endDate ? DateTime.fromJSDate(changeProposal.endDate) : null;

    const statusLabelRecord = {
      [ChangeProposalStatus.Approved]: "changeProposals.accepted",
      [ChangeProposalStatus.Pending]: "changeProposals.waitingForApproval",
      [ChangeProposalStatus.Rejected]: "changeProposals.abandoned",
    } as const;
    const statusLabel = statusLabelRecord[changeProposal.status];
    const disabled = changeProposal.status !== ChangeProposalStatus.Pending;

    return (
      <div key={changeProposal.id}>
        <Grid container spacing={1} padding={2} sx={{ borderBottom: "1px solid #e6e4e4" }}>
          <Grid item xs={4} sx={{ display: "flex", flexDirection: "row" }}>
            <GenericDatePicker
              fullWidth
              label={t("changeProposals.changeStart")}
              value={formattedStartDate}
              onChange={handleUpdateChangeProposalDateFormChange("startDate", changeProposal.id)}
              hasBorder
              maxDate={formattedEndDate ?? undefined}
              disabled={disabled}
            />
            <GenericDatePicker
              fullWidth
              label={t("changeProposals.changeEnd")}
              value={formattedEndDate}
              onChange={handleUpdateChangeProposalDateFormChange("endDate", changeProposal.id)}
              hasBorder
              minDate={formattedStartDate ?? undefined}
              disabled={disabled}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              value={changeProposal.reason}
              label={t("changeProposals.reasonForChange")}
              select
              size="small"
              sx={{
                width: "100%",
                border: "1px solid #e6e4e4",
                padding: "1px 0px 8px",
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "#000000",
                },
              }}
              onChange={handleUpdateChangeProposalFormChange("reason", changeProposal.id)}
              disabled={disabled}
            >
              {REASONS_FOR_CHANGE.map((reason) => (
                <MenuItem key={reason} value={reason}>
                  {reason}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={2}>
            {ChangeProposalUtils.renderStatusElement(changeProposal.status, t(statusLabel))}
          </Grid>
          <Grid item xs={8}>
            <TextField
              fullWidth
              label={t("changeProposals.comment")}
              value={changeProposal.comment}
              onChange={handleUpdateChangeProposalFormChange("comment", changeProposal.id)}
              sx={{ border: "1px solid #e6e4e4" }}
              disabled={disabled}
            />
          </Grid>
          {changeProposal.status === ChangeProposalStatus.Pending && (
            <Grid item xs={2}>
              {loadingProposalsDeletion[changeProposal.id] ? (
                <CircularProgress size={24} sx={{ marginLeft: "1rem" }} />
              ) : (
                <IconButton
                  edge="start"
                  onClick={() => handleDeleteChangeProposal(changeProposal.id)}
                  aria-label="close"
                  sx={{ color: "#0000008F", marginLeft: "1rem" }}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              )}
            </Grid>
          )}
        </Grid>
      </div>
    );
  };

  /**
   * Renders change proposal creation forms
   */
  const renderCreateChangeProposals = () => {
    return createChangeProposalData.map((newChangeProposal) => {
      if (!newChangeProposal.id) return;

      const formattedStartDate = newChangeProposal.startDate ? DateTime.fromJSDate(newChangeProposal.startDate) : null;
      const formattedEndDate = newChangeProposal.endDate ? DateTime.fromJSDate(newChangeProposal.endDate) : null;

      return (
        <div key={newChangeProposal.id}>
          <Grid container spacing={1} padding={2} sx={{ borderBottom: "1px solid #e6e4e4" }}>
            <Grid item xs={4} sx={{ display: "flex", flexDirection: "row" }}>
              <GenericDatePicker
                fullWidth
                label={t("changeProposals.changeStart")}
                value={formattedStartDate}
                onChange={handleCreateChangeProposalDateFormChange("startDate", newChangeProposal.id)}
                hasBorder
                maxDate={formattedEndDate ?? undefined}
              />
              <GenericDatePicker
                fullWidth
                label={t("changeProposals.changeEnd")}
                value={formattedEndDate}
                onChange={handleCreateChangeProposalDateFormChange("endDate", newChangeProposal.id)}
                hasBorder
                minDate={formattedStartDate ?? undefined}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                value={newChangeProposal.reason}
                label={t("changeProposals.reasonForChange")}
                select
                size="small"
                sx={{ width: "100%", border: "1px solid #e6e4e4", padding: "1px 0px 8px" }}
                onChange={handleCreateChangeProposalFormChange("reason", newChangeProposal.id)}
              >
                {REASONS_FOR_CHANGE.map((reason) => (
                  <MenuItem key={reason} value={reason}>
                    {reason}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={2}>
              {ChangeProposalUtils.renderStatusElement(
                newChangeProposal.status,
                t("changeProposals.waitingForApproval"),
              )}
            </Grid>
            <Grid item xs={8}>
              <TextField
                fullWidth
                label={t("changeProposals.comment")}
                value={newChangeProposal.comment}
                onChange={handleCreateChangeProposalFormChange("comment", newChangeProposal.id)}
                sx={{ border: "1px solid #e6e4e4" }}
              />
            </Grid>
            <Grid item xs={2}>
              <IconButton
                edge="start"
                onClick={() => handleDeleteUnsavedChangeProposal(newChangeProposal.id)}
                aria-label="close"
                sx={{ color: "#0000008F", marginLeft: "1rem" }}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Grid>
          </Grid>
        </div>
      );
    });
  };

  /**
   * Renders change proposal section
   */
  const renderChangeProposalsSection = () => {
    if (!task?.id) return;

    return (
      <div>
        <DialogContentText sx={{ padding: 2 }} variant="h5">
          {t("changeProposals.changeProposals")}
        </DialogContentText>
        {updateChangeProposalData.map((proposal) => renderExistingChangeProposals(proposal))}
        {!!createChangeProposalData.length && renderCreateChangeProposals()}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="text"
            color="primary"
            sx={{ borderRadius: 25 }}
            onClick={handleAddChangeProposalClick}
            disabled={!task?.id}
          >
            <AddIcon />
            {t("changeProposals.addButton")}
          </Button>
        </div>
      </div>
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
                description: t(
                  "newMilestoneTaskDialog.taskAttachmentsTable.uploadExistingFileConfirmationDialog.description",
                ),
                cancelButtonEnabled: true,
                confirmButtonText: t(
                  "newMilestoneTaskDialog.taskAttachmentsTable.uploadExistingFileConfirmationDialog.confirm",
                ),
                onConfirmClick: () => handleUploadExistingAttachment(file),
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
  const isDisabled = !(
    !!taskData.name &&
    !!taskData.startDate &&
    !!taskData.endDate &&
    !!taskData.status &&
    !!taskConnectionsValid
  );

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
            <DialogTitle>{task ? task.name : t("newMilestoneTaskDialog.title")}</DialogTitle>
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
            taskData={taskData}
            handleEditConnection={handleEditConnection}
            addNewTaskConnectionRow={addNewTaskConnectionRow}
            handleEditNewConnection={handleEditNewConnection}
            removeNewTaskConnectionRow={removeNewTaskConnectionRow}
            removeExistingTaskConnectionRow={removeExistingTaskConnectionRow}
            setTaskConnectionsValid={setTaskConnectionsValid}
          />
          {renderTaskAttachmentsTable()}
          {renderChangeProposalsSection()}
          <Button
            fullWidth
            onClick={handleTaskFormSubmit}
            variant="contained"
            color="primary"
            size="large"
            sx={{ minHeight: 50, marginTop: 2, marginBottom: 2 }}
            //TODO: reconsider disabling the button @daniil
            disabled={isDisabled}
          >
            {!task && <AddIcon />}
            {task ? t("newMilestoneTaskDialog.updateButton") : t("newMilestoneTaskDialog.createButton")}
          </Button>
        </DialogContent>
      </Dialog>
      {renderUploadTaskAttachmentDialog()}
    </>
  );
};

export default TaskDialog;
