import { Card, Toolbar, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

const UsersIndexRoute = () => {
  const { t } = useTranslation();

  return (
    <div style={{ padding: "1rem" }}>
      <Card>
        <Toolbar>
          <Typography component="h1" variant="h5">
            {t("users")}
          </Typography>
        </Toolbar>
      </Card>
    </div>
  );
};

export const Route = createFileRoute("/users")({
  component: UsersIndexRoute,
});
