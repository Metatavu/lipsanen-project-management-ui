import { UseQueryResult } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export const useCachedMaxResultsFromQuery = <T extends UseQueryResult<{ maxResults: number }>>(query: T) => {
  const [maxResults, setMaxResults] = useState<number>();

  useEffect(() => {
    const { maxResults: updatedMaxResults } = query.data ?? {};
    if (updatedMaxResults !== undefined) setMaxResults(updatedMaxResults);
  }, [query.data]);

  return maxResults;
};
