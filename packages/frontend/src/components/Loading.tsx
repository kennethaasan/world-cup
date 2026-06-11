import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import React from 'react';

export function Loading() {
  return (
    <Paper sx={{ mb: 1 }}>
      <Stack sx={{ alignItems: 'center', py: 1 }}>
        <CircularProgress />
      </Stack>
    </Paper>
  );
}
