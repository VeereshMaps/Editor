import React, { useCallback, useState } from 'react';
import { useUser } from './hooks/useUser';
import { useParams } from 'react-router';
import { useDispatch } from 'react-redux';

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
      // style={{
      //   // background: '#f9f9f9',
      //   border: '1px solid #ddd',
      //   borderRadius: '12px',
      //   // padding: '6px 12px',
      //   // marginTop: '1rem',
      //   boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
      // }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '40px',
          gap:1
        }}
      >
        <textarea
          placeholder="Write a comment…"
          onChange={(e) => setComment(e.currentTarget.value)}
          value={comment}
          rows={1}
          style={{
            flex: 1,
            padding: '8px 10px',
            fontSize: '0.95rem',
            border: '1px solid #ccc',
            borderRadius: '6px',
            resize: 'none',
            fontFamily: 'inherit',
            outline: 'none',
            transition: 'border 0.2s ease',
            height: '100%',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#5b9df9')}
          onBlur={(e) => (e.target.style.borderColor = '#ccc')}
        />
        <button
          type="submit"
          disabled={!comment.length}
          style={{
            marginLeft: 'auto',
            marginRight: 0,
            backgroundColor: comment.length ? '#4a90e2' : '#ccc',
            color: 'white',
            padding: '6px 16px',
            fontSize: '0.9rem',
            fontWeight: 500,
            border: 'none',
            borderRadius: '6px',
            cursor: comment.length ? 'pointer' : 'not-allowed',
            opacity: comment.length ? 1 : 0.7,
            height: '100%',
          }}
        >
          Replay
        </button>
      </div>
    </form>

  );
};
