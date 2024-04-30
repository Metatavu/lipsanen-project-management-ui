import Badge from "@mui/material/Badge";

/**
 * Component Props
 */
interface Props {
  progress: number;
}

/**
 * Progress badge component
 *
 * @param props component properties
 */
const ProgressBadge = ({ progress }: Props) => {
  const backgroundClipPath = `inset(0 ${100 - progress}% 0 0)`;

  return (
    <Badge
      color="default"
      overlap="circular"
      style={{
        position: "relative",
        borderRadius: "999px",
        width: "80px",
        height: "36px",
        border: "1px solid #0000001A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          borderRadius: "999px",
          backgroundColor: "#0079BF80",
          clipPath: backgroundClipPath,
        }}
      />
      <div style={{ zIndex: 1, fontWeight: 700 }}>{`${progress}%`}</div>
    </Badge>
  );
};

export default ProgressBadge;
