import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PreviewIcon from "@mui/icons-material/Preview";
import { Button, Card, Toolbar, Typography } from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { FlexColumnLayout } from "components/generic/flex-column-layout";
import { useListAttachmentsQuery, useListTasksQuery, useListUsersQuery } from "hooks/api-queries";
import { useApi } from "hooks/use-api";
import { DateTime } from "luxon";
import { useConfirmDialog } from "providers/confirm-dialog-provider";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getLastPartFromMimeType, handleError } from "utils";

/**
 * Project attachments route
 */
export const Route = createFileRoute("/projects/$projectId/attachments")({
  component: ProjectAttachmentsScreen,
});

/**
 * Project attachments screen component
 */
function ProjectAttachmentsScreen() {
  const { t } = useTranslation();
  const { projectId } = Route.useParams();
  const navigate = Route.useNavigate();
  const confirm = useConfirmDialog();
  const { attachmentsApi } = useApi();
  const queryClient = useQueryClient();

  const listProjectAttachmentsQuery = useListAttachmentsQuery({ projectId });
  const attachments = useMemo(() => listProjectAttachmentsQuery.data, [listProjectAttachmentsQuery.data]);

  const listProjectTasksQuery = useListTasksQuery({ projectId });
  const tasks = useMemo(() => listProjectTasksQuery.data, [listProjectTasksQuery.data]);

  const listProjectUsers = useListUsersQuery({ projectId });
  const { users } = useMemo(() => listProjectUsers.data, [listProjectUsers.data]) || {};

  const deleteAttachmentMutation = useMutation({
    mutationFn: (attachmentId: string) => attachmentsApi.deleteAttachment({ attachmentId }),
    onError: (error) => handleError(t("errorHandling.errorDeletingAttachment"), error),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments"] });
    },
  });

  /**
   * Main component render
   */
  return (
    <FlexColumnLayout>
      <Toolbar disableGutters sx={{ gap: 2 }}>
        <Typography component="h1" variant="h5" sx={{ mr: "auto" }}>
          {t("projectAttachmentsScreen.title")}
        </Typography>
        <Button startIcon={<AddIcon />} variant="contained" size="large" onClick={() => navigate({ to: "new" })}>
          {t("projectAttachmentsScreen.addNewAttachment")}
        </Button>
      </Toolbar>
      <Card sx={{ flex: 1, display: "flex" }}>
        <DataGrid
          loading={
            listProjectTasksQuery.isLoading || listProjectAttachmentsQuery.isLoading || listProjectUsers.isLoading
          }
          rows={attachments ?? []}
          columns={[
            { field: "name", headerName: t("projectAttachmentsScreen.name"), flex: 1 },
            {
              field: "type",
              headerName: t("projectAttachmentsScreen.fileType"),
              flex: 1,
              valueGetter: ({ row: { type } }) => getLastPartFromMimeType(type),
            },
            {
              field: "taskId",
              headerName: t("projectAttachmentsScreen.attachmentToTask"),
              flex: 1,
              valueGetter: ({ row: { taskId } }) => tasks?.find((task) => task.id === taskId)?.name ?? "-",
            },
            {
              field: "creatorId",
              headerName: t("projectAttachmentsScreen.creator"),
              flex: 1,
              valueGetter: (params) => {
                const user = users?.find((user) => user.id === params.row.metadata?.creatorId);
                return user ? `${user.firstName} ${user.lastName}` : "";
              },
            },
            {
              field: "createdAt",
              headerName: t("projectAttachmentsScreen.createdAt"),
              flex: 1,
              valueGetter: (params) => params.row.metadata?.createdAt,
              valueFormatter: ({ value }) =>
                value ? DateTime.fromJSDate(value).toLocaleString({ dateStyle: "short", timeStyle: "short" }) : "",
            },
            {
              field: "actions",
              type: "actions",
              getActions: (params) => [
                <GridActionsCellItem
                  icon={<PreviewIcon />}
                  label={t("projectAttachmentsScreen.preview")}
                  onClick={() => window.open(params.row.url, "_blank")}
                />,
                <GridActionsCellItem
                  icon={<DeleteIcon />}
                  label={t("generic.delete")}
                  onClick={() =>
                    confirm({
                      title: t("projectAttachmentsScreen.deleteAttachmentConfirmation.title"),
                      description: t("projectAttachmentsScreen.deleteAttachmentConfirmation.description", {
                        attachmentName: params.row.name,
                      }),
                      onConfirmClick: () => {
                        if (params.row.id) deleteAttachmentMutation.mutate(params.row.id);
                      },
                    })
                  }
                />,
              ],
            },
          ]}
          autoHeight
          disableColumnFilter
          disableColumnMenu
          disableColumnSelector
          disableDensitySelector
          disableRowSelectionOnClick
          sx={{ "& .MuiDataGrid-row": { cursor: "pointer" } }}
          onRowClick={({ row }) => navigate({ to: row.id })}
        />
      </Card>
      <Outlet />
    </FlexColumnLayout>
  );
}
