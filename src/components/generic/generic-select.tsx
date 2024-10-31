import Autocomplete, { AutocompleteRenderOptionState } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { HTMLAttributes, ReactNode, SyntheticEvent } from "react";
/**
 * Component Props
 */
interface Props<T> {
  options: T[];
  selectedOption: T | undefined;
  label: string;
  disabled?: boolean;
  setSelectedOption: (option: T | undefined) => void;
  getOptionLabel: (option: T) => string;
  renderOption?: (props: HTMLAttributes<HTMLLIElement>, option: T, state: AutocompleteRenderOptionState) => ReactNode;
}

/**
 * Generic Select component
 *
 * @param props component properties
 */
const GenericSelect = <T,>({
  options,
  selectedOption,
  label,
  disabled = false,
  setSelectedOption,
  getOptionLabel,
  renderOption,
}: Props<T>) => {
  /**
   * Change event handler
   *
   * @param _event event
   * @param newValue user selection
   */
  const handleChange = (_event: SyntheticEvent<Element, Event>, newValue: T | null) => {
    setSelectedOption(newValue ?? undefined);
  };

  /**
   * Main component render
   */
  return (
    <Autocomplete
      value={selectedOption ?? null}
      onChange={handleChange}
      options={options}
      disabled={disabled}
      getOptionLabel={getOptionLabel}
      renderOption={renderOption || ((props, option) => <li {...props}>{getOptionLabel(option)}</li>)}
      fullWidth
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  );
};

export default GenericSelect;
