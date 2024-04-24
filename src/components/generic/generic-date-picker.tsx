import { CalendarTodayOutlined } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Typography } from "@mui/material";
import { DateTime } from "luxon";

/**
 * Component Props
 */
interface Props {
  label: string;
  onChange: (value: DateTime | null) => void;
  value: DateTime<boolean> | null | undefined;
  minDate?: DateTime<boolean>;
}

/**
 * Renders generic date picker
 *
 * @param props component properties
 */
const GenericDatePicker = ({ label, onChange, value, minDate }: Props) => (
  <>
    <Typography variant="subtitle1">{label}</Typography>
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
