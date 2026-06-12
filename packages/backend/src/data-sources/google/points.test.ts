import { describe, expect, test } from 'vitest';
import { getMaxPoints, getPoints } from './points';

describe('getPoints', () => {
  test('scores group-stage matches from the 2026 form as winner plus exact result', () => {
    expect(getPoints('Mexico - Sør-Afrika', '2:1', '2-1')).toEqual({
      points: 2,
      maxPoints: 2,
    });
    expect(getPoints('Mexico - Sør-Afrika', '2–1', '2-0')).toEqual({
      points: 1,
      maxPoints: 2,
    });
    expect(getPoints('Mexico - Sør-Afrika', '4-«', '2-0')).toEqual({
      points: 0,
      maxPoints: 2,
    });
  });

  test('scores 2026 knockout team picks using the form point values', () => {
    expect(
      getPoints(
        'Hvem går videre til 16-delsfinaler? Alle lag topp to og 8 av 12 lag på tredjeplass går videre til 16-delsfinaler.',
        'Argentina, Norge, Frankrike',
        'Argentina, Brasil, Frankrike'
      )
    ).toEqual({
      points: 2,
      maxPoints: 3,
    });
    expect(
      getPoints(
        'Hvilke lag finner vi i 8-delsfinalene?',
        'Argentina, Norge',
        'Argentina, Brasil'
      )
    ).toEqual({
      points: 2,
      maxPoints: 4,
    });
    expect(
      getPoints(
        'Hvilke lag finner vi i kvartfinalene?',
        'Argentina, Norge',
        'Argentina, Brasil'
      )
    ).toEqual({
      points: 3,
      maxPoints: 6,
    });
    expect(
      getPoints(
        'Hvilke lag finner vi i semifinalene?',
        'Frankrike, Norge',
        'Frankrike, Spania'
      )
    ).toEqual({
      points: 5,
      maxPoints: 10,
    });
    expect(
      getPoints(
        'Hvilke to lag finner vi i finalen? ',
        'Frankrike, Spania',
        'Frankrike, Spania'
      )
    ).toEqual({
      points: 14,
      maxPoints: 14,
    });
  });

  test('scores 2026 specials with normalization for common user input variants', () => {
    expect(
      getPoints('Toppscorer etter gruppespill', 'Haaland ', 'Håland')
    ).toEqual({
      points: 3,
      maxPoints: 3,
    });
    expect(
      getPoints('Vinner\nRiktig: 10 poeng', 'frankrike', 'Frankrike')
    ).toEqual({
      points: 10,
      maxPoints: 10,
    });
    expect(
      getPoints(
        'Beste unge spiller (FIFA Young Player of the Tournament). Må være under 21 år ved starten av kalenderåret 2026.\nRiktig: 2 poeng',
        'Lamine Yamal.',
        'Lamine Yamal'
      )
    ).toEqual({
      points: 2,
      maxPoints: 2,
    });
    expect(
      getPoints('Hvem skårer Norges første mål?', 'Haaland ', 'Håland')
    ).toEqual({
      points: 1,
      maxPoints: 1,
    });
  });

  test('estimates max points before the fasit row is filled in', () => {
    expect(getMaxPoints('Mexico - Sør-Afrika', undefined)).toBe(2);
    expect(
      getMaxPoints('Hvilke lag finner vi i semifinalene?', undefined)
    ).toBe(20);
    expect(getMaxPoints('Hvilke to lag finner vi i finalen?', undefined)).toBe(
      14
    );
    expect(getMaxPoints('Toppscorer etter gruppespill', undefined)).toBe(3);
  });
});
