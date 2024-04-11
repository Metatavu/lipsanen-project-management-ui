import { Box, Button, Card, Divider, MenuItem, Radio, TextField, Toolbar, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import FileUploader from "components/generic/file-upload";
import { DEFAULT_THEME_COLORS } from "../constants";
import { MuiColorInput } from "mui-color-input";
import { useApi } from "../hooks/use-api";
import { useAtom } from "jotai";
import { projectsAtom } from "../atoms/projects";
import LoaderWrapper from "components/generic/loader-wrapper";
import config from "../app/config";
import { ProjectTheme } from "generated/client";

const SettingsIndexRoute = () => {
  const { t } = useTranslation();
  const { projectsApi, ProjectThemesApi } = useApi();
  const [projects, setProjects] = useAtom(projectsAtom);
  // TODO: Maybe default value for selectedProject should come from the user settings in future?
  const [selectedProject, setSelectedProject] = useState("");
  const [projectThemes, setProjectThemes] = useState<ProjectTheme[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [selectedLogo, setSelectedLogo] = useState<string | undefined>(undefined);
  const [openColorPicker, setOpenColorPicker] = useState(false);
  const debounceTimeoutRef = useRef<number | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Get projects list
   */
  const getProjectsList = async () => {
    if (projects.length) return;

    setLoading(true);
    try {
      const projects = await projectsApi.listProjects();
      setProjects(projects);
    } catch (error) {
      console.error(t("errorHandling.errorListingProjects"), error);
    }
    setLoading(false);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: Dependencies not needed
  useEffect(() => {
    getProjectsList();
    // TODO: This can contain the logos listing request also
  }, []);

  /**
   * Get project themes list
   */
  const getProjectThemesList = async (selectedProject: string) => {
    const selectedProjectId = projects.find((project) => project.id === selectedProject)?.id;

    if (!selectedProjectId) return;

    setLoading(true);
    try {
      const projectThemes = await ProjectThemesApi.listProjectThemes({ projectId: selectedProjectId });
      setProjectThemes(projectThemes);
    } catch (error) {
      console.error(t("errorHandling.errorListingProjectThemes"), error);
    }
    setLoading(false);
  };

  useEffect(() => {
    getProjectThemesList(selectedProject);
  }, [selectedProject]);

  useEffect(() => {
    applyProjectThemeSettings();
  }, [projectThemes]);

  /**
   * Create project theme
   *
   * @param selectedProject string
   * @param selectedColor string
   * @param selectedLogo string url
   */
  const createProjectTheme = async (selectedProject: string, selectedColor?: string, selectedLogo?: string) => {
    const selectedProjectId = projects.find((project) => project.id === selectedProject)?.id;

    if (!selectedProjectId) return;

    setLoading(true);
    try {
      const createdTheme = await ProjectThemesApi.createProjectTheme({
        projectId: selectedProjectId,
        projectTheme: {
          themeColor: selectedColor ?? DEFAULT_THEME_COLORS[0].value,
          logoUrl: selectedLogo ?? "placeholder-url",
        },
      });
      setProjectThemes([createdTheme]);
    } catch (e) {
      console.error(t("errorHandling.errorCreatingProjectTheme"), e);
    }
    setLoading(false);
  };

  /**
   * Update project theme
   *
   * @param selectedProject string
   * @param selectedColor string
   * @param selectedLogo string url
   */
  const updateProjectTheme = async (selectedProject: string, selectedColor?: string, selectedLogo?: string) => {
    const selectedProjectId = projects.find((project) => project.id === selectedProject)?.id;

    if (!selectedProjectId || !projectThemes[0]?.id) return;

    setLoading(true);
    try {
      const updatedTheme = await ProjectThemesApi.updateProjectTheme({
        themeId: projectThemes[0].id,
        projectId: selectedProjectId,
        projectTheme: {
          themeColor: selectedColor ?? projectThemes[0].themeColor,
          logoUrl: selectedLogo ?? projectThemes[0].logoUrl,
        },
      });
      setProjectThemes([updatedTheme]);
    } catch (e) {
      console.error(t("errorHandling.errorUpdatingProjectTheme"), e);
    }
    setLoading(false);
  };

  /**
   * Applies the project theme settings to settings configuration
   */
  const applyProjectThemeSettings = () => {
    const colorToUpdate = projectThemes[0]?.themeColor ?? DEFAULT_THEME_COLORS[0].value;
    setSelectedColor(colorToUpdate);
    const isCustomColor = !DEFAULT_THEME_COLORS.some((color) => color.value === colorToUpdate);

    if (isCustomColor) {
      setOpenColorPicker(true);
    } else {
      setOpenColorPicker(false);
    }
  };

  // TODO: Upload logo to s3
  const uploadFile = (file: File) => {
    // TODO: This should upload to the lambda and update the list of logos
  };

  /**
   * Project theme change handler
   */
  const handleProjectThemeChange = (color?: string) => {
    if (!selectedProject) {
      setSelectedColor(color);
      // TODO: Set selected logo here also
      return;
    }

    if (projectThemes.length) {
      updateProjectTheme(selectedProject, color, selectedLogo);
    } else {
      createProjectTheme(selectedProject, color, selectedLogo);
    }
  };

  /**
   * Handles color selection
   *
   * @param color string
   */
  const handleColorSelection = (color: string) => {
    handleProjectThemeChange(color);
  };

  // TODO: Need to check the UI experience with this debounce for the custom color selection
  /**
   * Handles custom color selection
   *
   * @param color string
   */
  const handleCustomColorSelection = (color: string) => {
    setSelectedColor(color);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      handleProjectThemeChange(color);
    }, 5000);
  };

  /**
   * Handles project selection
   *
   * @param event event
   */
  const handleProjectSelection = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    setSelectedProject(value);
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
          alignSelf: "flex-start",
          alignItems: "center",
          textAlign: "center",
          width: "10%",
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
            borderRadius: "50%, ",
            "&:hover": {
              backgroundColor: color,
            },
          }}
        >
          {selectedColor === color.value && <CheckIcon />}
        </Button>
        <Typography sx={{ mt: 1, maxWidth: "6rem", overflowWrap: "break-word" }}>{color.name}</Typography>
      </Box>
    ));

  // TODO: Logos will come from the lambda
  /**
   * Renders logo radio buttons
   */
  const renderLogoRadioButtons = () => {
    const tempLogos = ["logo 1", "logo 2", "logo 3"];

    return (
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {tempLogos.map((logo) => (
          // TODO: Add a key
          <Box sx={{ display: "flex", alignItems: "center" }} onClick={() => setSelectedLogo(logo)}>
            <Radio checked={selectedLogo === logo} />
            <Typography>{logo}</Typography>
            {/* <img src={`${config.cdnBaseUrl}/${logo}`} alt={logo} /> */}
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <LoaderWrapper loading={loading}>
      <div style={{ padding: "1rem" }}>
        <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
          <Typography component="h1" variant="h5">
            {t("settingsScreen.title")}
          </Typography>
        </Toolbar>
        <Card sx={{ display: "flex", flexDirection: "column", padding: "1rem", gap: "1rem" }}>
          <Typography component="h2" variant="h6" gutterBottom>
            {t("settingsScreen.projectSpecificTheming")}
          </Typography>
          <Divider />
          <TextField
            value={selectedProject}
            label={t("settingsScreen.project")}
            select
            size="small"
            sx={{ marginTop: "1rem", marginBottom: "1rem", width: "40%" }}
            onChange={handleProjectSelection}
          >
            {projects.map((project) => {
              return (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              );
            })}
          </TextField>
          <Box sx={{ display: "flex", gap: "1rem", flexDirection: "column" }}>
            <Typography component="h3" variant="h6">
              {t("settingsScreen.themeMainColor")}
            </Typography>
            <Box sx={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              {renderColorsButtons()}
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => setOpenColorPicker(!openColorPicker)}
                sx={{ padding: "1.2rem", alignSelf: "flex-start" }}
              >
                {t("settingsScreen.otherColor")}
              </Button>
              {openColorPicker && (
                <MuiColorInput
                  value={selectedColor ?? ""}
                  onChange={handleCustomColorSelection}
                  sx={{ width: "200px", alignSelf: "flex-start", margin: 0 }}
                />
              )}
            </Box>
          </Box>
          <Box>
            <Typography component="h3" variant="h6">
              {t("settingsScreen.logo")}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "row", gap: "5rem" }}>
              {renderLogoRadioButtons()}
              <FileUploader allowedFileTypes={[".png", ".svg"]} uploadLoading={false} uploadFile={uploadFile} />
            </Box>
          </Box>
          <Box>
            <Button variant="contained" color="error" size="large">
              <DeleteIcon />
              {t("settingsScreen.disableProjectTheme")}
            </Button>
          </Box>
        </Card>
      </div>
    </LoaderWrapper>
  );
};

export const Route = createFileRoute("/settings")({ component: SettingsIndexRoute });
