import { CircularProgress, TextField, TextFieldProps } from "@mui/material";

export type LoadingTextFieldProps = TextFieldProps & { loading?: boolean };

const LoadingTextField = ({ loading, value, InputProps, ...rest }: LoadingTextFieldProps) => {
  return (
    <TextField
      {...rest}
      value={loading ? "" : value}
      InputProps={{
        ...(InputProps ?? {}),
        startAdornment: loading ? (
          <CircularProgress
            size="1rem"
            sx={{ color: "rgba(0, 0, 0, 0.33)", marginTop: !rest.variant || rest.variant === "filled" ? 2 : 0 }}
          />
        ) : (
          InputProps?.startAdornment
        ),
      }}
    />
  );
};

export default LoadingTextField;
