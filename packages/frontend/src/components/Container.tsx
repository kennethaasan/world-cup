import Box from '@mui/material/Box';
import React from 'react';

export function Container({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        width: '100%',
        mx: 'auto',
        boxSizing: 'border-box',
        pt: 1,
        px: 1,
      }}
    >
      {children}
    </Box>
  );
}
