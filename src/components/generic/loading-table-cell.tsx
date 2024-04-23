import { Skeleton, TableCell, TableCellProps } from "@mui/material";

export type LoadingTableCellProps = TableCellProps & { loading?: boolean };

const LoadingTableCell = ({ loading, ...props }: LoadingTableCellProps) =>
  loading ? (
    <TableCell>
      <Skeleton />
    </TableCell>
  ) : (
    <TableCell {...props} />
  );

export default LoadingTableCell;
