import { useThreadsState } from './context'
import { ThreadsListItem } from './ThreadsListItem'
import "../styles/tiptap.css";
export const ThreadsList = ({ provider, threads }) => {
  const { selectedThreads, selectedThread } = useThreadsState()

  if (!Array.isArray(threads) || threads.length === 0) {
    return <label className="label">No threads.</label>;
  }
  return (
    <div className="threads-group">
      {Array.isArray(threads) && threads.map((thread) => {
        // console.log('🧵 Thread:', thread);
        return (
          <ThreadsListItem
            key={thread.id}
            thread={thread}
            active={selectedThreads.includes(thread.id) || selectedThread === thread.id}
            open={selectedThread === thread.id}
            provider={provider}
          />
        );
      })}
    </div>
  );

}