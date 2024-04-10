import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { AppBar, IconButton, LinearProgress, Toolbar } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Company, User } from "generated/client";
import CreatableSelect from "components/generic/creatable-select";
import { CompanyOptionType } from "types";

/**
 * Component Props
 */
interface Props {
  open: boolean;
  handleClose: () => void;
  users: User[];
  createUser: (user: User) => Promise<void>;
  companies: Company[];
  createCompany: (selectedCompany: Company) => Promise<Company | undefined>;
}

/**
 * New user dialog component
 *
 * @param props Props
 */
const NewUserDialog = ({ open, handleClose, users, createUser, companies, createCompany }: Props) => {
  const { t } = useTranslation();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
  });
  const [selectedCompany, setSelectedCompany] = useState<CompanyOptionType | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
   * Validates email format and checks is unique
   *
   * @param email string
   */
  const emailValidation = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailIsValid = emailRegex.test(email);
    if (!emailIsValid) {
      setErrorMessage(t("newUserDialog.invalidEmailWarning"));
      return false;
    }

    const emailIsUnique = !users.some((user) => user.email === email);
    if (!emailIsUnique) {
      setErrorMessage(t("newUserDialog.emailNotUniqueWarning"));
      return false;
    }

    setErrorMessage("");
    return true;
  };

  /**
   * Handles user creation form submit
   */
  const handleUserFormSubmit = async () => {
    if (!emailValidation(userData.email)) {
      return;
    }

    setLoading(true);
    const firstName = userData.name.split(" ")[0];
    const lastName = userData.name.split(" ")[1];
    let companyId = null;
    const isNewCompany = !!(
      selectedCompany?.name && !companies.find((company) => company.name === selectedCompany.name)
    );

    if (isNewCompany) {
      const newCompany = await createCompany(selectedCompany);
      companyId = newCompany?.id;
    } else {
      companyId = companies.find((company) => company.name === selectedCompany?.name)?.id;
    }

    const user: User = {
      firstName: firstName,
      lastName: lastName,
      email: userData.email,
      companyId: companyId,
    };

    await createUser(user);
    setUserData({
      name: "",
      email: "",
    });
    setSelectedCompany(null);
    setLoading(false);
    handleClose();
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
          placeholder={t("newUserDialog.enterUsersName")}
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
          label={t("newUserDialog.email")}
          placeholder={t("newUserDialog.enterUsersEmail")}
          value={userData.email}
          onChange={handleFormChange}
          sx={{
            "& fieldset": { border: "none" },
          }}
          required
          error={!!errorMessage}
          helperText={errorMessage}
        />
        <CreatableSelect
          options={companies}
          selectedCompany={selectedCompany}
          setSelectedCompany={setSelectedCompany}
        />
      </DialogContent>
      {loading && <LinearProgress />}
      <DialogActions>
        <Button onClick={handleUserFormSubmit} variant="contained" color="primary" size="large" disabled={isDisabled}>
          <AddIcon />
          {t("newUserDialog.sendAnInvitation")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewUserDialog;
