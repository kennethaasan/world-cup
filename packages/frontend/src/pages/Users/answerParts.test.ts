import { describe, expect, test } from 'vitest';
import { getAnswerParts } from './answerParts';

describe('getAnswerParts', () => {
  test('marks each answer in a multi-answer list against the fasit', () => {
    expect(
      getAnswerParts(
        'Argentina, Norge, Frankrike',
        'Argentina, Brasil, Frankrike'
      )
    ).toEqual([
      { correct: true, value: 'Argentina' },
      { correct: false, value: 'Norge' },
      { correct: true, value: 'Frankrike' },
    ]);
  });

  test('normalizes common Norwegian spelling variants', () => {
    expect(
      getAnswerParts('Haaland, Ødegaard', 'Håland, Martin Ødegaard')
    ).toEqual([
      { correct: true, value: 'Haaland' },
      { correct: false, value: 'Ødegaard' },
    ]);
  });

  test('does not split ordinary single-answer questions', () => {
    expect(getAnswerParts('Frankrike', 'Frankrike')).toBeUndefined();
  });
});
