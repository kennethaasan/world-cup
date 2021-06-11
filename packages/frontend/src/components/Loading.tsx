import { CircularProgress, Grid, makeStyles, Paper } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  root: {
    marginBottom: theme.spacing(),
  },
  loading: {
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
  },
}));

export function Loading() {
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      <Grid container justify="center">
        <CircularProgress className={classes.loading} />
      </Grid>
    </Paper>
  );
}
