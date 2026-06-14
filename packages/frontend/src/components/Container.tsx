import Box from '@mui/material/Box';
import React from 'react';

export function Container({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1800,
        mx: 'auto',
        boxSizing: 'border-box',
        pt: { xs: 1.5, md: 2.5 },
        pb: { xs: 3, md: 5 },
        px: { xs: 1.25, sm: 2, lg: 3 },
      }}
    >
      {children}
    </Box>
  );
}
