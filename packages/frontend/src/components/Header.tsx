import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React from 'react';

function FootballMark() {
  return (
    <Box
      aria-hidden
      sx={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        backgroundColor: '#f6fbff',
        boxShadow:
          'inset -8px -10px 0 rgba(6, 16, 31, 0.18), 0 12px 28px rgba(0, 212, 255, 0.22)',
        display: 'grid',
        placeItems: 'center',
        flex: '0 0 auto',
        fontSize: 28,
      }}
    >
      ⚽
    </Box>
  );
}

export function Header() {
  return (
    <Box
      component="header"
      sx={{
        width: '100%',
        maxWidth: 1800,
        mx: 'auto',
        boxSizing: 'border-box',
        px: { xs: 1.25, sm: 2, lg: 3 },
        pt: 2,
      }}
    >
      <AppBar
        position="static"
        elevation={0}
        sx={{
          width: '100%',
          overflow: 'hidden',
          border: '1px solid rgba(219, 234, 254, 0.16)',
          borderRadius: '8px',
          background:
            'linear-gradient(135deg, rgba(13, 25, 48, 0.82), rgba(6, 16, 31, 0.62))',
          backdropFilter: 'blur(18px)',
          boxShadow: '0 16px 48px rgba(2, 6, 23, 0.28)',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(0, 212, 255, 0.14), transparent 42%, rgba(255, 61, 127, 0.12))',
            pointerEvents: 'none',
          },
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: 104, md: 116 },
            px: { xs: 2, sm: 3 },
            py: { xs: 1.75, md: 2 },
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center', minWidth: 0, width: '100%' }}
          >
            <FootballMark />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: 'wrap', gap: 1, mb: 1 }}
              >
                <Chip color="primary" label="World Cup 2026" size="small" />
                <Chip
                  label="USA · Canada · Mexico"
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: 'rgba(255, 255, 255, 0.24)' }}
                />
              </Stack>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: 30, sm: 38, md: 46 },
                  lineHeight: 1.05,
                  maxWidth: 980,
                }}
              >
                Meisterskaps-Tipping 2026
              </Typography>
            </Box>
          </Stack>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
