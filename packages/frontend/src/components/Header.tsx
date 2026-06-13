import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React from 'react';

function TournamentMark() {
  return (
    <Box
      aria-hidden
      sx={{
        width: 52,
        height: 52,
        borderRadius: '32% 68% 44% 56% / 55% 33% 67% 45%',
        background:
          'conic-gradient(from 210deg, #00d4ff, #35f2a3, #f6fbff, #ff3d7f, #0078ff, #00d4ff)',
        boxShadow: '0 0 36px rgba(0, 212, 255, 0.36)',
        display: { xs: 'none', sm: 'block' },
        flex: '0 0 auto',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 9,
          borderRadius: 'inherit',
          border: '2px solid rgba(6, 16, 31, 0.72)',
          background:
            'linear-gradient(135deg, rgba(6, 16, 31, 0.88), rgba(13, 25, 48, 0.58))',
        },
      }}
    />
  );
}

export function Header() {
  return (
    <Box component="header" sx={{ px: { xs: 1.25, sm: 2, lg: 3 }, pt: 2 }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          maxWidth: 1800,
          mx: 'auto',
          overflow: 'hidden',
          border: '1px solid rgba(219, 234, 254, 0.16)',
          borderRadius: 5,
          background:
            'linear-gradient(135deg, rgba(13, 25, 48, 0.82), rgba(6, 16, 31, 0.62))',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 22px 80px rgba(2, 6, 23, 0.34)',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 18% 0%, rgba(0, 212, 255, 0.26), transparent 24rem), radial-gradient(circle at 82% 12%, rgba(255, 61, 127, 0.2), transparent 22rem)',
            pointerEvents: 'none',
          },
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: 118, md: 136 },
            px: { xs: 2, sm: 3 },
            py: 2,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center', minWidth: 0, width: '100%' }}
          >
            <TournamentMark />
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
                  fontSize: { xs: 34, sm: 46, md: 58 },
                  lineHeight: 0.92,
                  maxWidth: 980,
                }}
              >
                Meisterskaps-Tipping 2026
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ mt: 1, maxWidth: 720, fontSize: { xs: 14, sm: 16 } }}
              >
                Live tabell, poengjakt og fasit i et nytt
                glassmorphism-draktsett.
              </Typography>
            </Box>
          </Stack>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
