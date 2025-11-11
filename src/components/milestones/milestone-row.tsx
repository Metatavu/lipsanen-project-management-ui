import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import { Avatar, Box, IconButton, Stack, TableCell, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import { Link } from "@tanstack/react-router";
import ProgressBadge from "components/generic/progress-badge";
import { GANTT_MEASUREMENTS } from "consts";
import type { Milestone } from "generated/client";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { differenceInDays, getValidDateTimeOrThrow } from "utils/date-time-utils";

const { objectiveCellWidth, durationCellWidth, startCellWidth, readyCellWidth, readinessCellWidth, taskListWidth } =
  GANTT_MEASUREMENTS;

/**
 * Component props
 */
interface Props {
  milestone: Milestone;
  projectId: string;
  showConfirmDialog: (params: {
    title: string;
    description: string;
    cancelButtonEnabled: boolean;
    confirmButtonText: string;
    onConfirmClick: () => void;
  }) => void;
  handleDeleteMilestone: (milestoneId: string) => void;
  handleEditMilestone: (milestone: Milestone, field: "name" | "startDate" | "endDate", value: string) => void;
}

export const MilestoneRow = ({
  milestone,
  projectId,
  showConfirmDialog,
  handleDeleteMilestone,
  handleEditMilestone,
}: Props) => {
  const { t } = useTranslation();
  const startDate = getValidDateTimeOrThrow(milestone.startDate);
  const endDate = getValidDateTimeOrThrow(milestone.endDate);
  const difference = differenceInDays(startDate, endDate);
  const inputStartDate = getValidDateTimeOrThrow(milestone.startDate).toFormat("dd.MM.yyyy");
  const inputEndDate = getValidDateTimeOrThrow(milestone.endDate).toFormat("dd.MM.yyyy");

  const [startEditing, setStartEditing] = useState(false);
  const [endEditing, setEndEditing] = useState(false);
  const [localStart, setLocalStart] = useState(inputStartDate);
  const [localEnd, setLocalEnd] = useState(inputEndDate);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editableName, setEditableName] = useState(milestone.name);
  const nameInputRef = useRef<HTMLInputElement>(null);

  /**
   * Commit start date
   */
  const commitStartDate = () => {
    setStartEditing(false);
    if (localStart !== inputStartDate) {
      handleEditMilestone(milestone, "startDate", localStart);
    }
  };

  /**
   * Commit end date
   */
  const commitEndDate = () => {
    setEndEditing(false);
    if (localEnd !== inputEndDate) {
      handleEditMilestone(milestone, "endDate", localEnd);
    }
  };

  /**
   * Commit milestone name
   */
  const commitMilestoneName = () => {
    if (editableName !== milestone.name) {
      handleEditMilestone(milestone, "name", editableName);
    }
  };

  /**
   * Handle milestone name change
   */
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditableName(event.target.value);
  };

  /**
   * Handle milestone name text field blur event
   */
  const handleNameBlur = () => {
    setIsEditingName(false);
    commitMilestoneName();
  };

  /**
   * Handle milestone name text field key press event
   */
  const handleNameKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setIsEditingName(false);
      commitMilestoneName();
    }
  };

  /**
   * Use effect for focusing on the name input field
   */
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  /**
   * Main component render
   */
  return (
    <TableRow style={{ width: taskListWidth }}>
      <TableCell
        style={{
          width: objectiveCellWidth,
          minWidth: objectiveCellWidth,
          maxWidth: objectiveCellWidth,
          borderLeft: "none",
          overflow: "hidden",
        }}
      >
        <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link
            to={`/projects/${projectId}/schedule/${milestone.id}/tasks`}
            style={{ textDecoration: "none", color: "#000", flex: 1 }}
            disabled={isEditingName}
          >
            <Stack direction="row" alignItems="center" gap={1}>
              <Avatar sx={{ backgroundColor: "#0079BF", width: 30, height: 30 }}>
                <FlagOutlinedIcon fontSize="medium" sx={{ color: "#fff" }} />
              </Avatar>
              <Box sx={{ overflow: "hidden" }}>
                {isEditingName ? (
                  <TextField
                    inputRef={nameInputRef}
                    value={editableName}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    onKeyUp={handleNameKeyPress}
                    inputProps={{ style: { padding: 0 } }}
                    type="text"
                    fullWidth
                  />
                ) : (
                  <Tooltip placement="top" title={milestone.name}>
                    <Typography sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {milestone.name}
                    </Typography>
                  </Tooltip>
                )}
                <Typography variant="body2">{t("scheduleScreen.objective")}</Typography>
              </Box>
            </Stack>
          </Link>
          <Stack direction="row" gap={1}>
            <IconButton size="small" onClick={() => setIsEditingName(true)}>
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() =>
                showConfirmDialog({
                  title: t("deleteMilestoneConfirmationDialog.title"),
                  description: t("deleteMilestoneConfirmationDialog.description", {
                    milestoneName: milestone.name,
                  }),
                  cancelButtonEnabled: true,
                  confirmButtonText: t("generic.delete"),
                  onConfirmClick: () => handleDeleteMilestone(milestone.id ?? ""),
                })
              }
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        </Box>
      </TableCell>

      <TableCell style={{ width: durationCellWidth }}>
        <Typography>{`${difference} ${t("scheduleScreen.days")}`}</Typography>
      </TableCell>

      <TableCell style={{ width: startCellWidth }}>
        {startEditing ? (
          <TextField
            type="text"
            value={localStart}
            onChange={(e) => setLocalStart(e.target.value)}
            onBlur={() => commitStartDate()}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitStartDate();
              if (e.key === "Escape") {
                setLocalStart(inputStartDate);
                setStartEditing(false);
              }
            }}
            inputProps={{ style: { padding: 0 } }}
            autoFocus
          />
        ) : (
          <Typography sx={{ cursor: "pointer" }} onClick={() => setStartEditing(true)}>
            {inputStartDate}
          </Typography>
        )}
      </TableCell>

      <TableCell style={{ width: readyCellWidth }}>
        {endEditing ? (
          <TextField
            type="text"
            value={localEnd}
            onChange={(e) => setLocalEnd(e.target.value)}
            onBlur={() => commitEndDate()}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEndDate();
              if (e.key === "Escape") {
                setLocalEnd(inputEndDate);
                setEndEditing(false);
              }
            }}
            inputProps={{ style: { padding: 0 } }}
            autoFocus
          />
        ) : (
          <Typography sx={{ cursor: "pointer" }} onClick={() => setEndEditing(true)}>
            {inputEndDate}
          </Typography>
        )}
      </TableCell>

      <TableCell style={{ width: readinessCellWidth }}>
        <ProgressBadge width="100%" progress={milestone.estimatedReadiness ?? 0} />
      </TableCell>
    </TableRow>
  );
};
