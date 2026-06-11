import Box from '@mui/material/Box';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridValidRowModel,
} from '@mui/x-data-grid';
import React from 'react';
import { Container } from '../../components/Container';
import { Loading } from '../../components/Loading';
import { Question, useGetUsersQuery } from '../../generated/queries';
import { ErrorPage } from '../ErrorPage';

function getWidth(question: string): number {
  switch (question) {
    case 'Hvem går videre til 8-delsfinaler? Alle lag topp to og 4 av 6 lag på tredjeplass går videre til 8-delsfinaler.':
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

  const columns: GridColDef[] = [
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
      renderCell: (params: GridRenderCellParams) => {
        return <strong>{params.value}</strong>;
      },
    },
  ];

  const rows: GridValidRowModel[] = [];

  if (data && data.getUsers) {
    data.getUsers[0].questions?.forEach((question) => {
      columns.push({
        field: question.question,
        headerName: question.question,
        width: getWidth(question.question),
        renderCell: (params: GridRenderCellParams) => {
          const cellQuestion = params.value as Question;

          let color: string;

          if (question.blueprint) {
            if (cellQuestion.points === cellQuestion.max_points) {
              color = 'success.main';
            } else if (cellQuestion.points) {
              color = 'info.main';
            } else {
              color = 'secondary.main';
            }
          } else {
            color = 'text.disabled';
          }

          return (
            <Box component="span" sx={{ color }}>
              {cellQuestion.answer}
            </Box>
          );
        },
      });
    });

    data.getUsers.forEach((user) => {
      const row: { [key: string]: string | number | object } = {
        id: user.id,
        name: user.name,
        points: user.points,
      };

      user.questions?.forEach((question) => {
        row[question.question] = question;
      });

      rows.push(row);
    });
  }

  return (
    <Container>
      <Box component="main">
        <DataGrid
          autoHeight
          rows={rows}
          rowHeight={40}
          columns={columns}
          hideFooter
        />
      </Box>
    </Container>
  );
}
