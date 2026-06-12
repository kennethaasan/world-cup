import { describe, expect, test } from 'vitest';
import { buildUsersFromGoogleSheetsData } from './GoogleAPI';

describe('buildUsersFromGoogleSheetsData', () => {
  test('adds ranks, possible points and question statuses', () => {
    const users = buildUsersFromGoogleSheetsData([
      [
        'Timestamp',
        'Email',
        'Name',
        'Mexico - Sør-Afrika',
        'Vinner',
        'Toppscorer etter gruppespill',
      ],
      ['2026-01-01', 'a@example.com', 'Anna', '2-1', 'Frankrike', 'Håland'],
      ['2026-01-01', 'b@example.com', 'Bjørn', '1-1', 'Brasil', 'Mbappe'],
      ['fasit', '', '', '2-1', 'Frankrike', ''],
    ]);

    expect(users?.map((user) => user.name)).toEqual(['Anna', 'Bjørn']);
    expect(users?.map((user) => user.rank)).toEqual([1, 2]);
    expect(users?.map((user) => user.points)).toEqual([12, 0]);
    expect(users?.map((user) => user.maxPoints)).toEqual([15, 15]);
    expect(users?.map((user) => user.remainingPossiblePoints)).toEqual([3, 3]);
    expect(users?.[0].questions?.map((question) => question.status)).toEqual([
      'CORRECT',
      'CORRECT',
      'UNSCORED',
    ]);
    expect(users?.[1].questions?.map((question) => question.status)).toEqual([
      'WRONG',
      'WRONG',
      'UNSCORED',
    ]);
  });

  test('uses shared ranks for equal scores', () => {
    const users = buildUsersFromGoogleSheetsData([
      ['Timestamp', 'Email', 'Name', 'Mexico - Sør-Afrika'],
      ['2026-01-01', 'a@example.com', 'Anna', '2-1'],
      ['2026-01-01', 'b@example.com', 'Bjørn', '2-1'],
      ['2026-01-01', 'c@example.com', 'Carla', '0-0'],
      ['fasit', '', '', '2-1'],
    ]);

    expect(
      users?.map((user) => ({ name: user.name, rank: user.rank }))
    ).toEqual([
      { name: 'Anna', rank: 1 },
      { name: 'Bjørn', rank: 1 },
      { name: 'Carla', rank: 3 },
    ]);
  });
});
