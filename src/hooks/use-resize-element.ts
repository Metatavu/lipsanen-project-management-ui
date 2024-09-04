import { useCallback, useEffect, useState } from "react";

/**
 * Properties for the useResizableHeight hook
 */
type UseResizeElementHeightWithMouseProps = {
  containerRef?: React.RefObject<HTMLElement>;
  initialHeight?: number;
  handleOffset?: number;
};

/**
 * Hook for resizing an element's height with the mouse
 *
 * @param props hook properties
 * @param props.containerRef reference to the container element
 * @param props.initialHeight initial height of the element
 * @param props.handleOffset offset from the top of the element to the center of the drag handle
 */
export const useResizableHeight = ({
  containerRef,
  initialHeight = 0,
  handleOffset = 0,
}: UseResizeElementHeightWithMouseProps | undefined = {}) => {
  const [height, setHeight] = useState(initialHeight);

  /**
   * Calculate the constrained height of the element
   */
  const constrainHeight = useCallback(
    (newHeight: number) => {
      const containerElement = containerRef?.current || document.body;
      return Math.min(containerElement.offsetHeight, Math.max(handleOffset * 2, newHeight));
    },
    [containerRef?.current, handleOffset],
  );

  useEffect(() => {
    if (!containerRef?.current) return;
    setHeight(constrainHeight(height));
  }, [containerRef?.current, constrainHeight, height]);

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
      const containerElement = containerRef?.current || document.body;
      const newHeight = containerElement.offsetHeight - e.clientY + containerElement.offsetTop + handleOffset;
      setHeight(constrainHeight(newHeight));
    },
    [containerRef, handleOffset, constrainHeight],
  );

  return { height, onMouseDown };
};
