import { useCallback, useState } from 'react';
import "../styles/tiptap.css";

export const CommentCard = ({
  name,
  createdAt,
  deleted,
  content,
  onEdit,
  onDelete,
  showActions = false,
}) => {
  const [isComposing, setIsComposing] = useState(false);
  const [composeValue, setComposeValue] = useState(content);

  const handleSubmit = useCallback(
    e => {
      e.preventDefault();
      if (onEdit) {
        setIsComposing(false);
        onEdit(composeValue);
      }
    },
    [composeValue, onEdit]
  );

  const commentWrapperClass = ['comment'];
  if (deleted) commentWrapperClass.push('deleted');

  const buttonStyle = {
    padding: '4px 6px',
    marginRight: '8px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    // backgroundColor: '#f1f1f1',
    backgroundColor:'#ffffff',
    cursor: 'pointer',
    fontSize: '0.7rem',
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
  };

  const cancelButtonStyle = {
    ...buttonStyle,
    // backgroundColor: '#e0e0e0',
    color: '#333',
  };

  return (
    <div className={commentWrapperClass.join(' ')}>
      <div className="label-group">
        <label><strong>{name}</strong></label>
        <label style={{ color: '#666', fontSize: '0.85em',marginLeft:'auto' }}>
          {new Date(createdAt).toLocaleTimeString()}
        </label>
      </div>

      {deleted ? (
        <div className="comment-content">
          <p style={{ fontStyle: 'italic', color: '#888' }}>Comment was deleted</p>
        </div>
      ) : !isComposing ? (
        <div className="comment-content">
          <p>{content}</p>
          {showActions && (
            <div className="button-group" style={{ marginTop: '8px' }}>
              <button
                style={buttonStyle}
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsComposing(true);
                }}
              >
                Edit
              </button>
              {onDelete && (
                <button
                style={cancelButtonStyle}
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      ) : null}

      {isComposing && !deleted && (
        <div className="comment-edit" style={{ marginTop: '8px' }}>
          <form onSubmit={handleSubmit}>
            <textarea
              onChange={e => setComposeValue(e.currentTarget.value)}
              value={composeValue}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                resize: 'vertical',
                fontSize: '0.95rem',
              }}
            />
            <div className="flex-row" style={{ marginTop: '8px' }}>
              <div className="button-group" style={{display:'flex',flexDirection:'row'}}>
                <button
                  type="reset"
                  onClick={() => setIsComposing(false)}
                  style={cancelButtonStyle}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={primaryButtonStyle}
                  disabled={!composeValue.length || composeValue === content}
                >
                  Accept
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
