import { Box, Typography } from "@mui/material";

/**
 * Component properties
 */
interface Props {
  progress: number;
  width?: string;
}

/**
 * Progress badge component
 *
 * @param props component properties
 */
const ProgressBadge = ({ progress, width = "80px" }: Props) => (
  <Box
    width={width}
    height="36px"
    overflow="hidden"
    border="1px solid #0000001A"
    borderRadius="999px"
    position="relative"
    display="flex"
    alignItems="center"
    justifyContent="center"
  >
    <Box
      position="absolute"
      top={0}
      left={0}
      width={`${Math.max(0, Math.min(100, progress))}%`}
      height="100%"
      bgcolor="#0079BF33"
    />
    <Typography fontSize={14} fontWeight="bold">{`${progress}%`}</Typography>
  </Box>
);

export default ProgressBadge;
