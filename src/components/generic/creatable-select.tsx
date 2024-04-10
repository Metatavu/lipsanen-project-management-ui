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
  selectedCompany: CompanyOptionType | null;
  setSelectedCompany: (company: CompanyOptionType | null) => void;
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
    if (typeof newValue === "string") {
      setSelectedCompany({
        name: newValue,
      });
    } else if (newValue?.inputValue) {
      setSelectedCompany({
        name: newValue.inputValue,
      });
    } else {
      setSelectedCompany(newValue);
    }
  };

  return (
    <Autocomplete
      value={selectedCompany}
      onChange={handleChange}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);
        const { inputValue } = params;
        const isExisting = options.some((option) => inputValue === option.name);
        if (inputValue !== "" && !isExisting) {
          filtered.push({
            inputValue,
            name: `${t("newUserDialog.createNewCompany")} "${inputValue}"`,
          });
        }

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={options}
      getOptionLabel={(option) => {
        if (typeof option === "string") {
          return option;
        }
        if (option.inputValue) {
          return option.inputValue;
        }
        return option.name;
      }}
      renderOption={(props, option) => <li {...props}>{option.name}</li>}
      freeSolo
      fullWidth
      renderInput={(params) => <TextField {...params} label={t("newUserDialog.selectUsersCompany")} />}
    />
  );
};

export default CreatableSelect;
