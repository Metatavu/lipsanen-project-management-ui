import {
  Box,
  Button,
  Card,
  Divider,
  MenuItem,
  Radio,
  Skeleton,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import FileUploader from "components/generic/file-upload";
import { DEFAULT_LOGO, DEFAULT_THEME_COLORS } from "constants";
import { MuiColorInput } from "mui-color-input";
import { useApi } from "hooks/use-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateProjectThemeRequest, ProjectTheme, UpdateProjectThemeRequest } from "generated/client";
import { filesApi } from "api/files";
import { FlexColumnLayout } from "components/generic/flex-column-layout";
import { useListFilesQuery, useListProjectThemesQuery, useListProjectsQuery } from "hooks/api-queries";

/**
 * Settings file route
 */
export const Route = createFileRoute("/settings")({ component: SettingsIndexRoute });

/**
 * Setting index route component
 */
function SettingsIndexRoute() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { projectThemesApi } = useApi();
  const listProjectsQuery = useListProjectsQuery();
  const listLogosQuery = useListFilesQuery();

  const projects = listProjectsQuery.data?.projects;

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedColorInput, setSelectedColor] = useState("");
  const [selectedLogoInput, setSelectedLogo] = useState("");
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const debounceTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const savedProjectId = localStorage.getItem("selectedProjectId");
    if (savedProjectId) setSelectedProjectId(savedProjectId);
  }, []);

  const listProjectThemesQuery = useListProjectThemesQuery(selectedProjectId);

  const projectTheme = useMemo(
    () =>
      listProjectThemesQuery.data
        ? listProjectThemesQuery.data.at(0) ?? { themeColor: DEFAULT_THEME_COLORS[0].value, logoUrl: DEFAULT_LOGO }
        : null,
    [listProjectThemesQuery.data],
  );

  useEffect(() => {
    if (projectTheme) applyProjectThemeSettings(projectTheme);
  }, [projectTheme]);

  const createProjectThemeMutation = useMutation({
    mutationFn: (params: CreateProjectThemeRequest) => projectThemesApi.createProjectTheme(params),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects", selectedProjectId, "themes"] }),
    onError: (error) => console.error(t("errorHandling.errorCreatingProjectTheme"), error),
  });

  const updateProjectThemeMutation = useMutation({
    mutationFn: (params: UpdateProjectThemeRequest) => projectThemesApi.updateProjectTheme(params),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects", selectedProjectId, "themes"] }),
    onError: (error) => console.error(t("errorHandling.errorUpdatingProjectTheme"), error),
  });

  const uploadFileMutation = useMutation({
    mutationFn: (file: File) => filesApi.uploadFile(file),
    onSuccess: async (fileName) => {
      handleLogoSelection(fileName);
      await queryClient.invalidateQueries({ queryKey: ["files"] });
      await queryClient.invalidateQueries({ queryKey: ["projects", selectedProjectId, "projectThemes"] });
    },
    onError: (error) => console.error(t("errorHandling.errorUploadingImage"), error),
  });

  /**
   * Applies the project theme settings to settings configuration
   */
  const applyProjectThemeSettings = (theme: ProjectTheme) => {
    setSelectedColor(theme.themeColor);
    setSelectedLogo(theme.logoUrl);

    const isCustomColor = DEFAULT_THEME_COLORS.every((color) => color.value !== theme.themeColor);
    setColorPickerOpen(isCustomColor);
  };

  /**
   * Disable project theme handler
   */
  const disableProjectThemeHandler = () =>
    handleProjectThemeChange({
      themeColor: DEFAULT_THEME_COLORS[0].value,
      logoUrl: DEFAULT_LOGO,
    });

  /**
   * Project theme change handler
   *
   * @param color string
   * @param logo string
   */
  const handleProjectThemeChange = ({ logoUrl, themeColor }: Partial<Pick<ProjectTheme, "logoUrl" | "themeColor">>) => {
    if (!projectTheme) return;

    const updatedTheme: ProjectTheme = { ...projectTheme };
    if (logoUrl) updatedTheme.logoUrl = logoUrl;
    if (themeColor) updatedTheme.themeColor = themeColor;

    if (updatedTheme.id) {
      updateProjectThemeMutation.mutateAsync({
        projectId: selectedProjectId,
        themeId: updatedTheme.id,
        projectTheme: updatedTheme,
      });
    } else {
      createProjectThemeMutation.mutateAsync({
        projectId: selectedProjectId,
        projectTheme: updatedTheme,
      });
    }
  };

  /**
   * Handles color selection
   *
   * @param color string
   */
  const handleColorSelection = (color: string) => {
    setSelectedColor(color);
    handleProjectThemeChange({ themeColor: color });
  };

  /**
   * Handles custom color selection
   *
   * @param color string
   */
  const handleCustomColorSelection = (color: string) => {
    setSelectedColor(color);
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => handleProjectThemeChange({ themeColor: color }), 2000);
  };

  /**
   * Handles logo selection
   *
   * @param logo string
   */
  const handleLogoSelection = (logo: string) => {
    setSelectedLogo(logo);
    handleProjectThemeChange({ logoUrl: logo });
  };

  /**
   * Handles project selection
   *
   * @param event event
   */
  const handleProjectSelection = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    setSelectedProjectId(value);
    localStorage.setItem("selectedProjectId", value);
  };

  /**
   * Renders color buttons
   */
  const renderColorsButtons = () =>
    DEFAULT_THEME_COLORS.map((color) => (
      <Box
        key={color.name}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          width: 150,
        }}
        onClick={() => handleColorSelection(color.value)}
      >
        <Button
          variant="contained"
          sx={{
            backgroundColor: color.value,
            minWidth: 0,
            width: "2.5rem",
            height: "2.5rem",
            borderRadius: "9999px",
            "&:hover": { backgroundColor: color },
          }}
        >
          {selectedColorInput === color.value && <CheckIcon />}
        </Button>
        <Typography sx={{ mt: 1, maxWidth: "6rem", overflowWrap: "break-word" }}>{color.name}</Typography>
      </Box>
    ));

  /**
   * Renders logo radio buttons
   */
  const renderLogoRadioButtons = () => {
    if (listLogosQuery.isPending) return null;

    return (
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {listLogosQuery.data?.map((logoUrl) => (
          <Box key={logoUrl} sx={{ display: "flex", alignItems: "center" }}>
            <Radio
              checked={selectedLogoInput === logoUrl}
              value={logoUrl}
              onChange={() => handleLogoSelection(logoUrl)}
            />
            <img src={logoUrl} alt={logoUrl} />
          </Box>
        ))}
      </Box>
    );
  };

  /**
   * Renders project theme settings
   */
  const renderSettings = () => {
    if (!selectedProjectId || listLogosQuery.isFetching) return null;

    return (
      <>
        <Typography component="h3" variant="h6">
          {t("settingsScreen.themeMainColor")}
        </Typography>
        <Box sx={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
          {renderColorsButtons()}
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => setColorPickerOpen(!colorPickerOpen)}
            sx={{ padding: "1.2rem" }}
          >
            {t("settingsScreen.otherColor")}
          </Button>
          {colorPickerOpen && (
            <MuiColorInput
              value={selectedColorInput ?? ""}
              onChange={handleCustomColorSelection}
              sx={{ width: "200px", margin: 0 }}
            />
          )}
        </Box>
        <Typography component="h3" variant="h6">
          {t("settingsScreen.logo")}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "row", gap: "5rem" }}>
          {renderLogoRadioButtons()}
          {/* TODO: Types from design, should we just allow all image types? */}
          <FileUploader
            allowedFileTypes={[".png", ".svg"]}
            uploadFile={uploadFileMutation.mutateAsync}
            logos={listLogosQuery.data ?? []}
          />
        </Box>
        <Button variant="contained" color="error" size="large" onClick={disableProjectThemeHandler}>
          <DeleteIcon />
          {t("settingsScreen.disableProjectTheme")}
        </Button>
      </>
    );
  };

  /**
   * Render project select field options
   */
  const renderProjectSelectFieldOptions = () => {
    if (!projects?.length) return <MenuItem value="">{""}</MenuItem>;

    return projects.map((project) => (
      <MenuItem key={project.id} value={project.id}>
        {project.name}
      </MenuItem>
    ));
  };

  /**
   * Render project select field
   */
  const renderProjectSelectField = () => {
    if (listProjectsQuery.isFetching) {
      <Skeleton sx={{ height: 72, width: "40%" }} />;
    }

    return (
      <TextField
        variant="outlined"
        value={selectedProjectId}
        label={t("settingsScreen.project")}
        select
        size="small"
        sx={{ marginTop: "1rem", marginBottom: "1rem", width: "40%" }}
        onChange={handleProjectSelection}
      >
        {renderProjectSelectFieldOptions()}
      </TextField>
    );
  };

  /**
   * Main component render
   */
  return (
    <FlexColumnLayout>
      <Toolbar disableGutters variant="dense">
        <Typography component="h1" variant="h5">
          {t("settingsScreen.title")}
        </Typography>
      </Toolbar>
      <Card sx={{ flex: 1, padding: "1rem", display: "flex", flexDirection: "column" }}>
        <Typography component="h2" variant="h6" gutterBottom>
          {t("settingsScreen.projectSpecificTheming")}
        </Typography>
        <Divider />
        <Box sx={{ py: 0.5, flex: 1, overflow: "auto" }}>
          <Stack alignItems="flex-start" gap={3}>
            {renderProjectSelectField()}
            {renderSettings()}
          </Stack>
        </Box>
      </Card>
    </FlexColumnLayout>
  );
}
