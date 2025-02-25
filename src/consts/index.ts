import account from "@iconify-icons/mdi/account";
import accountHardHat from "@iconify-icons/mdi/account-hard-hat";
import accountTie from "@iconify-icons/mdi/account-tie";
import clipboardTextOutline from "@iconify-icons/mdi/clipboard-text-outline";
import faceManShimmer from "@iconify-icons/mdi/face-man-shimmer";
import fire from "@iconify-icons/mdi/fire";
import flowerTulip from "@iconify-icons/mdi/flower-tulip";
import greenhouse from "@iconify-icons/mdi/greenhouse";
import hammerWrench from "@iconify-icons/mdi/hammer-wrench";
import homeAutomation from "@iconify-icons/mdi/home-automation";
import lightningBolt from "@iconify-icons/mdi/lightning-bolt";
import monitorDashboard from "@iconify-icons/mdi/monitor-dashboard";
import rulerSquareCompass from "@iconify-icons/mdi/ruler-square-compass";
import sofaSingle from "@iconify-icons/mdi/sofa-single";
import store from "@iconify-icons/mdi/store";
import sunSnowflakeVariant from "@iconify-icons/mdi/sun-snowflake-variant";
import terrain from "@iconify-icons/mdi/terrain";
import water from "@iconify-icons/mdi/water";
import config from "app/config";
import { DateTimeFormatOptions } from "luxon";
import { IconOption } from "types";

export const DEFAULT_LOGO = `${config.cdnBaseUrl}/logos/Lipsanen logo.png`;

export const TWO_MEGABYTES = 2_000_000;

export const ICON_OPTIONS: IconOption[] = [
  { labelKey: "architect", value: "ruler-square-compass", icon: rulerSquareCompass },
  { labelKey: "structuralEngineer", value: "greenhouse", icon: greenhouse },
  { labelKey: "hvacDesigner", value: "sun-snowflake-variant", icon: sunSnowflakeVariant },
  { labelKey: "electricalDesigner", value: "lightning-bolt", icon: lightningBolt },
  { labelKey: "buildingAutomationDesigner", value: "home-automation", icon: homeAutomation },
  { labelKey: "geotechnicalDesigner", value: "terrain", icon: terrain },
  { labelKey: "landscapeDesigner", value: "flower-tulip", icon: flowerTulip },
  { labelKey: "fireProtectionDesigner", value: "fire", icon: fire },
  { labelKey: "interiorDesigner", value: "sofa-single", icon: sofaSingle },
  { labelKey: "procurement", value: "store", icon: store },
  { labelKey: "siteEngineer", value: "clipboard-text-outline", icon: clipboardTextOutline },
  { labelKey: "siteManager", value: "hammer-wrench", icon: hammerWrench },
  { labelKey: "client", value: "face-man-shimmer", icon: faceManShimmer },
  { labelKey: "user", value: "account", icon: account },
  { labelKey: "supervisor", value: "account-tie", icon: accountTie },
  { labelKey: "moistureControlCoordinator", value: "water", icon: water },
  { labelKey: "bimCoordinator", value: "monitor-dashboard", icon: monitorDashboard },
  { labelKey: "safetyCoordinator", value: "account-hard-hat", icon: accountHardHat },
];

export const DEFAULT_USER_ICON = "account";

export const NO_SELECTION = "NO_SELECTION";

export const DATE_WITH_LEADING_ZEROS: DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
} as const;
