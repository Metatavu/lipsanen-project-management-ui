import { GridPaginationModel } from "@mui/x-data-grid";
import { useMemo } from "react";

export const usePaginationToFirstAndMax = (pagination: GridPaginationModel): [first: number, max: number] => {
  const [first, max] = useMemo(() => {
    const first = pagination.page * pagination.pageSize;
    const max = pagination.pageSize;
    return [first, max];
  }, [pagination]);

  return [first, max];
};
