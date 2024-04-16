export const getNthSlugFromPathName = (pathName: string, nth: number) => {
  return (pathName.startsWith("/") ? pathName : `/${pathName}`).split("/").at(nth + 1);
};

export const logQueryError = (errorMessage: string) => (error: unknown) => console.error(errorMessage, error);

/**
 * Check if given string contains invalid characters
 *
 * @param str string to test
 * @returns true if string contains invalid characters
 */
// biome-ignore lint/suspicious/noControlCharactersInRegex: Control characters required
export const containsIllegalCharacters = (str: string) => /[^\x00-\x7F]/gi.test(str);
