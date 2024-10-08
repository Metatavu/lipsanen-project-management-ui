import CheckIcon from "@mui/icons-material/Check";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { LoadingButton } from "@mui/lab";
import { Card, LinearProgress, MenuItem, Stack, TextField, Toolbar, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { FlexColumnLayout } from "components/generic/flex-column-layout";
import { Project, ProjectStatus } from "generated/client";
import { useFindProjectQuery } from "hooks/api-queries";
import { useApi } from "hooks/use-api";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { getValidDateTimeOrThrow } from "utils/date-time-utils";

/**
 * Project form
 */
type ProjectForm = {
  name: string;
  status: ProjectStatus;
  estimatedStartDate?: Date;
  estimatedEndDate?: Date;
};

/**
 * Project settings route
 */
export const Route = createFileRoute("/projects/$projectId/settings")({
  component: ProjectSettingsScreen,
});

/**
 * Project settings screen component
 */
function ProjectSettingsScreen() {
  const { t } = useTranslation();
  const { projectId } = Route.useParams();
  const { projectsApi } = useApi();
  const queryClient = useQueryClient();

  const findProjectQuery = useFindProjectQuery(projectId);
  const project = useMemo(() => findProjectQuery.data, [findProjectQuery.data]);

  const updateProject = useMutation({
    mutationFn: async (project: Project) => {
      try {
        await projectsApi.updateProject({ project: project, projectId: projectId });
      } catch (error) {
        throw new Error(t("errorHandling.errorUpdatingProject"), { cause: error });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
    },
  });

  const { control, handleSubmit, formState } = useForm<ProjectForm>({
    values: {
      name: project?.name ?? "",
      status: project?.status ?? ProjectStatus.Initiation,
      estimatedStartDate: project?.estimatedStartDate ?? undefined,
      estimatedEndDate: project?.estimatedEndDate ?? undefined,
    },
  });

  /**
   * Renders project settings form
   */
  const renderProjectSettings = () => {
    if (findProjectQuery.isLoading || !project) {
      return <LinearProgress />;
    }

    return (
      <form onSubmit={handleSubmit((values) => updateProject.mutate({ ...project, ...values }))}>
        <Stack gap={2} width={500}>
          <Typography variant="h6">{t("projectSettingsScreen.baseInfo")}</Typography>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField {...field} variant="outlined" label={t("projectSettingsScreen.projectName")} />
            )}
          />
          <Stack direction="row" gap={2}>
            <Controller
              name="estimatedStartDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label={t("projectSettingsScreen.estimatedStart")}
                  value={field.value ? getValidDateTimeOrThrow(field.value) : null}
                  inputRef={field.ref}
                  onChange={(date) => field.onChange(date?.setZone("utc").toJSDate())}
                  slotProps={{ textField: { variant: "outlined", fullWidth: true } }}
                />
              )}
            />
            <Controller
              name="estimatedEndDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label={t("projectSettingsScreen.estimatedEnd")}
                  value={field.value ? getValidDateTimeOrThrow(field.value) : null}
                  inputRef={field.ref}
                  onChange={(date) => field.onChange(date?.setZone("utc").toJSDate())}
                  slotProps={{ textField: { variant: "outlined", fullWidth: true } }}
                />
              )}
            />
          </Stack>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <TextField {...field} select variant="outlined" label={t("projectSettingsScreen.projectStatus")}>
                {Object.values(ProjectStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {t(`projectStatuses.${status}`)}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Stack direction="row" gap={2} alignItems="center">
            <LoadingButton
              type="submit"
              size="large"
              variant="contained"
              color="primary"
              loading={updateProject.isPending}
              disabled={!formState.isDirty}
              sx={{ alignSelf: "flex-start" }}
            >
              {t("generic.save")}
            </LoadingButton>
            {updateProject.isSuccess && !formState.isDirty && <CheckIcon color="success" />}
            {updateProject.isError && <ErrorOutlineIcon color="error" />}
          </Stack>
        </Stack>
      </form>
    );
  };

  /**
   * Main component render
   */
  return (
    <FlexColumnLayout>
      <Toolbar disableGutters sx={{ gap: 2 }}>
        <Typography component="h1" variant="h5">
          {t("settingsScreen.title")}
        </Typography>
      </Toolbar>
      <Card sx={{ flex: 1, p: 2 }}>{renderProjectSettings()}</Card>
    </FlexColumnLayout>
  );
}
