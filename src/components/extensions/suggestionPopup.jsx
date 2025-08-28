import React, { useEffect, useRef, useState } from 'react';

const SuggestionPopup = ({
  target,
  username,
  timestamp,
  text = '',
  isDeletion = false,
  onApprove,
  onReject,
}) => {
  const popupRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;

    setPosition({
      top: rect.bottom + scrollY + 8,
      left: rect.left + scrollX,
    });
  }, [target, text]);

  return (
    <div
      ref={popupRef}
      className="suggestion-popup"
      style={{
        position: 'absolute',
        zIndex: 9999,
        width: 280,
        top: position.top,
        left: position.left,
        backgroundColor: '#f8f9fa',
        border: '1px solid #edf2fa',
        borderRadius: 8,
        padding: 10,
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        fontSize: 14,
        cursor: 'default',
      }}
    >
      <div className="thread">
        <div className="comment" style={{ marginTop: 4, padding: 5 }}>
          <div
            className="label-group"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <strong>{username}</strong>
            <span style={{ color: '#666', fontSize: '0.85em' }}>
              {new Date(timestamp).toLocaleTimeString()}
            </span>
          </div>
          <div className="comment-content" style={{ marginTop: 6 }}>
            <p style={{ margin: 0 }}>
              {text || (isDeletion ? 'Text deleted' : 'New suggestion')}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button
            onClick={(event)=>onApprove(event)}
            style={{
              padding: '4px 8px',
              fontSize: 13,
              background: '#e6f4ea',
              border: '1px solid #b7dfc8',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Approve
          </button>
          <button
            onClick={onReject}
            style={{
              padding: '4px 8px',
              fontSize: 13,
              background: '#fbeaea',
              border: '1px solid #f2c2c2',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Reject
          </button>
        </div>
        <div
          style={{ marginTop: 6, fontSize: '0.85em', color: '#888' }}
        >
          0 replies
        </div>
      </div>
    </div>
  );
};

export default SuggestionPopup;
