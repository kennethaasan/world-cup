const POINTS_MATCH_WINNER = 1;
const POINTS_MATCH_RESULT = 1;

const POINTS: { [question: string]: number } = {
  'Toppscorer etter gruppespill': 5,
  'Assistkonge etter gruppespill': 5,
  'Råtasslag etter gruppespill': 5,
  'Hvem går videre til 8-delsfinaler?': 2,
  Kvartfinalelag: 3,
  Semifinalelag: 4,
  Finalelag: 5,
  Vinner: 10,
  'Beste spiller (Golden Ball)': 7,
  Assistkonge: 7,
  'Toppscorer (Golden Shoe)': 7,
};

function getWinner(score: string): number {
  const s = score.split('-');
  const homeScore = s[0];
  const awayScore = s[1];

  if (homeScore > awayScore) {
    return 1;
  } else if (homeScore < awayScore) {
    return -1;
  }
  return 0;
}

export function getPoints(
  question: string,
  answer: string,
  blueprint: string | undefined
): number | undefined {
  if (!blueprint) {
    return undefined;
  }

  let points = 0;

  if (POINTS[question]) {
    const answers = answer.split(', ');
    const blueprints = new Set(blueprint.split('. '));

    answers.forEach((a) => {
      if (blueprints.has(a)) {
        points = points + POINTS[question];
      }
    });

    return points;
  }

  if (answer === blueprint) {
    points = POINTS_MATCH_RESULT;
  }

  const playerWinner = getWinner(answer);
  const winner = getWinner(blueprint);

  if (playerWinner === winner) {
    points = points + POINTS_MATCH_WINNER;
  }

  return points;
}
