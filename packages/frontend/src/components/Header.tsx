import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React from 'react';

export function Header() {
  return (
    <header>
      <AppBar position="static">
        <Toolbar disableGutters sx={{ px: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Meisterskaps-Tipping {new Date().getFullYear()}
          </Typography>
        </Toolbar>
      </AppBar>
    </header>
  );
}
