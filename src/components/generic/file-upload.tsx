import { Alert, Box, IconButton, Snackbar } from "@mui/material";
import { DropzoneArea } from "mui-file-dropzone";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { UploadMessage } from "types";
import CloseIcon from "@mui/icons-material/Close";
const MAX_FILE_SIZE_IN_BYTES = 2000000;

/**
 * Component props
 */
interface Props {
  allowedFileTypes: string[];
  uploadFile: (file: File) => void;
  logos: string[];
}

/**
 * File uploader component
 *
 * @params props component properties
 */
const FileUploader = ({ allowedFileTypes, uploadFile, logos }: Props) => {
  const { t } = useTranslation();
  const [uploadMessage, setUploadMessage] = useState<UploadMessage>();

  /**
   * Render upload dialog
   */
  const renderUploadZone = () => {
    return (
      <>
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
        <Snackbar open={!!uploadMessage} autoHideDuration={10000} onClose={() => setUploadMessage(undefined)}>
          <Alert
            severity={uploadMessage?.severity}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                sx={{ p: 0.5 }}
                onClick={() => setUploadMessage(undefined)}
              >
                <CloseIcon />
              </IconButton>
            }
          >
            {uploadMessage?.message}
          </Alert>
        </Snackbar>
      </>
    );
  };

  /**
   * Check if file name contains invalid characters
   *
   * @param file file which name to test
   * @returns true if file name contains invalid characters
   */
  const checkFileName = (file: File) => /[^\x00-\x7F]/gi.test(file.name);

  /**
   *  Handler when files are added to the drop zone
   *
   * @param files files
   */
  const handleDropFile = (files: File[]) => {
    const file = files[0];
    if (!file) {
      setUploadMessage({ message: t("errorHandling.errorUploadingImage"), severity: "error" });
      return;
    }

    if (checkFileName(file)) {
      setUploadMessage({ message: t("settingsScreen.uploadWarningInvalidCharacters"), severity: "error" });
      return;
    }

    if (logos.some((logo) => logo === files[0].name)) {
      setUploadMessage({ message: t("settingsScreen.uploadWarningDuplicateFileName"), severity: "error" });
      return;
    }

    uploadFile(file);
  };

  return <Box sx={{ display: "flex", flexDirection: "row", width: "30%" }}>{renderUploadZone()}</Box>;
};

export default FileUploader;
