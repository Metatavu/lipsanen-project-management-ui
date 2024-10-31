import { Box, Grid, LinearProgress, MenuItem, TextField, Typography } from "@mui/material";
import { DataGrid, GridRenderCellParams } from "@mui/x-data-grid";
import { ChangeProposal, JobPosition, Task, User } from "generated/client";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChangeProposalScope, DelaysByReason, DelaysByRole, DelaysByTask } from "types";

/**
 * Component props
 */
interface Props {
  users: User[];
  tasks: Task[];
  changeProposals: ChangeProposal[];
  jobPositions: JobPosition[];
  loading: boolean;
}

/**
 * Delays component
 * renders a list of delays and 3 different scopes
 *
 * @param props component props
 */
const DelaysList = ({ users, tasks, changeProposals, jobPositions, loading }: Props) => {
  const { t } = useTranslation();
  const [changeProposalScope, setChangeProposalScope] = useState<ChangeProposalScope>(ChangeProposalScope.TASK);

  /**
   * Delays by task row data
   */
  const delaysByTaskRowData: DelaysByTask[] = useMemo(() => {
    const taskMap = new Map<string, DelaysByTask>();

    for (const delay of changeProposals.filter((delay) => delay.status === "PENDING")) {
      if (!delay.id || !delay.metadata || !delay.endDate) continue;

      if (!taskMap.has(delay.id)) {
        taskMap.set(delay.id, {
          id: delay.id,
          taskId: delay.taskId,
          metadata: delay.metadata,
          reason: delay.reason,
          endDate: delay.endDate,
        });
      }
    }

    return Array.from(taskMap.values());
  }, [changeProposals]);

  /**
   * Delays by role row data
   */
  const delaysByRoleRowData: DelaysByRole[] = useMemo(() => {
    const positionMap = new Map<string, DelaysByRole>();

    for (const task of tasks) {
      const taskPosition = jobPositions.find((position) => position.id === task.jobPositionId);
      if (!taskPosition || !taskPosition.id || !taskPosition.name || !task.id) continue;

      if (!positionMap.has(taskPosition.id)) {
        positionMap.set(taskPosition.id, {
          id: taskPosition.id,
          positionName: taskPosition.name,
          taskIds: [],
          delayedTasksNumber: 0,
          delayedTasksPercentage: 0,
          totalTasksDuration: 0,
          totalDelayDuration: 0,
        });
      }

      const positionEntry = positionMap.get(taskPosition.id);
      if (!positionEntry) continue;

      positionEntry.taskIds.push(task.id);

      const taskDelays = changeProposals.filter((delay) => delay.taskId === task.id);
      const pendingTaskDelays = taskDelays.filter((delay) => delay.status === "PENDING");

      // Increment delayedTasks count
      if (taskDelays.length > 0) {
        positionEntry.delayedTasksNumber += 1;
      }

      // Calculate total task duration
      if (task.endDate && task.startDate) {
        const taskEndDate = new Date(task.endDate).getTime();
        const taskStartDate = new Date(task.startDate).getTime();
        const taskDuration = (taskEndDate - taskStartDate) / (1000 * 60 * 60 * 24);
        positionEntry.totalTasksDuration += taskDuration;
      }

      // Calculate total delay duration
      const totalDelayDuration = pendingTaskDelays.reduce((acc, delay) => {
        const delayEndDate = delay.endDate ? new Date(delay.endDate).getTime() : 0;
        const taskEndDate = task.endDate ? new Date(task.endDate).getTime() : 0;
        return acc + (delayEndDate - taskEndDate) / (1000 * 60 * 60 * 24);
      }, 0);

      positionEntry.totalDelayDuration += totalDelayDuration;

      positionEntry.delayedTasksPercentage = (positionEntry.delayedTasksNumber / positionEntry.taskIds.length) * 100;
      positionMap.set(taskPosition.id, positionEntry);
    }

    return Array.from(positionMap.values());
  }, [changeProposals, tasks, jobPositions]);

  /**
   * Delays by reason row data
   */
  const delaysByReasonRowData: DelaysByReason[] = useMemo(() => {
    const reasonMap = new Map<string, DelaysByReason>();

    for (const delay of changeProposals) {
      if (!reasonMap.has(delay.reason)) {
        reasonMap.set(delay.reason, {
          id: delay.reason,
          reasonText: delay.reason,
          taskIds: [],
          totalTasksDuration: 0,
          totalDelayDuration: 0,
        });
      }

      const reasonEntry = reasonMap.get(delay.reason);
      if (!reasonEntry) continue;

      if (delay.status === "PENDING" && delay.endDate) {
        const task = tasks.find((task) => task.id === delay.taskId);
        if (task?.id) {
          // Add task id to the list if not already present
          if (!reasonEntry.taskIds.includes(task.id)) {
            reasonEntry.taskIds.push(task.id);
          }

          const delayEndDate = new Date(delay.endDate).getTime();
          const taskEndDate = new Date(task.endDate).getTime();
          const taskStartDate = new Date(task.startDate).getTime();

          reasonEntry.totalDelayDuration += Math.floor((delayEndDate - taskEndDate) / (1000 * 60 * 60 * 24));
          reasonEntry.totalTasksDuration += Math.floor((taskEndDate - taskStartDate) / (1000 * 60 * 60 * 24));

          reasonMap.set(delay.reason, reasonEntry);
        }
      }
    }

    return Array.from(reasonMap.values());
  }, [changeProposals, tasks]);

  /**
   * Return loading spinner if loading
   */
  if (loading) {
    return (
      <Box sx={{ padding: "1rem" }}>
        <LinearProgress />
      </Box>
    );
  }

  /**
   * Renders delays by task column
   */
  const renderDelaysByTaskColumn = () => {
    return (
      <Box sx={{ padding: "1rem" }}>
        <DataGrid
          loading={loading}
          rows={delaysByTaskRowData}
          rowCount={delaysByTaskRowData.length}
          columns={[
            {
              field: "taskId",
              headerName: t("trackingScreen.delaysList.byTask.delayedTask"),
              flex: 1,
              disableColumnMenu: true,
              valueGetter: (params: GridRenderCellParams) => {
                const task = tasks.find((task) => task.id === params.value);
                return task?.name;
              },
            },
            {
              field: "metadata",
              headerName: t("trackingScreen.delaysList.byTask.creator"),
              flex: 1,
              disableColumnMenu: true,
              renderCell: (params: GridRenderCellParams) => {
                const user = users.find((user) => user.id === params.value?.creatorId);

                return (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {user?.firstName} {user?.lastName}
                  </Box>
                );
              },
            },
            {
              field: "reason",
              headerName: t("trackingScreen.delaysList.byTask.delayReason"),
              flex: 1,
              disableColumnMenu: true,
            },
            {
              field: "endDate",
              headerName: t("trackingScreen.delaysList.byTask.delayQuantity"),
              flex: 1,
              disableColumnMenu: true,
              renderCell: (params: GridRenderCellParams) => {
                const task = tasks.find((task) => task.id === params.row.taskId);
                const daysDelayed = task?.endDate
                  ? Math.floor(
                      (new Date(params.value).getTime() - new Date(task.endDate).getTime()) / (1000 * 60 * 60 * 24),
                    )
                  : 0;
                return daysDelayed;
              },
            },
          ]}
          autoHeight
          disableRowSelectionOnClick
          hideFooter
        />
      </Box>
    );
  };

  /**
   * Renders delays by role column
   */
  const renderDelaysByPositionColumn = () => (
    <Box sx={{ padding: "1rem" }}>
      <DataGrid
        loading={loading}
        rows={delaysByRoleRowData}
        columns={[
          {
            field: "positionName",
            headerName: t("trackingScreen.delaysList.byPosition.position"),
            flex: 1,
            disableColumnMenu: true,
          },
          {
            field: "taskIds",
            headerName: t("trackingScreen.delaysList.byPosition.tasks"),
            flex: 1,
            disableColumnMenu: true,
            valueGetter: (params) => params.value.length,
          },
          {
            field: "delayedTasksNumber",
            headerName: t("trackingScreen.delaysList.byPosition.delayedNumber"),
            flex: 1,
            disableColumnMenu: true,
          },
          {
            field: "delayedTasksPercentage",
            headerName: t("trackingScreen.delaysList.byPosition.delayPercentage"),
            flex: 1,
            disableColumnMenu: true,
            valueFormatter: (params) => `${params.value.toFixed(2)}%`,
          },
          {
            field: "totalDelayPercentage",
            headerName: t("trackingScreen.delaysList.byPosition.overallDelay"),
            flex: 1,
            disableColumnMenu: true,
            valueGetter: (params) =>
              `${((params.row.totalDelayDuration / params.row.totalTasksDuration) * 100).toFixed(2)}%`,
          },
        ]}
        autoHeight
        disableRowSelectionOnClick
        hideFooter
      />
    </Box>
  );

  /**
   * Renders delays by reason column
   */
  const renderDelaysByReasonColumn = () => (
    <Box sx={{ padding: "1rem" }}>
      <DataGrid
        loading={loading}
        rows={delaysByReasonRowData}
        columns={[
          {
            field: "reasonText",
            headerName: t("trackingScreen.delaysList.byReason.delayReason"),
            flex: 1,
            disableColumnMenu: true,
          },
          {
            field: "delayedTasks",
            headerName: t("trackingScreen.delaysList.byReason.delayedNumber"),
            flex: 1,
            disableColumnMenu: true,
            valueGetter: (params) => params.row.taskIds.length,
          },
          {
            field: "totalDelayDuration",
            headerName: t("trackingScreen.delaysList.byReason.delayQuantity"),
            flex: 1,
            disableColumnMenu: true,
          },
          {
            field: "totalDelayPercentage",
            headerName: t("trackingScreen.delaysList.byReason.overallDelay"),
            flex: 1,
            disableColumnMenu: true,
            valueGetter: (params) => {
              return params.row.totalDelayDuration > 0
                ? `${((params.row.totalDelayDuration / params.row.totalTasksDuration) * 100).toFixed(2)}%`
                : "0%";
            },
          },
        ]}
        autoHeight
        disableRowSelectionOnClick
        hideFooter
      />
    </Box>
  );

  /**
   * Renders delays column depending on the scope selected
   */
  const renderDelaysColumnWithDataGrid = (scope: ChangeProposalScope) =>
    ({
      [ChangeProposalScope.TASK]: renderDelaysByTaskColumn(),
      [ChangeProposalScope.POSITION]: renderDelaysByPositionColumn(),
      [ChangeProposalScope.REASON]: renderDelaysByReasonColumn(),
    })[scope];

  /**
   * Renders dropdown picker
   */
  const renderDropdownPicker = () => (
    <TextField
      select
      fullWidth
      size="small"
      variant="outlined"
      label={t("trackingScreen.delaysList.groupBy")}
      value={changeProposalScope}
      onChange={(event) => setChangeProposalScope(event.target.value as ChangeProposalScope)}
    >
      {Object.values(ChangeProposalScope).map((option) => (
        <MenuItem key={option} value={option}>
          {t(`trackingScreen.delaysList.scopes.${option}`)}
        </MenuItem>
      ))}
    </TextField>
  );

  /**
   * Main component render
   */
  return (
    <>
      <Grid container style={{ alignContent: "center", alignItems: "center", justifyContent: "space-between" }}>
        <Grid item width={"50%"}>
          <Typography component="h2" variant="h6" sx={{ padding: "1rem" }}>
            {t("trackingScreen.delaysList.title")}
          </Typography>
        </Grid>
        <Grid item width={"20%"}>
          <Box sx={{ padding: "1rem" }}>{renderDropdownPicker()}</Box>
        </Grid>
      </Grid>
      {/* Render delays data grid */}
      {renderDelaysColumnWithDataGrid(changeProposalScope)}
    </>
  );
};

export default DelaysList;
