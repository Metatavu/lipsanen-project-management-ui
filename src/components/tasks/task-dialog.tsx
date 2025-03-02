import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PreviewIcon from "@mui/icons-material/Preview";
import { LoadingButton } from "@mui/lab";
import {
  AppBar,
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
  Tooltip,
  Typography,
  createTheme,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiUserAtom } from "atoms/auth";
import AttachmentDialog from "components/attachments/attachment-dialog";
import GenericDatePicker from "components/generic/generic-date-picker";
import {
  Attachment,
  ChangeProposal,
  ChangeProposalStatus,
  CreateChangeProposalRequest,
  CreateTaskConnectionRequest,
  CreateTaskRequest,
  DeleteChangeProposalRequest,
  DeleteTaskConnectionRequest,
  DeleteTaskRequest,
  ProjectStatus,
  Task,
  TaskConnectionType,
  TaskStatus,
  UpdateChangeProposalRequest,
  UpdateTaskConnectionRequest,
  UpdateTaskRequest,
  UserRole,
} from "generated/client";
import {
  useFindProjectQuery,
  useListAttachmentsQuery,
  useListJobPositionsQuery,
  useListProjectMilestonesQuery,
  useListTaskConnectionsQuery,
  useListTasksQuery,
  useListUsersQuery,
} from "hooks/api-queries";
import { useApi } from "hooks/use-api";
import { useAtomValue } from "jotai";
import { DateTime } from "luxon";
import { useConfirmDialog } from "providers/confirm-dialog-provider";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TaskConnectionRelationship, type TaskConnectionTableData, type TaskFormData } from "types";
import { getLastPartFromMimeType } from "utils";
import { getValidDateTimeOrThrow } from "utils/date-time-utils";
import { useSetError } from "utils/error-handling";
import { v4 as uuidv4 } from "uuid";
import CommentsSection from "./comments-section";
import TaskConnectionsTable from "./task-connections-table";

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
  const { tasksApi, taskConnectionsApi, changeProposalsApi, attachmentsApi } = useApi();

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

  const listTaskAttachmentsQuery = useListAttachmentsQuery({ projectId, taskId: task?.id });
  const [updatedTaskAttachments, setUpdatedTaskAttachments] = useState(
    task?.id ? listTaskAttachmentsQuery.data ?? [] : [],
  );

  useEffect(() => {
    setUpdatedTaskAttachments(task?.id ? listTaskAttachmentsQuery.data ?? [] : []);
  }, [task, listTaskAttachmentsQuery.data]);

  const projectStatus = useFindProjectQuery(projectId).data?.status;
  const user = useAtomValue(apiUserAtom);

  const showConfirmDialog = useConfirmDialog();

  const [taskData, setTaskData] = useState<TaskFormData>({
    name: "",
    milestoneId: milestoneId,
    startDate: undefined,
    endDate: undefined,
    status: TaskStatus.NotStarted,
    assigneeIds: [],
    positionId: "",
    dependentUserId: null,
    estimatedDuration: 0,
    estimatedReadiness: 0,
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
        dependentUserId: task.dependentUserId || null,
        userRole: task.userRole,
        estimatedDuration: task.estimatedDuration,
        estimatedReadiness: task.estimatedReadiness,
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
        dependentUserId: null,
        estimatedDuration: 0,
        estimatedReadiness: 0
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
    onError: (error) => setError(t("errorHandling.errorCreatingMilestoneTask"), error),
  });

  /**
   * Update task mutation
   */
  const updateTaskMutation = useMutation({
    mutationFn: (params: UpdateTaskRequest) => tasksApi.updateTask(params),
    onError: (error) => setError(t("errorHandling.errorUpdatingMilestoneTask"), error),
  });

  /**
   * Delete task mutation
   */
  const deleteTaskMutation = useMutation({
    mutationFn: (params: DeleteTaskRequest) => tasksApi.deleteTask(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "milestones"] });
    },
    onError: (error) => setError(t("errorHandling.errorDeletingTask"), error),
  });

  /**
   * Create change proposal mutation
   */
  const createChangeProposalMutation = useMutation({
    mutationFn: (params: CreateChangeProposalRequest) => changeProposalsApi.createChangeProposal(params),
    onError: (error) => setError(t("errorHandling.errorCreatingChangeProposal"), error),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["changeProposals"] });
    }
  });

  /**
   * Update change proposals mutation
   */
  const updateChangeProposalsMutation = useMutation({
    mutationFn: (params: UpdateChangeProposalRequest) => changeProposalsApi.updateChangeProposal(params),
    onError: (error) => setError(t("errorHandling.errorUpdatingChangeProposal"), error),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["changeProposals"] });
    }
  });

  /**
   * Delete change proposal mutation
   */
  const deleteChangeProposalMutation = useMutation({
    mutationFn: (params: DeleteChangeProposalRequest) => changeProposalsApi.deleteChangeProposal(params),
    onError: (error) => setError(t("errorHandling.errorDeletingChangeProposal"), error),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["changeProposals"] });
    }
  });

  /**
   * Create task connections mutation
   */
  const createTaskConnectionsMutation = useMutation({
    mutationFn: (params: CreateTaskConnectionRequest) => taskConnectionsApi.createTaskConnection(params),
    onError: (error) => setError(t("errorHandling.errorCreatingTaskConnection"), error),
  });

  /**
   * Update task connections mutation
   */
  const updateTaskConnectionsMutation = useMutation({
    mutationFn: (params: UpdateTaskConnectionRequest) => taskConnectionsApi.updateTaskConnection(params),
    onError: (error) => setError(t("errorHandling.errorUpdatingTaskConnection"), error),
  });

  /**
   * Delete task connections mutation
   */
  const deleteTaskConnectionsMutation = useMutation({
    mutationFn: (params: DeleteTaskConnectionRequest) => taskConnectionsApi.deleteTaskConnection(params),
    onError: (error) => setError(t("errorHandling.errorDeletingTaskConnection"), error),
  });

  /**
   * Update task attachments mutation
   */
  const updateTaskAttachmentsMutation = useMutation({
    mutationFn: async () => {
      const existingAttachments = listTaskAttachmentsQuery.data ?? [];

      const attachmentsToDelete = existingAttachments.filter(
        (attachment) => !updatedTaskAttachments.some((updatedAttachment) => updatedAttachment.id === attachment.id),
      );
      const deletePromises = attachmentsToDelete
        .map((attachment) => attachment.id)
        .filter((attachmentId): attachmentId is string => !!attachmentId)
        .map((attachmentId) => attachmentsApi.deleteAttachment({ attachmentId }));

      const attachmentsToCreate = updatedTaskAttachments.filter((attachment) => !attachment.id);
      const createPromises = attachmentsToCreate.map((attachment) =>
        attachmentsApi.createAttachment({ attachment: attachment }),
      );

      await Promise.all([...deletePromises, ...createPromises]);
    },
    onError: (error) => setError(t("errorHandling.errorUpdatingProjectAttachments"), error),
  });

  /**
   * Closes the dialog and clears the form
   */
  const closeAndClear = () => {
    setTaskData({
      name: "",
      milestoneId: taskData.milestoneId,
      startDate: undefined,
      endDate: undefined,
      status: TaskStatus.NotStarted,
      assigneeIds: [],
      positionId: "",
      dependentUserId: null,
      estimatedDuration: 0,
      estimatedReadiness: 0,
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
   * Handles task attachment delete
   *
   * @param attachmentUrl attachment url
   */
  const handleDeleteAttachment = async (attachmentToDelete: Attachment) => {
    try {
      setUpdatedTaskAttachments(updatedTaskAttachments.filter((attachment) => attachment.id !== attachmentToDelete.id));
    } catch (error) {
      setError(t("errorHandling.errorDeletingAttachment"), error instanceof Error ? error : undefined);
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
   * Handles task deletion
   */
  const handleDeleteTask = async () => {
    if (!task?.id) return;

    deleteTaskMutation.mutate({ taskId: task.id });
    closeAndClear();
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
          dependentUserId: taskData.dependentUserId || undefined,
          userRole: taskData.userRole,
          estimatedDuration: taskData.estimatedDuration,
          estimatedReadiness: taskData.estimatedReadiness,
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
          dependentUserId: taskData.dependentUserId || undefined,
          userRole: taskData.userRole,
          estimatedDuration: taskData.estimatedDuration,
          estimatedReadiness: taskData.estimatedReadiness,
        },
      });

      if (createdTask.id) {
        await persistNewAndEditedTaskConnections(createdTask.id);
      }
    }

    await updateTaskAttachmentsMutation.mutateAsync();
    await persistChangeProposals();

    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["projects", projectId, "milestones"] });
    queryClient.invalidateQueries({ queryKey: ["attachments"] });
    queryClient.invalidateQueries({ queryKey: ["projects", projectId, "changeProposals"] });
    queryClient.invalidateQueries({ queryKey: ["projects", projectId, "connections"] });

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
        value={taskData[field] || ""}
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
        { multipleSelect ? undefined : <MenuItem value="">-</MenuItem> }
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
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {updatedTaskAttachments.map((attachment) => (
                <TableRow key={`${attachment.id}-${attachment.url}`} sx={{ "& > .MuiTableCell-root": { py: 0 } }}>
                  <TableCell>{getLastPartFromMimeType(attachment.type)}</TableCell>
                  <TableCell>{attachment.name}</TableCell>
                  <TableCell width={60}>
                    <Stack direction="row" justifyContent="flex-end" gap={1}>
                      <IconButton
                        title={t("newMilestoneTaskDialog.taskAttachmentsTable.preview")}
                        onClick={() => {
                          window.open(attachment.url, "_blank");
                        }}
                      >
                        <PreviewIcon />
                      </IconButton>
                      <IconButton
                        title={t("newMilestoneTaskDialog.taskAttachmentsTable.delete")}
                        color="primary"
                        sx={{ borderRadius: 25 }}
                        onClick={() =>
                          showConfirmDialog({
                            title: t("newMilestoneTaskDialog.taskAttachmentsTable.deleteConfirmationDialog.title"),
                            description: t(
                              "newMilestoneTaskDialog.taskAttachmentsTable.deleteConfirmationDialog.description",
                              { attachmentName: attachment.name },
                            ),
                            cancelButtonEnabled: true,
                            confirmButtonText: t("generic.delete"),
                            onConfirmClick: () => handleDeleteAttachment(attachment),
                          })
                        }
                      >
                        <DeleteIcon color="error" />
                      </IconButton>
                    </Stack>
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
            label={t(`changeProposalStatuses.${changeProposal.status}`)}
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

  const isUserAdminOrOwner = user?.roles?.includes(UserRole.Admin) || user?.roles?.includes(UserRole.ProjectOwner);
  const projectInPlanning = projectStatus === ProjectStatus.Planning || projectStatus === ProjectStatus.Initiation;
  const deleteDisabled = !task || !!existingTaskConnections.length || (!projectInPlanning && !isUserAdminOrOwner);

  /**
   * Renders tooltip based on reason for button being disabled
   */
  const renderDisabledButtonTooltip = () => {
    if (!deleteDisabled) return null;
    if (!task) {
      return t("newMilestoneTaskDialog.deleteButtonToolTips.noTask");
    }
    if (!projectInPlanning && !isUserAdminOrOwner) {
      return t("newMilestoneTaskDialog.deleteButtonToolTips.outOfPlanning");
    }
    if (existingTaskConnections.length) {
      return t("newMilestoneTaskDialog.deleteButtonToolTips.taskHasConnections");
    }
    return null;
  };

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
            <Tooltip title={renderDisabledButtonTooltip()}>
              <span style={{ marginLeft: "auto" }}>
                <Button
                  onClick={() =>
                    showConfirmDialog({
                      title: t("newMilestoneTaskDialog.deleteTaskConfirmationDialog.title"),
                      description: t("newMilestoneTaskDialog.deleteTaskConfirmationDialog.description", {
                        taskName: task?.name,
                      }),
                      cancelButtonEnabled: true,
                      confirmButtonText: t("generic.delete"),
                      onConfirmClick: handleDeleteTask,
                    })
                  }
                  variant="contained"
                  color="inherit"
                  size="large"
                  disabled={deleteDisabled}
                  sx={{ ml: "auto", backgroundColor: "#D32F2F" }}
                >
                  {t("newMilestoneTaskDialog.deleteButton")}
                </Button>
              </span>
            </Tooltip>
            <LoadingButton
              loading={
                updateTaskMutation.isPending ||
                createTaskMutation.isPending ||
                createChangeProposalMutation.isPending ||
                updateChangeProposalsMutation.isPending ||
                deleteChangeProposalMutation.isPending ||
                createTaskConnectionsMutation.isPending ||
                updateTaskConnectionsMutation.isPending ||
                deleteTaskConnectionsMutation.isPending ||
                updateTaskAttachmentsMutation.isPending
              }
              onClick={handleTaskFormSubmit}
              variant="outlined"
              color="inherit"
              size="large"
              disabled={isDisabled}
            >
              {!task && <AddIcon />}
              {task ? t("newMilestoneTaskDialog.updateButton") : t("newMilestoneTaskDialog.createButton")}
            </LoadingButton>
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
      <AttachmentDialog
        open={attachmentDialogOpen}
        onClose={() => setAttachmentDialogOpen(false)}
        projectId={projectId}
        taskId={task?.id}
        handleAttachmentSave={(attachment) => updatedTaskAttachments.push(attachment)}
      />
    </>
  );
};

export default TaskDialog;
