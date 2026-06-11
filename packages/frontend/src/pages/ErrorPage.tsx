import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React from 'react';
import { Container } from '../components/Container';

export function ErrorPage({ error }: { error: Error }) {
  return (
    <Container>
      <Stack sx={{ alignItems: 'center' }}>
        <Typography color="secondary">Error</Typography>
        <Typography color="secondary">{error.message}</Typography>
        <Typography color="secondary">Blame Kenneth!</Typography>
      </Stack>
    </Container>
  );
}
