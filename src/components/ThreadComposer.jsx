import { useCallback, useState } from 'react'

import { useUser } from './hooks/useUser'
import { useParams } from 'react-router'
import { useDispatch } from 'react-redux'
import { createcoments } from 'redux/Slices/tiptapSlice'
import "../styles/tiptap.css";
export const ThreadComposer = ({ threadId, provider }) => {
  const user = useUser()
  const [comment, setComment] = useState('')
  const { editionId } = useParams();
  const dispatch = useDispatch();
  const handleSubmit = useCallback(
    e => {
      e.preventDefault()

      if (!comment) {
        return
      }

      if (provider) {
        provider.addComment(threadId, {
          content: comment,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          data: { userName: user.name },
        })
        const comments = {
          content: comment,
          data: {
            userName: user.name,
            userId: user._id,
            color: user.color
          },
        }
        const payload = {
          editionId: editionId,
          commentListId: threadId,
          content: comments
        };
        dispatch(createcoments(payload));
        setComment('')

      }
    },
    [comment, provider, editionId,dispatch],
  )

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        placeholder="Reply to thread …"
        onChange={e => setComment(e.currentTarget.value)}
        value={comment}
      />
      <div className="flex-row">
        <div className="button-group">
          <button type="submit" className="primary" disabled={!comment.length}>Send</button>
        </div>
      </div>
    </form>
  )
}
