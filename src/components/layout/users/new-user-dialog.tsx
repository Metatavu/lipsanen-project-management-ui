import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { AppBar, IconButton, Toolbar } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { User } from "generated/client";

/**
 * Component Props
 */
interface Props {
  open: boolean;
  handleClose: () => void;
  createUser: (user: User) => Promise<void>;
}

/**
 * New user dialog component
 *
 * @param props Props
 */
const NewUserDialog = ({ open, handleClose, createUser }: Props) => {
  const { t } = useTranslation();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    company: "",
  });

  /**
   * Handles user creation form submit
   *
   * @param event event
   */
  const handleFormChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = target;
    setUserData({ ...userData, [name]: value });
  };

  /**
   * Handles user creation form submit
   */
  const handleUserFormSubmit = () => {
    const firstName = userData.name.split(" ")[0];
    const lastName = userData.name.split(" ")[1];

    const user: User = {
      firstName: firstName,
      lastName: lastName,
      email: userData.email,
      company: userData.company,
    };

    createUser(user);
  };

  const isDisabled = !(!!userData.name && !!userData.email);

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={handleClose}>
      <AppBar sx={{ position: "relative" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <DialogTitle sx={{ paddingLeft: 0 }}>{t("addANewUser")}</DialogTitle>
          <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <DialogContent sx={{ backgroundColor: "#2196F314", overflowX: "hidden" }}>
        <TextField
          fullWidth
          name="name"
          label={t("name")}
          placeholder={t("enterUsersName")}
          value={userData.name}
          onChange={handleFormChange}
          sx={{
            "& fieldset": { border: "none" },
          }}
          required
        />
        <TextField
          fullWidth
          name="email"
          label={t("email")}
          placeholder={t("enterUsersEmail")}
          value={userData.email}
          onChange={handleFormChange}
          sx={{
            "& fieldset": { border: "none" },
          }}
          required
        />
        <TextField
          fullWidth
          name="company"
          label={t("company")}
          placeholder={t("enterUsersCompany")}
          value={userData.company}
          onChange={handleFormChange}
          sx={{
            "& fieldset": { border: "none" },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleUserFormSubmit} variant="contained" color="primary" size="large" disabled={isDisabled}>
          <AddIcon />
          {t("sendAnInvitation")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewUserDialog;
