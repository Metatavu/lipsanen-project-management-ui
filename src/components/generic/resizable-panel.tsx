import DragHandleIcon from "@mui/icons-material/DragHandle";
import { Box, Divider } from "@mui/material";
import { useResizableHeight } from "hooks/use-resizable-height";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { type ReactNode, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";

const INITIAL_HEIGHT = 20;

/**
 *  Component properties
 */
type Props = {
  children?: ReactNode;
  storeKey?: string;
  reserveSpaceForHandle?: boolean;
};

/**
 * Hook for storing the height of a resizable panel in local storage
 *
 * @param storeId ID to store the last position to localstorage with
 */
const useStoredHeightWithId = (initialHeight: number, storeId?: string) => {
  if (!storeId) return [undefined, undefined];
  // biome-ignore lint/correctness/useHookAtTopLevel: Fixing this might cause unexpected behavior
  const storedHeightAtom = useMemo(
    () => atomWithStorage(`resizable-panel-${storeId}`, initialHeight, undefined, { getOnInit: true }),
    [storeId, initialHeight],
  );
  // biome-ignore lint/correctness/useHookAtTopLevel: Fixing this might cause unexpected behavior
  return useAtom(storedHeightAtom);
};

/**
 * Resizable panel component
 *
 * @param props component properties
 * @param props.id unique identifier for the resizable panel
 * @param props.children panel content
 * @param props.initialHeight initial height of the panel
 */
const ResizablePanel = ({ storeKey, children, reserveSpaceForHandle }: Props) => {
  const [storedHeight, setStoredHeight] = useStoredHeightWithId(INITIAL_HEIGHT, storeKey);

  const { height, onMouseDown } = useResizableHeight({
    initialHeight: storedHeight ?? INITIAL_HEIGHT,
    minHeight: INITIAL_HEIGHT,
    handleOffset: 10,
  });

  useEffect(() => setStoredHeight?.(height), [height, setStoredHeight]);

  /**
   * Main component render
   */
  return (
    <>
      {reserveSpaceForHandle && <Box height={20} />}
      {createPortal(
        <Box
          position="fixed"
          bottom={0}
          left={0}
          right={0}
          height={height}
          bgcolor="background.paper"
          // borderTop="2px solid rgba(0, 0, 0, .1)"
          boxShadow={10}
          zIndex={(theme) => theme.zIndex.drawer}
        >
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height={20}
            onMouseDown={onMouseDown}
            sx={{
              transition: "background-color .1s",
              cursor: "row-resize",
              "&:hover,&:active": {
                backgroundColor: "rgba(0, 0, 0, .025)",
              },
            }}
          >
            <DragHandleIcon sx={{ color: "grey.500" }} />
          </Box>
          <Divider />
          <Box height={`${height - 20 - 1}px`} overflow="auto" position="relative">
            {children}
          </Box>
        </Box>,
        document.body,
      )}
    </>
  );
};

export default ResizablePanel;
