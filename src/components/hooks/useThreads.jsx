import { subscribeToThreads } from '@tiptap-pro/extension-comments'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router'
import {createThrad } from 'redux/Slices/tiptapSlice'
export const useThreads = (provider, editor, user) => {
  const [threads, setThreads] = useState()
  const { editionId } = useParams();
  const dispatch = useDispatch();
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

    // Create in Tiptap/Yjs
    editor.chain().focus().setThread({
      content: input,
      commentData: {
        userName: user.name,
        userId: user._id,
        color: user.color
      },
    }).run();
    const comments = {
      content: input,
      data: {
        userName: user.name,
        userId: user._id,
        color: user.color
      },
    }
    const payload = {
      editionId: editionId,
      content: comments
    };
    // Send to backend
    dispatch(createThrad(payload));
  }, [editor, user, dispatch]);
  console.log(threads);

  return { threads, createThread }
}

