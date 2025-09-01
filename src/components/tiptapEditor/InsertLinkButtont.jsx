import React, { useState } from 'react';
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
} from '@mui/material';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import AlertService from 'utils/AlertService';

const InsertLinkButton = ({ editor }) => {
  const [open, setOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const handleOpenDialog = () => {
    setLinkUrl('');
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setLinkUrl('');
  };

  const handleInsertLink = () => {
    if (!linkUrl) return;
    editor.chain().focus().setLink({ href: linkUrl }).run();
    AlertService?.success?.(`Link "${linkUrl}" inserted.`);
    handleCloseDialog();
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 0.5, mx: 1 }}>
        <Tooltip title="Insert Link">
          <IconButton
            onClick={handleOpenDialog}
            sx={{
              backgroundColor: editor.isActive('link') ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
            }}
          >
            <InsertLinkIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>Insert Link</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, margin: 2 }}>
            <TextField
              label="Link URL"
              fullWidth
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleInsertLink}
            variant="contained"
            disabled={!linkUrl}
          >
            Insert
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InsertLinkButton;