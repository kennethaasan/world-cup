import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React from 'react';

export function Loading() {
  return (
    <Box component="main" sx={{ px: 2, py: { xs: 4, md: 6 } }}>
      <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
        <CircularProgress size={30} />
        <Typography variant="body2" color="text.secondary">
          Laster tabellen
        </Typography>
      </Stack>
    </Box>
  );
}
