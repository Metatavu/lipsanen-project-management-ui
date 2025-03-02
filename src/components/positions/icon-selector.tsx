import { Icon, IconifyIcon } from "@iconify/react";
import { ListItemIcon, ListItemText, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { ICON_OPTIONS } from "consts";
import { useTranslation } from "react-i18next";

/**
 * Component Props
 */
interface Props {
  icon: string;
  onChange: (value: string) => void;
}

/**
 * Icon selector component
 *
 * @param props Props
 */
const IconSelector = ({ icon, onChange }: Props) => {
  const { t } = useTranslation();

  return (
    <Select
      fullWidth
      value={icon}
      onChange={(e: SelectChangeEvent<string>) => onChange(e.target.value)}
      displayEmpty
      renderValue={(selected) => {
        if (!selected) {
          return t("iconSelector.selectIcon");
        }
        
        const selectedItem = ICON_OPTIONS.find((option) => option.value === selected);
        if (!selectedItem) {
          return null;
        }

        const icon = selectedItem.icon as IconifyIcon;
        // biome-ignore lint: dynamic translation
        const label = t(`iconSelector.iconNames.${selectedItem.labelKey}` as any);

        if (!icon || !label) {
          return null;
        }

        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Icon icon={icon} />
            <span style={{ marginLeft: 8 }}> { label || "" } </span>
          </div>
        );
      }}
      required
    >
      <MenuItem value="" disabled>
        {t("iconSelector.selectIcon")}
      </MenuItem>
      {ICON_OPTIONS.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          <ListItemIcon>
            <Icon icon={option.icon as IconifyIcon} />
          </ListItemIcon>
          <ListItemText>              
              { 
                // biome-ignore lint: dynamic translation
                t(`iconSelector.iconNames.${option.labelKey}` as any)
              }
          </ListItemText>
        </MenuItem>
      ))}
    </Select>
  );
};

export default IconSelector;
