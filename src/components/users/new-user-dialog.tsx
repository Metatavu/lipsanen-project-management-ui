import {
  AppBar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  TextField,
  Toolbar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Company, CreateCompanyRequest, CreateUserRequest, Project } from "generated/client";
import CreatableSelect from "components/generic/creatable-select";
import GenericSelect from "components/generic/generic-select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "hooks/use-api";
import { useListUsersQuery, useListProjectsQuery, useListCompaniesQuery } from "hooks/api-queries";

/**
 * New user dialog component
 *
 * @param props component properties
 */
const NewUserDialog = () => {
  const { t } = useTranslation();
  const { usersApi, companiesApi } = useApi();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState({ name: "", email: "" });

  const [selectedCompany, setSelectedCompany] = useState<Company>();
  const [selectedProject, setSelectedProject] = useState<Project>();

  const listUsersQuery = useListUsersQuery();
  const listProjectsQuery = useListProjectsQuery();
  const listCompaniesQuery = useListCompaniesQuery();

  const users = listUsersQuery.data?.users;
  const projects = listProjectsQuery.data?.projects;
  const companies = listCompaniesQuery.data?.companies;

  const createUserMutation = useMutation({
    mutationFn: (params: CreateUserRequest) => usersApi.createUser(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setOpen(false);
    },
    onError: (error) => console.error(t("errorHandling.errorCreatingUser"), error),
  });

  const createCompanyMutation = useMutation({
    mutationFn: (params: CreateCompanyRequest) => companiesApi.createCompany(params),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["companies"] }),
    onError: (error) => console.error(t("errorHandling.errorCreatingNewCompany"), error),
  });

  /**
   * Handles user creation form submit
   *
   * @param event event
   */
  const handleFormChange = (field: keyof typeof userData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [field]: event.target.value });
  };

  const handleCompanyChange = async (company?: Company) => {
    if (!company) return;
    setSelectedCompany(company.id ? company : await createCompanyMutation.mutateAsync({ company: company }));
  };

  const inValidEmailError = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmail = !emailRegex.test(userData.email);

    return invalidEmail ? t("newUserDialog.invalidEmailWarning") : undefined;
  }, [userData?.email, t]);

  const alreadyExistingEmailError = useMemo(() => {
    const emailAlreadyExists = users?.some((user) => user.email === userData.email);
    return emailAlreadyExists ? t("newUserDialog.emailNotUniqueWarning") : undefined;
  }, [users, userData?.email, t]);

  /**
   * Handles user creation form submit
   */
  const handleUserFormSubmit = async () => {
    if (inValidEmailError || alreadyExistingEmailError) return;

    const [firstName, lastName] = userData.name.split(" ");

    await createUserMutation.mutateAsync({
      user: {
        firstName: firstName,
        lastName: lastName,
        email: userData.email,
        companyId: selectedCompany?.id,
        projectIds: selectedProject?.id ? [selectedProject.id] : [],
      },
    });

    setUserData({ name: "", email: "" });
    setSelectedCompany(undefined);
    setSelectedProject(undefined);
    setOpen(false);
  };

  const isDisabled = !(!!userData.name && !!userData.email);

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="contained" color="primary" size="large">
        <AddIcon />
        {t("addANewUser")}
      </Button>
      <Dialog fullWidth maxWidth="md" open={open} onClose={() => setOpen(false)}>
        <AppBar elevation={0} sx={{ position: "relative" }}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <DialogTitle sx={{ paddingLeft: 0 }}>{t("addANewUser")}</DialogTitle>
            <IconButton edge="start" color="inherit" onClick={() => setOpen(false)} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <DialogContent sx={{ backgroundColor: "#2196F314", display: "flex", flexDirection: "column", gap: 1 }}>
          <TextField
            fullWidth
            label={t("name")}
            placeholder={t("newUserDialog.enterUsersName")}
            value={userData.name}
            onChange={handleFormChange("name")}
            sx={{ "& fieldset": { border: "none" } }}
            required
          />
          <TextField
            fullWidth
            label={t("newUserDialog.email")}
            placeholder={t("newUserDialog.enterUsersEmail")}
            value={userData.email}
            onChange={handleFormChange("email")}
            sx={{ "& fieldset": { border: "none" } }}
            required
            error={!!inValidEmailError || !!alreadyExistingEmailError}
            helperText={inValidEmailError ?? alreadyExistingEmailError}
          />
          <CreatableSelect
            options={companies ?? []}
            selectedCompany={selectedCompany}
            setSelectedCompany={handleCompanyChange}
          />
          <GenericSelect
            options={projects ?? []}
            selectedOption={selectedProject}
            setSelectedOption={setSelectedProject}
            getOptionLabel={(option) => option?.name || ""}
          />
        </DialogContent>
        {createUserMutation.isPending && <LinearProgress />}
        <DialogActions>
          <Button onClick={handleUserFormSubmit} variant="contained" color="primary" size="large" disabled={isDisabled}>
            <AddIcon />
            {t("newUserDialog.sendAnInvitation")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NewUserDialog;
