import { Card, Toolbar, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

const ProjectsIndexRoute = () => {
  const { t } = useTranslation();

  return (
    <div style={{ padding: "1rem" }}>
      <Card>
        <Toolbar>
          <Typography component="h1" variant="h5">
            {t("projects")}
          </Typography>
        </Toolbar>
      </Card>
    </div>
  );
};

export const Route = createFileRoute("/projects")({
  component: ProjectsIndexRoute,
});
