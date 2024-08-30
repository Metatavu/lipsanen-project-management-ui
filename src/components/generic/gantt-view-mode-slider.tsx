import { Slider, Box } from "@mui/material";
import { ViewMode } from "../../../lipsanen-project-management-gantt-chart/src/types/public-types";
import { useTranslation } from "react-i18next";

/**
 * Component properties
 */
interface Props {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

/**
 * Gantt view modes selector slider component
 */
const GanttViewModesSlider = ({ viewMode, onViewModeChange }: Props) => {
  const { t } = useTranslation();

  /**
   * Marks for the slider
   */
  const sliderMarks = [
    { value: 0, label: t("scheduleScreen.labelMonth") },
    { value: 1, label: t("scheduleScreen.labelWeek") },
    { value: 2, label: t("scheduleScreen.labelDay") },
  ];

  /**
   * View modes for the slider
   */
  const sliderViewModes = [ViewMode.Month, ViewMode.Week, ViewMode.Day];

  /**
   * Handles the view mode change
   *
   * @param event event
   * @param newValue new value
   */
  const handleViewModeChange = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      onViewModeChange(sliderViewModes[newValue]);
    }
  };

  /**
   * Main component render
   */
  return (
    <Box sx={{ width: "120px", marginInline: "2rem", marginTop: "1rem" }}>
      <Slider
        defaultValue={sliderViewModes.indexOf(viewMode)}
        aria-labelledby="view-mode-slider"
        valueLabelDisplay="off"
        step={1}
        marks={sliderMarks}
        min={0}
        max={2}
        onChange={handleViewModeChange}
      />
    </Box>
  );
};

export default GanttViewModesSlider;