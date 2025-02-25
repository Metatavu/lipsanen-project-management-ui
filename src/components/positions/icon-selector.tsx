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
 * Render an icon
 *
 * @param icon icon to render
 */
const renderSelectedIcon = (icon: string) => {
  const { t } = useTranslation();
  const selectedItem = ICON_OPTIONS.find((option) => option.value === icon);
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {selectedItem && (
        <>
          <Icon icon={selectedItem.icon as IconifyIcon} />
          <span style={{ marginLeft: 8 }}>
              { 
                // biome-ignore lint: dynamic translation
                t(`iconSelector.iconNames.${selectedItem.labelKey}` as any)
              }
            </span>
        </>
      )}
    </div>
  );
};

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
        return renderSelectedIcon(selectedItem?.value ?? "");
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
