export const getNthSlugFromPathName = (pathName: string, nth: number) => {
  return (pathName.startsWith("/") ? pathName : `/${pathName}`).split("/").at(nth + 1);
};
