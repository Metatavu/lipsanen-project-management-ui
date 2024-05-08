import React, { useState } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";
import TaskDialog from "./task-dialog";

interface TaskButtonProps {
  projectId: string;
  milestoneId: string;
}

const TaskButton: React.FC<TaskButtonProps> = ({ projectId, milestoneId }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="contained" color="primary" size="large">
        <AddIcon />
        {t("scheduleScreen.addANewTask")}
      </Button>
      <TaskDialog projectId={projectId} milestoneId={milestoneId} open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default TaskButton;