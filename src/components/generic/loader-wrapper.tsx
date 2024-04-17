import { Backdrop, CircularProgress } from "@mui/material";

/**
 * Components properties
 */
interface Props {
  loading: boolean;
  children: React.ReactNode;
}

/**
 * Loader wrapper component
 */
const LoaderWrapper = ({ loading, children }: Props) => (
  <>
    {children}
    {loading ? (
      <Backdrop sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color="primary" />
      </Backdrop>
    ) : null}
  </>
);

export default LoaderWrapper;
