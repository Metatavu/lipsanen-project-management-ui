import { useDraggable } from "@dnd-kit/core";
import { Icon } from "@iconify/react";
import { Box, darken, Tooltip, Typography } from "@mui/material";
import { NON_WORKING_DAY_COLOR, TODAY_HIGHLIGHT_COLOR } from "consts";
import { type JobPosition, type Task, TaskStatus } from "generated/client";
import { useFindUserQuery, useListJobPositionsQuery } from "hooks/api-queries";
import { Interval } from "luxon";
import { type CSSProperties, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getContrastForegroundColor, hexFromString } from "utils";

const HORIZONTAL_PADDING = 16;
const COLUMN_MIN_WIDTH = 40;
const CELL_WIDTH = 40;
const ROW_HEIGHT = 50;

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
  isNonWorkingDay?: boolean;
  isToday?: boolean;
  draggable?: boolean;
  dragData?: {
    taskId: string;
    assigneeId: string;
    startDayIndex: number;
    durationDays: number;
    assigneeIds: string[];
  };
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
  isNonWorkingDay,
  isToday,
  draggable,
  dragData,
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

  const isDraggable = !!(draggable && task && dragData);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task ? `task-${task.id}` : "task-empty",
    data: dragData,
    disabled: !isDraggable,
  });

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

  let backgroundColor: string | undefined;
  if (isToday) {
    backgroundColor = TODAY_HIGHLIGHT_COLOR;
  } else if (isNonWorkingDay) {
    backgroundColor = NON_WORKING_DAY_COLOR;
  } else {
    backgroundColor = "rgba(0, 150, 255, 0.02)";
  }

  const disableVerticalSnap = (task?.assigneeIds?.length ?? 0) > 1;
  const snappedTransform =
    isDraggable && transform
      ? {
          x: Math.round(transform.x / CELL_WIDTH) * CELL_WIDTH,
          y: disableVerticalSnap ? 0 : Math.round(transform.y / ROW_HEIGHT) * ROW_HEIGHT,
        }
      : null;

  /**
   * Component render
   */
  return (
    <td
      align="center"
      colSpan={colSpan}
      style={{
        backgroundColor,
        minWidth: CELL_WIDTH * colSpan,
        maxWidth: CELL_WIDTH * colSpan,
        width: CELL_WIDTH,
        verticalAlign: "middle",
        ...cellStyle,
      }}
    >
      {task ? (
        <Box
          ref={isDraggable ? setNodeRef : undefined}
          {...(isDraggable ? { ...listeners, ...attributes } : {})}
          height={40}
          borderRadius={999}
          display="flex"
          alignItems="center"
          gap={1}
          px={2}
          bgcolor={taskBackgroundColor}
          color={taskForegroundColor}
          onClick={() => !editMode && onTaskClick?.(task)}
          sx={{
            ...(onTaskClick && !editMode
              ? {
                  transition: "background-color 0.1s",
                  cursor: isDraggable ? "grab" : "pointer",
                  "&:hover": {
                    backgroundColor: taskBackgroundColor ? darken(taskBackgroundColor, 0.1) : "rgba(0, 0, 0, 0.1)",
                  },
                  "&:active": isDraggable ? { cursor: "grabbing" } : undefined,
                }
              : isDraggable
                ? {
                    cursor: "grab",
                    "&:active": { cursor: "grabbing" },
                  }
                : undefined),
          }}
          style={
            isDraggable && snappedTransform
              ? {
                  transform: `translate3d(${snappedTransform.x}px, ${snappedTransform.y}px, 0)`,
                  opacity: isDragging ? 0.8 : 1,
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
              display="flex"
              alignItems="center"
              onPointerDown={(e) => {
                if (editMode) e.stopPropagation();
              }}
              onClick={() => editMode && onSwitchTaskStatus?.(task)}
              sx={onSwitchTaskStatus && editMode ? { cursor: "pointer" } : undefined}
            >
              <Icon icon={`mdi:${jobPosition.iconName}`} height={16} width={16} />
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
