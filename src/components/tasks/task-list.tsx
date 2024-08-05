import { Box, Card, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { renderMdiIconifyIconWithBackground } from "components/generic/mdi-icon-with-background";
import ProgressBadge from "components/generic/progress-badge";
import { useListJobPositionsQuery } from "hooks/api-queries";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { theme } from "theme";
import TaskUtils from "utils/task";
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import { User, Task } from "generated/client";

/**
 * Component props
 */
interface Props {
    user: User;
    tasks: Task[];
    loading: boolean;
  }

  const DEFAULT_USER_ICON = "account";

  // TODO: Finalise tracking screen
  
  /**
   * Task list component
   * renders a list of tasks
   * 
   * @param props component props
   */
  const TaskList = ({ user, tasks, loading }: Props) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const listJobPositionsQuery = useListJobPositionsQuery();
    const jobPositions = listJobPositionsQuery.data?.jobPositions;

    const renderTasksColumn = () => {
        const columns = [
          {
            field: "assigneeIds",
            headerName: "Tekijä",
            flex: 1,
            renderCell: (params) => {
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
            }
          },
          {
            field: "name",
            headerName: "Tehtävä",
            flex: 1,
            renderCell: (params) => (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AssignmentOutlinedIcon sx={{ marginRight: '0.5rem' }} />
                {params.value}
              </Box>
            )
          },
          {
            field: "endDate",
            headerName: "Valmis arvio",
            flex: 1,
            renderCell: (params) => new Date(params.value).toLocaleDateString().replace(/\//g, ".")
          },
          {
            field: "status",
            headerName: "Tila",
            flex: 1,
            renderCell: (params) => TaskUtils.renderStatusElement(params.value),
          },
          {
            field: "estimatedReadiness",
            headerName: "Valmius",
            flex: 1,
            renderCell: (params) => <ProgressBadge progress={params.value ?? 0} customWidth="120px" />
          }
        ];
    
        return (
          <Card sx={{ flex: 1, minWidth: 0, overflow: "auto", boxShadow: "none" }}>
            <Typography component="h2" variant="h6" sx={{ padding: "1rem" }}>
              Omat tehtäväni
            </Typography>
            <Box sx={{ padding: "1rem" }}>
              <DataGrid
                loading={loading || listJobPositionsQuery.isLoading}
                sx={{ height: "100%", width: "100%" }}
                rows={tasks ?? []}
                // rowCount={10}
                columns={columns}
                // pageSizeOptions={[10, 25, 50]}
                disableRowSelectionOnClick
                hideFooter
              />
            </Box>
          </Card>
        );
      };
  
    return renderTasksColumn();
  };
  
  export default TaskList;