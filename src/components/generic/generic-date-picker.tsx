import { CalendarTodayOutlined } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Typography } from "@mui/material";
import { DateTime } from "luxon";

/**
 * Component Props
 */
interface Props {
  onChange: (value: DateTime | null) => void;
  value: DateTime<boolean> | null | undefined;
  title?: string;
  minDate?: DateTime<boolean>;
  fullWidth?: boolean;
  label?: string;
}

/**
 * Renders generic date picker
 *
 * @param props component properties
 */
const GenericDatePicker = ({ onChange, value, title, minDate, fullWidth, label }: Props) => (
  <>
    <Typography variant="subtitle1">{title}</Typography>
    <DatePicker
      value={value}
      onChange={onChange}
      format="dd.MM.yyyy"
      minDate={minDate}
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
    />
  </>
);

export default GenericDatePicker;
