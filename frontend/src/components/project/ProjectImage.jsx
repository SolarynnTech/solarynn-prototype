import React from 'react';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FlagIcon from '@mui/icons-material/Flag';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';

const ProjectImage = ({
                          imgUrl,
                          isFav,
                          onToggleFav,
                          onReport,
                          alertsEnabled,
                          onToggleAlerts,
                          onImageClick
                      }) => (
  <Box className="relative">
      <img
        src={imgUrl}
        alt="Preview"
        className="mt-2 rounded-md w-full h-auto max-h-[400px] object-contain"
        onClick={onImageClick}
        style={{ cursor: onImageClick ? 'pointer' : 'default' }}
      />

      <Stack
        spacing={1}
        sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 10,
            bgcolor: 'rgba(255,255,255,0.8)',
            p: 1,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
          <Tooltip title="Save to Favorites">
              <IconButton size="small" onClick={onToggleFav} sx={{ color: '#6366F1' }}>
                  {isFav ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
          </Tooltip>

          <Tooltip title="Report">
              <IconButton size="small" onClick={onReport} sx={{ color: '#d32f2f' }}>
                  <FlagIcon />
              </IconButton>
          </Tooltip>

          <Tooltip title="Receive Alerts">
              <IconButton size="small" onClick={onToggleAlerts} sx={{ color: '#f9a825' }}>
                  {alertsEnabled ? <NotificationsActiveIcon /> : <NotificationsOffIcon />}
              </IconButton>
          </Tooltip>
      </Stack>
  </Box>
);


export default ProjectImage;

