import { Grid } from '@material-ui/core';
import React from 'react';
import { Container } from '../../components/Container';

export function Users() {
  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={12} component="main">
          <p>Hello World</p>
        </Grid>
      </Grid>
    </Container>
  );
}
