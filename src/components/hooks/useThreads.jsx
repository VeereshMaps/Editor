import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { subscribeToThreads } from '@tiptap-pro/extension-comments'
export const useThreads = (provider, editor, user, webIORef, getThreds = []) => {
  const { editionId } = useParams();
  const [threads, setThreads] = useState()
  useEffect(() => {
    if (provider) {
      const unsubscribe = subscribeToThreads({
        provider,
        callback: currentThreads => {
          setThreads(currentThreads)
        },
      })

      return () => {
        unsubscribe()
      }
    }
  }, [provider])
  const createThread = useCallback(() => {
    const input = window.prompt('Comment content');
    if (!input || !editor) return;

    // editor.chain().focus().setThread({
    //   content: input,
    //   commentData: {
    //     userName: user.name,
    //     userId: user._id,
    //     color: user.color
    //   },
    // }).run();

    const payload = {
      editionId,
      content: {
        content: input,
        data: {
          userName: user.name,
          userId: user._id,
          color: user.color
        }
      }
    };

    if (webIORef.current && webIORef.current.readyState === 1) {
      webIORef.current.send(JSON.stringify({
        type: "create-thread",
        ...payload
      }));
    }
  }, [editor, user, editionId, webIORef]);

  return { threads: getThreds, createThread };
};
