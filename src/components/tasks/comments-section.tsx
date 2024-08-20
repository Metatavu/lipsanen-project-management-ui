import { Box, Button, DialogContent, DialogContentText, IconButton, LinearProgress, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTaskCommentRequest, DeleteTaskCommentRequest, UpdateTaskCommentRequest, User } from "generated/client";
import { useApi } from "hooks/use-api";
import { DateTime } from "luxon";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Mention, MentionItem, MentionsInput } from "react-mentions";
import { useListJobPositionsQuery, useListTaskCommentsQuery } from "hooks/api-queries";
import { userProfileAtom } from "atoms/auth";
import { useAtomValue } from "jotai";
import UsersUtils from "utils/users";

/**
 * Component props
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
 * Comments section component for the  task dialog
 *
 * @param props component props
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
  const { taskCommentsApi } = useApi();
  const queryClient = useQueryClient();
  const loggedInUser = useAtomValue(userProfileAtom);
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
      queryClient.invalidateQueries({ queryKey: ["comments", projectId, milestoneId, { taskId: taskId }] });
    },
    onError: (error) => console.error(t("errorHandling.errorCreatingTaskComment"), error),
  });

  /**
   * Update task comment mutation
   */
  const updateTaskCommentMutation = useMutation({
    mutationFn: (params: UpdateTaskCommentRequest) => taskCommentsApi.updateTaskComment(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", projectId, milestoneId, { taskId: taskId }] });
    },
    onError: (error) => console.error(t("errorHandling.errorUpdatingTaskComment"), error),
  });

  /**
   * Delete task comment mutation
   */
  const deleteTaskCommentMutation = useMutation({
    mutationFn: (params: DeleteTaskCommentRequest) => taskCommentsApi.deleteTaskComment(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", projectId, milestoneId, { taskId: taskId }] });
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
  const renderMentionsInput = (editingValue?: string) => {
    const projectUsers = Object.keys(projectUsersMap)
      .filter((userId) =>
        editingValue ? !editingReferencedUsers.includes(userId) : !commentReferencedUsers.includes(userId),
      )
      .map((userId) => ({
        id: userId,
        display: projectUsersMap[userId],
      }));

    return (
      <MentionsInput
        value={editingValue ? editingCommentDisplay : newCommentDisplay}
        onChange={editingValue ? handleUpdateMentionChange : handleMentionChange}
        style={{
          width: "100%",
          height: "auto",
          backgroundColor: "white",
          highlighter: {
            boxSizing: "border-box",
            height: 100,
          },
          input: {
            border: "1px solid #0000001A",
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

      return (
        <DialogContent key={comment.id} sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
          <div style={{ marginRight: "1rem" }}>
            {UsersUtils.getUserIcon(projectUsers, comment.metadata?.creatorId, jobPositions)}
          </div>
          <Box sx={{ width: "100%" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "row", gap: "0.5rem" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {commentCreatorName}
                </Typography>
                <Typography>-</Typography>
                <Typography variant="subtitle1">{lastModifiedDate}</Typography>
                {hasBeenEdited && (
                  <Typography variant="subtitle1" color="#0000008F">
                    {t("taskComments.editFlag")}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: "flex", flexDirection: "row", gap: "0.5rem" }}>
                {loggedInUser?.id === comment.metadata?.creatorId && (
                  <IconButton
                    edge="start"
                    onClick={() => handleEditClick(commentId, comment.comment)}
                    disabled={editDisabled}
                    sx={{ color: "#0000008F" }}
                  >
                    <EditIcon />
                  </IconButton>
                )}
                {loggedInUser?.id === comment.metadata?.creatorId && (
                  <IconButton edge="start" onClick={() => handleDeleteComment(commentId)} sx={{ color: "#0000008F" }}>
                    <DeleteOutlineIcon />
                  </IconButton>
                )}
              </Box>
            </Box>
            {editActive ? (
              <>
                {renderMentionsInput(comment.comment)}
                <Box sx={{ display: "flex", flexDirection: "row", gap: "0.5rem" }}>
                  <Button onClick={() => updateComment(commentId)}>{t("taskComments.updateComment")}</Button>
                  <Button
                    onClick={() => {
                      setIsEditingId("");
                      setEditingComment("");
                    }}
                    sx={{ color: "#0000008F" }}
                  >
                    {t("generic.cancel")}
                  </Button>
                </Box>
              </>
            ) : (
              <Typography>{parseAndStyleMentions(comment.comment)}</Typography>
            )}
          </Box>
        </DialogContent>
      );
    });
  };

  /**
   * Main component render
   */
  return (
    <Box sx={{ backgroundColor: "#F3F3F3" }}>
      <DialogContentText sx={{ padding: 2 }} variant="h5">
        {t("taskComments.comments")}
      </DialogContentText>
      <DialogContent sx={{ display: "flex", flexDirection: "row", marginBottom: "1rem" }}>
        <div style={{ marginRight: "1rem" }}>
          {UsersUtils.getUserIcon(projectUsers, loggedInUser?.id, jobPositions)}
        </div>
        {renderMentionsInput()}
        <Button onClick={persistNewComment}>{t("taskComments.addComment")}</Button>
      </DialogContent>
      {commentsLoading ? <LinearProgress /> : renderComments()}
    </Box>
  );
};

export default CommentsSection;
