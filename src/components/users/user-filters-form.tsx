import { MenuItem, TextField } from "@mui/material";
import { NO_SELECTION } from "consts";
import { useListCompaniesQuery, useListJobPositionsQuery, useListProjectsQuery } from "hooks/api-queries";
import { useTranslation } from "react-i18next";
import { UsersSearchSchema } from "schemas/search";
import { FormFieldChangeHandler } from "types";

/**
 * Component properties
 *
 * @property formValues form values
 * @property onChange form value change handler
 */
type Props = {
  formValues: UsersSearchSchema;
  onChange: FormFieldChangeHandler<UsersSearchSchema>;
};

/**
 * Users filters form component
 *
 * @param props component properties
 */
const UsersFiltersForm = ({ formValues, onChange }: Props) => {
  const { t } = useTranslation();
  const listProjectsQuery = useListProjectsQuery();
  const listCompaniesQuery = useListCompaniesQuery();
  const listJobPositionsQuery = useListJobPositionsQuery();

  const companies = listCompaniesQuery.data?.companies;
  const jobPositions = listJobPositionsQuery.data?.jobPositions;
  const projects = listProjectsQuery.data?.projects;

  return (
    <>
      <TextField
        fullWidth
        select
        label={t("userFilters.project")}
        value={formValues.projectId || NO_SELECTION}
        onChange={onChange("projectId")}
      >
        <MenuItem key={NO_SELECTION} value={NO_SELECTION}>
          {t("generic.noSelection")}
        </MenuItem>
        {projects?.map((project) => (
          <MenuItem key={project.id} value={project.id}>
            {project.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        fullWidth
        select
        label={t("userFilters.company")}
        value={formValues.companyId || NO_SELECTION}
        onChange={onChange("companyId")}
      >
        <MenuItem key={NO_SELECTION} value={NO_SELECTION}>
          {t("generic.noSelection")}
        </MenuItem>
        {companies?.map((company) => (
          <MenuItem key={company.id} value={company.id}>
            {company.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        // TODO: Disabled until backend position filter implemented
        disabled
        fullWidth
        select
        label={t("userFilters.position")}
        value={formValues.jobPositionId || NO_SELECTION}
        onChange={onChange("jobPositionId")}
      >
        <MenuItem key={NO_SELECTION} value={NO_SELECTION}>
          {t("generic.noSelection")}
        </MenuItem>
        {jobPositions?.map((jobPosition) => (
          <MenuItem key={jobPosition.id} value={jobPosition.id}>
            {jobPosition.name}
          </MenuItem>
        ))}
      </TextField>
    </>
  );
};

export default UsersFiltersForm;
