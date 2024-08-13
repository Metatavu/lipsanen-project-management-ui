import { Box, LinearProgress, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { renderMdiIconifyIconWithBackground } from "components/generic/mdi-icon-with-background";
import ProgressBadge from "components/generic/progress-badge";
import { useListJobPositionsQuery } from "hooks/api-queries";
import { useTranslation } from "react-i18next";
import { theme } from "theme";
import TaskUtils from "utils/task";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import { User, Task } from "generated/client";

/**
 * Component props
 */
interface Props {
  user: User | null | undefined;
  tasks: Task[];
  loading: boolean;
}

const DEFAULT_USER_ICON = "account";

// TODO: Finalise tracking screen

/**
 * Task list component
 * renders a list of user tasks
 *
 * @param props component props
 */
const TaskList = ({ user, tasks, loading }: Props) => {
  const { t } = useTranslation();

  const listJobPositionsQuery = useListJobPositionsQuery();
  const jobPositions = listJobPositionsQuery.data?.jobPositions;

  if (!user) {
    return (
      <Box sx={{ padding: "1rem" }}>
        <LinearProgress />
      </Box>
    );
  }

  const renderTasksColumn = () => (
    <>
      <Typography component="h2" variant="h6" sx={{ padding: "1rem" }}>
        {t("trackingScreen.tasksList.title")}
      </Typography>
      <Box sx={{ padding: "1rem" }}>
        <DataGrid
          loading={loading || listJobPositionsQuery.isLoading}
          rows={tasks}
          columns={[
            {
              field: "assigneeIds",
              headerName: t("trackingScreen.tasksList.assignee"),
              flex: 1,
              renderCell: () => {
                // All the tasks in this list are assigned to the test user, so no need to check if the user is assigned to the task
                const jobPosition = jobPositions?.find((position) => user.jobPositionId === position.id);
                const iconName = jobPosition?.iconName ?? DEFAULT_USER_ICON;
                const iconColor = jobPosition?.color ?? theme.palette.primary.main;
                return (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {renderMdiIconifyIconWithBackground(iconName, iconColor)}
                    {user.firstName} {user.lastName}
                  </div>
                );
              },
            },
            {
              field: "name",
              headerName: t("trackingScreen.tasksList.task"),
              flex: 1,
              renderCell: (params) => (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <AssignmentOutlinedIcon sx={{ marginRight: "0.5rem" }} />
                  {params.value}
                </Box>
              ),
            },
            {
              field: "endDate",
              headerName: t("trackingScreen.tasksList.readyBy"),
              flex: 1,
              renderCell: (params) => new Date(params.value).toLocaleDateString().replace(/\//g, "."),
            },
            {
              field: "status",
              headerName: t("trackingScreen.tasksList.status"),
              flex: 1,
              renderCell: (params) => TaskUtils.renderStatusElement(params.value),
            },
            {
              field: "estimatedReadiness",
              headerName: t("trackingScreen.tasksList.readiness"),
              flex: 1,
              renderCell: (params) => <ProgressBadge progress={params.value ?? 0} customWidth="120px" />,
            },
          ]}
          disableRowSelectionOnClick
          hideFooter
          autoHeight
        />
      </Box>
    </>
  );

  return renderTasksColumn();
};

export default TaskList;