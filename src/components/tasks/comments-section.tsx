import {
  Avatar,
  Box,
  Button,
  DialogContent,
  DialogContentText,
  IconButton,
  LinearProgress,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTaskCommentRequest, DeleteTaskCommentRequest, Task, UpdateTaskCommentRequest } from "generated/client";
import { useApi } from "hooks/use-api";
import { DateTime } from "luxon";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Mention, MentionItem, MentionsInput } from "react-mentions";
import { useListTaskCommentsQuery } from "hooks/api-queries";

/**
 * Component props
 */
interface Props {
  projectId: string;
  milestoneId: string;
  taskId: string;
  projectUsersMap: Record<string, string>;
}

/**
 * Comments section component for the  task dialog
 *
 * @param props component props
 */
const CommentsSection = ({ projectId, milestoneId, taskId, projectUsersMap }: Props) => {
  const { t } = useTranslation();
  const { taskCommentsApi } = useApi();
  const queryClient = useQueryClient();
  const listTaskCommentsQuery = useListTaskCommentsQuery({ projectId, milestoneId, taskId: taskId });

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
    commentReferencedUsers.length &&
      commentReferencedUsers.map((userId) => {
        if (!newPlainTextValue.includes(projectUsersMap[userId])) {
          handleMentionDelete(userId);
        }
      });

    setNewComment(newPlainTextValue);
    setNewCommentDisplay(event.target.value);
    mentions.length && setCommentReferencedUsers((prev) => [...prev, ...mentions.map((mention) => mention.id)]);
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
    editingReferencedUsers.length &&
      editingReferencedUsers.map((userId) => {
        if (!newPlainTextValue.includes(projectUsersMap[userId])) {
          handleMentionDelete(userId);
        }
      });

    setEditingComment(newPlainTextValue);
    setEditingCommentDisplay(event.target.value);
    mentions.length && setEditingReferencedUsers((prev) => [...prev, ...mentions.map((mention) => mention.id)]);
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
   * Extracts all mentions from a comment
   *
   * @param comment string
   */
  const extractMentions = (comment: string) => {
    const mentionRegex = /@\w+\s\w+/g;
    const mentions = comment.match(mentionRegex) || [];

    const validMentionIds = mentions
      .map((mention) => mention.slice(1))
      .filter((mentionName) => {
        return Object.values(projectUsersMap).includes(mentionName);
      })
      .map((mentionName) => {
        const userId = Object.keys(projectUsersMap).find((userId) => projectUsersMap[userId] === mentionName);
        return userId || "";
      })
      .filter((mentionId) => !!mentionId);

    return validMentionIds;
  };

  /**
   *  Applies highlight styles to mentions in comments
   *
   * @param comment string
   */
  const parseAndStyleMentions = (comment: string) => {
    const mentionRegex = /@\w+\s\w+/g;
    const parts = comment.split(mentionRegex);
    const mentions = comment.match(mentionRegex);

    return (
      <>
        {parts.map((part, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: no id available here
          <Typography component="span" key={index}>
            {part}
            {mentions?.[index] && Object.values(projectUsersMap).includes(mentions[index].substring(1)) ? (
              <Typography
                component="span"
                sx={{ color: "#0079BF" }}
                key={`mention-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  index
                }`}
              >
                {mentions[index]}
              </Typography>
            ) : (
              mentions?.[index]
            )}
          </Typography>
        ))}
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
      milestoneId: milestoneId,
      taskId: taskId,
      commentId: id,
    });
    await listTaskCommentsQuery?.refetch();
  };

  /**
   * Persists new comment
   */
  const persistNewComment = async () => {
    if (!newComment || !taskId) return;

    await createTaskCommentMutation.mutateAsync({
      projectId: projectId,
      milestoneId: milestoneId,
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
      milestoneId: milestoneId,
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

    const handleChange = editingValue ? handleUpdateMentionChange : handleMentionChange;

    return (
      <MentionsInput
        value={editingValue ? editingCommentDisplay : newCommentDisplay}
        onChange={handleChange}
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
      const commentCreator = comment.metadata?.creatorId && projectUsersMap[comment.metadata.creatorId];
      const lastModifiedDate =
        comment.metadata?.modifiedAt && DateTime.fromJSDate(comment.metadata?.modifiedAt).toFormat("dd.MM.yyyy HH:mm");
      const hasBeenEdited = comment.metadata?.modifiedAt?.getTime() !== comment.metadata?.createdAt?.getTime();

      return (
        <DialogContent key={comment.id} sx={{ display: "flex", flexDirection: "row" }}>
          {/* TODO: Placeholder icon until user icons ready */}
          <Avatar sx={{ backgroundColor: "#0079BF", marginRight: "1rem" }}>
            <FlagOutlinedIcon fontSize="large" sx={{ color: "#fff" }} />
          </Avatar>
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
                  {commentCreator}
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
                {/* TODO: Only the user who created a comment should be able to edit */}
                <IconButton
                  edge="start"
                  onClick={() => handleEditClick(commentId, comment.comment)}
                  disabled={editDisabled}
                  sx={{ color: "#0000008F" }}
                >
                  <EditIcon />
                </IconButton>
                {/* TODO: Only the user who created a comment should be able to delete */}
                <IconButton edge="start" onClick={() => handleDeleteComment(commentId)} sx={{ color: "#0000008F" }}>
                  <DeleteOutlineIcon />
                </IconButton>
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
        {/* TODO: Placeholder icon until user icons ready */}
        <Avatar sx={{ backgroundColor: "#0079BF", marginRight: "1rem" }}>
          <FlagOutlinedIcon fontSize="large" sx={{ color: "#fff" }} />
        </Avatar>
        {renderMentionsInput()}
        <Button onClick={persistNewComment}>{t("taskComments.addComment")}</Button>
      </DialogContent>
      {commentsLoading ? <LinearProgress /> : renderComments()}
    </Box>
  );
};

export default CommentsSection;
