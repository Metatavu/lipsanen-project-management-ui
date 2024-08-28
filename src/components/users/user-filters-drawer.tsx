import {
  AppBar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  MenuItem,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useListProjectsQuery, useListCompaniesQuery, useListJobPositionsQuery } from "hooks/api-queries";
import { useNavigate } from "@tanstack/react-router";
import { Route as UserRoute } from "routes/users";

/**
 * User filters drawer component
 */
const UserFiltersDrawer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate({ from: UserRoute.fullPath });
  const searchFilters = UserRoute.useSearch();

  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({
    projectId: searchFilters.projectId || "",
    companyId: searchFilters.companyId || "",
    position: searchFilters.position || "",
  });

  const listProjectsQuery = useListProjectsQuery();
  const listCompaniesQuery = useListCompaniesQuery();
  const listJobPositionsQuery = useListJobPositionsQuery();

  const projects = listProjectsQuery.data?.projects;
  const companies = listCompaniesQuery.data?.companies;
  const jobPositions = listJobPositionsQuery.data?.jobPositions;

  /**
   * Handles user filter change
   *
   * @param event event
   */
  const handleFormChange = (field: keyof typeof filters) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [field]: event.target.value });
  };

  /**
   * Handles drawer close
   */
  const handleClose = () => {
    setOpen(false);
  };

  /**
   * Handles drawer apply filters
   */
  const handleApplyFilters = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        projectId: filters.projectId === "" ? undefined : filters.projectId,
        companyId: filters.companyId === "" ? undefined : filters.companyId,
        position: filters.position === "" ? undefined : filters.position,
      }),
    });
    handleClose();
  };

  /**
   * Handles drawer clear filters
   */
  const handleClearFilters = () => {
    setFilters({ projectId: "", companyId: "", position: "" });
    navigate({
      search: (prev) => ({
        ...prev,
        projectId: undefined,
        companyId: undefined,
        position: undefined,
      }),
    });
    handleClose();
  };

  /**
   * Get number of applied filters
   */
  const getNumberOfAppliedFilters = () => {
    let count = 0;

    for (const key in searchFilters) {
      if (searchFilters[key as keyof typeof searchFilters]) count++;
    }
    return count;
  };

  /**
   * Main component render
   */
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="contained" color="primary" size="large">
        <Badge badgeContent={getNumberOfAppliedFilters()} color="warning" sx={{ marginRight: "0.4rem" }}>
          <FilterListIcon />
        </Badge>
        {t("generic.showFilters")}
      </Button>
      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: "30%",
          },
        }}
      >
        <AppBar elevation={0} sx={{ position: "relative" }}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h5">{t("userFilters.title")}</Typography>
            <IconButton edge="start" color="inherit" onClick={() => setOpen(false)} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Divider />
        <List sx={{ padding: 0 }}>
          <Box sx={{ backgroundColor: "#2196F314", display: "flex", flexDirection: "column" }}>
            <ListItem>
              <TextField
                fullWidth
                select
                label={t("userFilters.project")}
                value={filters.projectId}
                onChange={handleFormChange("projectId")}
              >
                <MenuItem value="" sx={{ height: 36 }} />
                {projects?.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </TextField>
            </ListItem>
            <ListItem>
              <TextField
                fullWidth
                select
                label={t("usersScreen.company")}
                value={filters.companyId}
                onChange={handleFormChange("companyId")}
              >
                <MenuItem value="" sx={{ height: 36 }} />
                {companies?.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name}
                  </MenuItem>
                ))}
              </TextField>
            </ListItem>
            <ListItem>
              <TextField
                fullWidth
                select
                label={t("usersScreen.position")}
                value={filters.position}
                onChange={handleFormChange("position")}
              >
                <MenuItem value="" sx={{ height: 36 }} />
                {jobPositions?.map((position) => (
                  <MenuItem key={position.id} value={position.id}>
                    {position.name}
                  </MenuItem>
                ))}
              </TextField>
            </ListItem>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", padding: "0.5rem" }}>
            <Button variant="contained" color="error" onClick={handleClearFilters}>
              {t("userFilters.clearAll")}
            </Button>
            <Button variant="contained" color="primary" onClick={handleApplyFilters}>
              {t("userFilters.applyAll")}
            </Button>
          </Box>
        </List>
      </Drawer>
    </>
  );
};

export default UserFiltersDrawer;
