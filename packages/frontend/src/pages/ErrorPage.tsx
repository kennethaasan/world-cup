import { Grid, Typography } from '@material-ui/core';
import React from 'react';
import { Container } from '../components/Container';

export function ErrorPage({ error }: { error: Error }) {
  return (
    <Container>
      <Grid container justify="center">
        <Grid item>
          <Typography color="secondary">Error</Typography>
          <Typography color="secondary">{error.message}</Typography>
          <Typography color="secondary">Blame Kenneth!</Typography>
        </Grid>
      </Grid>
    </Container>
  );
}
