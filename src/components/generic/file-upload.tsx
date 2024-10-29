import CloseIcon from "@mui/icons-material/Close";
import { Alert, Box, CircularProgress, IconButton } from "@mui/material";
import config from "app/config";
import { TWO_MEGABYTES } from "consts";
import { DropzoneArea } from "mui-file-dropzone";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { UploadMessage } from "types";
import { containsIllegalCharacters } from "utils";

/**
 * Component props
 */
interface Props {
  allowedFileTypes: string[];
  uploadFile: (file: File) => void;
  existingFiles: string[];
  existingFilesPath: string;
  allFiles?: string[];
  width?: number;
  loaderVisible?: boolean;
  uploadExistingFile?: (file: string) => void;
}

/**
 * File uploader component
 *
 * @params props component properties
 */
const FileUploader = ({
  allowedFileTypes,
  uploadFile,
  existingFiles,
  existingFilesPath,
  allFiles,
  width,
  loaderVisible,
  uploadExistingFile,
}: Props) => {
  const { t } = useTranslation();
  const [uploadMessage, setUploadMessage] = useState<UploadMessage>();

  /**
   * Render upload zone
   */
  const renderUploadZone = () => {
    if (loaderVisible) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <DropzoneArea
        onDrop={(files) => handleDropFile(files)}
        acceptedFiles={allowedFileTypes}
        maxFileSize={TWO_MEGABYTES}
        onAlert={(message, variant) => variant === "error" && setUploadMessage({ message, severity: "error" })}
        filesLimit={1}
        fileObjects={[]}
        showPreviewsInDropzone={false}
        dropzoneText={t("settingsScreen.dropzoneText")}
        showAlerts={false}
      />
    );
  };

  /**
   * Render alert
   */
  const renderAlert = () => {
    return (
      uploadMessage && (
        <Box sx={{ width: "100%", mt: 2 }}>
          <Alert
            severity={uploadMessage.severity}
            action={
              <IconButton aria-label="close" color="inherit" size="small" onClick={() => setUploadMessage(undefined)}>
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            {uploadMessage.message}
          </Alert>
        </Box>
      )
    );
  };

  /**
   *  Handler when files are added to the drop zone
   *
   * @param files files
   */
  const handleDropFile = (files: File[]) => {
    const file = files[0];
    if (!file) {
      setUploadMessage({ message: t("settingsScreen.uploadWarningNoFile"), severity: "error" });
      return;
    }

    if (containsIllegalCharacters(file.name)) {
      setUploadMessage({ message: t("settingsScreen.uploadWarningInvalidCharacters"), severity: "error" });
      return;
    }

    const existingFileFullPath = `${config.cdnBaseUrl}/${existingFilesPath}/${files[0].name}`;

    // If file is already attached to the task - do not upload it again and show a warning
    if (existingFiles.includes(existingFileFullPath)) {
      setUploadMessage({ message: t("settingsScreen.uploadWarningDuplicateFileName"), severity: "warning" });
      return;
    }

    // Handles uploading files that exist in the S3
    if (allFiles?.includes(existingFileFullPath)) {
      if (uploadExistingFile) {
        uploadExistingFile(existingFileFullPath);
      }
      return;
    }

    uploadFile(file);
  };

  /**
   * Component render
   */
  return (
    <Box width={width ?? 200}>
      {renderUploadZone()}
      {renderAlert()}
    </Box>
  );
};

export default FileUploader;
