import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import ActionBtn from "@/components/buttons/ActionBtn.jsx";

const ConfirmDeleteProjectModal = ({ open, deleteSuccess, onClose, onCancel, onConfirm }) => {
  return (
    <Dialog
      open={open}
      onClose={() => (deleteSuccess ? null : onClose())}
      PaperProps={{
        sx: {
          width: { xs: '90%', sm: 400 },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
        {!deleteSuccess && 'Are you sure?'}
      </DialogTitle>

      <DialogContent>
        {deleteSuccess ? (
          <Typography
            color="success.main"
            sx={{ fontWeight: 'bold', fontSize: '1rem', textAlign: 'center' }}
          >
            Your project was successfully deleted.
          </Typography>
        ) : (
          <Typography>
            This will archive (hide) your project. You won’t be able to see it afterward.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'end', px: 2, pb: 2 }}>
        {!deleteSuccess && (
          <>
            <ActionBtn title="Cancel" onClick={onCancel} />
            <ActionBtn
              title="Yes, delete"
              onClick={onConfirm}
              classes="bg-red-600 hover:bg-red-700 text-white"
            />
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteProjectModal;
