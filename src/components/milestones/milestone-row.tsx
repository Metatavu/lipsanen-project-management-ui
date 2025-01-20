import { useState } from "react";
import { Box, TableRow, TableCell, TextField, Typography, IconButton, Tooltip, Avatar } from "@mui/material";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import { Link } from "@tanstack/react-router";
import { differenceInDays, getValidDateTimeOrThrow } from "utils/date-time-utils";
import ProgressBadge from "components/generic/progress-badge";
import { useTranslation } from "react-i18next";
import { Milestone } from "generated/client";

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
  handleDateChange: (milestone: Milestone, field: "startDate" | "endDate", value: string) => void;
}

export const MilestoneRow = ({
  milestone,
  projectId,
  showConfirmDialog,
  handleDeleteMilestone,
  handleDateChange,
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

  /**
   * Commit start date
   */
  const commitStartDate = () => {
    setStartEditing(false);
    if (localStart !== inputStartDate) {
      handleDateChange(milestone, "startDate", localStart);
    }
  };

  /**
   * Commit end date
   */
  const commitEndDate = () => {
    setEndEditing(false);
    if (localEnd !== inputEndDate) {
      handleDateChange(milestone, "endDate", localEnd);
    }
  };

  /**
   * Main component render
   */
  return (
    <TableRow>
      <TableCell style={{ overflow: "hidden" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link
            to={`/projects/${projectId}/schedule/${milestone.id}/tasks`}
            style={{ textDecoration: "none", color: "#000" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <Avatar sx={{ backgroundColor: "#0079BF", width: 30, height: 30 }}>
                <FlagOutlinedIcon fontSize="medium" sx={{ color: "#fff" }} />
              </Avatar>
              <Box sx={{ margin: "0 1rem", maxWidth: 300 }}>
                <Tooltip placement="top" title={milestone.name}>
                  <Typography sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {milestone.name}
                  </Typography>
                </Tooltip>
                <Typography variant="body2">{t("scheduleScreen.objective")}</Typography>
              </Box>
            </div>
          </Link>
          <IconButton
            size="small"
            style={{ padding: 0 }}
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
        </Box>
      </TableCell>

      <TableCell>{`${difference} ${t("scheduleScreen.days")}`}</TableCell>

      <TableCell>
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

      <TableCell>
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

      <TableCell>
        <ProgressBadge progress={milestone.estimatedReadiness ?? 0} />
      </TableCell>
    </TableRow>
  );
};