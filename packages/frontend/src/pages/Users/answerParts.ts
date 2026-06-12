export type AnswerPart = {
  correct: boolean;
  value: string;
};

function normalizeText(value: string | null | undefined): string {
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

function splitAnswerList(value: string | null | undefined): string[] {
  return (value || '')
    .split(/[,;]|\.\s+/g)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function getAnswerParts(
  answer: string,
  blueprint: string | null | undefined
): AnswerPart[] | undefined {
  if (!blueprint) {
    return undefined;
  }

  const answerParts = splitAnswerList(answer);
  const blueprintParts = splitAnswerList(blueprint);

  if (answerParts.length <= 1 && blueprintParts.length <= 1) {
    return undefined;
  }

  const normalizedBlueprints = new Set(blueprintParts.map(normalizeText));

  return answerParts.map((value) => ({
    correct: normalizedBlueprints.has(normalizeText(value)),
    value,
  }));
}
