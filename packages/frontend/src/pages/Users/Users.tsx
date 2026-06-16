import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
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
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
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
  User,
  useGetUserQuery,
  useGetUsersQuery,
} from '../../generated/queries';
import { ErrorPage } from '../ErrorPage';
import { AnswerPart, getAnswerParts } from './answerParts';
import {
  QuestionSummary,
  getDecisiveQuestionSummaries,
  getQuestionSummaries,
} from './questionSummaries';

type QuestionFilter = 'all' | 'scored' | 'unscored';

const MOBILE_PARTICIPANT_COLUMN_WIDTH = 124;
const MOBILE_MATCH_QUESTION_COLUMN_WIDTH = 124;
const MOBILE_LONG_QUESTION_COLUMN_WIDTH = 216;

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[æ]/gi, 'ae')
    .replace(/[ø]/gi, 'o')
    .replace(/[å]/gi, 'a')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

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

function isLongNonMatchQuestion(question: Question): boolean {
  return (
    question.category !== 'MATCHES' &&
    ((question.max_points ?? 0) > 4 ||
      question.question.length > 28 ||
      question.answer.length > 18)
  );
}

function getMobileQuestionWidth(question: Question): number {
  return isLongNonMatchQuestion(question)
    ? MOBILE_LONG_QUESTION_COLUMN_WIDTH
    : MOBILE_MATCH_QUESTION_COLUMN_WIDTH;
}

function formatImpact(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
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

function AnswerParts({
  parts,
  truncate = true,
}: {
  parts: AnswerPart[];
  truncate?: boolean;
}) {
  return (
    <Box
      component="span"
      sx={{
        display: truncate ? 'block' : 'inline',
        overflow: truncate ? 'hidden' : 'visible',
        textOverflow: truncate ? 'ellipsis' : 'clip',
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

function QuestionAnswer({
  question,
  showAnswerText,
  truncateAnswerParts = true,
}: {
  question: Question;
  showAnswerText: boolean;
  truncateAnswerParts?: boolean;
}) {
  const answerParts = showAnswerText
    ? getAnswerParts(question.answer, question.blueprint)
    : undefined;
  const content = showAnswerText ? (
    answerParts ? (
      <AnswerParts parts={answerParts} truncate={truncateAnswerParts} />
    ) : (
      question.answer || 'Tomt'
    )
  ) : (
    `${question.points ?? 0}/${question.max_points ?? 0}`
  );

  return answerParts ? (
    content
  ) : (
    <Box component="span" sx={{ color: getCellColor(question) }}>
      {content}
    </Box>
  );
}

function MobileScoreMatrix({
  users,
  questions,
  showAnswerText,
  onSelectUser,
}: {
  users: User[];
  questions: Question[];
  showAnswerText: boolean;
  onSelectUser: (userId: string) => void;
}) {
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const activeQuestion = questions[activeQuestionIndex];
  const questionColumnWidths = useMemo(
    () => questions.map(getMobileQuestionWidth),
    [questions]
  );
  const gridTemplateColumns = `${MOBILE_PARTICIPANT_COLUMN_WIDTH}px ${questionColumnWidths
    .map((width) => `${width}px`)
    .join(' ')}`;
  const matrixWidth =
    MOBILE_PARTICIPANT_COLUMN_WIDTH +
    questionColumnWidths.reduce((total, width) => total + width, 0);

  useEffect(() => {
    if (activeQuestionIndex >= questions.length) {
      setActiveQuestionIndex(Math.max(questions.length - 1, 0));
    }
  }, [activeQuestionIndex, questions.length]);

  function handleHorizontalScroll(event: React.UIEvent<HTMLDivElement>) {
    if (!questions.length) {
      return;
    }

    const scrollLeft = event.currentTarget.scrollLeft;
    let nextQuestionIndex = 0;
    let accumulatedWidth = 0;

    for (let index = 0; index < questionColumnWidths.length; index += 1) {
      const width = questionColumnWidths[index];

      if (scrollLeft < accumulatedWidth + width / 2) {
        nextQuestionIndex = index;
        break;
      }

      nextQuestionIndex = index;
      accumulatedWidth += width;
    }

    setActiveQuestionIndex(nextQuestionIndex);
  }

  return (
    <Paper
      variant="outlined"
      data-testid="mobile-score-matrix"
      sx={{
        borderRadius: '8px',
        overflow: 'hidden',
        background:
          'linear-gradient(145deg, rgba(13, 25, 48, 0.76), rgba(6, 16, 31, 0.56))',
      }}
    >
      <Box
        sx={{
          p: 1,
          borderBottom: '1px solid rgba(219, 234, 254, 0.12)',
          background:
            'linear-gradient(90deg, rgba(0, 212, 255, 0.16), rgba(255, 61, 127, 0.1))',
        }}
      >
        <Typography
          variant="body2"
          aria-live="polite"
          sx={{ fontSize: 12, fontWeight: 900, lineHeight: '16px' }}
        >
          {activeQuestion?.question || 'Ingen spørsmål matcher filtreringen'}
        </Typography>
      </Box>
      <Box
        data-testid="mobile-score-matrix-scroll"
        onScroll={handleHorizontalScroll}
        sx={{
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <Box role="table" sx={{ minWidth: matrixWidth }}>
          <Box
            role="row"
            sx={{
              display: 'grid',
              gridTemplateColumns,
              height: 44,
              borderBottom: '1px solid rgba(219, 234, 254, 0.14)',
            }}
          >
            <Box
              role="columnheader"
              sx={{
                position: 'sticky',
                left: 0,
                zIndex: 3,
                p: 0.75,
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#091b34',
                borderRight: '1px solid rgba(219, 234, 254, 0.14)',
                boxShadow: '10px 0 18px rgba(2, 6, 23, 0.22)',
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              Deltaker
            </Box>
            {questions.map((question) => (
              <Box
                role="columnheader"
                key={question.question}
                sx={{
                  p: 0.75,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 0.25,
                  borderRight: '1px solid rgba(219, 234, 254, 0.1)',
                }}
              >
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    fontWeight: 900,
                    fontSize: 11,
                    lineHeight: '14px',
                    minWidth: 0,
                  }}
                  title={question.question}
                >
                  {question.question}
                </Typography>
              </Box>
            ))}
          </Box>
          {users.map((user) => (
            <Box
              role="row"
              key={user.id}
              sx={{
                display: 'grid',
                gridTemplateColumns,
                height: 44,
                borderBottom: '1px solid rgba(219, 234, 254, 0.08)',
              }}
            >
              <Box
                role="cell"
                sx={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 2,
                  p: 0.5,
                  backgroundColor: '#091b34',
                  borderRight: '1px solid rgba(219, 234, 254, 0.14)',
                  boxShadow: '10px 0 18px rgba(2, 6, 23, 0.22)',
                }}
              >
                <ButtonBase
                  onClick={() => onSelectUser(user.id)}
                  sx={{
                    width: '100%',
                    height: '100%',
                    justifyContent: 'stretch',
                    textAlign: 'left',
                    borderRadius: '6px',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 212, 255, 0.12)',
                    },
                  }}
                >
                  <Stack spacing={0.1} sx={{ width: '100%', minWidth: 0 }}>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontSize: 10,
                          fontWeight: 700,
                          lineHeight: '14px',
                        }}
                      >
                        #{user.rank}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        sx={{
                          fontSize: 10,
                          fontWeight: 700,
                          lineHeight: '14px',
                        }}
                      >
                        {user.points}p
                      </Typography>
                    </Stack>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        lineHeight: '15px',
                      }}
                    >
                      {user.name}
                    </Typography>
                  </Stack>
                </ButtonBase>
              </Box>
              {questions.map((question) => {
                const userQuestion = user.questions?.find(
                  (candidate) => candidate.question === question.question
                );
                const showScoreChip = userQuestion
                  ? showAnswerText && isLongNonMatchQuestion(userQuestion)
                  : false;

                return (
                  <Box
                    role="cell"
                    key={question.question}
                    sx={{
                      p: 0.5,
                      minWidth: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 0.5,
                      borderRight: '1px solid rgba(219, 234, 254, 0.08)',
                    }}
                  >
                    {userQuestion ? (
                      <>
                        <Box
                          data-testid="mobile-answer-scroll"
                          sx={{
                            minWidth: 0,
                            flex: 1,
                            display: 'block',
                            overflowX: 'auto',
                            overflowY: 'hidden',
                            whiteSpace: 'nowrap',
                            fontSize: 12,
                            lineHeight: '15px',
                            overscrollBehaviorX: 'contain',
                            touchAction: 'pan-x',
                            WebkitOverflowScrolling: 'touch',
                            scrollbarWidth: 'none',
                            '&::-webkit-scrollbar': {
                              display: 'none',
                            },
                          }}
                        >
                          <QuestionAnswer
                            question={userQuestion}
                            showAnswerText={showAnswerText}
                            truncateAnswerParts={false}
                          />
                        </Box>
                        {showScoreChip ? (
                          <Chip
                            label={`${userQuestion.points ?? 0}/${
                              userQuestion.max_points ?? 0
                            }`}
                            size="small"
                            color={getStatusColor(userQuestion.status)}
                            sx={{
                              flex: '0 0 auto',
                              height: 22,
                              fontSize: 11,
                              fontWeight: 800,
                              '& .MuiChip-label': {
                                px: 0.75,
                              },
                            }}
                          />
                        ) : null}
                      </>
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: 12, lineHeight: '15px' }}
                      >
                        Tomt
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

function Metric({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string | number;
  detail?: string;
  tone: 'blue' | 'green' | 'pink' | 'gold';
}) {
  const accents = {
    blue: 'linear-gradient(135deg, rgba(0, 212, 255, 0.45), rgba(0, 120, 255, 0.12))',
    green:
      'linear-gradient(135deg, rgba(53, 242, 163, 0.42), rgba(53, 242, 163, 0.1))',
    pink: 'linear-gradient(135deg, rgba(255, 61, 127, 0.4), rgba(255, 61, 127, 0.1))',
    gold: 'linear-gradient(135deg, rgba(255, 209, 102, 0.38), rgba(255, 209, 102, 0.1))',
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        minHeight: { xs: 92, md: 104 },
        p: { xs: 1.5, md: 1.75 },
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: accents[tone],
          opacity: 0.76,
          pointerEvents: 'none',
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontWeight: 800,
            letterSpacing: 0,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Typography>
        <Typography variant="h5" sx={{ mt: 0.5, fontSize: { xs: 22, md: 26 } }}>
          {value}
        </Typography>
        {detail ? (
          <Typography variant="caption" color="text.secondary">
            {detail}
          </Typography>
        ) : null}
      </Box>
    </Paper>
  );
}

function QuestionSummaries({ summaries }: { summaries: QuestionSummary[] }) {
  const decisiveQuestions = getDecisiveQuestionSummaries(summaries);

  return (
    <Paper
      variant="outlined"
      sx={{ p: { xs: 1.5, md: 1.75 }, borderRadius: '8px', minWidth: 0 }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
        <Box component="span" sx={{ color: 'primary.main' }}>
          ✦
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
          Mest utslagsgivende
        </Typography>
      </Stack>
      <Stack
        spacing={1}
        sx={{
          maxHeight: { xs: 190, md: 260 },
          overflowY: 'auto',
          pr: 0.5,
        }}
      >
        {decisiveQuestions.length ? (
          decisiveQuestions.map((summary) => (
            <Box
              key={summary.question}
              sx={{
                alignItems: 'center',
                display: 'flex',
                gap: 1.5,
                maxWidth: '100%',
                minWidth: 0,
                whiteSpace: 'nowrap',
              }}
            >
              <Chip label={`Δ${formatImpact(summary.impact)}`} size="small" />
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
            Ingen utslagsgivende spørsmål ennå
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
    <Drawer
      anchor="right"
      open={Boolean(userId)}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            background:
              'linear-gradient(155deg, rgba(13, 25, 48, 0.96), rgba(6, 16, 31, 0.96))',
            borderLeft: '1px solid rgba(219, 234, 254, 0.16)',
          },
        },
      }}
    >
      <Box sx={{ width: { xs: '100vw', sm: 580 }, p: { xs: 2, sm: 3 } }}>
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
                  sx={{ p: 1.5, borderRadius: '8px' }}
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { error, loading, data, refetch } = useGetUsersQuery({
    notifyOnNetworkStatusChange: true,
  });
  const [search, setSearch] = useState('');
  const [questionSearch, setQuestionSearch] = useState('');
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
    const normalizedSearch = normalizeSearchText(search);

    if (!normalizedSearch) {
      return users;
    }

    return users.filter((user) =>
      normalizeSearchText(user.name).includes(normalizedSearch)
    );
  }, [search, users]);
  const visibleQuestions = useMemo(() => {
    const normalizedQuestionSearch = normalizeSearchText(questionSearch);

    return questions.filter((question) => {
      if (
        normalizedQuestionSearch &&
        !normalizeSearchText(question.question).includes(
          normalizedQuestionSearch
        )
      ) {
        return false;
      }

      if (questionFilter === 'scored') {
        return question.status !== 'UNSCORED';
      }

      if (questionFilter === 'unscored') {
        return question.status === 'UNSCORED';
      }

      return true;
    });
  }, [questionFilter, questionSearch, questions]);

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

        return (
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', height: '100%', minWidth: 0 }}
          >
            <QuestionAnswer
              question={cellQuestion}
              showAnswerText={showAnswerText}
            />
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
      <Stack component="main" spacing={2}>
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
          <Metric label="Deltakere" value={users.length} tone="blue" />
          <Metric
            label="Avgjorte spørsmål"
            value={`${scoredQuestions}/${questions.length}`}
            tone="green"
          />
          <Metric
            label="Mulige poeng igjen"
            value={remainingPossiblePoints}
            tone="pink"
          />
          <Metric
            label="Sist oppdatert"
            value={formatDateTime(lastUpdatedAt)}
            detail="fra Google Sheets"
            tone="gold"
          />
        </Box>
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Button href="#resultattabell" variant="contained" fullWidth>
            Gå til tabell
          </Button>
        </Box>
        <QuestionSummaries summaries={questionSummaries} />
        <Paper
          variant="outlined"
          sx={{ p: { xs: 1.25, md: 1.5 }, borderRadius: '8px' }}
        >
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
              label="Søk kamp/spørsmål"
              value={questionSearch}
              onChange={(event) => setQuestionSearch(event.target.value)}
              size="small"
              sx={{ minWidth: { md: 260 } }}
            />
            <TextField
              label="Status"
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
            <Button onClick={() => void refetch()} variant="contained">
              Oppdater
            </Button>
          </Stack>
        </Paper>
        <Box id="resultattabell">
          {isMobile ? (
            <MobileScoreMatrix
              users={filteredUsers}
              questions={visibleQuestions}
              showAnswerText={showAnswerText}
              onSelectUser={(userId) => setSelectedUserId(userId)}
            />
          ) : (
            <DataGrid
              autoHeight
              disableVirtualization
              rows={rows}
              rowHeight={44}
              columns={columns}
              hideFooter
              disableRowSelectionOnClick
              onRowClick={(params: GridRowParams) =>
                setSelectedUserId(String(params.id))
              }
              sx={{
                border: '1px solid rgba(219, 234, 254, 0.16)',
                borderRadius: '8px',
                overflow: 'hidden',
                background:
                  'linear-gradient(145deg, rgba(13, 25, 48, 0.72), rgba(6, 16, 31, 0.52))',
                backdropFilter: 'blur(18px)',
                '& .MuiDataGrid-main': {
                  borderRadius: '8px',
                },
                '& .MuiDataGrid-cell': {
                  alignItems: 'center',
                  borderColor: 'rgba(219, 234, 254, 0.08)',
                },
                '& .MuiDataGrid-columnHeaders': {
                  background:
                    'linear-gradient(90deg, rgba(0, 212, 255, 0.18), rgba(255, 61, 127, 0.12))',
                  borderColor: 'rgba(219, 234, 254, 0.14)',
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 900,
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'rgba(0, 212, 255, 0.08)',
                  cursor: 'pointer',
                },
                '& .sticky-rank': {
                  position: 'sticky',
                  left: 0,
                  zIndex: 10,
                  backgroundColor: '#091b34',
                  backdropFilter: 'blur(18px)',
                  boxShadow: '10px 0 18px rgba(2, 6, 23, 0.22)',
                },
                '& .sticky-name': {
                  position: 'sticky',
                  left: 72,
                  zIndex: 10,
                  backgroundColor: '#091b34',
                  backdropFilter: 'blur(18px)',
                  boxShadow: '10px 0 18px rgba(2, 6, 23, 0.22)',
                },
                '& .sticky-points': {
                  position: 'sticky',
                  left: 252,
                  zIndex: 10,
                  backgroundColor: '#091b34',
                  backdropFilter: 'blur(18px)',
                  boxShadow: '10px 0 18px rgba(2, 6, 23, 0.22)',
                },
                '& .MuiDataGrid-columnHeader.sticky-rank, & .MuiDataGrid-columnHeader.sticky-name, & .MuiDataGrid-columnHeader.sticky-points':
                  {
                    zIndex: 11,
                  },
              }}
            />
          )}
        </Box>
      </Stack>
      <UserDetailsDrawer
        userId={selectedUserId}
        onClose={() => setSelectedUserId(undefined)}
      />
    </Container>
  );
}
