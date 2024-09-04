import { Icon } from "@iconify/react/dist/iconify.js";

/**
 * Component properties
 */
type Props = {
  iconName?: string;
  backgroundColor?: string;
  color?: string;
};

/**
 * Render MDI Iconify icon with background
 *
 * @param iconName icon name
 * @param backgroundColor background color
 */
export const MdiIconifyIconWithBackground = ({ iconName, backgroundColor, color }: Props) => {
  if (!iconName || !backgroundColor) return null;

  return (
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        backgroundColor: backgroundColor,
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
      }}
    >
      <Icon icon={`mdi:${iconName}`} height={20} width={20} color={color ?? "#fff"} />
    </div>
  );
};
