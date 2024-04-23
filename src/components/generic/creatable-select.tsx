import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { SyntheticEvent } from "react";
import { useTranslation } from "react-i18next";
import { CompanyOptionType } from "types";

/**
 * Component Props
 */
interface Props {
  options: CompanyOptionType[];
  selectedCompany?: CompanyOptionType;
  setSelectedCompany: (company?: CompanyOptionType) => void | Promise<void>;
}

/**
 * Select with autocomplete and create option component
 *
 * @param props
 */
const CreatableSelect = ({ options, selectedCompany, setSelectedCompany }: Props) => {
  const { t } = useTranslation();
  const filter = createFilterOptions<CompanyOptionType>();

  /**
   * Change event handler
   *
   * @param _event event
   * @param newValue user selection
   */
  const handleChange = (_event: SyntheticEvent<Element, Event>, newValue: string | CompanyOptionType | null) => {
    if (typeof newValue === "string") setSelectedCompany({ name: newValue });
    else if (newValue?.inputValue) setSelectedCompany({ name: newValue.inputValue });
    else setSelectedCompany(newValue ?? undefined);
  };

  return (
    <Autocomplete
      freeSolo
      fullWidth
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={options}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);
        const { inputValue } = params;
        const isExisting = options.some((option) => inputValue === option.name);
        if (inputValue !== "" && !isExisting) {
          filtered.push({ inputValue: inputValue, name: `${t("newUserDialog.createNewCompany")} "${inputValue}"` });
        }

        return filtered;
      }}
      getOptionLabel={(option) => {
        if (typeof option === "string") return option;
        if (option.inputValue) return option.inputValue;
        return option.name;
      }}
      renderOption={(props, option) => <li {...props}>{option.name}</li>}
      renderInput={(params) => <TextField {...params} label={t("newUserDialog.selectUsersCompany")} />}
      value={selectedCompany}
      onChange={handleChange}
    />
  );
};

export default CreatableSelect;
