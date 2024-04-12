import React, { SyntheticEvent } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete, { AutocompleteRenderOptionState } from "@mui/material/Autocomplete";
import { useTranslation } from "react-i18next";

/**
 * Component Props
 */
interface Props<T> {
  options: T[];
  selectedOption: T | null;
  setSelectedOption: (option: any) => void;
  getOptionLabel: (option: T) => string;
  renderOption?: (props: React.HTMLAttributes<HTMLLIElement>, option: T, state: AutocompleteRenderOptionState) => React.ReactNode;
}

/**
 * Generic Select component
 *
 * @param props component properties
 */
const GenericSelect = <T,>({ options, selectedOption, setSelectedOption, getOptionLabel, renderOption }: Props<T>) => {
  const { t } = useTranslation();

  /**
   * Change event handler
   *
   * @param _event event
   * @param newValue user selection
   */
  const handleChange = (_event: SyntheticEvent<Element, Event>, newValue: T | null) => {
    setSelectedOption(newValue);
  };

  /**
   * Main component render
   */
  return (
    <Autocomplete
      value={selectedOption}
      onChange={handleChange}
      options={options}
      getOptionLabel={getOptionLabel}
      renderOption={renderOption || ((props, option) => <li {...props}>{getOptionLabel(option)}</li>)}
      fullWidth
      renderInput={(params) => <TextField {...params} label={t("newUserDialog.assignUserToProject")} />}
    />
  );
};

export default GenericSelect;