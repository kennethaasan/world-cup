import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowParams,
  GridValidRowModel,
} from '@mui/x-data-grid';
import React, { useEffect, useMemo, useState } from 'react';
import { Container } from '../../components/Container';
import { Loading } from '../../components/Loading';
import {
  Question,
  useGetUserQuery,
  useGetUsersQuery,
} from '../../generated/queries';
import { ErrorPage } from '../ErrorPage';
import { AnswerPart, getAnswerParts } from './answerParts';
import { QuestionSummary, getQuestionSummaries } from './questionSummaries';

type QuestionFilter = 'all' | 'scored' | 'unscored';

const CATEGORY_LABELS: Record<string, string> = {
  MATCHES: 'Kamper',
  KNOCKOUT: 'Sluttspill',
  AWARDS: 'Priser',
  NORWAY: 'Norge',
  OTHER: 'Annet',
};

const STATUS_LABELS: Record<string, string> = {
  UNSCORED: 'Ikke avgjort',
  WRONG: 'Feil',
  PARTIAL: 'Delvis',
  CORRECT: 'Riktig',
};

function getWidth(question: string): number {
  if (
    question.includes('Hvem går videre til 16-delsfinaler') ||
    question.includes('Hvilke lag finner vi i 8-delsfinalene?')
  ) {
    return 850;
  } else if (question.includes('kvartfinalene')) {
    return 450;
  } else if (
    question.includes('semifinalene') ||
    question.includes('finalen')
  ) {
    return 320;
  }

  return 220;
}

function getStatusColor(status: Question['status']) {
  if (status === 'CORRECT') {
    return 'success';
  }

  if (status === 'PARTIAL') {
    return 'info';
  }

  if (status === 'WRONG') {
    return 'error';
  }

  return 'default';
}

function getCellColor(question: Question): string {
  if (question.status === 'CORRECT') {
    return 'success.main';
  }

  if (question.status === 'PARTIAL') {
    return 'info.main';
  }

  if (question.status === 'WRONG') {
    return 'error.light';
  }

  return 'text.disabled';
}

function getCategoryLabel(category: Question['category']): string {
  return CATEGORY_LABELS[category] || CATEGORY_LABELS.OTHER;
}

function formatDateTime(date: Date | undefined): string {
  if (!date) {
    return 'Ikke oppdatert';
  }

  return new Intl.DateTimeFormat('nb-NO', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function getQuestionGroups(questions: Question[]) {
  return questions.reduce<Record<string, Question[]>>((groups, question) => {
    const label = getCategoryLabel(question.category);
    groups[label] = [...(groups[label] || []), question];
    return groups;
  }, {});
}

function AnswerParts({ parts }: { parts: AnswerPart[] }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {parts.map((part, index) => (
        <React.Fragment key={`${part.value}-${index}`}>
          <Box
            component="span"
            sx={{
              color: part.correct ? 'success.main' : 'error.light',
            }}
          >
            {part.value}
          </Box>
          {index < parts.length - 1 ? ', ' : null}
        </React.Fragment>
      ))}
    </Box>
  );
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5">{value}</Typography>
      {detail ? (
        <Typography variant="caption" color="text.secondary">
          {detail}
        </Typography>
      ) : null}
    </Paper>
  );
}

function QuestionSummaries({ summaries }: { summaries: QuestionSummary[] }) {
  const decisiveQuestions = [...summaries]
    .filter((summary) => summary.spread > 0)
    .sort((a, b) => b.spread - a.spread)
    .slice(0, 5);

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, minWidth: 0 }}>
      <Typography variant="subtitle2" gutterBottom>
        Mest utslagsgivende
      </Typography>
      <Stack spacing={1}>
        {decisiveQuestions.length ? (
          decisiveQuestions.map((summary) => (
            <Box
              key={summary.question}
              sx={{
                alignItems: 'center',
                display: 'flex',
                gap: 1,
                maxWidth: '100%',
                minWidth: 0,
                whiteSpace: 'nowrap',
              }}
            >
              <Chip label={`+${summary.spread}`} size="small" />
              <Typography
                variant="body2"
                noWrap
                sx={{
                  flex: '0 1 auto',
                  maxWidth: { xs: 'none', sm: 520 },
                  minWidth: 0,
                }}
              >
                {summary.question}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  flex: '0 0 auto',
                  whiteSpace: 'nowrap',
                }}
              >
                <Box
                  component="span"
                  sx={{ display: { xs: 'none', sm: 'inline' } }}
                >
                  <Box component="span" sx={{ color: 'success.main' }}>
                    {summary.correct} riktige
                  </Box>
                  {' / '}
                  <Box component="span" sx={{ color: 'info.main' }}>
                    {summary.partial} delvis
                  </Box>
                  {' / '}
                  <Box component="span" sx={{ color: 'error.main' }}>
                    {summary.wrong} feil
                  </Box>
                </Box>
                <Box
                  component="span"
                  sx={{ display: { xs: 'inline', sm: 'none' } }}
                >
                  <Box component="span" sx={{ color: 'success.main' }}>
                    R {summary.correct}
                  </Box>
                  {' / '}
                  <Box component="span" sx={{ color: 'info.main' }}>
                    D {summary.partial}
                  </Box>
                  {' / '}
                  <Box component="span" sx={{ color: 'error.main' }}>
                    F {summary.wrong}
                  </Box>
                </Box>
              </Typography>
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            Ingen avgjorte spørsmål ennå
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

function UserDetailsDrawer({
  userId,
  onClose,
}: {
  userId: string | undefined;
  onClose: () => void;
}) {
  const { data, loading, error } = useGetUserQuery({
    variables: { userId: userId || '' },
    skip: !userId,
  });
  const user = data?.getUser;
  const groupedQuestions = getQuestionGroups(user?.questions || []);

  return (
    <Drawer anchor="right" open={Boolean(userId)} onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', sm: 560 }, p: 2 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" noWrap>
                {user?.name || 'Deltaker'}
              </Typography>
              {user ? (
                <Typography variant="body2" color="text.secondary">
                  #{user.rank} · {user.points}/{user.max_points} poeng ·{' '}
                  {user.remaining_possible_points} mulige igjen
                </Typography>
              ) : null}
            </Box>
            <Button onClick={onClose} variant="outlined">
              Lukk
            </Button>
          </Stack>
          <Divider />
          {loading ? (
            <Stack sx={{ py: 4, alignItems: 'center' }}>
              <CircularProgress size={28} />
            </Stack>
          ) : null}
          {error ? (
            <Typography color="error">Kunne ikke hente deltaker.</Typography>
          ) : null}
          {Object.entries(groupedQuestions).map(([group, questions]) => (
            <Stack key={group} spacing={1}>
              <Typography variant="subtitle2">{group}</Typography>
              {questions.map((question) => (
                <Paper
                  key={question.question}
                  variant="outlined"
                  sx={{ p: 1.25, borderRadius: 1 }}
                >
                  <Stack spacing={0.75}>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: 'center' }}
                    >
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {question.question}
                      </Typography>
                      <Chip
                        label={STATUS_LABELS[question.status]}
                        size="small"
                        color={getStatusColor(question.status)}
                      />
                    </Stack>
                    <Typography variant="body2">
                      Svar: {question.answer || 'Tomt'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fasit: {question.blueprint || 'Ikke avgjort ennå'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {question.points ?? 0}/{question.max_points ?? 0} poeng
                    </Typography>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          ))}
        </Stack>
      </Box>
    </Drawer>
  );
}

export function Users() {
  const { error, loading, data, refetch } = useGetUsersQuery({
    notifyOnNetworkStatusChange: true,
  });
  const [search, setSearch] = useState('');
  const [questionFilter, setQuestionFilter] = useState<QuestionFilter>('all');
  const [showAnswerText, setShowAnswerText] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | undefined>();

  useEffect(() => {
    if (data?.getUsers) {
      setLastUpdatedAt(new Date());
    }
  }, [data?.getUsers]);

  const users = useMemo(() => data?.getUsers || [], [data?.getUsers]);
  const questions = users[0]?.questions || [];
  const questionSummaries = useMemo(() => getQuestionSummaries(users), [users]);
  const scoredQuestions = questionSummaries.filter(
    (summary) => summary.unscored === 0
  ).length;
  const remainingPossiblePoints = users[0]?.remaining_possible_points || 0;
  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return users;
    }

    return users.filter((user) =>
      user.name.toLowerCase().includes(normalizedSearch)
    );
  }, [search, users]);
  const visibleQuestions = useMemo(() => {
    return questions.filter((question) => {
      if (questionFilter === 'scored') {
        return question.status !== 'UNSCORED';
      }

      if (questionFilter === 'unscored') {
        return question.status === 'UNSCORED';
      }

      return true;
    });
  }, [questionFilter, questions]);

  if (error) {
    console.error(error);
    return <ErrorPage error={error} />;
  } else if (loading && !data) {
    return <Loading />;
  }

  const columns: GridColDef[] = [
    {
      field: 'rank',
      headerName: '#',
      width: 72,
      type: 'number',
      cellClassName: 'sticky-rank',
      headerClassName: 'sticky-rank',
    },
    {
      field: 'name',
      headerName: 'Navn',
      width: 180,
      cellClassName: 'sticky-name',
      headerClassName: 'sticky-name',
    },
    {
      field: 'points',
      headerName: 'Poeng',
      width: 108,
      type: 'number',
      cellClassName: 'sticky-points',
      headerClassName: 'sticky-points',
      renderCell: (params: GridRenderCellParams) => {
        return <strong>{params.value}</strong>;
      },
    },
  ];

  visibleQuestions.forEach((question) => {
    columns.push({
      field: question.question,
      headerName: question.question,
      width: getWidth(question.question),
      renderCell: (params: GridRenderCellParams) => {
        const cellQuestion = params.value as Question;
        const answerParts = showAnswerText
          ? getAnswerParts(cellQuestion.answer, cellQuestion.blueprint)
          : undefined;
        const content = showAnswerText ? (
          answerParts ? (
            <AnswerParts parts={answerParts} />
          ) : (
            cellQuestion.answer || 'Tomt'
          )
        ) : (
          `${cellQuestion.points ?? 0}/${cellQuestion.max_points ?? 0}`
        );

        return (
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', height: '100%', minWidth: 0 }}
          >
            {answerParts ? (
              content
            ) : (
              <Box component="span" sx={{ color: getCellColor(cellQuestion) }}>
                {content}
              </Box>
            )}
          </Stack>
        );
      },
    });
  });

  const rows: GridValidRowModel[] = filteredUsers.map((user) => {
    const row: { [key: string]: string | number | object } = {
      id: user.id,
      rank: user.rank,
      name: user.name,
      points: user.points,
    };

    user.questions?.forEach((question) => {
      row[question.question] = question;
    });

    return row;
  });

  return (
    <Container>
      <Stack component="main" spacing={1.5}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))',
            },
            gap: 1,
          }}
        >
          <Metric label="Deltakere" value={users.length} />
          <Metric
            label="Avgjorte spørsmål"
            value={`${scoredQuestions}/${questions.length}`}
          />
          <Metric label="Mulige poeng igjen" value={remainingPossiblePoints} />
          <Metric
            label="Sist oppdatert"
            value={formatDateTime(lastUpdatedAt)}
            detail="fra Google Sheets"
          />
        </Box>
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Button href="#resultattabell" variant="contained" fullWidth>
            Gå til tabell
          </Button>
        </Box>
        <QuestionSummaries summaries={questionSummaries} />
        <Paper variant="outlined" sx={{ p: 1, borderRadius: 1 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1}
            sx={{ alignItems: { xs: 'stretch', md: 'center' } }}
          >
            <TextField
              label="Søk deltaker"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              size="small"
              sx={{ minWidth: { md: 260 } }}
            />
            <TextField
              label="Spørsmål"
              select
              value={questionFilter}
              onChange={(event) =>
                setQuestionFilter(event.target.value as QuestionFilter)
              }
              size="small"
              sx={{ minWidth: { md: 180 } }}
            >
              <MenuItem value="all">Alle</MenuItem>
              <MenuItem value="scored">Avgjorte</MenuItem>
              <MenuItem value="unscored">Ikke avgjort</MenuItem>
            </TextField>
            <FormControlLabel
              control={
                <Switch
                  checked={showAnswerText}
                  onChange={(event) => setShowAnswerText(event.target.checked)}
                />
              }
              label="Vis svar"
            />
            <Box sx={{ flex: 1 }} />
            <Button onClick={() => void refetch()} variant="outlined">
              Oppdater
            </Button>
          </Stack>
        </Paper>
        <Box id="resultattabell">
          <DataGrid
            autoHeight
            rows={rows}
            rowHeight={44}
            columns={columns}
            hideFooter
            disableRowSelectionOnClick
            onRowClick={(params: GridRowParams) =>
              setSelectedUserId(String(params.id))
            }
            sx={{
              borderRadius: 1,
              '& .MuiDataGrid-cell': {
                alignItems: 'center',
              },
              '& .sticky-rank': {
                position: 'sticky',
                left: 0,
                zIndex: 2,
              },
              '& .sticky-name': {
                position: 'sticky',
                left: 72,
                zIndex: 2,
              },
              '& .sticky-points': {
                position: 'sticky',
                left: 252,
                zIndex: 2,
              },
              '& .MuiDataGrid-columnHeader.sticky-rank, & .MuiDataGrid-columnHeader.sticky-name, & .MuiDataGrid-columnHeader.sticky-points':
                {
                  zIndex: 3,
                },
            }}
          />
        </Box>
      </Stack>
      <UserDetailsDrawer
        userId={selectedUserId}
        onClose={() => setSelectedUserId(undefined)}
      />
    </Container>
  );
}
