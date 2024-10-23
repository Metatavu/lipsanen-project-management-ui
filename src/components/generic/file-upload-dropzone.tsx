import { Chip, alpha, styled } from "@mui/material";
import { t } from "i18next";
import { DropzoneArea } from "mui-file-dropzone";

/**
 * Dropzone wrapper that is used to style the dropzone area
 */
const DropzoneWrapper = styled("div")(({ theme }) => ({
  position: "relative",

  "& .dropzone-root": {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    borderRadius: "0.5rem",
    borderColor: "primary.light",
    borderWidth: 1,
    p: 3,
    transition: "background-color 0.1s",
    "&:active": {
      backgroundColor: "#eaf4fb",
    },
  },

  "& .dropzone-icon": {
    display: "none",
  },

  "& .dropzone-text": {
    width: 200,
    lineHeight: 2,
    fontSize: theme.typography.body1.fontSize,
    fontWeight: 500,
    m: 0,
  },
}));

/**
 * File previews container
 */
const FilePreviews = styled("div")(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  left: 0,
  width: "100%",
  padding: theme.spacing(2),
  display: "flex",
  gap: theme.spacing(2),
  flexWrap: "wrap",
}));

/**
 * Component properties
 */
type Props = {
  files: (File | string)[];
  filesLimit?: number;
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (file: File | string) => void;
};

/**
 * File upload dropzone component
 *
 * @param props component properties
 */
const FileUploadDropzone = ({ files, filesLimit = 1, onAddFiles, onRemoveFile }: Props) => {
  /**
   * Get file name from either file or URL string
   *
   * @param file file or URL string
   * @returns file name
   */
  const getFileName = (file: File | string) => {
    if (typeof file === "string") {
      return file.split("/").at(-1) ?? file;
    }

    return file.name;
  };

  /**
   * Main component render
   */
  return (
    <DropzoneWrapper>
      <DropzoneArea
        fileObjects={files}
        filesLimit={filesLimit}
        dropzoneText={t("attachmentDialog.dropzoneText")}
        showPreviewsInDropzone={false}
        showPreviews={false}
        clearOnUnmount
        useChipsForPreview
        showAlerts={false}
        onDrop={onAddFiles}
        onDelete={onRemoveFile}
        classes={{
          root: "dropzone-root",
          textContainer: "dropzone-text-container",
          text: "dropzone-text",
          icon: "dropzone-icon",
        }}
      />
      <FilePreviews>
        {files.map((file) => {
          const fileName = getFileName(file);
          return <Chip key={fileName} label={fileName} onDelete={() => onRemoveFile(file)} />;
        })}
      </FilePreviews>
    </DropzoneWrapper>
  );
};

export default FileUploadDropzone;
