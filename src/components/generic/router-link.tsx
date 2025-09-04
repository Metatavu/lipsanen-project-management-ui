import { Link } from "@mui/material";
import { createLink, type LinkComponent } from "@tanstack/react-router";

const CreatedLinkComponent = createLink(Link);

export const RouterLink: LinkComponent<typeof Link> = (props) => {
  return <CreatedLinkComponent underline="hover" color="inherit" {...props} />;
};
