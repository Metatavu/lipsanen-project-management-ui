import { AppBar, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Toolbar } from "@mui/material";
import { GridCloseIcon } from "@mui/x-data-grid";
import { ReactNode, createContext, useContext, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Confirm dialog options type
 */
type ConfirmDialogOptions = {
  title: string;
  description: string;
  confirmButtonText?: string;
  cancelButtonEnabled?: boolean;
  onConfirmClick: () => void | Promise<void>;
};

/**
 * Show confirm dialog handler
 *
 * @param options ConfirmDialogOptions
 */
type ShowConfirmDialogHandler = (options: ConfirmDialogOptions) => void;

/**
 * Confirm dialog context
 */
const ConfirmDialogContext = createContext<ShowConfirmDialogHandler>(() => {
  throw new Error("Component must be wrapped with DialogProvider");
});

/**
 *  Confirmation dialog provider
 *
 * @param children ReactNode
 */
const ConfirmDialogProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions>();
  const showDialog = (options: ConfirmDialogOptions) => {
    setOpen(true);
    setOptions(options);
  };
  const { t } = useTranslation();
  const handleClose = () => setOpen(false);

  /**
   * Form submit handler
   */
  const handleSubmit = () => {
    options?.onConfirmClick();
    handleClose();
  };

  /**
   * Main component render
   */
  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <AppBar sx={{ position: "relative" }}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <DialogTitle sx={{ paddingLeft: 0 }}>{options?.title}</DialogTitle>
            <IconButton edge="start" color="inherit" onClick={() => setOpen(false)} aria-label="close">
              <GridCloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <DialogContent>{options?.description}</DialogContent>
        <DialogActions>
          {options?.cancelButtonEnabled && <Button onClick={handleClose}>{t("generic.cancel")}</Button>}
          <Button variant="contained" onClick={handleSubmit}>
            {options?.confirmButtonText || t("generic.confirm")}
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialogContext.Provider value={showDialog}>{children}</ConfirmDialogContext.Provider>
    </>
  );
};

/**
 * Use confirm dialog hook
 */
export const useConfirmDialog = () => {
  return useContext(ConfirmDialogContext);
};

export default ConfirmDialogProvider;
