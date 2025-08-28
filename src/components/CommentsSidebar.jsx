import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Divider,
} from '@mui/material'

export function CommentsSidebar({ editor, threads, selectThread, resolveThread, unresolveThread, deleteThread }) {
  const scrollToThread = (threadId) => {
    if (!editor) return
    editor.chain().focus().selectThread({ id: threadId }).run()
    editor.view.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <Box sx={{ width: 300, p: 2, borderLeft: '1px solid #ddd', overflowY: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Comments
      </Typography>

      {threads.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No comments available.
        </Typography>
      )}

      <Stack spacing={2}>
        {threads.map((thread) => (
          <Card
            key={thread.id}
            variant="outlined"
            elevation={3}
            sx={{
              cursor: 'pointer',
              borderRadius: 2,
              boxShadow: 3,
              '&:hover': { backgroundColor: '#f9f9f9' },
            }}
            onClick={() => scrollToThread(thread.id)}
          >
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Comment:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  backgroundColor: '#f0f0f0',
                  p: 0.5,
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                {thread.comments[0]?.content || 'No content'}
              </Typography>

              <Divider sx={{ my: 1 }} />

              <Stack direction="row" spacing={1}>
                {thread.resolvedAt ? (
                  <Button
                    size="small"
                    variant="outlined"
                    color="success"
                    onClick={(e) => {
                      e.stopPropagation()
                      unresolveThread(thread.id)
                    }}
                  >
                    Unresolve
                  </Button>
                ) : (
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={(e) => {
                      e.stopPropagation()
                      resolveThread(thread.id)
                    }}
                  >
                    Resolve
                  </Button>
                )}
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteThread(thread.id)
                  }}
                >
                  Delete
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  )
}
