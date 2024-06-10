import { CalendarTodayOutlined } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Typography } from "@mui/material";
import { DateTime } from "luxon";

/**
 * Component Props
 */
interface Props {
  onChange: (value: DateTime<true> | DateTime<false> | null) => void;
  value: DateTime<true> | DateTime<false> | null | undefined;
  title?: string;
  minDate?: DateTime<true> | DateTime<false>;
  maxDate?: DateTime<true> | DateTime<false>;
  fullWidth?: boolean;
  label?: string;
  hasBorder?: boolean;
  disabled?: boolean;
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
}: Props) => (
  <>
    <Typography variant="subtitle1">{title}</Typography>
    <DatePicker
      value={value}
      onChange={onChange}
      format="dd.MM.yyyy"
      minDate={minDate}
      maxDate={maxDate}
      slots={{
        openPickerIcon: CalendarTodayOutlined,
      }}
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
