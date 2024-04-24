import {
  AppBar,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Toolbar,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  DialogActions,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import AssignUserToProjectDialog from "./assign-user-to-project-dialog";
import { useFindUserQuery, useListCompaniesQuery } from "hooks/api-queries";
import UserProjectTableRow from "./user-project-table-row";
import LoadingTextField, { LoadingTextFieldProps } from "components/generic/loading-text-field";
import LoadingTableCell from "components/generic/loading-table-cell";

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
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [role, setRole] = useState("");

  const listCompaniesQuery = useListCompaniesQuery();
  const findUserQuery = useFindUserQuery(userId);

  const companies = listCompaniesQuery.data?.companies;

  /**
   * Use effect to set user info
   */
  useEffect(() => {
    if (!findUserQuery.data) return;
    setName(`${findUserQuery.data.firstName} ${findUserQuery.data.lastName}`);
    setOrganization(findUserQuery.data.companyId || "");
  }, [findUserQuery.data]);

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
    else if (field === "role") setRole(value);
  };

  /**
   * Renders user info section
   */
  const renderUserInfoSection = () => {
    const textFieldProps: LoadingTextFieldProps = {
      loading: findUserQuery.isFetching,
      fullWidth: true,
      InputProps: { readOnly: true },
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
          <Grid item xs={6}>
            <LoadingTextField
              {...textFieldProps}
              label={t("userInfoDialog.role")}
              value={role || t("userInfoDialog.noAssignedRole")}
              onChange={handleUserInfoChange("role")}
            />
          </Grid>
          <Grid item xs={4}>
            <LoadingTextField
              {...textFieldProps}
              label={t("userInfoDialog.organization")}
              value={
                companies?.find((company) => company.id === organization)?.name ??
                t("userInfoDialog.unknownOrganization")
              }
              onChange={handleUserInfoChange("organization")}
            />
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
      PaperProps={{ sx: { minHeight: "90vh", maxHeight: "90vh", minWidth: 1200, maxWidth: 1200 } }}
      open={!!userId}
      onClose={handleClose}
    >
      <AppBar sx={{ position: "relative" }} elevation={0}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <DialogTitle>{userName}</DialogTitle>
          <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
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