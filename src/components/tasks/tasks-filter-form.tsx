import { MenuItem, TextField } from "@mui/material";
import { NO_SELECTION } from "consts";
import { useListProjectMilestonesQuery } from "hooks/api-queries";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TasksSearchSchema } from "schemas/search";
import { FormFieldChangeHandler } from "types";

/**
 * Component properties
 *
 * @property projectId project ID
 * @property formValues form values
 * @property onChange form value change handler
 */
type Props = {
  projectId: string;
  formValues: TasksSearchSchema;
  onChange: FormFieldChangeHandler<TasksSearchSchema>;
};

/**
 * Tasks filters form component
 *
 * @param props component properties
 */
const TasksFilterForm = ({ projectId, formValues, onChange }: Props) => {
  const { t } = useTranslation();
  const listMilestonesQuery = useListProjectMilestonesQuery({ projectId });
  const milestones = useMemo(() => listMilestonesQuery.data ?? [], [listMilestonesQuery.data]);

  return (
    <TextField
      select
      size="small"
      label={t("taskFilters.milestone")}
      value={formValues.milestoneId || NO_SELECTION}
      onChange={onChange("milestoneId")}
    >
      <MenuItem key={NO_SELECTION} value={NO_SELECTION}>
        {t("generic.noSelection")}
      </MenuItem>
      {milestones.map((milestone) => (
        <MenuItem key={milestone.id} value={milestone.id}>
          {milestone.name}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default TasksFilterForm;
