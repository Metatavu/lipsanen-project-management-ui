import CancelIcon from "@mui/icons-material/Cancel";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import SendIcon from "@mui/icons-material/Send";
import { Box, CircularProgress, IconButton, LinearProgress, Stack, Typography, useTheme } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiUserAtom } from "atoms/auth";
import JobPositionAvatar from "components/generic/job-position-avatar";
import {
  CreateTaskCommentRequest,
  DeleteTaskCommentRequest,
  TaskComment,
  UpdateTaskCommentRequest,
  User,
} from "generated/client";
import { useListJobPositionsQuery, useListTaskCommentsQuery } from "hooks/api-queries";
import { useApi } from "hooks/use-api";
import { useAtomValue } from "jotai";
import { DateTime } from "luxon";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Mention, MentionItem, MentionsInput } from "react-mentions";
import UserUtils from "utils/users";

/**
 * Component properties
 */
interface Props {
  projectId: string;
  milestoneId: string;
  taskId: string;
  projectUsers: User[];
  projectUsersMap: Record<string, string>;
  projectKeycloakUsersMap: Record<string, string>;
}

/**
 * Comments section component for the task dialog
 *
 * @param props component properties
 */
const CommentsSection = ({
  projectId,
  milestoneId,
  taskId,
  projectUsers,
  projectUsersMap,
  projectKeycloakUsersMap,
}: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { taskCommentsApi } = useApi();
  const queryClient = useQueryClient();
  const loggedInUser = useAtomValue(apiUserAtom);
  const listTaskCommentsQuery = useListTaskCommentsQuery({ projectId, taskId: taskId });
  const listJobPositionsQuery = useListJobPositionsQuery();
  const jobPositions = listJobPositionsQuery.data?.jobPositions;

  const [newComment, setNewComment] = useState("");
  const [newCommentDisplay, setNewCommentDisplay] = useState("");
  const [commentReferencedUsers, setCommentReferencedUsers] = useState<string[]>([]);
  const [isEditingId, setIsEditingId] = useState("");
  const [editingComment, setEditingComment] = useState("");
  const [editingCommentDisplay, setEditingCommentDisplay] = useState("");
  const [editingReferencedUsers, setEditingReferencedUsers] = useState<string[]>([]);

  const commentsLoading = listTaskCommentsQuery?.isLoading || listTaskCommentsQuery?.isFetching;

  /**
   * Create task comment mutation
   */
  const createTaskCommentMutation = useMutation({
    mutationFn: (params: CreateTaskCommentRequest) => taskCommentsApi.createTaskComment(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "milestones", milestoneId, "comments", { taskId }],
      });
    },
    onError: (error) => console.error(t("errorHandling.errorCreatingTaskComment"), error),
  });

  /**
   * Update task comment mutation
   */
  const updateTaskCommentMutation = useMutation({
    mutationFn: (params: UpdateTaskCommentRequest) => taskCommentsApi.updateTaskComment(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "milestones", milestoneId, "comments", { taskId }],
      });
    },
    onError: (error) => console.error(t("errorHandling.errorUpdatingTaskComment"), error),
  });

  /**
   * Delete task comment mutation
   */
  const deleteTaskCommentMutation = useMutation({
    mutationFn: (params: DeleteTaskCommentRequest) => taskCommentsApi.deleteTaskComment(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "milestones", milestoneId, "comments", { taskId }],
      });
    },
    onError: (error) => console.error(t("errorHandling.errorDeletingTaskComment"), error),
  });

  /**
   * Handles edit click to edit a comment
   *
   * @param commentId string
   * @param commentValue string
   */
  const handleEditClick = (commentId: string, commentValue: string) => {
    if (isEditingId) {
      setIsEditingId("");
      setEditingComment("");
      setEditingCommentDisplay("");
      setEditingReferencedUsers([]);
    } else {
      setIsEditingId(commentId);
      setEditingComment(commentValue);
      setEditingCommentDisplay(commentValue);
      const existingReferencedUsers = extractMentions(commentValue);
      setEditingReferencedUsers(existingReferencedUsers);
    }
  };

  /**
   * Handle mention changes in comment creation
   *
   * @param event
   * @param _newValue
   * @param newPlainTextValue
   * @param mentions
   */
  const handleMentionChange = (
    event: { target: { value: string } },
    _newValue: string,
    newPlainTextValue: string,
    mentions: MentionItem[],
  ) => {
    // biome-ignore lint/complexity/noForEach: Using forEach for readability
    commentReferencedUsers.forEach((userId) => {
      if (!newPlainTextValue.includes(projectUsersMap[userId])) {
        handleMentionDelete(userId);
      }
    });

    setNewComment(newPlainTextValue);
    setNewCommentDisplay(event.target.value);
    if (mentions.some((mention) => !commentReferencedUsers.includes(mention.id))) {
      setCommentReferencedUsers((prev) => [
        ...prev,
        ...mentions.map((mention) => mention.id).filter((id) => !prev.includes(id)),
      ]);
    }
  };

  /**
   * Handle mention changes in comment update
   *
   * @param event
   * @param _newValue
   * @param newPlainTextValue
   * @param mentions
   */
  const handleUpdateMentionChange = (
    event: { target: { value: string } },
    _newValue: string,
    newPlainTextValue: string,
    mentions: MentionItem[],
  ) => {
    // biome-ignore lint/complexity/noForEach: Using forEach for readability
    editingReferencedUsers.forEach((userId) => {
      if (!newPlainTextValue.includes(projectUsersMap[userId])) {
        handleUpdateMentionDelete(userId);
      }
    });

    setEditingComment(newPlainTextValue);
    setEditingCommentDisplay(event.target.value);
    setEditingReferencedUsers((prev) => {
      const updatedUsers = [...prev, ...mentions.map((mention) => mention.id)];
      const uniqueUsers = Array.from(new Set(updatedUsers));
      return uniqueUsers;
    });
  };

  /**
   * Handles removing a referenced user when mention removed from a comment
   *
   * @param id string
   */
  const handleMentionDelete = (id: string) => {
    setCommentReferencedUsers((prevUsers) => prevUsers.filter((userId) => userId !== id));
  };

  /**
   * Handles removing a referenced user when mention removed from a comment when updating
   *
   * @param id string
   */
  const handleUpdateMentionDelete = (id: string) => {
    setEditingReferencedUsers((prevUsers) => prevUsers.filter((userId) => userId !== id));
  };

  /**
   * Extracts all mentions from a comment
   *
   * @param comment string
   */
  const extractMentions = (comment: string) => {
    const mentionRegex = /@\w+\s\w+/g;
    const mentions = comment.match(mentionRegex) || [];

    const validMentionIds = mentions.reduce<string[]>((list, mention) => {
      const mentionName = mention.slice(1);
      const userEntry = Object.entries(projectUsersMap).find(([, name]) => mentionName === name);
      const userId = userEntry?.at(0);
      if (userId) list.push(userId);
      return list;
    }, []);

    return validMentionIds;
  };

  /**
   *  Applies highlight styles to mentions in comments
   *
   * @param comment string
   */
  const parseAndStyleMentions = (comment: string) => {
    const mentionRegex = /@\w+\s\w+/g;
    const plainTextParts = comment.split(mentionRegex);
    const mentions = comment.match(mentionRegex);
    const projectUserNames = Object.values(projectUsersMap);

    return (
      <>
        {plainTextParts.map((part, index) => {
          const mention = mentions?.at(index);
          const mentionName = mention?.substring(1);
          const mentionKey = `${mentionName}-${index}`;
          const mentionMatchesUser = mentionName && projectUserNames.includes(mentionName);

          return (
            <Typography component="span" key={mentionKey}>
              {part}
              {mentionMatchesUser ? (
                <Typography component="span" sx={{ color: "#0079BF" }}>
                  {mention}
                </Typography>
              ) : (
                mention
              )}
            </Typography>
          );
        })}
      </>
    );
  };

  /**
   * Handles deleting a task comment
   *
   * @param id comment id
   */
  const handleDeleteComment = async (id: string) => {
    await deleteTaskCommentMutation.mutateAsync({
      projectId: projectId,
      taskId: taskId,
      commentId: id,
    });
    await listTaskCommentsQuery?.refetch();
    setIsEditingId("");
    setEditingComment("");
    setEditingCommentDisplay("");
    setEditingReferencedUsers([]);
  };

  /**
   * Persists new comment
   */
  const persistNewComment = async () => {
    if (!newComment || !taskId) return;

    await createTaskCommentMutation.mutateAsync({
      projectId: projectId,
      taskId: taskId,
      taskComment: {
        comment: newComment,
        taskId: taskId,
        referencedUsers: commentReferencedUsers,
      },
    });
    await listTaskCommentsQuery?.refetch();
    setNewComment("");
    setNewCommentDisplay("");
    setCommentReferencedUsers([]);
  };

  /**
   * Updates task comment
   *
   * @param commentId string
   */
  const updateComment = async (commentId: string) => {
    if (!commentId) return;

    await updateTaskCommentMutation.mutateAsync({
      commentId: commentId,
      projectId: projectId,
      taskId: taskId,
      taskComment: {
        comment: editingComment,
        taskId: taskId,
        referencedUsers: editingReferencedUsers,
      },
    });
    await listTaskCommentsQuery?.refetch();
    setIsEditingId("");
    setEditingComment("");
    setEditingCommentDisplay("");
    setEditingReferencedUsers([]);
  };

  /**
   * Renders the mentions input for comments
   *
   * @param editingValue editing value
   */
  const renderMentionsInput = (existingComment?: TaskComment) => {
    const existingCommentId = existingComment?.id;
    const existingReferencedUsers = existingComment ? editingReferencedUsers : commentReferencedUsers;
    const projectUsers = Object.keys(projectUsersMap)
      .filter((userId) => !existingReferencedUsers.includes(userId))
      .map((userId) => ({ id: userId, display: projectUsersMap[userId] }));

    return (
      <Box position="relative" width="100%">
        <MentionsInput
          value={existingComment ? editingCommentDisplay : newCommentDisplay}
          onChange={existingComment ? handleUpdateMentionChange : handleMentionChange}
          onKeyDown={(event) => {
            if (event.code !== "Enter" || !event.shiftKey) return;
            event.preventDefault();
            event.stopPropagation();
            const noContent = existingComment ? !editingCommentDisplay : !newCommentDisplay;
            if (noContent) return;
            persistNewComment();
          }}
          style={{
            width: "100%",
            height: "auto",
            highlighter: {
              boxSizing: "border-box",
              height: 100,
            },
            input: {
              backgroundColor: "#fff",
              borderRadius: 4,
              border: "1px solid #0000001A",
              padding: 8,
              paddingRight: 90,
            },
            suggestions: {
              list: {
                backgroundColor: "white",
                border: "1px solid rgba(0,0,0,0.15)",
                fontSize: 14,
                // Styles to ensure mention list visibility- could be improved
                maxHeight: 100,
                overflowY: "auto",
              },
              item: {
                padding: "5px 15px",
                borderBottom: "1px solid rgba(0,0,0,0.15)",
                "&focused": {
                  backgroundColor: "#2196F314",
                },
              },
            },
          }}
          placeholder={t("taskComments.addComment")}
        >
          <Mention
            trigger="@"
            data={projectUsers}
            displayTransform={(_, display) => `@${display}`}
            style={{
              textDecoration: "underline",
              textDecorationColor: "#2196F3",
            }}
          />
        </MentionsInput>
        <Box
          position="absolute"
          top={theme.spacing(2)}
          right={theme.spacing(2)}
          width={theme.spacing(2)}
          height={theme.spacing(2)}
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          gap={1}
        >
          {existingComment && (
            <IconButton
              size="small"
              title={t("generic.cancel")}
              onClick={() => {
                setIsEditingId("");
                setEditingComment("");
              }}
            >
              <CancelIcon fontSize="small" />
            </IconButton>
          )}
          {existingCommentId && (
            <IconButton
              title={t("generic.save")}
              size="small"
              color="primary"
              disabled={!editingCommentDisplay}
              onClick={() => updateComment(existingCommentId)}
            >
              {updateTaskCommentMutation.isPending ? (
                <CircularProgress thickness={5} size={20} />
              ) : (
                <SaveIcon fontSize="small" />
              )}
            </IconButton>
          )}
          {!existingCommentId && (
            <IconButton size="small" color="primary" disabled={!newCommentDisplay} onClick={persistNewComment}>
              {createTaskCommentMutation.isPending ? (
                <CircularProgress thickness={5} size={20} />
              ) : (
                <SendIcon fontSize="small" />
              )}
            </IconButton>
          )}
        </Box>
      </Box>
    );
  };

  /**
   * Renders list of comments
   */
  const renderComments = () => {
    return listTaskCommentsQuery?.data?.map((comment) => {
      if (!comment?.id) return;

      const commentId = comment.id;
      const editDisabled = !!isEditingId && isEditingId !== commentId;
      const editActive = !!isEditingId && isEditingId === commentId;
      const commentCreatorName = comment.metadata?.creatorId && projectKeycloakUsersMap[comment.metadata.creatorId];
      const lastModifiedDate =
        comment.metadata?.modifiedAt && DateTime.fromJSDate(comment.metadata?.modifiedAt).toFormat("dd.MM.yyyy HH:mm");
      const hasBeenEdited = comment.metadata?.modifiedAt?.getTime() !== comment.metadata?.createdAt?.getTime();
      const isOwnComment = loggedInUser?.keycloakId === comment.metadata?.creatorId;

      return (
        <Stack key={commentId} direction="row" alignItems="center" mb={1} gap={1}>
          <JobPositionAvatar
            jobPosition={UserUtils.getUserJobPosition(
              jobPositions,
              projectUsers.find((user) => comment.metadata?.creatorId === user.id),
            )}
          />
          <Stack flex={1}>
            {!editActive && (
              <>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Typography variant="subtitle1">
                    <b>{commentCreatorName}</b> - {lastModifiedDate}
                  </Typography>
                  {hasBeenEdited && (
                    <Typography variant="subtitle1" color="#0000008F">
                      {t("taskComments.editFlag")}
                    </Typography>
                  )}
                </Stack>
                <Typography>{parseAndStyleMentions(comment.comment)}</Typography>
              </>
            )}
            {editActive && renderMentionsInput(comment)}
          </Stack>
          {isOwnComment && !editActive && (
            <Stack display="inline-flex" direction="row" gap={1}>
              <IconButton
                onClick={() => handleEditClick(commentId, comment.comment)}
                disabled={editDisabled}
                sx={{ color: "#0000008F" }}
              >
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDeleteComment(commentId)} sx={{ color: "#0000008F" }}>
                <DeleteOutlineIcon />
              </IconButton>
            </Stack>
          )}
        </Stack>
      );
    });
  };

  /**
   * Main component render
   */
  return (
    <Box bgcolor="#F3F3F3" p={2}>
      <Typography component="h2" variant="h6" py={1}>
        {t("taskComments.comments")}
      </Typography>
      <Stack direction="row" mb={3} gap={1}>
        <JobPositionAvatar jobPosition={UserUtils.getUserJobPosition(jobPositions, loggedInUser)} />
        {renderMentionsInput()}
      </Stack>
      {commentsLoading ? <LinearProgress /> : renderComments()}
    </Box>
  );
};

export default CommentsSection;
