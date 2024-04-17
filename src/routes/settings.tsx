import { Box, Button, Card, Divider, MenuItem, Radio, Stack, TextField, Toolbar, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import FileUploader from "components/generic/file-upload";
import { DEFAULT_LOGO, DEFAULT_THEME_COLORS } from "../constants";
import { MuiColorInput } from "mui-color-input";
import { useApi } from "../hooks/use-api";
import LoaderWrapper from "components/generic/loader-wrapper";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateProjectThemeRequest, ProjectTheme, UpdateProjectThemeRequest } from "generated/client";
import { logQueryError } from "utils";
import { filesApi } from "api/files";
import { FlexColumnLayout } from "components/generic/flex-column-layout";

export const Route = createFileRoute("/settings")({ component: SettingsIndexRoute });

function SettingsIndexRoute() {
  const { t } = useTranslation();
  const { projectsApi, ProjectThemesApi: projectThemesApi } = useApi();
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedColorInput, setSelectedColor] = useState("");
  const [selectedLogoInput, setSelectedLogo] = useState("");
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const debounceTimeoutRef = useRef<number | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const savedProjectId = localStorage.getItem("selectedProjectId");
    if (savedProjectId) setSelectedProjectId(savedProjectId);
  }, []);

  const listProjectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsApi.listProjects().catch(logQueryError(t("errorHandling.errorListingProjects"))),
  });

  const listLogosQuery = useQuery({
    queryKey: ["files"],
    queryFn: () => filesApi.listFiles().catch(logQueryError(t("errorHandling.errorListingLogos"))),
  });

  const getProjectThemeQuery = useQuery({
    queryKey: ["projectThemes", selectedProjectId],
    queryFn: () =>
      projectThemesApi
        .listProjectThemes({ projectId: selectedProjectId })
        .then((themes) => {
          for (const theme of themes.slice(1)) {
            theme.id &&
              projectThemesApi.deleteProjectTheme({
                projectId: selectedProjectId,
                themeId: theme.id,
              });
          }

          return themes.at(0) ?? { logoUrl: DEFAULT_LOGO, themeColor: DEFAULT_THEME_COLORS[0].value };
        })
        .catch(logQueryError(t("errorHandling.errorListingProjectThemes"))),
    enabled: listProjectsQuery.isSuccess && !!selectedProjectId.length,
  });

  useEffect(() => {
    if (getProjectThemeQuery.data) applyProjectThemeSettings(getProjectThemeQuery.data);
  }, [getProjectThemeQuery.data]);

  const createProjectThemeMutation = useMutation({
    mutationFn: (requestParams: CreateProjectThemeRequest) => projectThemesApi.createProjectTheme(requestParams),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projectThemes"] }),
    onError: (error) => console.error(t("errorHandling.errorCreatingProjectTheme"), error),
  });

  const updateProjectThemeMutation = useMutation({
    mutationFn: (requestParams: UpdateProjectThemeRequest) => projectThemesApi.updateProjectTheme(requestParams),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projectThemes"] }),
    onError: (error) => console.error(t("errorHandling.errorUpdatingProjectTheme"), error),
  });

  const uploadFileMutation = useMutation({
    mutationFn: (file: File) => filesApi.uploadFile(file),
    onSuccess: async (fileName) => {
      handleLogoSelection(fileName);
      await queryClient.invalidateQueries({ queryKey: ["logos"] });
      await queryClient.invalidateQueries({ queryKey: ["projectThemes"] });
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
    if (!getProjectThemeQuery.data) return;

    const updatedTheme: ProjectTheme = { ...getProjectThemeQuery.data };
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
    if (!selectedProjectId) return null;

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

  const renderSelectProjectOptions = () => {
    if (!listProjectsQuery.data?.length) {
      return <MenuItem value="">{""}</MenuItem>;
    }

    return listProjectsQuery.data.map((project) => (
      <MenuItem key={project.id} value={project.id}>
        {project.name}
      </MenuItem>
    ));
  };

  return (
    <LoaderWrapper loading={listProjectsQuery.isPending}>
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
              <TextField
                value={selectedProjectId}
                label={t("settingsScreen.project")}
                select
                size="small"
                sx={{ marginTop: "1rem", marginBottom: "1rem", width: "40%" }}
                onChange={handleProjectSelection}
              >
                {renderSelectProjectOptions()}
              </TextField>
              {renderSettings()}
            </Stack>
          </Box>
        </Card>
      </FlexColumnLayout>
    </LoaderWrapper>
  );
}
