import { Box, Button, Drawer, LinearProgress, List, ListItem, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import DoneIcon from "@mui/icons-material/Done";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { ChangeProposal, Task } from "generated/client";
import { DateTime } from "luxon";
import { useFindUsersQuery } from "hooks/api-queries";
import DragHandleIcon from "@mui/icons-material/DragHandle";

/**
 * Change proposals component properties
 */
interface Props {
  changeProposals?: ChangeProposal[];
  tasks?: Task[];
  selectedChangeProposal: string;
  setSelectedChangeProposal: (selectedChangeProposal: string) => void;
  loading: boolean;
}

/**
 * Change proposals drawer component
 *
 * @props props component properties
 */
const ChangeProposalsDrawer = ({
  changeProposals,
  tasks,
  selectedChangeProposal,
  setSelectedChangeProposal,
  loading,
}: Props) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState(150);
  const [maxHeight, setMaxHeight] = useState<number | null>(null);
  const startY = useRef(0);
  const startHeight = useRef(height);
  const contentRef = useRef<HTMLDivElement>(null);

  const proposalCreatorUsersIds = [
    ...new Set(
      changeProposals
        ?.flatMap((proposal) => proposal.metadata?.creatorId)
        .filter((creatorId): creatorId is string => creatorId !== undefined),
    ),
  ];
  const listProposalCreatorUsersQuery = useFindUsersQuery(proposalCreatorUsersIds);
  const creatorUsers = (listProposalCreatorUsersQuery.data ?? []).filter((user) => user);

  useEffect(() => {
    if (contentRef.current) {
      setMaxHeight(contentRef.current.scrollHeight);
    }
  }, [contentRef, changeProposals]);

  /**
   * Handler for mouse down click event
   *
   * @param e MouseEvent
   */
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    startY.current = e.clientY;
    startHeight.current = height;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  /**
   * Handler for mouse move event
   *
   * @param e MouseEvent
   */
  const handleMouseMove = (e: MouseEvent) => {
    const newHeight = startHeight.current + (startY.current - e.clientY);
    if (newHeight >= 100 && (maxHeight === null || newHeight <= maxHeight)) {
      setHeight(newHeight);
    }
  };

  /**
   * Handler for mouse up event
   */
  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  /**
   * Renders change proposals list
   *
   * @param changeProposals List of change proposals
   */
  const renderChangeProposalsList = (changeProposals?: ChangeProposal[]) => {
    if (!changeProposals?.length) return null;

    return (
      <List>
        {changeProposals.map((changeProposal, index) => {
          if (!changeProposal.id) return null;

          const proposalId = changeProposal.id;
          const proposalCreator = creatorUsers.find((user) => user.id === changeProposal.metadata?.creatorId);
          const proposalTask = tasks?.find((task) => task.id === changeProposal.taskId);

          return (
            <ListItem onClick={() => setSelectedChangeProposal(proposalId)} key={changeProposal.id} sx={{ padding: 0 }}>
              <Box
                sx={{
                  width: "100%",
                  border: "2px solid #ECEFF1",
                  borderColor: selectedChangeProposal === proposalId ? "#0079BF" : "",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    backgroundColor: selectedChangeProposal === proposalId ? "#0079BF" : "#ECEFF1",
                    padding: "0.3rem",
                    color: selectedChangeProposal === proposalId ? "#fff" : "#000",
                  }}
                >
                  <Box sx={{ display: "flex", flexDirection: "row", width: "50%", alignItems: "center" }}>
                    <Typography fontWeight={700} component="h3" variant="body2" sx={{ flex: 1 }}>
                      {t("changeProposalsDrawer.changeProposalPosition", {
                        current: index + 1,
                        total: changeProposals.length,
                      })}
                    </Typography>
                    <Typography sx={{ flex: 1, fontSize: "12px" }}>
                      {changeProposal.metadata?.createdAt &&
                        DateTime.fromJSDate(changeProposal.metadata.createdAt).toFormat("dd.MM.yyyy - HH:mm")}
                    </Typography>
                    <Typography fontWeight={700} component="h3" variant="body2" sx={{ flex: 1 }}>
                      {proposalTask?.name}
                    </Typography>
                  </Box>
                  <Box sx={{ width: "20%" }}>
                    {/* TODO: Put requests for the change proposal */}
                    <Button
                      variant="text"
                      sx={{
                        height: 32,
                        px: 2,
                        color: selectedChangeProposal === proposalId ? "#fff" : "#000",
                        fontSize: "10px",
                      }}
                    >
                      {t("changeProposalsDrawer.accept")}
                      <DoneIcon fontSize="small" sx={{ marginLeft: 1 }} />
                    </Button>
                    <Button
                      variant="text"
                      sx={{
                        height: 32,
                        px: 2,
                        color: selectedChangeProposal === proposalId ? "#fff" : "#000",
                        fontSize: "10px",
                      }}
                    >
                      {t("changeProposalsDrawer.reject")}
                      <DeleteOutlineIcon fontSize="small" sx={{ marginLeft: 1 }} />
                    </Button>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    padding: "1.5rem",
                    backgroundColor: selectedChangeProposal === proposalId ? "#0079BF1A" : "",
                  }}
                >
                  <Typography variant="caption" sx={{ width: "20%" }}>
                    {/* TODO: Users icon is missing */}
                    {`${proposalCreator?.firstName} ${proposalCreator?.lastName}`}
                  </Typography>
                  <Typography variant="caption" sx={{ width: "40%" }}>
                    {changeProposal.reason}
                  </Typography>
                  <Typography variant="caption" sx={{ width: "40%" }}>
                    {changeProposal.comment}
                  </Typography>
                </Box>
              </Box>
            </ListItem>
          );
        })}
      </List>
    );
  };

  /**
   * Main component render
   */
  return (
    <>
      <Button
        onClick={() => setOpen(!open)}
        variant="contained"
        color="primary"
        size="large"
        disabled={!changeProposals?.length}
      >
        <RemoveRedEyeIcon sx={{ marginRight: 1 }} />
        {loading
          ? t("changeProposalsDrawer.viewChangeProposals")
          : t("changeProposalsDrawer.viewChangeProposalsWithValue", { value: changeProposals?.length ?? 0 })}
      </Button>
      <Drawer open={open && !!changeProposals?.length} anchor="bottom" variant="persistent">
        <Box sx={{ display: "flex", justifyContent: "center" }} onMouseDown={handleMouseDown}>
          <DragHandleIcon />
        </Box>
        <Box ref={contentRef} sx={{ padding: "0 1rem 1rem 1rem", height: `${height}px` }}>
          <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
            <Typography component="h2" variant="h6" fontWeight={700}>
              {t("changeProposalsDrawer.changeProposals")}
            </Typography>
            <Typography component="h2" variant="h6" fontWeight={700}>
              {t("changeProposalsDrawer.numberOfChangeProposals", { value: changeProposals?.length })}
            </Typography>
          </Box>
          {listProposalCreatorUsersQuery.isPending ? <LinearProgress /> : renderChangeProposalsList(changeProposals)}
        </Box>
      </Drawer>
    </>
  );
};

export default ChangeProposalsDrawer;
