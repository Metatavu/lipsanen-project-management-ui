import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  AppBar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { filesApi } from "api/files";
import FileUploader from "components/generic/file-upload";
import GenericDatePicker from "components/generic/generic-date-picker";
import {
  ChangeProposal,
  ChangeProposalStatus,
  CreateChangeProposalRequest,
  CreateTaskConnectionRequest,
  CreateTaskRequest,
  DeleteChangeProposalRequest,
  DeleteTaskConnectionRequest,
  ProjectStatus,
  Task,
  TaskConnectionType,
  TaskStatus,
  UpdateChangeProposalRequest,
  UpdateTaskConnectionRequest,
  UpdateTaskRequest,
} from "generated/client";
import {
  useFindProjectQuery,
  useListJobPositionsQuery,
  useListProjectMilestonesQuery,
  useListTaskAttachmentsQuery,
  useListTaskConnectionsQuery,
  useListTasksQuery,
  useListUsersQuery,
} from "hooks/api-queries";
import { useApi } from "hooks/use-api";
import { DateTime } from "luxon";
import { useConfirmDialog } from "providers/confirm-dialog-provider";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TaskConnectionRelationship, type TaskConnectionTableData, type TaskFormData } from "types";
import { getValidDateTimeOrThrow } from "utils/date-time-utils";
import { useSetError } from "utils/error-handling";
import { v4 as uuidv4 } from "uuid";
import CommentsSection from "./comments-section";
import TaskConnectionsTable from "./task-connections-table";

const TASK_ATTACHMENT_UPLOAD_PATH = "task-attachments";

/**
 * Task dialog properties
 */
interface Props {
  projectId: string;
  milestoneId?: string;
  open: boolean;
  task?: Task; // Existing task to edit
  onClose: () => void;
  changeProposals?: ChangeProposal[];
}

/**
 * Task dialog component
 *
 * @param props component properties
 */
const TaskDialog = ({ projectId, milestoneId: milestoneIdFromProps, open, task, onClose, changeProposals }: Props) => {
  const milestoneId = task?.milestoneId ?? milestoneIdFromProps;
  const theme = useTheme();
  const isSmallerScreen = useMediaQuery(theme.breakpoints.down("lg"));
  const { t } = useTranslation();
  const setError = useSetError();
  const { tasksApi, taskConnectionsApi, changeProposalsApi } = useApi();
  const queryClient = useQueryClient();
  const listProjectUsersQuery = useListUsersQuery({ projectId });
  const listMilestonesQuery = useListProjectMilestonesQuery({ projectId });
  const milestones = useMemo(() => listMilestonesQuery.data ?? [], [listMilestonesQuery.data]);
  const listMilestoneTasksQuery = useListTasksQuery({ projectId, milestoneId });
  const tasks = useMemo(() => listMilestoneTasksQuery.data ?? [], [listMilestoneTasksQuery.data]);
  const listTaskConnectionsQuery = useListTaskConnectionsQuery({ projectId, taskId: task?.id });
  const taskConnections = useMemo(() => listTaskConnectionsQuery.data ?? [], [listTaskConnectionsQuery.data]);
  const listJobPositionsQuery = useListJobPositionsQuery();
  const jobPositions = useMemo(() => listJobPositionsQuery.data?.jobPositions ?? [], [listJobPositionsQuery.data]);
  const findProjectQuery = useFindProjectQuery(projectId);
  const project = useMemo(() => findProjectQuery.data, [findProjectQuery.data]);
  const listTaskAttachmentsQuery = useListTaskAttachmentsQuery(TASK_ATTACHMENT_UPLOAD_PATH);
  const showConfirmDialog = useConfirmDialog();

  const [taskData, setTaskData] = useState<TaskFormData>({
    name: "",
    milestoneId: milestoneId,
    startDate: undefined,
    endDate: undefined,
    status: TaskStatus.NotStarted,
    assigneeIds: [],
    positionId: "",
    estimatedDuration: 0,
    estimatedReadiness: 0,
    attachmentUrls: [],
  });

  const selectedMilestone = useMemo(
    () => milestones.find((m) => m.id === taskData.milestoneId),
    [milestones, taskData.milestoneId],
  );

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

  const REASONS_FOR_CHANGE = [
    t("changeProposals.reasons.missingInitialData"),
    t("changeProposals.reasons.resourceShortage"),
    t("changeProposals.reasons.timeUsageEstimate"),
  ];

  /**
   * Use effect to update task specific change proposals on change proposals change
   */
  useEffect(() => {
    setUpdateChangeProposalData(changeProposals?.filter((proposal) => proposal.taskId === task?.id) ?? []);
  }, [changeProposals, task?.id]);

  useEffect(() => {
    if (task) {
      setTaskData({
        name: task.name,
        milestoneId: milestoneId,
        startDate: getValidDateTimeOrThrow(task.startDate),
        endDate: getValidDateTimeOrThrow(task.endDate),
        status: task.status,
        assigneeIds: task.assigneeIds ?? [],
        positionId: task.jobPositionId,
        dependentUserId: task.dependentUserId,
        userRole: task.userRole,
        estimatedDuration: task.estimatedDuration,
        estimatedReadiness: task.estimatedReadiness,
        attachmentUrls: task.attachmentUrls ?? [],
      });
    } else {
      setTaskData({
        name: "",
        milestoneId: milestoneId,
        startDate: undefined,
        endDate: undefined,
        status: TaskStatus.NotStarted,
        assigneeIds: [],
        positionId: "",
        estimatedDuration: 0,
        estimatedReadiness: 0,
        attachmentUrls: [],
      });
    }
  }, [task, milestoneId]);

  /**
   * Set existing task connections
   */
  useEffect(() => {
    if (!task) return;

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
    if (!tasks) return;

    const availableTasks = task
      ? tasks.filter(
          (taskElement) =>
            taskElement.id !== task.id &&
            !existingTaskConnections.some((connection) => connection.attachedTask?.id === taskElement.id),
        )
      : tasks;

    setAvailableTaskConnectionTasks(availableTasks);
  }, [task, tasks, existingTaskConnections]);

  /**
   * Project users map
   */
  const projectUsersMap = useMemo(() => {
    const users = listProjectUsersQuery.data?.users ?? [];
    return users.reduce(
      (acc, user) => {
        if (user.id) acc[user.id] = `${user.firstName} ${user.lastName}`;
        return acc;
      },
      {} as Record<string, string>,
    );
  }, [listProjectUsersQuery.data]);

  /**
   * Project keycloak users map
   */
  const projectKeycloakUsersMap = useMemo(() => {
    const users = listProjectUsersQuery.data?.users ?? [];
    return users.reduce<Record<string, string>>((record, user) => {
      if (user.id) record[user.id] = `${user.firstName} ${user.lastName}`;
      return record;
    }, {});
  }, [listProjectUsersQuery.data]);

  /**
   * Create task mutation
   */
  const createTaskMutation = useMutation({
    mutationFn: (params: CreateTaskRequest) => tasksApi.createTask(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "tasks"] });
    },
    onError: (error) => setError(t("errorHandling.errorCreatingMilestoneTask"), error),
  });

  /**
   * Update task mutation
   */
  const updateTaskMutation = useMutation({
    mutationFn: (params: UpdateTaskRequest) => tasksApi.updateTask(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "milestones"] });
    },
    onError: (error) => setError(t("errorHandling.errorUpdatingMilestoneTask"), error),
  });

  /**
   * Create task mutation
   */
  const createChangeProposalMutation = useMutation({
    mutationFn: (params: CreateChangeProposalRequest) => changeProposalsApi.createChangeProposal(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "changeProposals"] });
    },
    onError: (error) => setError(t("errorHandling.errorCreatingChangeProposal"), error),
  });

  /**
   * Update change proposals mutation
   */
  const updateChangeProposalsMutation = useMutation({
    mutationFn: (params: UpdateChangeProposalRequest) => changeProposalsApi.updateChangeProposal(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "changeProposals"] });
    },
    onError: (error) => setError(t("errorHandling.errorUpdatingChangeProposal"), error),
  });

  /**
   * Delete change proposal mutation
   */
  const deleteChangeProposalMutation = useMutation({
    mutationFn: (params: DeleteChangeProposalRequest) => changeProposalsApi.deleteChangeProposal(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "changeProposals"] });
    },
    onError: (error) => setError(t("errorHandling.errorDeletingChangeProposal"), error),
  });

  /**
   * Create task connections mutation
   */
  const createTaskConnectionsMutation = useMutation({
    mutationFn: (params: CreateTaskConnectionRequest) => taskConnectionsApi.createTaskConnection(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "connections"] });
    },
    onError: (error) => setError(t("errorHandling.errorCreatingTaskConnection"), error),
  });

  /**
   * Update task connections mutation
   */
  const updateTaskConnectionsMutation = useMutation({
    mutationFn: (params: UpdateTaskConnectionRequest) => taskConnectionsApi.updateTaskConnection(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "connections"] });
    },
    onError: (error) => setError(t("errorHandling.errorUpdatingTaskConnection"), error),
  });

  /**
   * Delete task connections mutation
   */
  const deleteTaskConnectionsMutation = useMutation({
    mutationFn: (params: DeleteTaskConnectionRequest) => taskConnectionsApi.deleteTaskConnection(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "connections"] });
    },
    onError: (error) => setError(t("errorHandling.errorDeletingTaskConnection"), error),
  });

  /**
   * Closes the dialog and clears the form
   */
  const closeAndClear = () => {
    setTaskData({
      name: "",
      startDate: undefined,
      endDate: undefined,
      status: TaskStatus.NotStarted,
      assigneeIds: [],
      positionId: "",
      estimatedDuration: 0,
      estimatedReadiness: 0,
      attachmentUrls: [],
    });

    setNewTaskConnections([]);
    setExistingTaskConnections([]);
    onClose();
  };

  /**
   * Deletes removed task connections
   * Note: to be used only when editing existing task
   */
  const deleteRemovedTaskConnections = async () => {
    const connectionsToDelete = (listTaskConnectionsQuery.data ?? [])
      .filter((connection) => !existingTaskConnections.some((c) => c.connectionId === connection.id))
      .map((connection) => ({ projectId, connectionId: connection.id ?? "" }));

    for (const connection of connectionsToDelete) {
      await deleteTaskConnectionsMutation.mutateAsync(connection);
    }
  };

  /**
   * Persist new and edited task connections
   *
   * @param taskId task id
   */
  const persistNewAndEditedTaskConnections = async (taskId: string) => {
    const newConnections = newTaskConnections
      .filter((connection) => connection.attachedTask) // Filter out empty connections
      .map((connection) => ({
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
      setError(t("errorHandling.errorUploadingNewTaskAttachment"), error instanceof Error ? error : undefined);
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
      setError(t("errorHandling.errorUploadingExistingTaskAttachment"), error instanceof Error ? error : undefined);
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
      setError(t("errorHandling.errorDeletingTaskAttachment"), error instanceof Error ? error : undefined);
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
        setTaskData({
          ...taskData,
          [field]: Array.isArray(value) ? value : [value],
        });
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

    setLoadingProposalsDeletion((prev) => ({
      ...prev,
      [changeProposalId]: true,
    }));
    try {
      await deleteChangeProposalMutation.mutateAsync({
        changeProposalId: changeProposalId,
      });
    } finally {
      setUpdateChangeProposalData(
        updateChangeProposalData?.filter((proposal) => proposal.id !== changeProposalId) ?? [],
      );
      setLoadingProposalsDeletion((prev) => ({
        ...prev,
        [changeProposalId]: false,
      }));
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
      if (!task.milestoneId) return;

      await updateTaskMutation.mutateAsync({
        taskId: task.id,
        task: {
          milestoneId: task.milestoneId,
          name: taskData.name,
          startDate: startDateIsoConverted,
          endDate: endDateIsoConverted,
          status: taskData.status,
          assigneeIds: taskData.assigneeIds,
          jobPositionId: taskData.positionId,
          dependentUserId: taskData.dependentUserId,
          userRole: taskData.userRole,
          estimatedDuration: taskData.estimatedDuration,
          estimatedReadiness: taskData.estimatedReadiness,
          attachmentUrls: taskData.attachmentUrls,
        },
      });

      await deleteRemovedTaskConnections();
      await persistNewAndEditedTaskConnections(task.id);
    } else {
      if (!taskData?.milestoneId) return;

      const createdTask = await createTaskMutation.mutateAsync({
        task: {
          milestoneId: taskData.milestoneId,
          name: taskData.name,
          startDate: startDateIsoConverted,
          endDate: endDateIsoConverted,
          status: taskData.status,
          assigneeIds: taskData.assigneeIds,
          jobPositionId: taskData.positionId,
          dependentUserId: taskData.dependentUserId,
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

    closeAndClear();
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
    return urlParts[urlParts.length - 1]?.toUpperCase();
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
   *  Checks if project status is planning or initiation
   */
  const hasProjectStarted = () => {
    return project?.status !== ProjectStatus.Planning && project?.status !== ProjectStatus.Initiation;
  };

  /**
   * Returns min date for startDate input
   */
  const getStartDateMin = () => {
    if (!selectedMilestone || !hasProjectStarted()) {
      return undefined;
    }

    return getValidDateTimeOrThrow(selectedMilestone.startDate);
  };

  /**
   * Returns max date for startDate input
   */
  const getStartDateMax = () => {
    if (!selectedMilestone || !hasProjectStarted()) return taskData.endDate ?? undefined;

    return taskData.endDate
      ? [getValidDateTimeOrThrow(selectedMilestone.endDate), taskData.endDate].toSorted().at(0)
      : getValidDateTimeOrThrow(selectedMilestone.endDate);
  };

  /**
   * Returns min date for endDate input
   */
  const getEndDateMin = () => {
    if (!selectedMilestone || !hasProjectStarted()) {
      return taskData.startDate ?? undefined;
    }

    return taskData.startDate
      ? [getValidDateTimeOrThrow(selectedMilestone.startDate), taskData.startDate].toSorted().at(1)
      : getValidDateTimeOrThrow(selectedMilestone.startDate);
  };

  /**
   * Returns max date for endDate input
   */
  const getEndDateMax = () => {
    if (!selectedMilestone || !hasProjectStarted()) {
      return undefined;
    }

    return getValidDateTimeOrThrow(selectedMilestone.endDate);
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
            {renderDropdownPicker(
              "status",
              t("newMilestoneTaskDialog.status"),
              Object.fromEntries(Object.values(TaskStatus).map((status) => [status, t(`taskStatuses.${status}`)])),
              false,
            )}
          </Grid>
          <Grid item xs={3}>
            {renderDropdownPicker("dependentUserId", t("newMilestoneTaskDialog.dependentUser"), projectUsersMap, false)}
          </Grid>
          <Grid item xs={3}>
            {renderDropdownPicker(
              "positionId",
              t("newMilestoneTaskDialog.position"),
              jobPositions.reduce(
                (acc, position) => {
                  if (position.id) {
                    acc[position.id] = position.name;
                  }
                  return acc;
                },
                {} as Record<string, string>,
              ),
              false,
            )}
          </Grid>
          <Grid item xs={6}>
            {renderDropdownPicker("assigneeIds", t("newMilestoneTaskDialog.assignees"), projectUsersMap, true)}
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              label={t("newMilestoneTaskDialog.estimatedDuration")}
              value={taskData.estimatedDuration}
              onChange={handleFormChange("estimatedDuration")}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">{t("newMilestoneTaskDialog.inputLabelDays")}</InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              label={t("newMilestoneTaskDialog.estimatedReadiness")}
              value={taskData.estimatedReadiness}
              onChange={handleFormChange("estimatedReadiness")}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">{t("newMilestoneTaskDialog.inputLabelPercent")}</InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={3}>
            <GenericDatePicker
              fullWidth
              label={t("newMilestoneTaskDialog.start")}
              value={taskData.startDate ?? null}
              minDate={getStartDateMin()}
              maxDate={getStartDateMax()}
              onChange={handleDateFormChange("startDate")}
            />
          </Grid>
          <Grid item xs={3}>
            <GenericDatePicker
              fullWidth
              label={t("newMilestoneTaskDialog.end")}
              value={taskData.endDate ?? null}
              minDate={getEndDateMin()}
              maxDate={getEndDateMax()}
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
        <Typography component="h2" variant="h6" px={2} pb={1}>
          {t("newMilestoneTaskDialog.taskAttachmentsTable.title")}
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("newMilestoneTaskDialog.taskAttachmentsTable.type")}</TableCell>
                <TableCell>{t("newMilestoneTaskDialog.taskAttachmentsTable.name")}</TableCell>
                <TableCell>{t("newMilestoneTaskDialog.taskAttachmentsTable.preview")}</TableCell>
                <TableCell sx={{ width: 50 }}>{t("newMilestoneTaskDialog.taskAttachmentsTable.delete")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {taskData.attachmentUrls.map((attachment) => (
                <TableRow key={attachment} sx={{ "& > .MuiTableCell-root": { py: 0, px: 1 } }}>
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
                  <TableCell style={{ width: 50, textDecorationColor: "red", textAlign: "center" }}>
                    <IconButton
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
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack direction="row" justifyContent="flex-end" p={2}>
          <Button
            variant="text"
            color="primary"
            sx={{ borderRadius: 25 }}
            onClick={() => setAttachmentDialogOpen(true)}
          >
            <AddIcon />
            {t("newMilestoneTaskDialog.taskAttachmentsTable.addButton")}
          </Button>
        </Stack>
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

    const startDate = changeProposal.startDate ? getValidDateTimeOrThrow(changeProposal.startDate) : undefined;
    const endDate = changeProposal.endDate ? getValidDateTimeOrThrow(changeProposal.endDate) : undefined;
    const disabled = changeProposal.status !== ChangeProposalStatus.Pending;

    return (
      <Stack key={changeProposal.id} direction="row" gap={1} p={2} sx={{ borderBottom: "1px solid #e6e4e4" }}>
        <Grid container spacing={1} flex={1}>
          <Grid item xs={6} sx={{ display: "flex", flexDirection: "row" }}>
            <GenericDatePicker
              fullWidth
              label={t("changeProposals.changeStart")}
              value={startDate ?? null}
              onChange={handleUpdateChangeProposalDateFormChange("startDate", changeProposal.id)}
              hasBorder
              maxDate={endDate}
              disabled={disabled}
            />
            <GenericDatePicker
              fullWidth
              label={t("changeProposals.changeEnd")}
              value={endDate ?? null}
              onChange={handleUpdateChangeProposalDateFormChange("endDate", changeProposal.id)}
              hasBorder
              minDate={startDate}
              disabled={disabled}
            />
          </Grid>
          <Grid item xs={6}>
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
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t("changeProposals.comment")}
              value={changeProposal.comment}
              onChange={handleUpdateChangeProposalFormChange("comment", changeProposal.id)}
              sx={{ border: "1px solid #e6e4e4" }}
              disabled={disabled}
            />
          </Grid>
        </Grid>
        <Stack width={150} gap={1} pt={1} alignItems="flex-start">
          <Chip
            size="small"
            label={t("changeProposalStatuses.PENDING")}
            sx={{
              bgcolor: (theme) => theme.palette.changeProposalStatus[changeProposal.status],
              color: "white",
            }}
          />
          {loadingProposalsDeletion[changeProposal.id] ? (
            <CircularProgress size={24} sx={{ marginLeft: "1rem" }} />
          ) : (
            <IconButton
              onClick={() => handleDeleteChangeProposal(changeProposal.id)}
              aria-label="close"
              sx={{ color: "#0000008F" }}
            >
              <DeleteOutlineIcon />
            </IconButton>
          )}
        </Stack>
      </Stack>
    );
  };

  /**
   * Renders change proposal creation forms
   */
  const renderCreateChangeProposals = () => {
    return createChangeProposalData.map((newChangeProposal) => {
      if (!newChangeProposal.id) return;

      const startDate = newChangeProposal.startDate ? getValidDateTimeOrThrow(newChangeProposal.startDate) : null;
      const endDate = newChangeProposal.endDate ? getValidDateTimeOrThrow(newChangeProposal.endDate) : null;

      return (
        <div key={newChangeProposal.id}>
          <Grid container spacing={1} padding={2} sx={{ borderBottom: "1px solid #e6e4e4" }}>
            <Grid item xs={4} sx={{ display: "flex", flexDirection: "row" }}>
              <GenericDatePicker
                fullWidth
                label={t("changeProposals.changeStart")}
                value={startDate}
                onChange={handleCreateChangeProposalDateFormChange("startDate", newChangeProposal.id)}
                hasBorder
                maxDate={endDate}
              />
              <GenericDatePicker
                fullWidth
                label={t("changeProposals.changeEnd")}
                value={endDate}
                onChange={handleCreateChangeProposalDateFormChange("endDate", newChangeProposal.id)}
                hasBorder
                minDate={startDate}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                value={newChangeProposal.reason}
                label={t("changeProposals.reasonForChange")}
                select
                size="small"
                sx={{
                  width: "100%",
                  border: "1px solid #e6e4e4",
                  padding: "1px 0px 8px",
                }}
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
              <Chip
                size="small"
                label={t("changeProposalStatuses.PENDING")}
                sx={{
                  bgcolor: (theme) => theme.palette.changeProposalStatus.PENDING,
                  color: "white",
                }}
              />
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
      <>
        <Typography component="h2" variant="h6" px={2}>
          {t("changeProposals.changeProposals")}
        </Typography>
        {updateChangeProposalData.map((proposal) => renderExistingChangeProposals(proposal))}
        {!!createChangeProposalData.length && renderCreateChangeProposals()}
        <Stack direction="row" justifyContent="flex-end" p={2}>
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
        </Stack>
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
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: "5rem",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
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
   * Renders milestone name or select input if milestone is not yet defined
   */
  const renderMilestoneName = () => {
    if (milestoneId) return milestones.find((milestone) => milestone.id === milestoneId)?.name;

    return (
      <ThemeProvider theme={createTheme({ palette: { mode: "dark" } })}>
        <TextField
          value={taskData?.milestoneId ?? ""}
          label={t("newMilestoneTaskDialog.milestone")}
          select
          size="small"
          variant="outlined"
          onChange={handleFormChange("milestoneId")}
          sx={{ width: 200 }}
        >
          {milestones.map((milestone) => (
            <MenuItem key={milestone.id} value={milestone.id}>
              {milestone.name}
            </MenuItem>
          ))}
        </TextField>
      </ThemeProvider>
    );
  };

  /**
   * Disables form submit based on required form fields
   */
  const isDisabled = !(
    taskData.milestoneId &&
    taskData.name &&
    taskData.startDate &&
    taskData.endDate &&
    taskData.status &&
    taskConnectionsValid
  );

  /**
   * Main component render
   */
  return (
    <>
      <Dialog
        fullScreen={isSmallerScreen}
        PaperProps={{ sx: { minHeight: "90vh", maxWidth: 1200 } }}
        open={open}
        onClose={closeAndClear}
      >
        <AppBar sx={{ position: "relative" }} elevation={0}>
          <Toolbar sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {renderMilestoneName()}
            <span>/</span>
            {task ? task.name : t("newMilestoneTaskDialog.title")}
            <Button
              onClick={handleTaskFormSubmit}
              variant="outlined"
              color="inherit"
              size="large"
              disabled={isDisabled}
              sx={{ ml: "auto" }}
            >
              {!task && <AddIcon />}
              {task ? t("newMilestoneTaskDialog.updateButton") : t("newMilestoneTaskDialog.createButton")}
            </Button>
            <IconButton color="inherit" onClick={closeAndClear}>
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <DialogContent style={{ padding: 0 }}>
          {renderNewTaskInfoSection()}
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
          {task?.id && (
            <CommentsSection
              projectId={projectId}
              milestoneId={task.milestoneId}
              taskId={task.id}
              projectUsers={listProjectUsersQuery.data?.users ?? []}
              projectUsersMap={projectUsersMap}
              projectKeycloakUsersMap={projectKeycloakUsersMap}
            />
          )}
        </DialogContent>
      </Dialog>
      {renderUploadTaskAttachmentDialog()}
    </>
  );
};

export default TaskDialog;
