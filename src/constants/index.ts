import config from "app/config";

export const DEFAULT_THEME_COLORS = [
  { name: "Lipsanen Lipa-Betoni Oy", value: "rgba(0, 121, 191, 1)" },
  { name: "Rakennus Ahola", value: "rgba(25, 85, 158, 0.35)" },
  { name: "Moduls", value: "rgba(0, 23, 58, 1)" },
  { name: "HB-Porras", value: "rgba(0, 122, 191, 1)" },
];

export const DEFAULT_LOGO = `${config.cdnBaseUrl}/Lipsanen logo.png`;

// TODO: This should be finalized and come from the API
export const REASONS_FOR_CHANGE = ["Supply issue", "Bad weather", "Strikes", "Other"];
