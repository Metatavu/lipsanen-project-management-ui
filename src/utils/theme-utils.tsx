/**
 * Theme functions
 */
namespace ThemeUtils {
  /**
   * Darkens a hex color by a given amount
   *
   * @param rgb or rgba color
   * @param amount amount to darken the color by
   * @returns rgb or rgba string
   */
  export const darkenColor = (rgb: string, amount = 0.5) => {
    // Extract the RGB(A) values from the input string
    const rgbaValues = rgb.match(/\d+(\.\d+)?/g);

    if (!rgbaValues || (rgbaValues.length !== 3 && rgbaValues.length !== 4)) {
      return rgb;
    }

    // Parse the RGB values and optional alpha
    let [r, g, b] = rgbaValues.slice(0, 3).map(Number);
    const a = rgbaValues.length === 4 ? parseFloat(rgbaValues[3]) : 1;

    // Calculate the new RGB values by reducing each color component by the amount
    r = Math.round(r * (1 - amount));
    g = Math.round(g * (1 - amount));
    b = Math.round(b * (1 - amount));

    // Ensure the new RGB values are within the range [0, 255]
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    // Return the darkened color in RGB(A) format
    const newColor = a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;

    return newColor;
  };
}

export default ThemeUtils;
