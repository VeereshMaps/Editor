  import React from 'react';
  import { useThreadsState } from './context';
  import { ThreadsListItem } from './ThreadsListItem';
  
  export const ThreadsList = ({ provider, threads, WebSocket }) => {
    const { selectedThreads, selectedThread } = useThreadsState();
  
    if (!Array.isArray(threads) || threads.length === 0) {
      return (
        <div style={{ color: '#888', fontStyle: 'italic',textAlign:'center' }}>
          No threads.
        </div>
      );
    }
    return (
      <div
        className="threads-group"
        style={{
          height: '45vh',
          overflowY: 'auto',
          padding: '10px',
          // borderRadius: '8px',
          // background: '#fdfdfd',
          // border: '1px solid #e2e2e2',
          // boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}
      >
        {threads.map((thread) => (
          <ThreadsListItem
            key={thread.id}
            thread={thread}
            active={
              selectedThreads.includes(thread.id) || selectedThread === thread.id
            }
            open={selectedThread === thread.id}
            provider={provider}
            WebSocket={WebSocket}
          />
        ))}
      </div>
    );
  };
  