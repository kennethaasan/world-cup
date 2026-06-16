import { Question, User } from '../../generated/queries';

export type QuestionSummary = {
  question: string;
  category: Question['category'];
  hasBlueprint: boolean;
  correct: number;
  partial: number;
  wrong: number;
  unscored: number;
  spread: number;
  impact: number;
};

export function getQuestionSummaries(users: User[]): QuestionSummary[] {
  const questions = users[0]?.questions || [];

  return questions.map((question, index) => {
    const summary: QuestionSummary = {
      question: question.question,
      category: question.category,
      hasBlueprint: users.some((user) =>
        Boolean(user.questions?.[index]?.blueprint)
      ),
      correct: 0,
      partial: 0,
      wrong: 0,
      unscored: 0,
      spread: 0,
      impact: 0,
    };
    let minPoints: number | undefined;
    let maxPoints: number | undefined;
    const scoredPoints: number[] = [];

    users.forEach((user) => {
      const userQuestion = user.questions?.[index];

      if (!userQuestion) {
        return;
      }

      if (userQuestion.status === 'CORRECT') {
        summary.correct = summary.correct + 1;
      } else if (userQuestion.status === 'PARTIAL') {
        summary.partial = summary.partial + 1;
      } else if (userQuestion.status === 'WRONG') {
        summary.wrong = summary.wrong + 1;
      } else {
        summary.unscored = summary.unscored + 1;
      }

      if (
        userQuestion.status !== 'UNSCORED' &&
        typeof userQuestion.points === 'number'
      ) {
        scoredPoints.push(userQuestion.points);
        minPoints =
          minPoints === undefined
            ? userQuestion.points
            : Math.min(minPoints, userQuestion.points);
        maxPoints =
          maxPoints === undefined
            ? userQuestion.points
            : Math.max(maxPoints, userQuestion.points);
      }
    });

    summary.spread =
      minPoints === undefined || maxPoints === undefined
        ? 0
        : maxPoints - minPoints;
    if (scoredPoints.length) {
      const average =
        scoredPoints.reduce((total, points) => total + points, 0) /
        scoredPoints.length;

      summary.impact = scoredPoints.reduce(
        (total, points) => total + Math.abs(points - average),
        0
      );
    }

    return summary;
  });
}

export function getDecisiveQuestionSummaries(
  summaries: QuestionSummary[]
): QuestionSummary[] {
  return [...summaries]
    .filter((summary) => summary.hasBlueprint && summary.impact > 0)
    .sort((a, b) => {
      if (b.impact !== a.impact) {
        return b.impact - a.impact;
      }

      if (b.spread !== a.spread) {
        return b.spread - a.spread;
      }

      return a.question.localeCompare(b.question);
    });
}
