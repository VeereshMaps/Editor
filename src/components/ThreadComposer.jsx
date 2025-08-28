import React, { useCallback, useState } from 'react';
import { useUser } from './hooks/useUser';
import { useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { createcoments } from 'redux/Slices/tiptapSlice';

export const ThreadComposer = ({ threadId, provider, WebSocket }) => {
  const user = useUser();
  const [comment, setComment] = useState('');
  const { editionId } = useParams();
  const dispatch = useDispatch();

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!comment) return;

      if (provider) {
        provider.addComment(threadId, {
          content: comment,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          data: { userName: user.name },
        });

        const comments = {
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
              commentListId: threadId,
              content: comments,
            })
          );
        }

        setComment('');
      }
    },
    [comment, provider, editionId, dispatch]
  );

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: '#f9f9f9',
        border: '1px solid #ddd',
        borderRadius: '12px',
        padding: '12px',
        marginTop: '1rem',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
      }}
    >
      <textarea
        placeholder="Write a comment…"
        onChange={(e) => setComment(e.currentTarget.value)}
        value={comment}
        rows={3}
        style={{
          width: '100%',
          padding: '10px 14px',
          fontSize: '1rem',
          border: '1px solid #ccc',
          borderRadius: '8px',
          resize: 'vertical',
          fontFamily: 'inherit',
          outline: 'none',
          transition: 'border 0.2s ease',
        }}
        onFocus={(e) => (e.target.style.borderColor = '#5b9df9')}
        onBlur={(e) => (e.target.style.borderColor = '#ccc')}
      />
      <div style={{ marginTop: '10px', textAlign: 'right' }}>
        <button
          type="submit"
          disabled={!comment.length}
          style={{
            backgroundColor: comment.length ? '#4a90e2' : '#ccc',
            color: 'white',
            padding: '8px 20px',
            fontSize: '0.95rem',
            fontWeight: '500',
            border: 'none',
            borderRadius: '6px',
            cursor: comment.length ? 'pointer' : 'not-allowed',
            opacity: comment.length ? 1 : 0.7,
            transition: 'background-color 0.2s ease',
          }}
        >
          Send
        </button>
      </div>
    </form>
  );
};
