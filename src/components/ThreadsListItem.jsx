import React, { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import {
    Box,
    Paper,
    Button,
    TextField,
    Typography,
    Divider,
    Card,
    CardContent,
    IconButton,
    Chip,
    Stack,
    Tooltip
} from '@mui/material';
import {
    Check as CheckIcon,
    Refresh as RefreshIcon,
    Close as CloseIcon,
    Send as SendIcon
} from '@mui/icons-material';
import { useThreadsState } from './Context';
import { CommentCard } from './CommentCard';
import { ThreadCard } from './ThreadCard';
import '../styles/tiptap.css';
import { useUser } from './hooks/useUser';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete'
// Enhanced Comment Item Component
const CommentItem = ({
    comment,
    showActions = true,
    onEdit,
    onDelete,
    index,
}) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser._id

    const [isComposing, setIsComposing] = useState(false);
    const [composeValue, setComposeValue] = useState(comment.content || '');

    const handleEditSubmit = useCallback((e) => {
        e.preventDefault();
        if (composeValue.trim() && composeValue !== comment.content) {
            onEdit?.(comment.id, composeValue);
            setIsComposing(false);
        }
    }, [composeValue, comment.id, comment.content, onEdit]);

    const handleEditCancel = () => {
        setComposeValue(comment.content || '');
        setIsComposing(false);
    };
    console.log(comment);
    console.log(userId);


    return (
        <Card
            variant="outlined"
            sx={{
                mt: 1,
                opacity: comment.deletedAt ? 0.6 : 1,
                backgroundColor: comment.deletedAt ? 'grey.50' : 'background.paper'
            }}
        >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle2" fontWeight="bold">
                        {comment.data?.userName || 'Anonymous'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {new Date(comment.createdAt).toLocaleTimeString()}
                    </Typography>
                </Box>

                {comment.deletedAt ? (
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                        Comment was deleted
                    </Typography>
                ) : !isComposing ? (
                    <>
                        <Typography variant="body2" sx={{ mb: showActions ? 1 : 0 }}>
                            {comment.content}
                        </Typography>
                        {showActions && (userId==comment.data.userId) && (index !== 0) && (
                            <Stack direction="row" spacing={1}>

                                <Tooltip title="Edit">
                                    <IconButton
                                        size="small"
                                        onClick={() => setIsComposing(true)}
                                    // color="primary"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title="Delete">
                                    <IconButton
                                        size="small"
                                        onClick={() => onDelete?.(comment.id)}
                                    // color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        )}
                    </>
                ) : (
                    <Box component="form" onSubmit={handleEditSubmit}>
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            value={composeValue}
                            onChange={(e) => setComposeValue(e.target.value)}
                            variant="outlined"
                            size="small"
                            sx={{ mb: 1 }}
                        />
                        <Stack direction="row" spacing={1}>
                            <Button
                                type="button"
                                size="small"
                                variant="outlined"
                                onClick={handleEditCancel}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="small"
                                variant="contained"
                                disabled={!composeValue.trim() || composeValue === comment.content}
                            >
                                Save
                            </Button>
                        </Stack>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

// Main ThreadsListItem Component
const ThreadsListItem = ({ thread, provider, active, open, WebSocket }) => {
    const {
        onClickThread,
        deleteThread,
        onHoverThread,
        onLeaveThread,
        resolveThread,
        unresolveThread,
    } = useThreadsState();

    const { editionId } = useParams();
    const user = useUser();

    const comments = useMemo(() => {
        const result = thread.comments || provider.getThreadComments?.(thread.id, true) || [];
        return result;
    }, [provider, thread]);

    const firstComment = comments?.[0];
    const [comment, setComment] = useState('');

    const handleDeleteClick = useCallback(() => {
        deleteThread(thread.id);
        if (WebSocket.current?.readyState === 1) {
            WebSocket.current.send(
                JSON.stringify({
                    type: 'delete-thread',
                    editionId,
                    commentListId: thread.id,
                })
            );
        }
    }, [thread.id, deleteThread, WebSocket, editionId]);

    const handleResolveClick = useCallback(() => {
        resolveThread(thread.id);
        if (WebSocket.current?.readyState === 1) {
            WebSocket.current.send(
                JSON.stringify({
                    type: 'resolve-thread',
                    status: "1",
                    commentListId: thread.id,
                    editionId: editionId
                })
            );
        }
    }, [thread.id, resolveThread, WebSocket, editionId]);

    const handleUnresolveClick = useCallback(() => {
        unresolveThread(thread.id);
        if (WebSocket.current?.readyState === 1) {
            WebSocket.current.send(
                JSON.stringify({
                    type: 'resolve-thread',
                    status: "0",
                    commentListId: thread.id,
                    editionId: editionId
                })
            );
        }
    }, [thread.id, unresolveThread, WebSocket, editionId]);

    const editComment = useCallback(
        (commentId, val) => {
            provider.updateComment(thread.id, commentId, { content: val });
            if (WebSocket.current?.readyState === 1) {
                WebSocket.current.send(
                    JSON.stringify({
                        type: 'update-thread',
                        editionId,
                        commentListId: thread.id,
                        commentId,
                        content: { content: val },
                    })
                );
            }
        },
        [provider, thread.id, WebSocket, editionId]
    );

    const deleteComment = useCallback(
        (commentId) => {
            console.log("delete comment", thread.id, commentId);
            if (WebSocket.current?.readyState === 1) {
                WebSocket.current.send(
                    JSON.stringify({
                        type: 'delete-comment',
                        editionId,
                        commentListId: thread.id,
                        commentId,
                    })
                );
            }
        },
        [thread.id, WebSocket, editionId]
    );

    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            if (!comment.trim()) return;

            if (provider) {
                provider.addComment(thread.id, {
                    content: comment,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    data: { userName: user.name },
                });

                const commentData = {
                    content: comment,
                    data: {
                        userName: user.name,
                        userId: user._id,
                        color: user.color,
                    },
                };

                if (WebSocket.current && WebSocket.current.readyState === 1) {
                    WebSocket.current.send(
                        JSON.stringify({
                            type: 'create-comment',
                            editionId,
                            commentListId: thread.id,
                            content: commentData,
                        })
                    );
                }

                setComment('');
            }
        },
        [comment, provider, thread.id, editionId, user, WebSocket]
    );

    return (
        <Paper
            elevation={active ? 3 : 1}
            onMouseEnter={() => onHoverThread(thread.id)}
            onMouseLeave={onLeaveThread}
            sx={{
                mb: 1.25,
                borderRadius: 2.5,
                border: active ? 2 : 1,
                borderColor: active ? 'primary.main' : 'grey.300',
                p: 1.25,
                backgroundColor: open ? 'background.paper' : 'grey.50',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                    elevation: 2,
                    borderColor: active ? 'primary.main' : 'grey.400'
                }
            }}
        >
            <ThreadCard
                id={thread.id}
                active={active}
                open={open}
                onClick={() => {
                    if (!open) onClickThread(thread.id);
                }}
            >
                {open && (
                    <>
                        {/* Action buttons */}
                        <Box display="flex" justifyContent="flex-end" mb={1} gap={1}>
                            <Tooltip title="Close">
                                <IconButton
                                    size="small"
                                    // color="error"
                                    onClick={() => { onClickThread(thread.id); }}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Resolve">
                                <IconButton
                                    size="small"
                                    // color="success"
                                    onClick={handleResolveClick}
                                >
                                    <CheckIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                                <IconButton
                                    size="small"
                                    onClick={handleDeleteClick}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>

                        <Divider sx={{ mb: 1.5 }} />

                        {/* Comments */}
                        <Box>
                            {comments.map((commentItem, index) => (
                                <CommentItem
                                    key={commentItem.id}
                                    comment={commentItem}
                                    showActions={true}
                                    onEdit={editComment}
                                    onDelete={deleteComment}
                                    index={index}
                                    user={user}
                                />
                            ))}
                        </Box>

                        {/* Add new comment */}
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                            <Stack direction="row" spacing={1} alignItems="flex-end">
                                <TextField
                                    fullWidth
                                    placeholder="Write a comment…"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    variant="outlined"
                                    size="small"
                                    multiline
                                    maxRows={3}
                                />
                                <IconButton
                                    type="submit"
                                    disabled={!comment.trim()}
                                    color="primary"
                                    sx={{
                                        backgroundColor: comment.trim() ? 'primary.main' : 'grey.300',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: comment.trim() ? 'primary.dark' : 'grey.300',
                                        },
                                        '&:disabled': {
                                            backgroundColor: 'grey.300',
                                            color: 'grey.500'
                                        }
                                    }}
                                >
                                    <SendIcon />
                                </IconButton>
                            </Stack>
                        </Box>
                    </>
                )}

                {/* Collapsed view */}
                {!open && firstComment?.data && (
                    <Box>
                        <CommentItem
                            comment={firstComment}
                            showActions={false}
                            onEdit={editComment}
                            onDelete={deleteComment}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            {Math.max(0, comments.length - 1)}{' '}
                            {(comments.length - 1) === 1 ? 'reply' : 'replies'}
                        </Typography>
                    </Box>
                )}
            </ThreadCard>
        </Paper>
    );
};

export default ThreadsListItem;