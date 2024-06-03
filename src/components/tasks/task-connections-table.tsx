import {
  TableRow,
  TableCell,
  TextField,
  MenuItem,
  IconButton,
  Button,
  DialogContentText,
  Table,
  TableBody,
  TableContainer,
  TableHead,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import {
  Task,
  TaskConnectionType,
} from "generated/client";
import { useTranslation } from "react-i18next";
import { TaskConnectionRelationship, TaskConnectionTableData } from "types";
import { useEffect } from "react";

/**
 * Component properties
 */
interface Props {
  existingTaskConnections: TaskConnectionTableData[];
  newTaskConnections: TaskConnectionTableData[];
  milestoneTasks: Task[];
  currentTask?: Task;
  availableTaskConnectionTasks: Task[];
  setNewTaskConnections: (connections: TaskConnectionTableData[]) => void;
  handleEditConnection: (connectionId: string, field: keyof TaskConnectionTableData, value: TaskConnectionType) => void;
  addNewTaskConnectionRow: () => void;
  removeNewTaskConnectionRow: (index: number) => void;
  removeExistingTaskConnecitonRow: (connectionId: string) => void;
  setTaskConnectionsValid: (valid: boolean) => void;
}

/**
 * Task connections table component
 *
 * @param props component properties
 */
const TaskConnectionsTable = ({
  existingTaskConnections,
  newTaskConnections,
  milestoneTasks,
  currentTask,
  availableTaskConnectionTasks,
  setNewTaskConnections,
  handleEditConnection,
  removeNewTaskConnectionRow,
  addNewTaskConnectionRow,
  removeExistingTaskConnecitonRow,
  setTaskConnectionsValid,
}: Props) => {
  const { t } = useTranslation();

  /**
   * Determine if task type is allowed
   * 
   * @param task1 first task to compare
   * @param task2 second task to compare
   * @param type task connection type
   */
  const determineIfTaskTypeIsAllowed = (task1: TaskConnectionTableData, task2: TaskConnectionTableData, type?: TaskConnectionType) => {
    if (!task1 || !task2) {
      return null;
    }

    const sourceTask = task1.hierarchy === TaskConnectionRelationship.PARENT ? task1 : task2;
    const targetTask = task1.hierarchy === TaskConnectionRelationship.PARENT ? task2 : task1;

    if (!sourceTask.attachedTask || !targetTask.attachedTask) {
      return null;
    }

    switch (type) {
      case TaskConnectionType.StartToStart:
        return sourceTask.attachedTask.startDate > targetTask.attachedTask.startDate
          ? t("newMilestoneTaskDialog.taskConnectionsTable.taskTypeCheck.sourceStartAfterTargetStartWarning")
          : null;
      case TaskConnectionType.FinishToFinish:
        return sourceTask.attachedTask.endDate > targetTask.attachedTask.endDate
          ? t("newMilestoneTaskDialog.taskConnectionsTable.taskTypeCheck.sourceEndAfterTargetEndWarning")
          : null;
      case TaskConnectionType.FinishToStart:
        return sourceTask.attachedTask.endDate > targetTask.attachedTask.startDate
          ? t("newMilestoneTaskDialog.taskConnectionsTable.taskTypeCheck.sourceEndAfterTargetStartWarning")
          : null;
      default:
        return null;
    }
  };

  /**
   * Recalculate overall validity
   */
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const allConnections = [...existingTaskConnections, ...newTaskConnections];
    const validationErrors = allConnections.map(connection =>
      determineIfTaskTypeIsAllowed(
        { ...connection, attachedTask: milestoneTasks.find((task) => task.id === connection.attachedTask?.id) },
        { ...connection, attachedTask: currentTask },
        connection.type
      )
    );
    setTaskConnectionsValid(!validationErrors.some(error => error !== null));
  }, [existingTaskConnections, newTaskConnections, milestoneTasks, currentTask]);

  /**
   * Render existing task connection table rows
   */
  const renderExistingTaskConnectionTableRows = () => {
    return existingTaskConnections.map(connection => (
      <TableRow key={connection.connectionId}>
        <TableCell>
          <TextField value={connection.hierarchy} disabled />
        </TableCell>
        <TableCell>
          <TextField
            fullWidth
            select
            value={connection.type}
            onChange={(e) => handleEditConnection(connection.connectionId, "type", e.target.value as TaskConnectionType)}
          >
            {Object.values(TaskConnectionType).map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          <div style={{ color: 'red', fontSize: '0.75rem' }}>
            {determineIfTaskTypeIsAllowed(
              { ...connection, attachedTask: milestoneTasks.find((task) => task.id === connection.attachedTask?.id) },
              { ...connection, attachedTask: currentTask },
              connection.type
            )}
          </div>
        </TableCell>
        <TableCell>
          <TextField fullWidth value={connection.attachedTask?.name ?? ""} disabled />
        </TableCell>
        <TableCell>
          <TextField fullWidth value={connection.attachedTask?.status ?? ""} disabled />
        </TableCell>
        <TableCell>
          <IconButton onClick={() => removeExistingTaskConnecitonRow(connection.connectionId)}>
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
    return newTaskConnections.map((connection, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: With new task connection rows we only have the index as key
      <TableRow key={index}>
        <TableCell>
          <TextField
            select
            value={connection.hierarchy}
            onChange={(event) => {
              const updatedConnections = [...newTaskConnections];
              updatedConnections[index].hierarchy = event.target.value as TaskConnectionRelationship;
              setNewTaskConnections(updatedConnections);
            }}
          >
            <MenuItem value={TaskConnectionRelationship.PARENT}>
              {TaskConnectionRelationship.PARENT}
            </MenuItem>
            <MenuItem value={TaskConnectionRelationship.CHILD}>
              {TaskConnectionRelationship.CHILD}
            </MenuItem>
          </TextField>
        </TableCell>
        <TableCell>
          <TextField
            fullWidth
            select
            value={connection.type}
            onChange={(event) => {
              const updatedConnections = [...newTaskConnections];
              updatedConnections[index].type = event.target.value as TaskConnectionType;
              setNewTaskConnections(updatedConnections);
            }}
          >
            {Object.values(TaskConnectionType).map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          <div style={{ color: 'red', fontSize: '0.75rem' }}>
            {determineIfTaskTypeIsAllowed(
              { ...connection, attachedTask: milestoneTasks.find((task) => task.id === connection.attachedTask?.id) },
              { ...connection, attachedTask: currentTask },
              connection.type
            )}
          </div>
        </TableCell>
        <TableCell>
          <TextField
            fullWidth
            select
            value={connection.attachedTask?.id ?? ""}
            onChange={(event) => {
              const selectedTask = milestoneTasks.find((task) => task.id === event.target.value);
              const updatedConnections = [...newTaskConnections];
              updatedConnections[index].attachedTask = selectedTask;
              setNewTaskConnections(updatedConnections);
            }}
          >
            {availableTaskConnectionTasks.filter((taskElement) => taskElement.id !== currentTask?.id).map((taskElement) => (
              <MenuItem key={taskElement.id} value={taskElement.id}>
                {taskElement.name}
              </MenuItem>
            ))}
          </TextField>
        </TableCell>
        <TableCell>
          <TextField fullWidth value={connection.attachedTask?.status ?? ""} disabled />
        </TableCell>
        <TableCell>
          <IconButton onClick={() => removeNewTaskConnectionRow(index)}>
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
      <DialogContentText sx={{ padding: 2 }} variant="h5">
        {t("newMilestoneTaskDialog.taskConnectionsTable.title")}
      </DialogContentText>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ width: "15%" }}>hierarchy</TableCell>
              <TableCell style={{ width: "15%" }}>{t("newMilestoneTaskDialog.taskConnectionsTable.type")}</TableCell>
              <TableCell style={{ width: "40%" }}>{t("newMilestoneTaskDialog.taskConnectionsTable.task")}</TableCell>
              <TableCell style={{ width: "25%" }}>{t("newMilestoneTaskDialog.taskConnectionsTable.status")}</TableCell>
              <TableCell style={{ width: "5%" }}>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {renderExistingTaskConnectionTableRows()}
            {renderNewTaskConnectionTableRows()}
          </TableBody>
        </Table>
        <Button onClick={addNewTaskConnectionRow} startIcon={<AddIcon />}>
          {t("newMilestoneTaskDialog.taskConnectionsTable.addButton")}
        </Button>
      </TableContainer>
    </>
  );
};

export default TaskConnectionsTable;
