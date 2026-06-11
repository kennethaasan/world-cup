const POINTS_MATCH_WINNER = 1;
const POINTS_MATCH_RESULT = 1;

function normalizeText(value: string | undefined): string {
  return (value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[æ]/gi, 'ae')
    .replace(/[ø]/gi, 'o')
    .replace(/[å]/gi, 'a')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.。]+$/g, '')
    .toLowerCase()
    .replace(/aa/g, 'a');
}

function normalizeQuestion(question: string): string {
  return normalizeText(question.replace(/\n/g, ' '));
}

function getPointsPerCorrectAnswer(question: string): number | undefined {
  const normalizedQuestion = normalizeQuestion(question);

  if (
    normalizedQuestion === 'toppscorer etter gruppespill' ||
    normalizedQuestion === 'assistkonge etter gruppespill' ||
    normalizedQuestion === 'ratasslag etter gruppespill'
  ) {
    return 3;
  }

  if (normalizedQuestion.includes('hvem gar videre til 16-delsfinaler')) {
    return 1;
  }

  if (normalizedQuestion.includes('hvilke lag finner vi i 8-delsfinalene')) {
    return 2;
  }

  if (normalizedQuestion.includes('hvilke lag finner vi i kvartfinalene')) {
    return 3;
  }

  if (normalizedQuestion.includes('hvilke lag finner vi i semifinalene')) {
    return 5;
  }

  if (normalizedQuestion.includes('hvilke to lag finner vi i finalen')) {
    return 7;
  }

  if (normalizedQuestion.startsWith('vinner')) {
    return 10;
  }

  if (
    normalizedQuestion.startsWith('toppscorer (golden boot)') ||
    normalizedQuestion.startsWith('assistkonge') ||
    normalizedQuestion.startsWith('beste spiller')
  ) {
    return 5;
  }

  if (normalizedQuestion.startsWith('beste unge spiller')) {
    return 2;
  }

  if (
    normalizedQuestion === 'hvem skarer norges forste mal?' ||
    normalizedQuestion ===
      'hvor mange mal skarer norge totalt? (straffekonk ikke tellende)' ||
    normalizedQuestion === 'hvem far norges forste gule kort?'
  ) {
    return 1;
  }

  return undefined;
}

function splitAnswerList(value: string): string[] {
  return value
    .split(/[,;]|\.\s+/g)
    .map(normalizeText)
    .filter(Boolean);
}

function parseScore(score: string):
  | {
      home: number;
      away: number;
    }
  | undefined {
  const normalizedScore = score
    .trim()
    .replace(/[–—]/g, '-')
    .replace(/:/g, '-')
    .replace(/\s+/g, '');
  const match = normalizedScore.match(/^(\d+)-(\d+)\.?$/);

  if (!match) {
    return undefined;
  }

  return {
    home: Number(match[1]),
    away: Number(match[2]),
  };
}

function getWinner(score: { home: number; away: number }): number {
  if (score.home > score.away) {
    return 1;
  } else if (score.home < score.away) {
    return -1;
  }

  return 0;
}

export function getPoints(
  question: string,
  answer: string,
  blueprint: string | undefined
):
  | {
      points: number;
      maxPoints: number;
    }
  | undefined {
  if (!blueprint) {
    return undefined;
  }

  const pointsPerCorrectAnswer = getPointsPerCorrectAnswer(question);

  if (pointsPerCorrectAnswer) {
    const answers = new Set(splitAnswerList(answer));
    const blueprints = new Set(splitAnswerList(blueprint));
    let points = 0;

    answers.forEach((a) => {
      if (blueprints.has(a)) {
        points = points + pointsPerCorrectAnswer;
      }
    });

    return {
      points,
      maxPoints: pointsPerCorrectAnswer * blueprints.size,
    };
  }

  const answerScore = parseScore(answer);
  const blueprintScore = parseScore(blueprint);

  if (!blueprintScore) {
    return undefined;
  }

  let points = 0;

  if (
    answerScore &&
    answerScore.home === blueprintScore.home &&
    answerScore.away === blueprintScore.away
  ) {
    points = POINTS_MATCH_RESULT;
  }

  if (answerScore && getWinner(answerScore) === getWinner(blueprintScore)) {
    points = points + POINTS_MATCH_WINNER;
  }

  return {
    points,
    maxPoints: POINTS_MATCH_RESULT + POINTS_MATCH_WINNER,
  };
}
