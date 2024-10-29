import { Backdrop, CircularProgress } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import AttachmentDialog from "components/attachments/attachment-dialog";
import { useFindAttachmentQuery } from "hooks/api-queries";
import { useMemo } from "react";

/**
 * Edit attachment route
 */
export const Route = createFileRoute("/projects/$projectId/attachments/$attachmentId")({
  component: EditAttachmentDialog,
});

/**
 * Edit attachment dialog component
 */
function EditAttachmentDialog() {
  const { projectId, attachmentId } = Route.useParams();
  const navigate = Route.useNavigate();

  const attachmentQuery = useFindAttachmentQuery({ attachmentId });
  const attachment = useMemo(() => attachmentQuery.data, [attachmentQuery.data]);

  if (attachmentQuery.isFetching || !attachment) {
    return (
      <Backdrop open sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })} enter={false} exit={false}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  /**
   * Main component render
   */
  return (
    <AttachmentDialog
      appear={false}
      projectId={projectId}
      existingAttachment={attachment}
      onClose={() => navigate({ to: ".." })}
    />
  );
}
