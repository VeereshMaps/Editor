import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Avatar,
    Card,
    CardContent,
    Zoom,
} from '@mui/material';
import { Send as SendIcon, Close as CloseIcon } from '@mui/icons-material';
import { useThreadsState } from 'components/Context';
import ThreadsListItem from 'components/ThreadsListItem'; // Default import

const SidebarWithComments = ({
    editor,
    mode,
    user,
    provider,
    filteredThreads,
    webIORef,
    tooltipPosition,
    showInputBox,
    setShowInputBox,
    commentText,
    setCommentText,
    handleSubmit
}) => {
    const { selectedThreads, selectedThread } = useThreadsState();
    const [positions, setPositions] = useState({});
    // console.log("@##showInputBox ", showInputBox)
    useEffect(() => {
        if (!editor) return;

        const updatePositions = () => {
            const elements = document.querySelectorAll('[data-thread-id]');

            const rawPositions = {};
            const topMap = {};

            elements.forEach((el) => {
                const threadId = el.getAttribute('data-thread-id');
                const rect = el.getBoundingClientRect();

                let top = Math.round(rect.top + window.scrollY);
                let left = Math.round(rect.left + window.scrollX);

                // Fix: Always count all entries
                topMap[top] = (topMap[top] || 0) + 1;
                const offset = (topMap[top] - 1) * 160; // Only offset duplicates

                rawPositions[threadId] = {
                    top: top + offset,
                    left,
                    width: rect.width,
                    height: rect.height,
                };
            });

            console.log("📍 Calculated positions:", rawPositions);
            setPositions(rawPositions);
        };

        const timeout = setTimeout(updatePositions, 300);

        window.addEventListener("resize", updatePositions);
        window.addEventListener("scroll", updatePositions);

        return () => {
            clearTimeout(timeout);
            window.removeEventListener("resize", updatePositions);
            window.removeEventListener("scroll", updatePositions);
        };
    }, [editor, filteredThreads, provider?.isSynced]);

    const handleCommentSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!commentText.trim()) return;

        try {
            await handleSubmit();

            console.log("Comment submitted successfully");

        } catch (error) {
            console.error("Error submitting comment:", error);
        }
    }, [commentText, handleSubmit]);

    const handleCancel = useCallback(() => {
        setShowInputBox(false);
        setCommentText('');
    }, [setShowInputBox, setCommentText]);

    return (
        <Box
            className="sidebar-options sidebar"
            sx={{
                backgroundColor: 'rgb(249, 251, 253)',
                width: 300,
                p: 1.25,
                height: '100%',
                position: 'relative',
                overflow: 'visible'
            }}
        >


            {/* Threads Container */}
            <Box
                className="threads-group"
                sx={{
                    position: 'relative',
                    height: '100%',
                    p: 1.25,
                    overflow: 'visible',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                {/* Loading State */}
                {!provider?.isSynced && (
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="200px"
                    >
                        <Typography variant="body2" color="text.secondary">
                            Syncing comments...
                        </Typography>
                    </Box>
                )}
                {/* Comment Input Box */}
                {(!editor?.state.selection.empty && showInputBox && (mode === "Editing" || mode === "Suggesting")) && (
                    <Card
                        sx={{
                            position: 'absolute',
                            top: tooltipPosition?.top || 0,
                            width: 280,
                            zIndex: 1500,
                            boxShadow: 3,
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            {/* User Info */}
                            <Box display="flex" alignItems="center" mb={1}>
                                {user?.avatarUrl && (
                                    <Avatar
                                        src={user.avatarUrl}
                                        alt={user.name}
                                        sx={{ width: 24, height: 24, mr: 1 }}
                                    />
                                )}
                                <Typography variant="caption" color="text.secondary">
                                    {user?.name || 'Anonymous'}
                                </Typography>
                            </Box>

                            {/* Comment Form */}
                            <Box component="form" onSubmit={handleCommentSubmit}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Write your comment..."
                                    variant="outlined"
                                    size="small"
                                    sx={{ mb: 1 }}
                                    autoFocus
                                />

                                {/* Action Buttons */}
                                <Box display="flex" justifyContent="space-between" gap={1}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<CloseIcon />}
                                        onClick={handleCancel}
                                        color="inherit"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="small"
                                        endIcon={<SendIcon />}
                                        disabled={!commentText.trim()}
                                        color="primary"
                                    >
                                        Submit
                                    </Button>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {/* Thread Items */}
                {provider?.isSynced && filteredThreads.map((thread) => {
                    const pos = positions[thread.id];

                    if (!pos) return null;

                    return (
                        <Zoom
                            key={thread.id}
                            in={Boolean(pos)}
                            timeout={300}
                            style={{
                                position: 'absolute',
                                top: pos.top - 330,
                                zIndex: 1000,
                                width: '100%'
                            }}
                        >
                            <Box sx={{ p: 2.5 }}>
                                <ThreadsListItem
                                    id={thread.id}
                                    active={selectedThreads.includes(thread.id)}
                                    open={selectedThread === thread.id}
                                    thread={thread}
                                    provider={provider}
                                    WebSocket={webIORef}
                                />
                            </Box>
                        </Zoom>
                    );
                })}

                {/* Empty State */}
                {provider?.isSynced && filteredThreads.length === 0 && (
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        height="200px"
                        textAlign="center"
                    >
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No Comments
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Select text to start a conversation
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default SidebarWithComments;