import { Box, Button, Drawer, LinearProgress, List, ListItem, Typography } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import DoneIcon from "@mui/icons-material/Done";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { ChangeProposal, ChangeProposalStatus, Task, User } from "generated/client";
import { DateTime } from "luxon";
import { useFindUsersQuery } from "hooks/api-queries";

/**
 * Change proposals component properties
 */
interface Props {
  changeProposals?: ChangeProposal[];
  tasks?: Task[];
  selectedChangeProposal: string;
  setSelectedChangeProposal: (selectedChangeProposal: string) => void;
}

// TODO: will be replaced with real data
const mockChangeProposals: ChangeProposal[] = [
  {
    id: "1",
    taskId: "056f047f-b441-4fad-90b7-95a6b4afca6e",
    startDate: new Date("2024-06-01"),
    endDate: new Date("2024-06-10"),
    reason: "Project delay due to resource unavailability",
    comment: "We need more time to allocate resources.",
    status: ChangeProposalStatus.Pending,
    metadata: {
      creatorId: "4fea2090-00be-4b44-94d3-8dcb7e5936be",
      createdAt: new Date("2024-05-27T13:57:14.25185Z"),
    },
  },
  {
    id: "2",
    taskId: "532c18c0-e4bf-48d9-a831-377d9e359352",
    startDate: new Date("2024-07-15"),
    reason: "Client requested change in start date",
    status: ChangeProposalStatus.Approved,
    metadata: {
      creatorId: "6611cf14-2841-420f-89d8-ce3e06c1e490",
      createdAt: new Date("2024-05-27T13:57:14.25185Z"),
    },
  },
  {
    id: "3",
    taskId: "c21ecec6-175b-4ac5-8045-8e23246a2a9b",
    endDate: new Date("2024-08-20"),
    reason: "Extended testing phase required",
    comment: "Testing phase needs an additional week.",
    status: ChangeProposalStatus.Pending,
    metadata: {
      creatorId: "cd7b03e2-7553-4804-9363-835f1fb78a5f",
      createdAt: new Date("2024-05-27T13:57:14.25185Z"),
    },
  },
  {
    id: "4",
    taskId: "5f407123-ffe4-4a86-bfa6-99b772eb35d0",
    reason: "Budget constraints",
    comment: "Need to halt the task temporarily.",
    status: ChangeProposalStatus.Rejected,
    metadata: {
      creatorId: "4fea2090-00be-4b44-94d3-8dcb7e5936be",
      createdAt: new Date("2024-05-27T13:57:14.25185Z"),
    },
  },
  {
    id: "5",
    taskId: "817bab82-bb26-4a46-b7f4-aae93f9bf316",
    startDate: new Date("2024-09-01"),
    endDate: new Date("2024-09-15"),
    reason: "Change in project scope",
    comment:
      "Project scope has increased, requiring more timfdsfaffsd fffffffffffffffff ffffffffffffffffffffffff fffffffffffffffffffff fffffffffffffffff fffffffffe.",
    status: ChangeProposalStatus.Pending,
    metadata: {
      creatorId: "6611cf14-2841-420f-89d8-ce3e06c1e490",
      createdAt: new Date("2024-05-27T13:57:14.25185Z"),
    },
  },
];

/**
 * Change proposals drawer component
 *
 * @props props component properties
 */
const ChangeProposals = ({ changeProposals, tasks, selectedChangeProposal, setSelectedChangeProposal }: Props) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const proposalCreatorUsersIds = [
    ...new Set(
      mockChangeProposals
        ?.flatMap((proposal) => proposal.metadata?.creatorId)
        .filter((creatorId): creatorId is string => creatorId !== undefined),
    ),
  ];
  const listProposalCreatorUsersQuery = useFindUsersQuery(proposalCreatorUsersIds);
  const creatorUsers = (listProposalCreatorUsersQuery.data ?? []).filter((user) => user);

  /**
   * Renders change proposals list
   *
   * @param changeProposals List of change proposals
   */
  const renderChangeProposalsList = (changeProposals: ChangeProposal[]) => {
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

  // TODO: Remove the filter when not using mock data
  const filteredMockProposals = mockChangeProposals.filter(
    (proposal) => proposal.status === ChangeProposalStatus.Pending,
  );

  /**
   * Main component render
   */
  return (
    <>
      <Button onClick={() => setOpen(!open)} variant="contained" color="primary" size="large">
        <RemoveRedEyeIcon sx={{ marginRight: 1 }} />
        {t("changeProposalsDrawer.viewChangeProposals", { value: filteredMockProposals?.length })}
      </Button>
      <Drawer open={open && !!filteredMockProposals?.length} anchor="bottom" variant="persistent">
        {/* // TODO: Need draggable height */}
        <Box sx={{ padding: "1rem", height: 400 }}>
          <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
            <Typography component="h2" variant="h6" fontWeight={700}>
              {t("changeProposalsDrawer.changeProposals")}
            </Typography>
            <Typography component="h2" variant="h6" fontWeight={700}>
              {t("changeProposalsDrawer.numberOfChangeProposals", { value: filteredMockProposals.length })}
            </Typography>
          </Box>
          {listProposalCreatorUsersQuery.isPending ? (
            <LinearProgress />
          ) : (
            renderChangeProposalsList(filteredMockProposals)
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default ChangeProposals;
