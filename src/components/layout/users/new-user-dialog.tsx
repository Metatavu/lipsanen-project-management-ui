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
import { Company, CreateCompanyRequest, CreateUserRequest, Project, User } from "generated/client";
import CreatableSelect from "components/generic/creatable-select";
import GenericSelect from "components/generic/generic-select";
import { UseMutationResult } from "@tanstack/react-query";

/**
 * Component Props
 */
interface Props {
  open: boolean;
  users: User[];
  companies: Company[];
  projects: Project[];
  handleClose: () => void;
  createUser: UseMutationResult<User, Error, CreateUserRequest, unknown>;
  createCompany: UseMutationResult<Company, Error, CreateCompanyRequest, unknown>;
}

/**
 * New user dialog component
 *
 * @param props component properties
 */
const NewUserDialog = ({ open, users, companies, projects, handleClose, createUser, createCompany }: Props) => {
  const { t } = useTranslation();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
  });
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
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
      const newCompany = await createCompany.mutateAsync({ company: selectedCompany });
      companyId = newCompany?.id;
    } else {
      companyId = companies.find((company) => company.name === selectedCompany?.name)?.id;
    }

    const projectIds: string[] = selectedProject?.id ? [selectedProject.id] : [];

    const user: User = {
      firstName: firstName,
      lastName: lastName,
      email: userData.email,
      companyId: companyId,
      projectIds: projectIds,
    };

    await createUser.mutateAsync({ user });
    setUserData({
      name: "",
      email: "",
    });
    setSelectedCompany(null);
    setSelectedProject(null);
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
        <GenericSelect
          options={projects}
          selectedOption={selectedProject}
          setSelectedOption={setSelectedProject}
          getOptionLabel={(option) => option.name || ""}
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
