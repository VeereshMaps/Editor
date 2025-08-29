import React, { useState, useCallback } from 'react'
import {
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material'
import SaveAsIcon from '@mui/icons-material/SaveAs'
import AlertService from 'utils/AlertService'
const SaveVersionButton = ({ editor, hasChanges, setHasChanges }) => {
  const [open, setOpen] = useState(false)
  const [commitDescription, setCommitDescription] = useState('')

  const handleOpenDialog = () => {
    if (!hasChanges) return
    setOpen(true)
  }

  const handleCloseDialog = () => {
    setOpen(false)
    setCommitDescription('')
  }

  const handleCommitDescriptionChange = (event) => {
    setCommitDescription(event.target.value)
  }

  const handleNewVersion = useCallback(
    (e) => {
      e.preventDefault()
      if (!commitDescription) return

      editor.commands.saveVersion(commitDescription)
      AlertService.success(
        `Version "${commitDescription}" created! Open the version history to see all versions.`
      )
      setCommitDescription('')
      setHasChanges(false)
      setOpen(false)
    },
    [editor, commitDescription, setHasChanges]
  )

  return (
    <>
      <Box sx={{ display: 'flex', gap: 0.5, mx: 1 }}>
        <Tooltip title={hasChanges ? "Save Version" : "No Changes to Save"}>
          <span>
            <IconButton
              disabled={!hasChanges}
              onClick={handleOpenDialog}
              size="large"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
              }}

            >
              <SaveAsIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>Save Version</DialogTitle>
        <DialogContent>
          <TextField
            label="version name"
            fullWidth
            multiline
            rows={3}
            value={commitDescription}
            onChange={handleCommitDescriptionChange}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleNewVersion}
            variant="contained"
            disabled={commitDescription.length === 0}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default SaveVersionButton
