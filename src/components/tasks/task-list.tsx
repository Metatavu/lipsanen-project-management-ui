import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import { Box, LinearProgress, Stack } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import JobPositionAvatar from "components/generic/job-position-avatar";
import ProgressBadge from "components/generic/progress-badge";
import { JobPosition, Task, User } from "generated/client";
import { useListJobPositionsQuery, useListTasksQuery, useListUsersQuery } from "hooks/api-queries";
import { DateTime } from "luxon";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TasksSearchSchema } from "schemas/search";
import TaskUtils from "utils/task";

/**
 * Component properties
 */
interface Props {
  projectId: string;
  filters?: TasksSearchSchema;
  user?: User | null;
  onTaskClick?: (task: Task) => void;
}

/**
 * Task list component
 * renders a list of tasks
 *
 * @param props component properties
 */
const TaskList = ({ user, projectId, onTaskClick, filters }: Props) => {
  const { t } = useTranslation();

  const listTasksQuery = useListTasksQuery({ projectId, milestoneId: filters?.milestoneId });
  const allTasks = useMemo(() => listTasksQuery.data ?? [], [listTasksQuery.data]);
  const tasks = user ? allTasks.filter((task) => task.assigneeIds?.includes(user.id as string)) : allTasks;

  const listUsersQuery = useListUsersQuery({ projectId });
  const users = useMemo(() => listUsersQuery.data?.users ?? [], [listUsersQuery.data]);

  const listJobPositionsQuery = useListJobPositionsQuery();
  const jobPositions = useMemo(() => listJobPositionsQuery.data?.jobPositions ?? [], [listJobPositionsQuery.data]);

  if (listTasksQuery.isFetching || listUsersQuery.isFetching || listJobPositionsQuery.isFetching) {
    return <LinearProgress />;
  }

  /**
   * Get assignee and job position for a task
   *
   * @param task task
   * @returns assignee and job position in array
   */
  const getAssigneeAndJobPositionForTask = (
    task: Task,
  ): [assignee: User | undefined, jobPosition: JobPosition | undefined] => {
    const taskAssignee = user
      ? users.find((u) => user.id === u.id)
      : users.find((u) => task.assigneeIds?.at(0) === u.id);
    const jobPosition = jobPositions.find((position) => taskAssignee?.jobPositionId === position.id);
    return [taskAssignee, jobPosition];
  };

  return (
    <DataGrid
      rows={tasks}
      onRowClick={(params) => params.row && onTaskClick?.(params.row as Task)}
      sx={{ flex: 1 }}
      disableColumnFilter
      disableColumnMenu
      disableColumnSelector
      disableDensitySelector
      columns={[
        {
          field: "assignee",
          headerName: t("trackingScreen.tasksList.assignee"),
          flex: 1,
          valueGetter: (params) => getAssigneeAndJobPositionForTask(params.row),
          sortable: false,
          renderCell: (params) => {
            const [taskAssignee, jobPosition] = params.value as [User | undefined, JobPosition | undefined];

            return (
              <Stack direction="row" alignItems="center" gap={1}>
                <JobPositionAvatar jobPosition={jobPosition} />
                {taskAssignee?.firstName ?? ""} {taskAssignee?.lastName ?? ""}
              </Stack>
            );
          },
        },
        {
          field: "name",
          headerName: t("trackingScreen.tasksList.task"),
          flex: 1,
          sortable: false,
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
          sortable: false,
          renderCell: (params) => DateTime.fromJSDate(params.value).toLocaleString(DateTime.DATE_SHORT),
        },
        {
          field: "status",
          headerName: t("trackingScreen.tasksList.status"),
          flex: 1,
          sortable: false,
          renderCell: (params) => TaskUtils.renderStatusElement(params.value),
        },
        {
          field: "estimatedReadiness",
          headerName: t("trackingScreen.tasksList.readiness"),
          flex: 1,
          sortable: false,
          renderCell: (params) => <ProgressBadge progress={params.value ?? 0} customWidth="120px" />,
        },
      ]}
      disableRowSelectionOnClick
      hideFooter
    />
  );
};

export default TaskList;
