import crypto from 'crypto';
import { Question, User } from '../../models';
import { getOptionalEnvVar } from '../../utils/env';
import { DEV_GOOGLE_SHEETS_DATA } from './dev-sheet';
import { getGoogleSheetsDataFromGws } from './gws';
import { getMaxPoints, getPoints } from './points';

const GOOGLE_API_KEY = getOptionalEnvVar('GOOGLE_API_KEY');
const GOOGLE_SERVICE_ACCOUNT_EMAIL = getOptionalEnvVar(
  'GOOGLE_SERVICE_ACCOUNT_EMAIL'
);
const GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = getOptionalEnvVar(
  'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY'
);
const GOOGLE_OAUTH_CLIENT_ID = getOptionalEnvVar('GOOGLE_OAUTH_CLIENT_ID');
const GOOGLE_OAUTH_CLIENT_SECRET = getOptionalEnvVar(
  'GOOGLE_OAUTH_CLIENT_SECRET'
);
const GOOGLE_OAUTH_REFRESH_TOKEN = getOptionalEnvVar(
  'GOOGLE_OAUTH_REFRESH_TOKEN'
);
const GOOGLE_SHEETS_ID =
  getOptionalEnvVar('GOOGLE_SHEETS_ID') ||
  '1hsMSMhqu4UTrPlToYrfxjFrIXmT2JaiVzzjXeUvbgpw';
const GOOGLE_SHEETS_RANGE =
  getOptionalEnvVar('GOOGLE_SHEETS_RANGE') || "'Form Responses 1'!A1:CS125";
const USE_DEV_SHEET_FALLBACK =
  getOptionalEnvVar('NODE_ENV') === 'development' &&
  getOptionalEnvVar('GOOGLE_SHEETS_DEV_FALLBACK') !== 'false';
const USE_GWS_DEV_SOURCE =
  getOptionalEnvVar('NODE_ENV') === 'development' &&
  getOptionalEnvVar('GOOGLE_SHEETS_DEV_SOURCE') !== 'fixture';

let cachedServiceAccountToken:
  | {
      accessToken: string;
      expiresAt: number;
    }
  | undefined;

let cachedOAuthToken:
  | {
      accessToken: string;
      expiresAt: number;
    }
  | undefined;

function normalizePrivateKey(privateKey: string): string {
  return privateKey.replace(/\\n/g, '\n');
}

function base64Url(input: string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function getServiceAccountAccessToken(): Promise<string | undefined> {
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
    return undefined;
  }

  const now = Math.floor(Date.now() / 1000);

  if (
    cachedServiceAccountToken &&
    cachedServiceAccountToken.expiresAt > now + 60
  ) {
    return cachedServiceAccountToken.accessToken;
  }

  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };
  const claimSet = {
    iss: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };
  const unsignedToken = `${base64Url(JSON.stringify(header))}.${base64Url(
    JSON.stringify(claimSet)
  )}`;
  const signature = crypto
    .createSign('RSA-SHA256')
    .update(unsignedToken)
    .sign(normalizePrivateKey(GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY), 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  const assertion = `${unsignedToken}.${signature}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!response.ok) {
    throw new Error(`Google service account auth failed: ${response.status}`);
  }

  const token = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  cachedServiceAccountToken = {
    accessToken: token.access_token,
    expiresAt: now + token.expires_in,
  };

  return cachedServiceAccountToken.accessToken;
}

async function getOAuthAccessToken(): Promise<string | undefined> {
  if (
    !GOOGLE_OAUTH_CLIENT_ID ||
    !GOOGLE_OAUTH_CLIENT_SECRET ||
    !GOOGLE_OAUTH_REFRESH_TOKEN
  ) {
    return undefined;
  }

  const now = Math.floor(Date.now() / 1000);

  if (cachedOAuthToken && cachedOAuthToken.expiresAt > now + 60) {
    return cachedOAuthToken.accessToken;
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GOOGLE_OAUTH_CLIENT_ID,
      client_secret: GOOGLE_OAUTH_CLIENT_SECRET,
      refresh_token: GOOGLE_OAUTH_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error(`Google OAuth refresh failed: ${response.status}`);
  }

  const token = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  cachedOAuthToken = {
    accessToken: token.access_token,
    expiresAt: now + token.expires_in,
  };

  return cachedOAuthToken.accessToken;
}

async function getGoogleAccessToken(): Promise<string | undefined> {
  return (await getServiceAccountAccessToken()) || getOAuthAccessToken();
}

function normalizeMarker(value: string | undefined): string {
  return (value || '').trim().toLowerCase();
}

function isBlueprintRow(row: string[]): boolean {
  return row.slice(0, 3).some((cell) => {
    const marker = normalizeMarker(cell);
    return marker === 'fasit' || marker === 'blueprint';
  });
}

function splitRowsAndBlueprint(rows: string[][]): {
  rows: string[][];
  blueprints: string[];
} {
  for (let index = rows.length - 1; index >= 0; index = index - 1) {
    if (isBlueprintRow(rows[index])) {
      return {
        rows: [...rows.slice(0, index), ...rows.slice(index + 1)],
        blueprints: rows[index],
      };
    }
  }

  return {
    rows,
    blueprints: [],
  };
}

function normalizeQuestion(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[æ]/gi, 'ae')
    .replace(/[ø]/gi, 'o')
    .replace(/[å]/gi, 'a')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/aa/g, 'a');
}

function getQuestionStatus(
  points: number | undefined,
  maxPoints: number | undefined,
  blueprint: string | undefined
): Question['status'] {
  if (!blueprint || points === undefined || maxPoints === undefined) {
    return 'UNSCORED';
  }

  if (points === maxPoints) {
    return 'CORRECT';
  }

  if (points > 0) {
    return 'PARTIAL';
  }

  return 'WRONG';
}

function getQuestionCategory(question: string): Question['category'] {
  const normalizedQuestion = normalizeQuestion(question);

  if (normalizedQuestion.includes('norge')) {
    return 'NORWAY';
  }

  if (
    normalizedQuestion.includes('16-delsfinaler') ||
    normalizedQuestion.includes('8-delsfinalene') ||
    normalizedQuestion.includes('kvartfinalene') ||
    normalizedQuestion.includes('semifinalene') ||
    normalizedQuestion.includes('finalen') ||
    normalizedQuestion.startsWith('vinner')
  ) {
    return 'KNOCKOUT';
  }

  if (
    normalizedQuestion.includes('toppscorer') ||
    normalizedQuestion.includes('assistkonge') ||
    normalizedQuestion.includes('beste spiller') ||
    normalizedQuestion.includes('beste unge spiller') ||
    normalizedQuestion.includes('ratasslag')
  ) {
    return 'AWARDS';
  }

  if (question.includes(' - ')) {
    return 'MATCHES';
  }

  return 'OTHER';
}

function addRanks(users: User[]): User[] {
  let previousPoints: number | undefined;
  let previousRank = 0;

  return users.map((user, index) => {
    const rank =
      previousPoints === user.points && previousRank ? previousRank : index + 1;

    previousPoints = user.points;
    previousRank = rank;

    return user.withRank(rank);
  });
}

export function buildUsersFromGoogleSheetsData(
  googleSheetsData: string[][]
): User[] | undefined {
  const [headers = [], ...sheetRows] = googleSheetsData;

  const { rows, blueprints } = splitRowsAndBlueprint(sheetRows);

  const users = rows
    .filter((user) => user.some((cell) => cell.trim() !== ''))
    .map((user, userId) => {
      const [timestamp = '', email = '', name = '', ...rest] = user;

      let points = 0;
      let maxPoints = 0;
      let remainingPossiblePoints = 0;

      const questions = headers.slice(3).map((question, index) => {
        const answer = rest[index] || '';
        const blueprint = blueprints[index + 3];
        const normalizedBlueprint = blueprint === '' ? undefined : blueprint;

        const questionPoints = getPoints(question, answer, normalizedBlueprint);
        const questionMaxPoints =
          questionPoints?.maxPoints ||
          getMaxPoints(question, normalizedBlueprint);
        const status = getQuestionStatus(
          questionPoints?.points,
          questionMaxPoints,
          normalizedBlueprint
        );

        if (questionPoints) {
          points = points + questionPoints.points;
        }

        if (questionMaxPoints) {
          maxPoints = maxPoints + questionMaxPoints;
        }

        if (status === 'UNSCORED' && questionMaxPoints) {
          remainingPossiblePoints = remainingPossiblePoints + questionMaxPoints;
        }

        return new Question({
          question,
          answer,
          blueprint: normalizedBlueprint,
          points: questionPoints?.points,
          maxPoints: questionMaxPoints,
          status,
          category: getQuestionCategory(question),
        });
      });

      return new User({
        id: `world-cup:user:${userId + 1}`,
        name: name || email || `Deltaker ${userId + 1}`,
        email,
        timestamp,
        rank: 0,
        points,
        maxPoints,
        remainingPossiblePoints,
        questions,
      });
    })
    .sort((a, b) => {
      if (a.points === b.points) {
        return a.name.localeCompare(b.name);
      } else if (a.points > b.points) {
        return -1;
      } else if (a.points < b.points) {
        return 1;
      }
      return 0;
    });

  return addRanks(users);
}

export class GoogleAPI {
  private async getGoogleSheetsData(): Promise<string[][]> {
    const searchParams = new URLSearchParams();
    const accessToken = await getGoogleAccessToken();
    let shouldFetchGoogleSheets = false;

    if (accessToken) {
      searchParams.set('valueRenderOption', 'FORMATTED_VALUE');
      shouldFetchGoogleSheets = true;
    } else if (GOOGLE_API_KEY) {
      searchParams.set('key', GOOGLE_API_KEY);
      searchParams.set('valueRenderOption', 'FORMATTED_VALUE');
      shouldFetchGoogleSheets = true;
    } else if (USE_GWS_DEV_SOURCE) {
      try {
        console.warn('Using gws CLI to read Google Sheets in development');
        return await getGoogleSheetsDataFromGws({
          range: GOOGLE_SHEETS_RANGE,
          spreadsheetId: GOOGLE_SHEETS_ID,
        });
      } catch (error) {
        if (!USE_DEV_SHEET_FALLBACK) {
          throw error;
        }

        console.warn(
          'gws Google Sheets read failed; using development fixture instead'
        );
      }
    }

    if (!shouldFetchGoogleSheets) {
      if (USE_DEV_SHEET_FALLBACK) {
        console.warn('Using development Google Sheets fixture');
        return DEV_GOOGLE_SHEETS_DATA;
      }

      throw new Error(
        'GOOGLE_API_KEY, Google service account credentials, or Google OAuth refresh credentials are required'
      );
    }

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/${encodeURIComponent(
        GOOGLE_SHEETS_RANGE
      )}?${searchParams.toString()}`,
      {
        headers: accessToken
          ? {
              authorization: `Bearer ${accessToken}`,
            }
          : undefined,
      }
    );

    if (!response.ok) {
      throw new Error(`Google Sheets API failed: ${response.status}`);
    }

    const data = (await response.json()) as {
      values: string[][];
    };

    return data.values || [];
  }

  public async getUsers(): Promise<User[] | undefined> {
    const googleSheetsData = await this.getGoogleSheetsData();
    return buildUsersFromGoogleSheetsData(googleSheetsData);
  }

  public async getUser(args: { userId: string }): Promise<User | undefined> {
    const users = await this.getUsers();
    return users?.find((user) => user.id === args.userId);
  }
}
