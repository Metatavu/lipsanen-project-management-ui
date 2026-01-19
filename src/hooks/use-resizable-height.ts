import { useCallback, useEffect, useState } from "react";

/**
 * Properties for the useResizableHeight hook
 */
type UseResizableHeightProps = {
  containerElement?: HTMLElement;
  initialHeight: number;
  handleOffset: number;
  minHeight: number;
};

/**
 * Hook for resizing an element's height with the mouse
 *
 * @param props hook properties
 * @param props.containerElement container element
 * @param props.initialHeight initial height of the element
 * @param props.handleOffset offset from the top of the element to the center of the drag handle
 * @param props.minHeight minimum height of the element
 */
export const useResizableHeight = ({
  containerElement = document.body,
  initialHeight,
  handleOffset,
  minHeight,
}: UseResizableHeightProps) => {
  const [height, setHeight] = useState(initialHeight);

  /**
   * Calculate the constrained height of the element
   */
  const constrainHeight = useCallback(
    (newHeight: number) => {
      return Math.min(containerElement.offsetHeight, Math.max(minHeight, newHeight));
    },
    [containerElement, minHeight],
  );

  useEffect(() => {
    setHeight(constrainHeight(height));
  }, [constrainHeight, height]);

  /**
   * Mouse down event handler
   */
  const onMouseDown = () => {
    document.addEventListener("mouseup", handleMouseUp, true);
    document.addEventListener("mousemove", handleMouseMove, true);
  };

  /**
   * Mouse up event handler
   */
  const handleMouseUp = () => {
    document.removeEventListener("mouseup", handleMouseUp, true);
    document.removeEventListener("mousemove", handleMouseMove, true);
  };

  /**
   * Mouse move event handler
   */
  const handleMouseMove = useCallback(
    (e: globalThis.MouseEvent) => {
      const newHeight = containerElement.offsetHeight - e.clientY + containerElement.offsetTop + handleOffset;
      setHeight(constrainHeight(newHeight));
    },
    [containerElement, handleOffset, constrainHeight],
  );

  return { height, onMouseDown };
};
