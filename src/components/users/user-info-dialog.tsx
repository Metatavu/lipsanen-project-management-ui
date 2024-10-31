import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import {
  AppBar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import LoadingTableCell from "components/generic/loading-table-cell";
import LoadingTextField, { LoadingTextFieldProps } from "components/generic/loading-text-field";
import { UpdateUserRequest, UserRole } from "generated/client";
import { useFindUserQuery, useListCompaniesQuery, useListJobPositionsQuery } from "hooks/api-queries";
import { useApi } from "hooks/use-api";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSetError } from "utils/error-handling";
import AssignUserToProjectDialog from "./assign-user-to-project-dialog";
import UserProjectTableRow from "./user-project-table-row";

/**
 * Component Props
 */
interface Props {
  userId?: string;
  handleClose: () => void;
}

/**
 * User info dialog component
 *
 * @param props component properties
 */
const UserInfoDialog = ({ userId, handleClose }: Props) => {
  const { t } = useTranslation();
  const { usersApi } = useApi();
  const queryClient = useQueryClient();
  const setError = useSetError();
  const theme = useTheme();
  const isSmallerScreen = useMediaQuery(theme.breakpoints.down("lg"));

  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [role, setRole] = useState<UserRole>();
  const [jobPositionId, setJobPositionId] = useState("");

  const [changesMade, setChangesMade] = useState(false);

  const listCompaniesQuery = useListCompaniesQuery();
  const findUserQuery = useFindUserQuery({ userId });
  const listJobPositionsQuery = useListJobPositionsQuery();

  const companies = useMemo(() => listCompaniesQuery.data?.companies ?? [], [listCompaniesQuery.data]);
  const jobPositions = useMemo(() => listJobPositionsQuery.data?.jobPositions ?? [], [listJobPositionsQuery.data]);

  /**
   * Sets user info on user data load
   */
  useEffect(() => {
    if (!findUserQuery.data) return;
    setName(`${findUserQuery.data.firstName} ${findUserQuery.data.lastName}`);
    setOrganization(findUserQuery.data.companyId || "");
    setJobPositionId(findUserQuery.data.jobPositionId || "");
    setRole(findUserQuery.data.roles?.at(0));
  }, [findUserQuery.data]);

  /**
   * Update user mutation
   */
  const updateUserMutation = useMutation({
    mutationFn: (params: UpdateUserRequest) => usersApi.updateUser(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => setError(t("errorHandling.errorUpdatingUser"), error),
  });

  /**
   * Handles user info change
   *
   * TODO: remove if not needed
   *
   * @param field field id
   */
  const handleUserInfoChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (field === "name") setName(value);
    else if (field === "organization") setOrganization(value);
    else if (field === "role") setRole(value as UserRole);
    else if (field === "jobPositionId") setJobPositionId(value);
    else return;

    setChangesMade(true);
  };

  /**
   * Handles user data save
   */
  const handleSaveUser = async () => {
    if (!changesMade || !findUserQuery.data || !userId || !role) return;

    const [firstName, lastName] = name.split(" ");

    try {
      await updateUserMutation.mutateAsync({
        userId: userId,
        user: {
          ...findUserQuery.data,
          firstName: firstName || "",
          lastName: lastName || "",
          companyId: organization,
          jobPositionId: jobPositionId,
          roles: [role],
        },
      });

      setChangesMade(false);
      handleClose();
    } catch (error) {
      setError(t("errorHandling.errorUpdatingUser"), error instanceof Error ? error : undefined);
    }
  };

  /**
   * Renders user info section
   */
  const renderUserInfoSection = () => {
    const textFieldProps: LoadingTextFieldProps = {
      loading: findUserQuery.isFetching,
      fullWidth: true,
      InputProps: { readOnly: false },
    };

    return (
      <div style={{ backgroundColor: "rgba(33, 150, 243, 0.08)" }}>
        <Grid container spacing={1} padding={2}>
          <Grid item xs={6}>
            <LoadingTextField
              {...textFieldProps}
              label={t("userInfoDialog.name")}
              value={name}
              onChange={handleUserInfoChange("name")}
            />
          </Grid>
          <Grid item xs={3}>
            <LoadingTextField
              select
              {...textFieldProps}
              label={t("userInfoDialog.position")}
              value={jobPositionId}
              onChange={handleUserInfoChange("jobPositionId")}
            >
              {jobPositions?.map((jobPosition) => (
                <MenuItem key={jobPosition.id} value={jobPosition.id}>
                  {jobPosition.name}
                </MenuItem>
              ))}
            </LoadingTextField>
          </Grid>
          <Grid item xs={3}>
            <LoadingTextField
              select
              {...textFieldProps}
              label={t("userInfoDialog.role")}
              value={role ?? ""}
              onChange={handleUserInfoChange("role")}
            >
              {Object.values(UserRole).map((role) => (
                <MenuItem key={role} value={role}>
                  {t(`userRoles.${role}`)}
                </MenuItem>
              ))}
            </LoadingTextField>
          </Grid>
          <Grid item xs={4}>
            <LoadingTextField
              select
              {...textFieldProps}
              label={t("userInfoDialog.organization")}
              value={organization}
              onChange={handleUserInfoChange("organization")}
            >
              {companies?.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.name}
                </MenuItem>
              ))}
            </LoadingTextField>
          </Grid>
          <Grid item xs={4}>
            <LoadingTextField
              {...textFieldProps}
              label={t("userInfoDialog.lastLogin")}
              value={findUserQuery.data?.lastLoggedIn?.toLocaleString() ?? t("userInfoDialog.userYetToLogin")}
            />
          </Grid>
          <Grid item xs={4}>
            <LoadingTextField
              {...textFieldProps}
              label={t("userInfoDialog.projectEstimatesAccuracy")}
              value={t("userInfoDialog.noCompletedTasksYet")}
            />
          </Grid>
        </Grid>
      </div>
    );
  };

  /**
   * Renders project rows
   */
  const renderProjectRows = () => {
    if (findUserQuery.isFetching) {
      return (
        <TableRow>
          <LoadingTableCell loading />
          <LoadingTableCell loading />
          <LoadingTableCell loading />
        </TableRow>
      );
    }

    return (findUserQuery.data?.projectIds ?? []).map((projectId) => (
      <UserProjectTableRow key={projectId} projectId={projectId} />
    ));
  };

  /**
   * Renders user projects table
   *
   * TODO: Once Project status is implemented in the API - add the status logic support
   */
  const renderUserProjectsTable = () => (
    <TableContainer>
      <Table style={{ width: "100%" }}>
        <TableHead>
          <TableRow>
            <TableCell style={{ width: "60%" }}>{t("userInfoDialog.projectName")}</TableCell>
            <TableCell style={{ width: "20%" }}>{t("userInfoDialog.projectEstimatesAccuracy")}</TableCell>
            <TableCell style={{ width: "20%" }}>{t("userInfoDialog.projectStatus")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{renderProjectRows()}</TableBody>
      </Table>
    </TableContainer>
  );

  const userName = useMemo(() => {
    const { firstName, lastName } = findUserQuery.data || {};
    return firstName && lastName ? `${firstName} ${lastName}` : "";
  }, [findUserQuery.data]);

  /**
   * Main component render
   */
  return (
    <Dialog
      fullScreen={isSmallerScreen}
      PaperProps={{ sx: { minHeight: "90vh", maxWidth: 1200 } }}
      open={!!userId}
      onClose={handleClose}
    >
      <AppBar sx={{ position: "relative" }} elevation={0}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <DialogTitle>{userName}</DialogTitle>
          <LoadingButton
            loading={updateUserMutation.isPending}
            onClick={handleSaveUser}
            variant="outlined"
            color="inherit"
            size="large"
            disabled={!changesMade || !findUserQuery.data || !userId || !role}
            sx={{ ml: "auto" }}
          >
            {t("generic.save")}
          </LoadingButton>
          <IconButton color="inherit" onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      {renderUserInfoSection()}
      <DialogContentText sx={{ padding: 2 }} variant="h5">
        {t("userInfoDialog.projects")}
      </DialogContentText>
      <DialogContent style={{ padding: 0 }}>
        {renderUserProjectsTable()}
        <DialogActions>
          <AssignUserToProjectDialog userId={userId} />
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default UserInfoDialog;
