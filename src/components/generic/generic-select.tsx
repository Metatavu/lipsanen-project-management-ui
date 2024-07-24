import { SyntheticEvent, HTMLAttributes, ReactNode } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete, { AutocompleteRenderOptionState } from "@mui/material/Autocomplete";
/**
 * Component Props
 */
interface Props<T> {
  options: T[];
  selectedOption: T | null;
  label: string;
  setSelectedOption: (option: any) => void;
  getOptionLabel: (option: T) => string;
  renderOption?: (props: HTMLAttributes<HTMLLIElement>, option: T, state: AutocompleteRenderOptionState) => ReactNode;
}

/**
 * Generic Select component
 *
 * @param props component properties
 */
const GenericSelect = <T,>({ options, selectedOption, label, setSelectedOption, getOptionLabel, renderOption }: Props<T>) => {

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
      renderInput={(params) => <TextField {...params} label={label}/>}
    />
  );
};

export default GenericSelect;