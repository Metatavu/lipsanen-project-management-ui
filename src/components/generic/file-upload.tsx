import { Alert, Box, IconButton } from "@mui/material";
import { DropzoneArea } from "mui-file-dropzone";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { UploadMessage } from "types";
import CloseIcon from "@mui/icons-material/Close";
import { containsIllegalCharacters } from "utils";
import config from "app/config";

const MAX_FILE_SIZE_IN_BYTES = 2000000;

/**
 * Component props
 */
interface Props {
  allowedFileTypes: string[];
  uploadFile: (file: File) => void;
  existingFiles: string[];
  existingFilesPath: string;
  widthPercent?: number;
}

/**
 * File uploader component
 *
 * @params props component properties
 */
const FileUploader = ({ allowedFileTypes, uploadFile, existingFiles, existingFilesPath, widthPercent }: Props) => {
  const { t } = useTranslation();
  const [uploadMessage, setUploadMessage] = useState<UploadMessage>();

  /**
   * Render upload zone
   */
  const renderUploadZone = () => {
    return (
      <DropzoneArea
        onDrop={(files) => handleDropFile(files)}
        acceptedFiles={allowedFileTypes}
        maxFileSize={MAX_FILE_SIZE_IN_BYTES}
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
        <Box sx={{ width: '100%', mt: 2 }}>
          <Alert
            severity={uploadMessage.severity}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setUploadMessage(undefined)}
              >
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

    if (existingFiles.some((existingFile) => existingFile === existingFileFullPath)) {
      setUploadMessage({ message: t("settingsScreen.uploadWarningDuplicateFileName"), severity: "error" });
      return;
    }

    uploadFile(file);
  };

  /**
   * Component render
   */
  return (
    <Box sx={{ width: `${widthPercent ?? 30}%` }}>
      {renderUploadZone()}
      {renderAlert()}
    </Box>
  );
};

export default FileUploader;
