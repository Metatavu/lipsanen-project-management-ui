import { AppBar, Button, Dialog, DialogContent, DialogTitle, IconButton, Toolbar, Typography } from "@mui/material";
import { GridCloseIcon } from "@mui/x-data-grid";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { errorAtom } from "../../atoms/error";

/**
 * Error dialog component.
 */
const ErrorDialog = () => {
  const { t } = useTranslation();
  const [error, setError] = useAtom(errorAtom);

  const handleClose = () => setError(null);

  return (
    <Dialog fullWidth open={!!error} onClose={handleClose}>
      <AppBar sx={{ position: "relative" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <DialogTitle>{t("errorTitle")}</DialogTitle>
          <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
            <GridCloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <DialogContent>
        <Typography variant="body1">{error?.message}</Typography>
        {error?.details && (
          <Typography variant="body2" color="textSecondary">
            {error.details.message}
          </Typography>
        )}
      </DialogContent>
      <Button onClick={handleClose}>{t("generic.close")}</Button>
    </Dialog>
  );
};

export default ErrorDialog;
