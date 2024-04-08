import { Box, Button, Card, Divider, MenuItem, Radio, TextField, Toolbar, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import { useEffect, useState } from "react";
import FileUploader from "components/generic/file-upload";
import { Color } from "types";
import { DEFAULT_THEME_COLORS } from "../constants";
import { MuiColorInput } from "mui-color-input";
import { useApi } from "../hooks/use-api";
import { useAtom } from "jotai";
import { projectsAtom } from "../atoms/projects";
import LoaderWrapper from "components/generic/loader-wrapper";

const SettingsIndexRoute = () => {
  const { t } = useTranslation();
  const { projectsApi } = useApi();
  const [projects, setProjects] = useAtom(projectsAtom);
  const [selectedColor, setSelectedColor] = useState<Color>();
  const [selectedLogo, setSelectedLogo] = useState("");
  const [openColorPicker, setOpenColorPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  //TODO: Set up construction of the url for the logo from cloudfront address

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

  useEffect(() => {
    getProjectsList();
    // TODO: This can contain the logos listing request also
  }, []);

  // TODO: Upload logo to s3
  const uploadFile = (file: File) => {
    // TODO: This should upload to the lambda and update the list of logos
  };

  /**
   * Handles custom color selection
   *
   * @param color string
   */
  const handleColorSelection = (color: string) => {
    setSelectedColor({ name: "Custom color", value: color });

    // TODO: This should update the project theme on API
  };

  /**
   * Renders color buttons
   */
  const renderColorsButtons = () =>
    DEFAULT_THEME_COLORS.map((color) => (
      // TODO: Needs styling for spacing
      <Box
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
        onClick={() => setSelectedColor(color)}
      >
        <Button
          key={color.name}
          variant="contained"
          sx={{
            backgroundColor: color.value,
            minWidth: 0,
            width: 0,
            height: "2rem",
            borderRadius: "50%, ",
            "&:hover": {
              backgroundColor: color,
            },
          }}
        >
          {selectedColor?.name === color.name && <CheckIcon />}
        </Button>
        <Typography>{color.name}</Typography>
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
          <Box sx={{ display: "flex", alignItems: "center" }} onClick={() => setSelectedLogo(logo)}>
            <Radio checked={selectedLogo === logo} />
            <Typography>{logo}</Typography>
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
          <TextField select>
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
            <Box sx={{ display: "flex", gap: "1rem" }}>
              {renderColorsButtons()}
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => setOpenColorPicker(!openColorPicker)}
              >
                {t("settingsScreen.otherColor")}
              </Button>
              {openColorPicker && <MuiColorInput value={selectedColor?.value ?? ""} onChange={handleColorSelection} />}
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
