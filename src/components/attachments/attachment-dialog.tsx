import { zodResolver } from "@hookform/resolvers/zod";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { LoadingButton } from "@mui/lab";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
  Toolbar,
  Typography,
  alpha,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { filesApi } from "api/files";
import FileUploadDropzone from "components/generic/file-upload-dropzone";
import { Attachment } from "generated/client";
import { useListFilesQuery, useListTasksQuery } from "hooks/api-queries";
import { useApi } from "hooks/use-api";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FileToUpload } from "types";
import { z } from "zod";

/**
 * Attachment form schema
 */
const attachmentFormSchema = z.object({
  name: z.string().min(1),
  projectId: z.string().uuid().min(1),
  type: z.string().min(1),
  url: z.string().min(1),
  taskId: z.string().uuid().min(1).or(z.null()),
});

/**
 * Attachment form type
 */
type AttachmentForm = z.infer<typeof attachmentFormSchema>;

/**
 * Component properties
 */
type Props = {
  appear?: boolean;
  open?: boolean;
  projectId: string;
  taskId?: string;
  existingAttachment?: Attachment;
  onClose: () => void;
  handleAttachmentSave?: (attachment: Attachment) => void;
};

/**
 * Attachment dialog component
 *
 * @param props component properties
 */
const AttachmentDialog = ({
  appear,
  projectId,
  taskId,
  existingAttachment,
  onClose,
  handleAttachmentSave,
  open = true,
}: Props) => {
  const { t } = useTranslation();
  const { attachmentsApi } = useApi();
  const queryClient = useQueryClient();

  const listProjectTasksQuery = useListTasksQuery({ projectId });
  const tasks = useMemo(() => listProjectTasksQuery.data, [listProjectTasksQuery.data]);

  const listAttachmentFilesQuery = useListFilesQuery(`project-attachments/${projectId}`);
  const existingFileUrls = useMemo(() => listAttachmentFilesQuery.data, [listAttachmentFilesQuery.data]);

  const [attachmentFile, setAttachmentFile] = useState<FileToUpload>();

  const { control, handleSubmit, setValue, formState, watch, reset } = useForm({
    resolver: zodResolver(attachmentFormSchema),
    values: {
      name: existingAttachment?.name ?? "",
      projectId: existingAttachment?.projectId ?? projectId,
      type: existingAttachment?.type ?? "",
      url: existingAttachment?.url ?? "",
      taskId: taskId ?? existingAttachment?.taskId ?? null,
    },
  });

  const { isValid, isDirty, isSubmitting } = formState;

  /**
   * Set form values
   *
   * - triggers validation, checks dirtiness and touches fields
   *
   * @param name name
   * @param value value
   */
  const setValues = (values: Partial<AttachmentForm>) => {
    for (const [name, value] of Object.entries(values)) {
      setValue(name as keyof AttachmentForm, value, {
        shouldDirty: true,
        shouldValidate: true,
        shouldTouch: true,
      });
    }
  };

  const attachmentUrl = watch("url");

  /**
   * Save attachment mutation.
   * If there is a new file to upload, it will be uploaded before saving the attachment.
   * If handleAttachmentSave is provided, it will be called with the new attachment instead of
   * handling the save with the API.
   */
  const saveAttachmentMutation = useMutation({
    mutationFn: async (formValues: AttachmentForm) => {
      let attachmentUrl = formValues.url;

      if (!formValues.url && attachmentFile && attachmentFile.file) {
        attachmentUrl = await filesApi.uploadFile(attachmentFile.file, `project-attachments/${projectId}`);
        queryClient.invalidateQueries({ queryKey: ["files"] });
      }

      if (!attachmentUrl) throw new Error(t("errorHandling.errorUploadingNewTaskAttachment"));

      const attachment: Attachment = {
        name: formValues.name,
        projectId: formValues.projectId,
        type: formValues.type,
        taskId: formValues.taskId ?? undefined,
        url: attachmentUrl,
      };

      if (existingAttachment?.id) {
        if (handleAttachmentSave) {
          handleAttachmentSave({ ...existingAttachment, ...attachment });
        } else {
          await attachmentsApi.updateAttachment({
            attachmentId: existingAttachment.id,
            attachment: { ...existingAttachment, ...attachment },
          });
          queryClient.invalidateQueries({ queryKey: ["attachments"] });
        }
      } else {
        if (handleAttachmentSave) {
          handleAttachmentSave?.(attachment);
        } else {
          await attachmentsApi.createAttachment({ attachment });
          queryClient.invalidateQueries({ queryKey: ["attachments"] });
        }
      }
    },
    onSuccess: () => onClose(),
    onError: (error) => console.error(t("errorHandling.errorUploadingNewTaskAttachment"), error),
  });

  /**
   * Handler for adding files
   *
   * @param files files
   */
  const onAddFiles = (files: File[]) => {
    const file = files.at(0);
    if (!file) return;

    setValues({ url: "", name: "", type: "" });

    const matchingFileUrl = existingFileUrls?.find((url) => url.endsWith(file.name));

    if (matchingFileUrl) {
      setAttachmentFile({ file: file, matchingUrl: matchingFileUrl, confirmedUseOfExistingFile: false });
    } else {
      setAttachmentFile({ file: file, matchingUrl: undefined });
      setValues({ name: file.name, type: file.type });
    }
  };

  /**
   * Handler for removing file
   */
  const onRemoveFile = () => {
    if (attachmentFile) setAttachmentFile(undefined);
    setValues({ name: "", type: "", url: "" });
  };

  /**
   * Confirms use of existing file
   */
  const confirmExistingFile = () => {
    if (!attachmentFile?.matchingUrl) return;

    setAttachmentFile({
      file: attachmentFile.file,
      matchingUrl: attachmentFile.matchingUrl,
      confirmedUseOfExistingFile: true,
    });

    setValues({
      name: attachmentFile.file.name,
      type: attachmentFile.file.type,
      url: attachmentFile.matchingUrl,
    });
  };

  /**
   * Handler for closing dialog
   */
  const onCloseDialog = () => {
    setAttachmentFile(undefined);
    reset();
    onClose();
  };

  /**
   * Main component render
   */
  return (
    <Dialog slotProps={{ backdrop: { appear: appear ?? true } }} fullWidth maxWidth="sm" open={open}>
      <AppBar elevation={0} sx={{ position: "relative" }}>
        <Toolbar>
          <DialogTitle sx={{ paddingLeft: 0 }}>
            {existingAttachment
              ? t("attachmentDialog.editAttachment", { attachmentName: existingAttachment.name })
              : t("attachmentDialog.addAttachment")}
          </DialogTitle>
          <IconButton sx={{ ml: "auto" }} color="inherit" onClick={onCloseDialog}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.5), padding: 2 }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          <InfoOutlinedIcon />
          <Typography sx={{ color: (theme) => theme.palette.primary.contrastText }}>
            {t("attachmentDialog.description")}
          </Typography>
        </Box>
      </Box>
      <form onSubmit={handleSubmit((formValues) => saveAttachmentMutation.mutateAsync(formValues))}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {!taskId && (
            <Controller
              name="taskId"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  fullWidth
                  label={t("attachmentDialog.linkToTask")}
                  variant="outlined"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                >
                  <MenuItem value="">{t("generic.noSelection")}</MenuItem>
                  {tasks?.map((task) => (
                    <MenuItem key={task.id} value={task.id}>
                      {task.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          )}
          <FileUploadDropzone
            files={attachmentFile ? [attachmentFile.file] : attachmentUrl ? [attachmentUrl] : []}
            filesLimit={1}
            onAddFiles={onAddFiles}
            onRemoveFile={onRemoveFile}
          />
          {attachmentFile?.matchingUrl && !attachmentFile?.confirmedUseOfExistingFile && (
            <Alert
              severity="warning"
              sx={{ alignItems: "center" }}
              action={
                <Button
                  variant="outlined"
                  size="large"
                  color="inherit"
                  sx={{ borderRadius: "0.5rem" }}
                  onClick={confirmExistingFile}
                >
                  {t("attachmentDialog.useExistingFile")}
                </Button>
              }
            >
              {t("attachmentDialog.fileWithSameNameAlreadyExists")}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, justifyContent: "space-between" }}>
          <Button variant="outlined" color="primary" size="large" startIcon={<CloseIcon />} onClick={onCloseDialog}>
            {t("generic.cancel")}
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<AddIcon />}
            disabled={!isValid || !isDirty}
            loading={isSubmitting}
          >
            {t("generic.save")}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AttachmentDialog;
