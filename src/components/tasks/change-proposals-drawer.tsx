import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DoneIcon from "@mui/icons-material/Done";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { Box, Button, LinearProgress, List, ListItem, Stack, Typography } from "@mui/material";
import JobPositionAvatar from "components/generic/job-position-avatar";
import ResizablePanel from "components/generic/resizable-panel";
import { ChangeProposal, ChangeProposalStatus, Task } from "generated/client";
import { useFindUsersQuery, useListJobPositionsQuery } from "hooks/api-queries";
import { DateTime } from "luxon";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import UserUtils from "utils/users";

/**
 * Change proposals component properties
 */
interface Props {
  changeProposals?: ChangeProposal[];
  tasks?: Task[];
  selectedChangeProposalId?: string;
  setSelectedChangeProposalId: (selectedChangeProposalId: string) => void;
  loading: boolean;
  updateChangeProposalStatus: (
    changeProposalId: string,
    changeProposal: ChangeProposal,
    status: ChangeProposalStatus,
  ) => void;
}

/**
 * Change proposals drawer component
 *
 * @props props component properties
 */
const ChangeProposalsDrawer = ({
  changeProposals,
  tasks,
  selectedChangeProposalId,
  setSelectedChangeProposalId,
  loading,
  updateChangeProposalStatus,
}: Props) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const wasOpen = useRef(open);

  const proposalCreatorUsersIds = useMemo(
    () => [
      ...new Set(
        changeProposals
          ?.flatMap((proposal) => proposal.metadata?.creatorId)
          .filter((creatorId): creatorId is string => creatorId !== undefined),
      ),
    ],
    [changeProposals],
  );

  const listProposalCreatorUsersQuery = useFindUsersQuery(proposalCreatorUsersIds);
  const creatorUsers = (listProposalCreatorUsersQuery.data ?? []).filter((user) => user);
  const listJobPositionsQuery = useListJobPositionsQuery();
  const jobPositions = listJobPositionsQuery.data?.jobPositions;

  /**
   *  Handler for change proposal status change
   *
   * @param changeProposal ChangeProposal
   * @param status ChangeProposalStatus
   */
  const handleStatusChange = (changeProposal: ChangeProposal, status: ChangeProposalStatus) => {
    if (!changeProposal.id) return;

    const changeProposalId = changeProposal.id;
    updateChangeProposalStatus(changeProposalId, changeProposal, status);
  };

  /**
   * Changes drawer open state
   */
  const onToggleOpen = () => {
    if (open) setSelectedChangeProposalId(undefined);
    setOpen(!open);
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
            <ListItem
              onClick={() => setSelectedChangeProposalId(proposalId)}
              key={changeProposal.id}
              sx={{ padding: 0 }}
            >
              <Box
                sx={{
                  width: "100%",
                  border: "2px solid #ECEFF1",
                  borderColor: selectedChangeProposalId === proposalId ? "#0079BF" : "",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    backgroundColor: selectedChangeProposalId === proposalId ? "#0079BF" : "#ECEFF1",
                    padding: "0.3rem",
                    color: selectedChangeProposalId === proposalId ? "#fff" : "#000",
                  }}
                >
                  <Box sx={{ display: "flex", flexDirection: "row", width: "50%", alignItems: "center" }}>
                    <Typography fontWeight={700} component="h3" variant="body2" sx={{ flex: 1 }}>
                      {t("changeProposals.changeProposalPosition", {
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
                    <Button
                      variant="text"
                      sx={{
                        height: 32,
                        px: 2,
                        color: selectedChangeProposalId === proposalId ? "#fff" : "#000",
                        fontSize: "10px",
                      }}
                      onClick={() => handleStatusChange(changeProposal, ChangeProposalStatus.Approved)}
                    >
                      {t("changeProposals.accept")}
                      <DoneIcon fontSize="small" sx={{ marginLeft: 1 }} />
                    </Button>
                    <Button
                      variant="text"
                      sx={{
                        height: 32,
                        px: 2,
                        color: selectedChangeProposalId === proposalId ? "#fff" : "#000",
                        fontSize: "10px",
                      }}
                      onClick={() => handleStatusChange(changeProposal, ChangeProposalStatus.Rejected)}
                    >
                      {t("changeProposals.reject")}
                      <DeleteOutlineIcon fontSize="small" sx={{ marginLeft: 1 }} />
                    </Button>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    padding: "1.5rem",
                    backgroundColor: selectedChangeProposalId === proposalId ? "#0079BF1A" : "",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ width: "20%", display: "flex", flexDirection: "row", alignItems: "center", gap: 1 }}
                  >
                    <JobPositionAvatar jobPosition={UserUtils.getUserJobPosition(jobPositions, proposalCreator)} />
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
        onClick={onToggleOpen}
        variant="contained"
        color="primary"
        size="large"
        disabled={!changeProposals?.length}
      >
        <RemoveRedEyeIcon sx={{ marginRight: 1 }} />
        {loading
          ? t("changeProposals.viewChangeProposals")
          : t("changeProposals.viewChangeProposalsWithValue", { value: changeProposals?.length ?? 0 })}
      </Button>
      {open && (
        <ResizablePanel initialHeight={200}>
          <Box p={2} pb={4}>
            <Stack direction="row" justifyContent="space-between">
              <Typography component="h2" variant="h6" fontWeight={700}>
                {t("changeProposals.changeProposals")}
              </Typography>
              <Typography component="h2" variant="h6" fontWeight={700}>
                {t("changeProposals.numberOfChangeProposals", { value: changeProposals?.length })}
              </Typography>
            </Stack>
            {listProposalCreatorUsersQuery.isPending ? <LinearProgress /> : renderChangeProposalsList(changeProposals)}
          </Box>
        </ResizablePanel>
      )}
    </>
  );
};

export default ChangeProposalsDrawer;
