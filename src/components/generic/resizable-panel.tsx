import DragHandleIcon from "@mui/icons-material/DragHandle";
import { Box, Divider } from "@mui/material";
import { useResizableHeight } from "hooks/use-resize-element";
import { ReactNode, useEffect, useMemo } from "react";
import { atomWithStorage } from "jotai/utils";
import { useAtom } from "jotai";

type Props = {
  containerRef?: React.RefObject<HTMLElement>;
  children?: ReactNode;
  toolbar?: ReactNode;
} & (
  | {
      id: string;
      storeLastPosition: true;
    }
  | {
      id?: never;
      storeLastPosition?: never;
    }
);

const useStoredHeightWithId = (storeLastPosition?: boolean, id?: string) => {
  if (!storeLastPosition || !id) return [undefined, undefined];
  const storedHeightAtom = useMemo(
    () => atomWithStorage(`resizable-panel-${id}`, 20, undefined, { getOnInit: true }),
    [id],
  );
  return useAtom(storedHeightAtom);
};

const ResizablePanel = ({ id, children, containerRef, storeLastPosition, toolbar = null }: Props) => {
  const [storedHeight, setStoredHeight] = useStoredHeightWithId(storeLastPosition, id);

  const { height, onMouseDown } = useResizableHeight({
    containerRef,
    initialHeight: storedHeight ?? 20,
    handleOffset: 10,
  });

  useEffect(() => {
    setStoredHeight?.(height);
  }, [height, setStoredHeight]);

  return (
    <>
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        height={height}
        bgcolor="background.paper"
        borderTop="2px solid rgba(0, 0, 0, .1)"
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
          <DragHandleIcon sx={{ color: (theme) => theme.palette.grey[500] }} />
        </Box>
        <Divider />
        {toolbar}
        {toolbar ? <Divider /> : null}
        <Box height={`${height - 1}px`} overflow="auto">
          {children}
        </Box>
      </Box>
    </>
  );
};

export default ResizablePanel;
