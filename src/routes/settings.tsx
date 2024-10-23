import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
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
  useTheme,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { filesApi } from "api/files";
import FileUploader from "components/generic/file-upload";
import { FlexColumnLayout } from "components/generic/flex-column-layout";
import { DEFAULT_LOGO } from "consts";
import { CreateProjectThemeRequest, ProjectTheme, UpdateProjectThemeRequest } from "generated/client";
import { useListFilesQuery, useListProjectThemesQuery, useListProjectsQuery } from "hooks/api-queries";
import { useApi } from "hooks/use-api";
import { MuiColorInput } from "mui-color-input";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const LOGOS_UPLOAD_PATH = "logos";

/**
 * Settings file route
 */
export const Route = createFileRoute("/settings")({ component: SettingsIndexRoute });

/**
 * Setting index route component
 */
function SettingsIndexRoute() {
  const { t } = useTranslation();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { projectThemesApi } = useApi();
  const listProjectsQuery = useListProjectsQuery();
  const listLogosQuery = useListFilesQuery(LOGOS_UPLOAD_PATH);

  const projects = listProjectsQuery.data?.projects;

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedColorInput, setSelectedColor] = useState("");
  const [selectedLogoInput, setSelectedLogo] = useState("");
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const themeColorDefaultOptions = useMemo(
    () => [
      { name: "Lipsanen Lipa-Betoni Oy", value: theme.palette.companyDefault.lipsanenLipaBetoniOy },
      { name: "Rakennus Ahola", value: theme.palette.companyDefault.rakennusAhola },
      { name: "Moduls", value: theme.palette.companyDefault.moduls },
      { name: "HB-Porras", value: theme.palette.companyDefault.hbPorras },
    ],
    [theme],
  );

  useEffect(() => {
    const savedProjectId = localStorage.getItem("selectedProjectId");
    if (savedProjectId) setSelectedProjectId(savedProjectId);
  }, []);

  const listProjectThemesQuery = useListProjectThemesQuery(selectedProjectId);

  const projectTheme = useMemo(
    () =>
      listProjectThemesQuery.data
        ? listProjectThemesQuery.data.at(0) ?? { themeColor: themeColorDefaultOptions[0].value, logoUrl: DEFAULT_LOGO }
        : null,
    [themeColorDefaultOptions[0].value, listProjectThemesQuery.data],
  );

  useEffect(() => {
    if (projectTheme) applyProjectThemeSettings(projectTheme);
  }, [projectTheme]);

  /**
   * Create project theme mutation
   */
  const createProjectThemeMutation = useMutation({
    mutationFn: (params: CreateProjectThemeRequest) => projectThemesApi.createProjectTheme(params),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects", selectedProjectId, "themes"] }),
    onError: (error) => console.error(t("errorHandling.errorCreatingProjectTheme"), error),
  });

  /**
   * Update project theme mutation
   */
  const updateProjectThemeMutation = useMutation({
    mutationFn: (params: UpdateProjectThemeRequest) => projectThemesApi.updateProjectTheme(params),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects", selectedProjectId, "themes"] }),
    onError: (error) => console.error(t("errorHandling.errorUpdatingProjectTheme"), error),
  });

  /**
   * Upload logo mutation
   */
  const uploadLogoMutation = useMutation({
    mutationFn: (file: File) => filesApi.uploadFile(file, LOGOS_UPLOAD_PATH),
    onSuccess: async (fileName) => {
      handleLogoSelection(fileName);
      await queryClient.invalidateQueries({ queryKey: ["files"] });
      await queryClient.invalidateQueries({ queryKey: ["projects", selectedProjectId, "projectThemes"] });
    },
    onError: (error) => console.error(t("errorHandling.errorUploadingLogo"), error),
  });

  /**
   * Applies the project theme settings to settings configuration
   */
  const applyProjectThemeSettings = (theme: ProjectTheme) => {
    setSelectedColor(theme.themeColor);
    setSelectedLogo(theme.logoUrl);

    const isCustomColor = themeColorDefaultOptions.every((color) => color.value !== theme.themeColor);
    setColorPickerOpen(isCustomColor);
  };

  /**
   * Disable project theme handler
   */
  const disableProjectThemeHandler = () =>
    handleProjectThemeChange({
      themeColor: themeColorDefaultOptions[0].value,
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
    themeColorDefaultOptions.map((color) => (
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
            uploadFile={uploadLogoMutation.mutateAsync}
            existingFiles={listLogosQuery.data ?? []}
            existingFilesPath={LOGOS_UPLOAD_PATH}
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
