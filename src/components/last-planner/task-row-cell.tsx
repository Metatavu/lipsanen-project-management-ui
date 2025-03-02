import { Icon } from "@iconify/react";
import { Box, Tooltip, Typography, darken } from "@mui/material";
import { JobPosition, Task, TaskStatus } from "generated/client";
import { useFindUserQuery, useListJobPositionsQuery } from "hooks/api-queries";
import { Interval } from "luxon";
import { CSSProperties, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getContrastForegroundColor, hexFromString } from "utils";

const HORIZONTAL_PADDING = 16;
const COLUMN_MIN_WIDTH = 40;

/**
 * This is used as a fallback job position when the dependent user is not found
 */
const DEFAULT_JOB_POSITION: JobPosition = {
  name: "default",
  iconName: "account",
};

/**
 * Component properties
 */
type Props = {
  task?: Task;
  colSpan?: number;
  editMode?: boolean;
  onTaskClick?: (task: Task) => void;
  onSwitchTaskStatus?: (task: Task) => void;
  cellStyle?: CSSProperties;
};

/**
 * Task row cell component
 *
 * @param props component properties
 */
export const TaskRowCell = ({
  task,
  colSpan = 1,
  editMode = false,
  onTaskClick,
  onSwitchTaskStatus,
  cellStyle = {},
}: Props) => {
  const { t } = useTranslation();
  const { dependentUserId } = task ?? {};
  const jobPositionsQuery = useListJobPositionsQuery();
  const jobPositions = useMemo(() => jobPositionsQuery.data?.jobPositions ?? [], [jobPositionsQuery.data]);
  const findDependentUserQuery = useFindUserQuery({ userId: dependentUserId });
  const dependentUser = findDependentUserQuery.data;

  const jobPosition =
    jobPositions.find((jobPosition) => jobPosition.id === dependentUser?.jobPositionId) ?? DEFAULT_JOB_POSITION;
  const taskBackgroundColor = dependentUserId ? hexFromString(dependentUserId) : "#666666";
  const taskForegroundColor = taskBackgroundColor ? getContrastForegroundColor(taskBackgroundColor) : undefined;

  /**
   * Returns the tooltip for the task
   *
   * @param task task
   */
  const getTaskToolTip = (task: Task) => {
    const userFullName = dependentUser
      ? `${dependentUser.firstName} ${dependentUser.lastName}`
      : t("lastPlannerView.noDependentUser");
    return getTaskLengthInDays(task) === 1 ? `${userFullName} - ${task.name}` : userFullName;
  };

  /**
   * Returns the length of a task in days
   *
   * @param task task
   * @returns task length in days
   */
  const getTaskLengthInDays = (task: Task) => Interval.fromDateTimes(task.startDate, task.endDate).count("days");

  /**
   * Render status line
   *
   * @param rotation rotation in degrees
   * @param color color string
   * @returns rendered status line element
   */
  const renderStatusLine = (rotation: number, color: string | undefined = "#fff") => {
    return (
      <div
        style={{
          height: 2,
          borderRadius: 4,
          width: 32,
          backgroundColor: color,
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          position: "absolute",
        }}
      />
    );
  };

  /**
   * Render task status indicator
   *
   * @param status task status
   * @returns task status indicator element with either one or two status lines
   */
  const renderTaskStatusIndicator = (status: TaskStatus) =>
    ({
      [TaskStatus.NotStarted]: null,
      [TaskStatus.InProgress]: renderStatusLine(45, taskForegroundColor),
      [TaskStatus.Done]: (
        <>
          {renderStatusLine(45, taskForegroundColor)}
          {renderStatusLine(-45, taskForegroundColor)}
        </>
      ),
    })[status];

  /**
   * Component render
   */
  return (
    <td
      align="center"
      colSpan={colSpan}
      style={{ minWidth: 40, verticalAlign: "middle", backgroundColor: "rgba(0, 150, 255, 0.02)", ...cellStyle }}
    >
      {task ? (
        <Box
          height={40}
          borderRadius={999}
          display="flex"
          alignItems="center"
          gap={1}
          px={2}
          bgcolor={taskBackgroundColor}
          color={taskForegroundColor}
          onClick={() => !editMode && onTaskClick?.(task)}
          sx={
            onTaskClick && !editMode
              ? {
                  transition: "background-color 0.1s",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: taskBackgroundColor ? darken(taskBackgroundColor, 0.1) : "rgba(0, 0, 0, 0.1)",
                  },
                }
              : undefined
          }
        >
          <Tooltip
            title={getTaskToolTip(task)}
            placement="top"
            slotProps={{ popper: { modifiers: [{ name: "offset", options: { offset: [0, -8] } }] } }}
          >
            <Box
              position="relative"
              height={40}
              width={16}
              onClick={() => editMode && onSwitchTaskStatus?.(task)}
              sx={onSwitchTaskStatus && editMode ? { cursor: "pointer" } : undefined}
            >
              <Icon icon={`mdi:${jobPosition.iconName}`} height="100%" width="100%" />
              {renderTaskStatusIndicator(task.status)}
            </Box>
          </Tooltip>
          {getTaskLengthInDays(task) > 1 ? (
            <Tooltip title={task.name} placement="top">
              <Typography noWrap textOverflow="ellipsis" maxWidth={COLUMN_MIN_WIDTH * colSpan - HORIZONTAL_PADDING}>
                {task.name}
              </Typography>
            </Tooltip>
          ) : null}
        </Box>
      ) : null}
    </td>
  );
};
