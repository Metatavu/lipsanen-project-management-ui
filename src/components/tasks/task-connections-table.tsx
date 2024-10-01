import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Button,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  TextFieldProps,
  Typography,
} from "@mui/material";
import { Task, TaskConnectionType } from "generated/client";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TaskConnectionRelationship, TaskConnectionTableData, TaskFormData } from "types";

/**
 * Component properties
 */
interface Props {
  existingTaskConnections: TaskConnectionTableData[];
  newTaskConnections: TaskConnectionTableData[];
  milestoneTasks: Task[];
  taskData: TaskFormData;
  availableTaskConnectionTasks: Task[];
  handleEditConnection: (connectionId: string, field: keyof TaskConnectionTableData, value: TaskConnectionType) => void;
  addNewTaskConnectionRow: () => void;
  handleEditNewConnection: (
    id: string,
    field: keyof TaskConnectionTableData,
    value: TaskConnectionTableData[keyof TaskConnectionTableData],
  ) => void;
  removeNewTaskConnectionRow: (id: string) => void;
  removeExistingTaskConnectionRow: (connectionId: string) => void;
  setTaskConnectionsValid: (valid: boolean) => void;
}

/**
 * Styled table cell text field component
 *
 * @param props component properties
 */
const TableCellTextField = (props: TextFieldProps) => (
  <TextField
    variant="outlined"
    fullWidth
    size="small"
    sx={{ ".MuiOutlinedInput-notchedOutline": { border: "none" } }}
    {...props}
  />
);

/**
 * Task connections table component
 *
 * @param props component properties
 */
const TaskConnectionsTable = ({
  existingTaskConnections,
  newTaskConnections,
  milestoneTasks,
  taskData,
  availableTaskConnectionTasks,
  handleEditConnection,
  removeNewTaskConnectionRow,
  addNewTaskConnectionRow,
  handleEditNewConnection,
  removeExistingTaskConnectionRow,
  setTaskConnectionsValid,
}: Props) => {
  const { t } = useTranslation();

  /**
   * Get unused available task options
   */
  const unusedAvailableTaskConnectionTasks = useMemo(() => {
    const newConnectionTaskIds = newTaskConnections.map((connection) => connection.attachedTask?.id);
    return availableTaskConnectionTasks.filter((task) => !newConnectionTaskIds.includes(task.id));
  }, [availableTaskConnectionTasks, newTaskConnections]);

  /**
   * Get available task options for a dropdown select
   *
   * @param selectedTaskId selected task id
   */
  const getAvailableTaskOptions = (selectedTaskId?: string) => {
    const selectedTask = milestoneTasks.find((task) => task.id === selectedTaskId);
    if (selectedTask) {
      return [selectedTask, ...unusedAvailableTaskConnectionTasks];
    }
    return unusedAvailableTaskConnectionTasks;
  };

  /**
   * Determine if task type is allowed
   *
   * @param connectedTask connected task
   * @param editedTaskFormData edited / new task form data
   * @param type task connection type
   */
  const determineIfTaskTypeIsAllowed = (
    connectedTask: TaskConnectionTableData,
    editedTaskFormData: TaskFormData,
    type?: TaskConnectionType,
  ) => {
    if (
      !connectedTask ||
      !editedTaskFormData ||
      !connectedTask.attachedTask ||
      !editedTaskFormData.startDate ||
      !editedTaskFormData.endDate
    ) {
      return null;
    }

    const connectedTaskStartDate = connectedTask.attachedTask.startDate;
    const connectedTaskEndDate = connectedTask.attachedTask.endDate;
    const editedTaskStartDate = new Date(editedTaskFormData.startDate.toISODate());
    const editedTaskEndDate = new Date(editedTaskFormData.endDate.toISODate());

    const sourceTaskDates =
      connectedTask.hierarchy === TaskConnectionRelationship.PARENT
        ? { startDate: connectedTaskStartDate, endDate: connectedTaskEndDate }
        : { startDate: editedTaskStartDate, endDate: editedTaskEndDate };
    const targetTaskDates =
      connectedTask.hierarchy === TaskConnectionRelationship.PARENT
        ? { startDate: editedTaskStartDate, endDate: editedTaskEndDate }
        : { startDate: connectedTaskStartDate, endDate: connectedTaskEndDate };

    switch (type) {
      case TaskConnectionType.StartToStart:
        return sourceTaskDates.startDate > targetTaskDates.startDate
          ? t("newMilestoneTaskDialog.taskConnectionsTable.taskTypeCheck.sourceStartAfterTargetStartWarning")
          : null;
      case TaskConnectionType.FinishToFinish:
        return sourceTaskDates.endDate > targetTaskDates.endDate
          ? t("newMilestoneTaskDialog.taskConnectionsTable.taskTypeCheck.sourceEndAfterTargetEndWarning")
          : null;
      case TaskConnectionType.FinishToStart:
        return sourceTaskDates.endDate > targetTaskDates.startDate
          ? t("newMilestoneTaskDialog.taskConnectionsTable.taskTypeCheck.sourceEndAfterTargetStartWarning")
          : null;
      default:
        return null;
    }
  };

  /**
   * Recalculate overall validity
   */
  useEffect(() => {
    const allConnections = [...existingTaskConnections, ...newTaskConnections];
    const validationErrors = allConnections.map((connection) =>
      determineIfTaskTypeIsAllowed(
        { ...connection, attachedTask: milestoneTasks.find((task) => task.id === connection.attachedTask?.id) },
        taskData,
        connection.type,
      ),
    );
    setTaskConnectionsValid(!validationErrors.some((error) => error !== null));
  }, [
    existingTaskConnections,
    newTaskConnections,
    milestoneTasks,
    taskData,
    setTaskConnectionsValid,
    determineIfTaskTypeIsAllowed,
  ]);

  /**
   * Render existing task connection table rows
   */
  const renderExistingTaskConnectionTableRows = () => {
    return existingTaskConnections.map((connection) => (
      <TableRow key={connection.connectionId} sx={{ "& > .MuiTableCell-root": { p: 0 } }}>
        <TableCell>
          <TableCellTextField
            value={t(`taskConnectionRoles.${connection.hierarchy}`)}
            InputProps={{ readOnly: true }}
          />
        </TableCell>
        <TableCell>
          <TableCellTextField
            select
            value={connection.type}
            onChange={(e) =>
              handleEditConnection(connection.connectionId, "type", e.target.value as TaskConnectionType)
            }
          >
            {Object.values(TaskConnectionType).map((type) => (
              <MenuItem key={type} value={type}>
                {t(`taskConnectionTypes.${type}`)}
              </MenuItem>
            ))}
          </TableCellTextField>
          <div style={{ color: "red", fontSize: "0.75rem" }}>
            {determineIfTaskTypeIsAllowed(
              { ...connection, attachedTask: milestoneTasks.find((task) => task.id === connection.attachedTask?.id) },
              taskData,
              connection.type,
            )}
          </div>
        </TableCell>
        <TableCell>
          <TableCellTextField value={connection.attachedTask?.name ?? ""} />
        </TableCell>
        <TableCell>
          {connection.attachedTask && (
            <TableCellTextField
              value={t(`taskStatuses.${connection.attachedTask.status}`)}
              InputProps={{ readOnly: true }}
            />
          )}
        </TableCell>
        <TableCell sx={{ textAlign: "center" }}>
          <IconButton onClick={() => removeExistingTaskConnectionRow(connection.connectionId)}>
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    ));
  };

  /**
   * Render new task connection table rows
   */
  const renderNewTaskConnectionTableRows = () => {
    return newTaskConnections.map((connection) => (
      <TableRow key={connection.id} sx={{ "& > .MuiTableCell-root": { p: 0 } }}>
        <TableCell>
          <TableCellTextField
            select
            value={connection.hierarchy}
            onChange={(e) =>
              handleEditNewConnection(connection.id ?? "", "hierarchy", e.target.value as keyof TaskConnectionTableData)
            }
          >
            <MenuItem value={TaskConnectionRelationship.PARENT}>{t("taskConnectionRoles.PARENT")}</MenuItem>
            <MenuItem value={TaskConnectionRelationship.CHILD}>{t("taskConnectionRoles.CHILD")}</MenuItem>
          </TableCellTextField>
        </TableCell>
        <TableCell>
          <TableCellTextField
            fullWidth
            select
            value={connection.type}
            onChange={(e) =>
              handleEditNewConnection(connection.id ?? "", "type", e.target.value as keyof TaskConnectionTableData)
            }
          >
            {Object.values(TaskConnectionType).map((type) => (
              <MenuItem key={type} value={type}>
                {t(`taskConnectionTypes.${type}`)}
              </MenuItem>
            ))}
          </TableCellTextField>
          <div style={{ color: "red", fontSize: "0.75rem" }}>
            {determineIfTaskTypeIsAllowed(
              { ...connection, attachedTask: milestoneTasks.find((task) => task.id === connection.attachedTask?.id) },
              taskData,
              connection.type,
            )}
          </div>
        </TableCell>
        <TableCell>
          <TableCellTextField
            fullWidth
            select
            value={connection.attachedTask?.id ?? ""}
            onChange={(e) => {
              const selectedTask = milestoneTasks.find((task) => task.id === e.target.value);
              if (selectedTask) {
                handleEditNewConnection(connection.id ?? "", "attachedTask", selectedTask);
              }
            }}
          >
            {getAvailableTaskOptions(connection.attachedTask?.id).map((taskElement) => (
              <MenuItem key={taskElement.id} value={taskElement.id}>
                {taskElement.name}
              </MenuItem>
            ))}
          </TableCellTextField>
        </TableCell>
        <TableCell>
          <TableCellTextField
            fullWidth
            value={connection.attachedTask ? t(`taskStatuses.${connection.attachedTask.status}`) : ""}
            InputProps={{ readOnly: true }}
          />
        </TableCell>
        <TableCell sx={{ textAlign: "center" }}>
          <IconButton onClick={() => removeNewTaskConnectionRow(connection.id ?? "")}>
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    ));
  };

  /**
   * Component render method
   */
  return (
    <>
      <Typography component="h2" variant="h6" p={2} pb={1}>
        {t("newMilestoneTaskDialog.taskConnectionsTable.title")}
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell style={{ width: 150 }}>{t("newMilestoneTaskDialog.taskConnectionsTable.hierarchy")}</TableCell>
              <TableCell style={{ width: 200 }}>{t("newMilestoneTaskDialog.taskConnectionsTable.type")}</TableCell>
              <TableCell>{t("newMilestoneTaskDialog.taskConnectionsTable.task")}</TableCell>
              <TableCell style={{ width: 150 }}>{t("newMilestoneTaskDialog.taskConnectionsTable.status")}</TableCell>
              <TableCell style={{ width: 50 }}>{t("newMilestoneTaskDialog.taskConnectionsTable.delete")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {renderExistingTaskConnectionTableRows()}
            {renderNewTaskConnectionTableRows()}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack direction="row" justifyContent="flex-end" p={2}>
        <Button
          onClick={addNewTaskConnectionRow}
          startIcon={<AddIcon />}
          disabled={unusedAvailableTaskConnectionTasks.length === 0}
        >
          {t("newMilestoneTaskDialog.taskConnectionsTable.addButton")}
        </Button>
      </Stack>
    </>
  );
};

export default TaskConnectionsTable;
