import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Card, Toolbar, Typography } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridPaginationModel } from "@mui/x-data-grid";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { FlexColumnLayout } from "components/generic/flex-column-layout";
import { MdiIconifyIconWithBackground } from "components/generic/mdi-icon-with-background";
import NewJobPositionDialog from "components/positions/new-job-position-dialog";
import UserInfoDialog from "components/users/user-info-dialog";
import { DeleteJobPositionRequest, JobPosition } from "generated/client";
import { useListJobPositionsQuery, useListUsersQuery } from "hooks/api-queries";
import { useApi } from "hooks/use-api";
import { useCachedMaxResultsFromQuery } from "hooks/use-cached-max-results";
import { usePaginationToFirstAndMax } from "hooks/use-pagination-to-first-and-max";
import { useConfirmDialog } from "providers/confirm-dialog-provider";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSetError } from "utils/error-handling";

export const Route = createFileRoute("/positions")({ component: PositionsIndexRoute });

/**
 * Positions route component
 */
function PositionsIndexRoute() {
  const { t } = useTranslation();
  const setError = useSetError();
  const { jobPositionsApi } = useApi();
  const queryClient = useQueryClient();
  const showConfirmDialog = useConfirmDialog();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [first, max] = usePaginationToFirstAndMax(paginationModel);
  const [selectedJobPosition, setSelectedJobPosition] = useState<JobPosition>();

  const listAllUsersQuery = useListUsersQuery();
  const listPositionsQuery = useListJobPositionsQuery({ first, max });
  const maxResults = useCachedMaxResultsFromQuery(listPositionsQuery);

  const loading = listPositionsQuery.isFetching || listAllUsersQuery.isFetching;

  const users = useMemo(() => listAllUsersQuery.data?.users ?? [], [listAllUsersQuery.data]);
  const positions = useMemo(() => listPositionsQuery.data?.jobPositions ?? [], [listPositionsQuery.data]);

  /**
   * Returns number of users in a position
   *
   * @param positionId position id
   */
  const getNumberOfUsersInPosition = (positionId?: string) => {
    if (!positionId) return 0;
    return users.filter((user) => user.jobPositionId === positionId).length;
  };

  /**
   * Delete job position mutation
   */
  const deleteJobPositionMutation = useMutation({
    mutationFn: (params: DeleteJobPositionRequest) => jobPositionsApi.deleteJobPosition(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobPositions"] });
    },
    onError: (error) => setError(t("errorHandling.errorDeletingJobPosition"), error),
  });

  /**
   * Handles job position delete
   *
   * @param positionId position id
   */
  const handleJobPositionDelete = (positionId?: string) => {
    positionId && deleteJobPositionMutation.mutateAsync({ positionId: positionId });
  };

  /**
   * Render color circle for a job position
   *
   * @param color color string
   */
  const renderColorCircle = (color?: string) => {
    if (!color) return null;
    return <div style={{ width: 30, height: 30, borderRadius: "50%", backgroundColor: color }} />;
  };

  /**
   * Main component render
   */
  return (
    <FlexColumnLayout>
      <UserInfoDialog userId={selectedJobPosition?.id} handleClose={() => setSelectedJobPosition(undefined)} />
      <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
        <Typography component="h1" variant="h5">
          {t("positionsScreen.title")}
        </Typography>
        <Box sx={{ display: "flex", gap: "1rem" }}>
          <NewJobPositionDialog />
        </Box>
      </Toolbar>
      <Card sx={{ flex: 1, minWidth: 0 }}>
        <DataGrid
          sx={{ width: "100%", height: "100%" }}
          rows={positions}
          rowCount={maxResults}
          columns={[
            {
              field: "name",
              headerName: t("positions"),
              flex: 1,
              disableColumnMenu: true,
              renderCell: (params) => <div style={{ display: "flex", alignItems: "center" }}>{params.row.name}</div>,
            },
            {
              field: "icon",
              headerName: t("positionsScreen.icon"),
              flex: 1,
              disableColumnMenu: true,
              sortable: false,
              renderCell: (params) => (
                <MdiIconifyIconWithBackground iconName={params.row.iconName} backgroundColor={params.row.color} />
              ),
            },
            {
              field: "color",
              headerName: t("positionsScreen.color"),
              flex: 1,
              disableColumnMenu: true,
              sortable: false,
              renderCell: (params) => renderColorCircle(params.row.color),
            },
            {
              field: "usersCount",
              headerName: t("positionsScreen.users"),
              flex: 1,
              disableColumnMenu: true,
              valueGetter: (params) => getNumberOfUsersInPosition(params.row.id),
            },
            {
              field: "actions",
              type: "actions",
              getActions: (params) => [
                <GridActionsCellItem
                  label={t("generic.delete")}
                  icon={<DeleteIcon color="error" />}
                  showInMenu
                  onClick={() =>
                    showConfirmDialog({
                      title: t("positionsScreen.deleteTitle"),
                      description: t("positionsScreen.deleteDescription", { name: params.row.name }),
                      cancelButtonEnabled: true,
                      confirmButtonText: t("generic.delete"),
                      onConfirmClick: () => handleJobPositionDelete(params.row.id),
                    })
                  }
                />,
              ],
            },
          ]}
          loading={loading}
          disableRowSelectionOnClick
          paginationMode="server"
          pageSizeOptions={[10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </Card>
    </FlexColumnLayout>
  );
}
