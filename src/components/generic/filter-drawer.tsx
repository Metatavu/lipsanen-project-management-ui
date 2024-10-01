import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import { AppBar, Badge, Button, Divider, Drawer, IconButton, Stack, Toolbar, Typography } from "@mui/material";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AppRouteOptions,
  AppRouteSearchSchema,
  AppRouter,
  FormFieldChangeHandler,
  RenderFilterFormFn as FilterFormRenderFunction,
} from "types";

/**
 * Filter drawer component properties
 *
 * @typeParam RoutePath route path
 * @typeParam FormValues form values
 */
type Props<RoutePath extends AppRouteOptions, FormValues = AppRouteSearchSchema<RoutePath>> = {
  route: RoutePath;
  title: string;
  children: FilterFormRenderFunction<FormValues>;
};

/**
 * Generic filter drawer button component
 *
 * Renders a button that opens a search param filter drawer. The drawer contains a form with filter fields.
 * The form fields are rendered by the children render function. The form values are stored in the component state.
 * The drawer has two buttons: "Clear" and "Apply". The "Clear" button clears all form values.
 * The "Apply" button applies the form values as search params and navigates to the route with the new search params.
 *
 * @param props component properties
 */
const FilterDrawerButton = <Route extends AppRouteOptions>({ route, children, title }: Props<Route>) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const searchParams = useSearch<AppRouter>({ from: route });
  const [open, setOpen] = useState(false);
  const [formValues, setFormValues] = useState(searchParams);

  useEffect(() => setFormValues(searchParams), [searchParams]);

  /**
   * Handles user filter change
   *
   * @param event event
   */
  const onChange: FormFieldChangeHandler<typeof formValues> = (field) => (event) => {
    setFormValues({
      ...formValues,
      [field]: !event.target.value || event.target.value === "NO_SELECTION" ? undefined : event.target.value,
    });
  };

  /**
   * Get number of applied filters
   */
  const getNumberOfAppliedFilters = () => Object.values(searchParams).filter((param) => param).length;

  /**
   * Main component render
   */
  return (
    <>
      <Badge
        badgeContent={getNumberOfAppliedFilters()}
        color="warning"
        variant="standard"
        sx={{ "& .MuiBadge-badge": { right: 8, top: 4, borderRadius: "999px" } }}
      >
        <Button onClick={() => setOpen(true)} variant="contained" color="primary" size="large">
          <FilterListIcon />
          {t("generic.showFilters")}
        </Button>
      </Badge>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { width: 400 } }}>
        <AppBar elevation={0} position="relative">
          <Toolbar disableGutters sx={{ px: 2, display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h5" maxWidth="90%">
              {title}
            </Typography>
            <IconButton edge="start" color="inherit" onClick={() => setOpen(false)} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Divider />
        <Stack height="100%" bgcolor="#2196F314" gap={2} p={2}>
          {children({ formValues, onChange })}
          <Stack direction="row" gap={1}>
            <Button fullWidth size="large" variant="outlined" color="primary" onClick={() => setFormValues({})}>
              {t("generic.clear")}
            </Button>
            <Button
              fullWidth
              size="large"
              variant="contained"
              color="primary"
              onClick={() => {
                navigate({ search: formValues });
                setOpen(false);
              }}
            >
              {t("generic.apply")}
            </Button>
          </Stack>
        </Stack>
      </Drawer>
    </>
  );
};

export default FilterDrawerButton;
