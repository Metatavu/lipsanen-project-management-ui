import {
  AppBar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
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
    <Dialog transitionDuration={0} fullWidth open={!!error} onClose={handleClose}>
      <AppBar sx={{ position: "relative", backgroundColor: "#D32F2F" }}>
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
      <DialogActions>
        <Button onClick={handleClose} variant="contained" color="primary" size="large">
          {t("generic.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorDialog;
