import React from "react";
import { Select, MenuItem, ListItemIcon, ListItemText, SelectChangeEvent } from "@mui/material";
import { Icon, IconifyIcon } from "@iconify/react";
import rulerSquareCompass from "@iconify-icons/mdi/ruler-square-compass";
import greenhouse from "@iconify-icons/mdi/greenhouse";
import sunSnowflakeVariant from "@iconify-icons/mdi/sun-snowflake-variant";
import lightningBolt from "@iconify-icons/mdi/lightning-bolt";
import homeAutomation from "@iconify-icons/mdi/home-automation";
import terrain from "@iconify-icons/mdi/terrain";
import flowerTulip from "@iconify-icons/mdi/flower-tulip";
import fire from "@iconify-icons/mdi/fire";
import sofaSingle from "@iconify-icons/mdi/sofa-single";
import store from "@iconify-icons/mdi/store";
import clipboardTextOutline from "@iconify-icons/mdi/clipboard-text-outline";
import hammerWrench from "@iconify-icons/mdi/hammer-wrench";
import faceManShimmer from "@iconify-icons/mdi/face-man-shimmer";
import account from "@iconify-icons/mdi/account";
import accountTie from "@iconify-icons/mdi/account-tie";
import water from "@iconify-icons/mdi/water";
import monitorDashboard from "@iconify-icons/mdi/monitor-dashboard";
import accountHardHat from "@iconify-icons/mdi/account-hard-hat";
import { useTranslation } from "react-i18next";

interface IconOption {
  label: string;
  value: string;
  icon: object;
}

const iconOptions: IconOption[] = [
  { label: "Architect", value: "ruler-square-compass", icon: rulerSquareCompass },
  { label: "Structural Engineer", value: "greenhouse", icon: greenhouse },
  { label: "HVAC Designer", value: "sun-snowflake-variant", icon: sunSnowflakeVariant },
  { label: "Electrical Designer", value: "lightning-bolt", icon: lightningBolt },
  { label: "RAU-suunnittelija / Building automation designer", value: "home-automation", icon: homeAutomation },
  { label: "Geotechnical Designer", value: "terrain", icon: terrain },
  { label: "Landscape Designer", value: "flower-tulip", icon: flowerTulip },
  { label: "Fire Protection Designer", value: "fire", icon: fire },
  { label: "Interior Designer", value: "sofa-single", icon: sofaSingle },
  { label: "Procurement", value: "store", icon: store },
  { label: "Site Engineer", value: "clipboard-text-outline", icon: clipboardTextOutline },
  { label: "Site Manager", value: "hammer-wrench", icon: hammerWrench },
  { label: "Client", value: "face-man-shimmer", icon: faceManShimmer },
  { label: "User", value: "account", icon: account },
  { label: "Supervisor", value: "account-tie", icon: accountTie },
  { label: "Moisture Control Coordinator", value: "water", icon: water },
  { label: "BIM Coordinator", value: "monitor-dashboard", icon: monitorDashboard },
  { label: "Safety Coordinator", value: "account-hard-hat", icon: accountHardHat },
];

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
        const selectedItem = iconOptions.find(option => option.value === selected);
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {selectedItem && (
              <>
                <Icon icon={selectedItem.icon as IconifyIcon} />
                <span style={{ marginLeft: 8 }}>{selectedItem.label}</span>
              </>
            )}
          </div>
        );
      }}
      required
    >
      <MenuItem value="" disabled>
        {t("iconSelector.selectIcon")}
      </MenuItem>
      {iconOptions.map(option => (
        <MenuItem key={option.value} value={option.value}>
          <ListItemIcon>
            <Icon icon={option.icon as IconifyIcon} />
          </ListItemIcon>
          <ListItemText primary={option.label} />
        </MenuItem>
      ))}
    </Select>
  );
};

export default IconSelector;
