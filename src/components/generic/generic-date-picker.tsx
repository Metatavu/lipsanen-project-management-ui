import { CalendarTodayOutlined } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTime } from "luxon";
import { Ref } from "react";

/**
 * Component Props
 */
interface Props {
  onChange: (value: DateTime<true> | null) => void;
  value: DateTime<true> | null;
  title?: string;
  minDate?: DateTime<true> | null;
  maxDate?: DateTime<true> | null;
  fullWidth?: boolean;
  label?: string;
  hasBorder?: boolean;
  disabled?: boolean;
  inputRef?: Ref<HTMLInputElement> | undefined;
}

/**
 * Renders generic date picker
 *
 * @param props component properties
 */
const GenericDatePicker = ({
  onChange,
  value,
  title,
  minDate,
  fullWidth,
  label,
  hasBorder,
  maxDate,
  disabled,
  inputRef,
}: Props) => (
  <>
    <Typography variant="subtitle1">{title}</Typography>
    <DatePicker
      value={value}
      onChange={onChange}
      format="dd.MM.yyyy"
      minDate={minDate ?? undefined}
      maxDate={maxDate ?? undefined}
      slots={{ openPickerIcon: CalendarTodayOutlined }}
      inputRef={inputRef}
      slotProps={{
        textField: {
          placeholder: "",
          fullWidth,
          label: label,
          InputProps: {
            disableUnderline: true,
          },
        },
        inputAdornment: { position: "start" },
        openPickerIcon: { color: "primary" },
      }}
      sx={{ border: hasBorder ? "1px solid #e6e4e4" : "" }}
      disabled={disabled}
    />
  </>
);

export default GenericDatePicker;
