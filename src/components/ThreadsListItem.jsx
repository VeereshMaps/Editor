import React, { useCallback, useMemo } from 'react';
import { useParams } from 'react-router';
import { useThreadsState } from './Context';
import { CommentCard } from './CommentCard';
import { ThreadCard } from './ThreadCard';
import { ThreadComposer } from './ThreadComposer';
import '../styles/tiptap.css';

const buttonStyle = {
    padding: '4px',
    marginRight: '8px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    backgroundColor: '#f1f1f1',
    cursor: 'pointer',
    fontSize: '0.7rem',
};


const cancelButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#e0e0e0',
    color: '#333',
};

export const ThreadsListItem = ({ thread, provider, active, open, WebSocket }) => {
    const {
        onClickThread,
        deleteThread,
        onHoverThread,
        onLeaveThread,
        resolveThread,
        unresolveThread,
    } = useThreadsState();

    const classNames = ['threadsList--item'];
    // console.log(active + "   uu " + open);
    (active, open)
    if (active || open) classNames.push('threadsList--item--active');

    const { editionId } = useParams();

    const comments = useMemo(() => {
        const result = thread.comments || provider.getThreadComments?.(thread.id, true) || [];
        return result;
    }, [provider, thread]);
    // const comments = useMemo(() => provider.getThreadComments(thread.id, true), [provider, thread])

    const firstComment = comments?.[0];

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
    }, [thread.id, resolveThread]);

    const handleUnresolveClick = useCallback(() => {
        unresolveThread(thread.id);
        // alert("fbfj"+WebSocket.current?.readyState)
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
    }, [thread.id, unresolveThread]);

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
            provider.deleteComment(thread.id, commentId, { deleteContent: true });
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
        [provider, thread.id, WebSocket, editionId]
    );

    return (
        <div
            onMouseEnter={() => {
                onHoverThread(thread.id);
            }}
            onMouseLeave={onLeaveThread}
            style={{
                marginBottom: '10px',
                borderRadius: '8px',
                border: active ? '2px solid #5c9ded' : '1px solid #ccc',
                padding: '10px',
                backgroundColor: open ? '#f8f9fa' : '#fff',
                boxShadow: active ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.3s ease',
            }}
        >
            <ThreadCard
                id={thread.id}
                active={active}
                open={open}
                onClick={() => onClickThread(thread.id)} 
            >
                {open && (
                    <>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                marginBottom: '8px',
                            }}
                        >
                            {!thread.resolvedAt ? (
                                <button onClick={handleResolveClick} style={cancelButtonStyle}>
                                    ✓ Resolve
                                </button>
                            ) : (
                                <button onClick={handleUnresolveClick} style={cancelButtonStyle}>
                                    ⟲ Unresolve
                                </button>
                            )}
                            <button onClick={handleDeleteClick} style={cancelButtonStyle}>
                                × Delete
                            </button>
                        </div>

                        {thread.resolvedAt && (
                            <div style={{ fontSize: '0.9em', color: '#666' }}>
                                💡 Resolved at {new Date(thread.resolvedAt).toLocaleString()}
                            </div>
                        )}

                        <div style={{ marginTop: '12px' }}>
                            {comments.map((comment) => (
                                <CommentCard
                                    key={comment.id}
                                    name={comment.data?.userName}
                                    content={comment.deletedAt ? null : comment.content}
                                    createdAt={comment.createdAt}
                                    deleted={comment.deletedAt}
                                    onEdit={(val) => val && editComment(comment.id, val)}
                                    onDelete={() => deleteComment(comment.id)}
                                    showActions
                                />
                            ))}
                        </div>

                        <div style={{ marginTop: '16px' }}>
                            <ThreadComposer
                                threadId={thread.id}
                                provider={provider}
                                WebSocket={WebSocket}
                            />
                        </div>
                    </>
                )}

                {!open && firstComment?.data && (
                    <div>
                        <CommentCard
                            key={firstComment.id}
                            name={firstComment.data.userName}
                            content={firstComment.content}
                            createdAt={firstComment.createdAt}
                            deleted={firstComment.deletedAt}
                            onEdit={(val) => val && editComment(firstComment.id, val)}
                        />
                        <div style={{ marginTop: '4px', fontSize: '0.85em', color: '#888' }}>
                            {Math.max(0, comments.length - 1)}{' '}
                            {(comments.length - 1 || 0) === 1 ? 'reply' : 'replies'}
                        </div>
                    </div>
                )}
            </ThreadCard>
        </div>
    );
};