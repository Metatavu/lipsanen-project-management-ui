import React, { useState } from "react";
import { Popover, Button } from "@mui/material";
import { ChromePicker } from "react-color";
import CheckIcon from "@mui/icons-material/Check";
import { useTranslation } from "react-i18next";

/**
 * Component Props
 */
interface Props {
  color: string;
  optionalLabel?: string;
  onChange: (color: string) => void;
}

const PLACEHOLDER = "Placeholder"

/**
 * Color selector component
 *
 * @param props Props
 */
const ColorSelector = ({ color, optionalLabel, onChange }: Props) => {
  const { t } = useTranslation();
  const [currentColor, setCurrentColor] = useState(color);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  /**
   * Handles click event
   * 
   * @param event event
   */
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * Handles close event
   */
  const handleClose = () => {
    setAnchorEl(null);
  };

  /**
   * Handles color change event
   * 
   * @param newColor new color
   */
  const handleChangeComplete = (newColor: any) => {
    setCurrentColor(newColor.hex);
    onChange(newColor.hex);
  };

  /**
   * Renders selected color circle with tick
   */
  const renderSelectedColorCircleWithTick = () => {
    const size = 30;
    const factor = 0.7;
    const tickSize = size * factor;
    const offset = size * (1 - factor) / 2;
    
    return (
    <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
      <div
        style={{
          backgroundColor: currentColor,
          width: size,
          height: size,
          borderRadius: "50%",
          marginRight: "10px",
        }}
      />
      <CheckIcon
        style={{ color: "#fff", position: "absolute", width: tickSize, height: tickSize, left: offset, top: offset }}
      />
    </div>
    );
  };

  const open = Boolean(anchorEl);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {currentColor && renderSelectedColorCircleWithTick()}
        <div style={{ width: "80px" }}>
          {optionalLabel ? <div style={{ fontSize: 9}}>{`${optionalLabel}`}</div> : <div style={{ visibility: 'hidden' }}>{PLACEHOLDER}</div>}
        </div>
        <Button variant="contained" onClick={handleClick} style={{ width: "160px", height: "40px" }}>
          {t("colorSelector.otherColor")}
        </Button>
      </div>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <ChromePicker color={currentColor} onChangeComplete={handleChangeComplete} />
      </Popover>
    </div>
  );
};

export default ColorSelector;
