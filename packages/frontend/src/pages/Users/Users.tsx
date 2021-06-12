import { Box, Grid } from '@material-ui/core';
import {
  DataGrid,
  GridCellParams,
  GridColumns,
  GridRowData,
} from '@material-ui/data-grid';
import React from 'react';
import { Container } from '../../components/Container';
import { Loading } from '../../components/Loading';
import { useGetUsersQuery } from '../../generated/queries';
import { ErrorPage } from '../ErrorPage';

function getWidth(question: string): number {
  switch (question) {
    case 'Hvem går videre til 8-delsfinaler?':
      return 850;
    case 'Kvartfinalelag':
      return 450;
    case 'Semifinalelag':
      return 250;
    default:
      return 200;
  }
}

export function Users() {
  const { error, loading, data } = useGetUsersQuery();

  if (error) {
    console.error(error);
    return <ErrorPage error={error} />;
  } else if (loading) {
    return <Loading />;
  }

  const columns: GridColumns = [
    {
      field: 'name',
      headerName: 'Navn',
      width: 160,
    },
    {
      field: 'points',
      headerName: 'Poeng',
      width: 108,
      type: 'number',
      renderCell: (params: GridCellParams) => {
        return <strong>{params.value}</strong>;
      },
    },
  ];

  const rows: GridRowData[] = [];

  if (data && data.getUsers) {
    data.getUsers[0].questions?.forEach((question) => {
      columns.push({
        field: question.question,
        headerName: question.question,
        width: getWidth(question.question),
        renderCell: (params: GridCellParams) => {
          let color = undefined;

          if (question.blueprint) {
            if (question.blueprint === params.value) {
              color = 'success.main';
            }
          } else {
            color = 'text.disabled';
          }

          return (
            <Box component="span" color={color}>
              {params.value}
            </Box>
          );
        },
      });
    });

    data.getUsers.forEach((user) => {
      const row: { [key: string]: string | number } = {
        id: user.id,
        name: user.name,
        points: user.points,
      };

      user.questions?.forEach((question) => {
        row[question.question] = question.answer;
      });

      rows.push(row);
    });
  }

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
