import React from 'react';
import { Dialog, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ImageViewerModal = ({ open, onClose, src }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="xl"
    fullWidth
    PaperProps={{
      sx: { backgroundColor: 'transparent', boxShadow: 'none' }
    }}
  >
    <IconButton
      onClick={onClose}
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
        bgcolor: 'rgba(0,0,0,0.5)',
        color: '#fff',
        '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
      }}
    >
      <CloseIcon />
    </IconButton>
    <Box
      component="img"
      src={src}
      sx={{
        width: '100%',
        height: '100vh',
        objectFit: 'contain',
        bgcolor: 'rgba(0,0,0,0.9)',
      }}
    />
  </Dialog>
);

export default ImageViewerModal;
