import { Icon } from "@iconify/react/dist/iconify.js";
import { Avatar } from "@mui/material";

/**
 * Component properties
 */
type Props = {
  iconName?: string;
  backgroundColor?: string;
  color?: string;
};

/**
 * MDI Iconify icon with background component
 *
 * @param iconName icon name
 * @param backgroundColor background color
 */
export const MdiIconifyIconWithBackground = ({ iconName, backgroundColor, color }: Props) => (
  <Avatar
    sx={{
      bgcolor: (theme) => backgroundColor ?? theme.palette.primary.main,
      width: 30,
      height: 30,
    }}
  >
    <Icon icon={`mdi:${iconName || "account"}`} color={color ?? "#fff"} />
  </Avatar>
);
