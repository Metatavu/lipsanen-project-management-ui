import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CreatableSelect from "components/generic/creatable-select";
import GenericSelect from "components/generic/generic-select";
import { Company, CreateCompanyRequest, CreateUserRequest, JobPosition, Project } from "generated/client";
import {
  useListCompaniesQuery,
  useListJobPositionsQuery,
  useListProjectsQuery,
  useListUsersQuery,
} from "hooks/api-queries";
import { useApi } from "hooks/use-api";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSetError } from "utils/error-handling";

type Props = {
  projectId?: string;
};

/**
 * New user dialog component
 *
 * @param props component properties
 */
const NewUserDialog = ({ projectId }: Props) => {
  const { t } = useTranslation();
  const { usersApi, companiesApi } = useApi();
  const queryClient = useQueryClient();
  const setError = useSetError();

  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState({ name: "", email: "" });

  const [selectedCompany, setSelectedCompany] = useState<Company>();
  const [selectedProject, setSelectedProject] = useState<Project>();
  const [selectedJobPosition, setSelectedJobPosition] = useState<JobPosition>();

  const listUsersQuery = useListUsersQuery();
  const listProjectsQuery = useListProjectsQuery();
  const listCompaniesQuery = useListCompaniesQuery();
  const listJobPositionsQuery = useListJobPositionsQuery();

  const users = listUsersQuery.data?.users;
  const projects = listProjectsQuery.data?.projects;
  const companies = listCompaniesQuery.data?.companies;

  useEffect(() => {
    if (projectId) setSelectedProject(projects?.find((project) => project.id === projectId));
  }, [projectId, projects]);

  /**
   * Create user mutation
   */
  const createUserMutation = useMutation({
    mutationFn: (params: CreateUserRequest) => usersApi.createUser(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setOpen(false);
    },
    onError: (error) => setError(t("errorHandling.errorCreatingUser"), error),
  });

  /**
   * Create company mutation
   */
  const createCompanyMutation = useMutation({
    mutationFn: (params: CreateCompanyRequest) => companiesApi.createCompany(params),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["companies"] }),
    onError: (error) => setError(t("errorHandling.errorCreatingNewCompany"), error),
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
        jobPositionId: selectedJobPosition?.id,
      },
    });

    setUserData({ name: "", email: "" });
    setSelectedCompany(undefined);
    setSelectedJobPosition(undefined);
    setSelectedProject(undefined);
    setOpen(false);
  };

  const isDisabled = !(!!userData.name && !!userData.email);

  /**
   * Main component render
   */
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
            options={listJobPositionsQuery.data?.jobPositions ?? []}
            label={t("newUserDialog.assignUserToPosition")}
            selectedOption={selectedJobPosition}
            setSelectedOption={setSelectedJobPosition}
            getOptionLabel={(option) => option?.name || ""}
          />
          <GenericSelect
            options={projects ?? []}
            label={t("newUserDialog.assignUserToProject")}
            disabled={!!projectId}
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
