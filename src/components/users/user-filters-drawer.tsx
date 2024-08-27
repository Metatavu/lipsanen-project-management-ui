import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  MenuItem,
  TextField,
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

  // TODO: Localize & style
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
   * Main component render
   */
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="contained" color="primary" size="large">
        <FilterListIcon />
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
        <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", padding: "1rem" }}>
          <Typography variant="h4">User filters</Typography>
          <IconButton onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List>
          <ListItem>
            <TextField
              fullWidth
              select
              label="Project"
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
              label="Company"
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
              label="Position"
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
          <Button onClick={handleClearFilters}>Clear all</Button>
          <Button onClick={handleApplyFilters}>Apply all</Button>
        </List>
      </Drawer>
    </>
  );
};

export default UserFiltersDrawer;
