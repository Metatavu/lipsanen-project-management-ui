import { Box, Slider } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ViewMode } from "../../../lipsanen-project-management-gantt-chart/src/types/public-types";

const sliderViewModes = [ViewMode.Month, ViewMode.Week, ViewMode.Day];

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
   * View modes for the slider
   */

  /**
   * Handles the view mode change
   *
   * @param event event
   * @param newValue new value
   */
  const handleViewModeChange = (_event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") onViewModeChange(sliderViewModes[newValue]);
  };

  /**
   * Main component render
   */
  return (
    <Box width={160} px={2}>
      <Slider
        defaultValue={sliderViewModes.indexOf(viewMode)}
        aria-labelledby="view-mode-slider"
        valueLabelDisplay="off"
        marks={[
          { value: 0, label: t("scheduleScreen.labelMonth") },
          { value: 1, label: t("scheduleScreen.labelWeek") },
          { value: 2, label: t("scheduleScreen.labelDay") },
        ]}
        step={1}
        min={0}
        max={2}
        slotProps={{
          root: { style: { marginBottom: 16, marginTop: 8 } },
          markLabel: { style: { fontSize: 14, top: 24 } },
        }}
        onChange={handleViewModeChange}
      />
    </Box>
  );
};

export default GanttViewModesSlider;
