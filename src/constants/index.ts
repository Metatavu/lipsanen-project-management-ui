import config from "app/config";
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
import { ChangeProposalScope, IconOption } from "types";

export const DEFAULT_THEME_COLORS = [
  { name: "Lipsanen Lipa-Betoni Oy", value: "rgba(0, 121, 191, 1)" },
  { name: "Rakennus Ahola", value: "rgba(25, 85, 158, 0.35)" },
  { name: "Moduls", value: "rgba(0, 23, 58, 1)" },
  { name: "HB-Porras", value: "rgba(0, 122, 191, 1)" },
];

export const DEFAULT_LOGO = `${config.cdnBaseUrl}/Lipsanen logo.png`;

// TODO: This should be finalized and come from the API
export const REASONS_FOR_CHANGE = ["Supply issue", "Bad weather", "Strikes", "Other"];

export const ICON_OPTIONS: IconOption[] = [
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

export const TRACKING_SCREEN_CHANGE_PROPOSAL_SCOPES = [
  ChangeProposalScope.TASK,
  ChangeProposalScope.ROLE,
  ChangeProposalScope.REASON
];

export const DEFAULT_USER_ICON = "account";
