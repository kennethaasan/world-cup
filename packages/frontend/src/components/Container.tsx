import { makeStyles } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  container: {
    width: '100%',
    marginLeft: 'auto',
    boxSizing: 'border-box',
    marginRight: 'auto',
    paddingTop: theme.spacing(),
    paddingLeft: theme.spacing(),
    paddingRight: theme.spacing(),
  },
}));

export function Container({ children }: { children: React.ReactNode }) {
  const classes = useStyles();

  return <div className={classes.container}>{children}</div>;
}
