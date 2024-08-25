import { useCallback, useEffect, useState } from "react";

type UseResizeElementHeightWithMouseProps = {
  containerRef?: React.RefObject<HTMLElement>;
  initialHeight?: number;
  handleOffset?: number;
};

export const useResizableHeight = ({
  containerRef,
  initialHeight = 0,
  handleOffset = 0,
}: UseResizeElementHeightWithMouseProps | undefined = {}) => {
  const [height, setHeight] = useState(initialHeight);

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

  const onMouseDown = () => {
    document.addEventListener("mouseup", handleMouseUp, true);
    document.addEventListener("mousemove", handleMouseMove, true);
  };

  const handleMouseUp = () => {
    document.removeEventListener("mouseup", handleMouseUp, true);
    document.removeEventListener("mousemove", handleMouseMove, true);
  };

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
