import { MenuItem, TextField } from "@mui/material";
import { NO_SELECTION } from "consts";
import { ProjectStatus } from "generated/client";
import { useTranslation } from "react-i18next";
import { ProjectsSearchSchema } from "schemas/search";
import { FormFieldChangeHandler } from "types";

/**
 * Component properties
 *
 * @property formValues form values
 * @property onChange form value change handler
 */
type Props = {
  formValues: ProjectsSearchSchema;
  onChange: FormFieldChangeHandler<ProjectsSearchSchema>;
};

/**
 * Projects filters form component
 *
 * @param props component properties
 */
const ProjectsFilterForm = ({ formValues, onChange }: Props) => {
  const { t } = useTranslation();

  return (
    <TextField
      fullWidth
      select
      label={t("projectFilters.status")}
      value={formValues.status ?? NO_SELECTION}
      onChange={onChange("status")}
    >
      <MenuItem key={NO_SELECTION} value={NO_SELECTION}>
        {t("generic.noSelection")}
      </MenuItem>
      {Object.values(ProjectStatus).map((status) => (
        <MenuItem key={status} value={status}>
          {t(`projectStatuses.${status}`)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default ProjectsFilterForm;
