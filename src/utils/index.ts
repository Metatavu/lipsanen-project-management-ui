import { getContrastRatio } from "@mui/material";
import { WithRequired } from "types";

export const getNthSlugFromPathName = (pathName: string, nth: number) => {
  return (pathName.startsWith("/") ? pathName : `/${pathName}`).split("/").at(nth + 1);
};

export const handleErrorWithMessage = (errorMessage: string) => (error: unknown) => handleError(errorMessage, error);

export const handleError = (errorMessage: string, error: unknown) => console.error(errorMessage, error);

/**
 * Check if given string contains invalid characters
 *
 * @param str string to test
 * @returns true if string contains invalid characters
 */
// biome-ignore lint/suspicious/noControlCharactersInRegex: Control characters required
export const containsIllegalCharacters = (str: string) => /[^\x00-\x7F]/gi.test(str);

export const mustHaveId = <T extends { id?: string }>(withPossibleId: T): WithRequired<T, "id"> => {
  if (!withPossibleId.id) throw new Error("Object must have an id");
  return withPossibleId as WithRequired<T, "id">;
};

const getMultiplierFromNumber = (num: number) => parseFloat(`0.${Math.sin(num).toString().substring(6)}`);

const getHexFromNumber = (num: number) => (~~(getMultiplierFromNumber(num) * 256)).toString(16);

export const hexFromString = (str: string) => {
  const splitStr = str.split("");
  const charCodes = splitStr.map((char) => char.charCodeAt(0));
  const numberHash = charCodes.reduce((sum, code) => sum + code, 0);
  const [r, g, b] = [1, 2, 3].map((i) => {
    const hex = getHexFromNumber(numberHash + i);
    return hex.length === 1 ? `0${hex}` : hex;
  });

  return `#${r}${g}${b}`.toUpperCase();
};

export const getContrastForegroundColor = (color: string) => (getContrastRatio("#FFF", color) > 3 ? "#FFF" : "#000");
