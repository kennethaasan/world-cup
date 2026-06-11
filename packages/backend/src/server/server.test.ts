import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { describe, expect, test } from 'vitest';
import { handler } from './server';

describe('GraphQL Lambda handler', () => {
  test('adds CORS headers to GraphQL responses', async () => {
    const event = {
      body: JSON.stringify({ query: '{ __typename }' }),
      headers: {
        'content-type': 'application/json',
        origin: 'https://tipping.aasan.dev',
      },
      httpMethod: 'POST',
      isBase64Encoded: false,
      multiValueQueryStringParameters: {},
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event, {} as Context, () => undefined);

    if (!response) {
      throw new Error('Expected Lambda response');
    }

    expect(response.headers).toMatchObject({
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': 'https://tipping.aasan.dev',
      Vary: 'Origin',
    });
  });
});
