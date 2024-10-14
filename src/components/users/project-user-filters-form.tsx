import { MenuItem, TextField } from "@mui/material";
import { NO_SELECTION } from "consts";
import { useListCompaniesQuery, useListJobPositionsQuery } from "hooks/api-queries";
import { useTranslation } from "react-i18next";
import { ProjectUsersSearchSchema } from "schemas/search";
import { FormFieldChangeHandler } from "types";

/**
 * Component properties
 *
 * @property formValues form values
 * @property onChange form value change handler
 */
type Props = {
  formValues: ProjectUsersSearchSchema;
  onChange: FormFieldChangeHandler<ProjectUsersSearchSchema>;
};

/**
 * Project users filters form component
 *
 * @param props component properties
 */
const ProjectUsersFiltersForm = ({ formValues, onChange }: Props) => {
  const { t } = useTranslation();
  const listCompaniesQuery = useListCompaniesQuery();
  const listJobPositionsQuery = useListJobPositionsQuery();

  const companies = listCompaniesQuery.data?.companies;
  const jobPositions = listJobPositionsQuery.data?.jobPositions;

  return (
    <>
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

export default ProjectUsersFiltersForm;
