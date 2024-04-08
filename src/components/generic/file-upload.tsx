import { Alert, Box, IconButton, Snackbar } from "@mui/material";
import { DropzoneArea } from "mui-file-dropzone";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { UploadMessage } from "types";
import CloseIcon from "@mui/icons-material/Close";

/**
 * Component props
 */
interface Props {
  allowedFileTypes: string[];
  uploadLoading: boolean;
  uploadFile: (file: File) => void;
}

/**
 * File uploader component
 *
 * @params props component properties
 */
const FileUploader = ({ allowedFileTypes, uploadLoading, uploadFile }: Props) => {
  const { t } = useTranslation();
  const [uploadMessage, setUploadMessage] = useState<UploadMessage>();

  /**
   * Render upload dialog
   */
  const renderUploadZone = () => {
    const bytes = 2000000;

    return (
      <>
        <DropzoneArea
          onDrop={(files) => handleDropFile(files)}
          acceptedFiles={allowedFileTypes}
          maxFileSize={bytes}
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
    if (checkFileName(files[0])) {
      setUploadMessage({ message: t("settingsScreen.uploadWarningInvalidCharacters"), severity: "error" });
      return;
    }

    // TODO: Prevent duplicate names here, when list available
    // if (backgroundImages.some((image) => image.name === files[0].name)) {
    //   setErrorMessage(t("settingsScreen.uploadWarningDuplicateFileName"));
    //   return;
    // }

    // TODO: Set the loading state here
    uploadFile(files[0]);

    setUploadMessage({ message: t("settingsScreen.fileSuccessfullyUploaded"), severity: "success" });
  };

  return <Box sx={{ display: "flex", flexDirection: "row", width: "30%" }}>{renderUploadZone()}</Box>;
};

export default FileUploader;
