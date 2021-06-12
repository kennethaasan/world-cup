import { Grid } from '@material-ui/core';
import { DataGrid, GridColumns } from '@material-ui/data-grid';
import React from 'react';
import { Container } from '../../components/Container';
import { Loading } from '../../components/Loading';
import { useGetUsersQuery } from '../../generated/queries';
import { ErrorPage } from '../ErrorPage';

const columns: GridColumns = [
  {
    field: 'name',
    headerName: 'Navn',
    flex: 1,
  },
  {
    field: 'points',
    headerName: 'Poeng',
    flex: 1,
    type: 'number',
  },
];

export function Users() {
  const { error, loading, data } = useGetUsersQuery();

  if (error) {
    console.error(error);
    return <ErrorPage error={error} />;
  } else if (loading) {
    return <Loading />;
  }

  const rows =
    data && data.getUsers
      ? data.getUsers.map((user) => {
          return {
            id: user.id,
            name: user.name,
            points: user.points,
          };
        })
      : [];

  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={12} component="main">
          <DataGrid
            autoHeight
            rows={rows}
            rowHeight={40}
            columns={columns}
            hideFooter
          />
        </Grid>
      </Grid>
    </Container>
  );
}
