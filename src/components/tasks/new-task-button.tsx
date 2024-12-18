import AddIcon from "@mui/icons-material/Add";
import { Button } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import TaskDialog from "./task-dialog";

/**
 * Component props
 */
interface Props {
  projectId: string;
  milestoneId: string;
}

/**
 * New task button component controlling the new task dialog
 *
 * @param props component props
 */
const NewTaskButton = ({ projectId, milestoneId }: Props) => {
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

export default NewTaskButton;
