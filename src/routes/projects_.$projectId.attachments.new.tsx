import { createFileRoute } from "@tanstack/react-router";
import AttachmentDialog from "components/attachments/attachment-dialog";

/**
 * New attachment route
 */
export const Route = createFileRoute("/projects/$projectId/attachments/new")({
  component: NewAttachmentDialog,
});

/**
 * New attachment dialog component
 */
function NewAttachmentDialog() {
  const { projectId } = Route.useParams();
  const navigate = Route.useNavigate();

  /**
   * Main component render
   */
  return <AttachmentDialog projectId={projectId} onClose={() => navigate({ to: ".." })} />;
}
