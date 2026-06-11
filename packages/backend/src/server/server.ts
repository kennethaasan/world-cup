import { ApolloServer } from '@apollo/server';
import responseCachePlugin from '@apollo/server-plugin-response-cache';
import {
  handlers,
  middleware,
  startServerAndCreateLambdaHandler,
} from '@as-integrations/aws-lambda';
import { IExecutableSchemaDefinition } from '@graphql-tools/schema';
import { resolvers, typeDefs } from '../schema';

const ALLOWED_ORIGIN = 'https://tipping.aasan.dev';
const requestHandler = handlers.createAPIGatewayProxyEventRequestHandler();

const corsMiddleware: middleware.MiddlewareFn<typeof requestHandler> = () => {
  return Promise.resolve((result) => {
    result.headers = {
      ...result.headers,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      Vary: 'Origin',
    };
    return Promise.resolve();
  });
};

const server = new ApolloServer({
  typeDefs,
  resolvers: resolvers as IExecutableSchemaDefinition['resolvers'],
  plugins: [responseCachePlugin()],
});

export const handler = startServerAndCreateLambdaHandler(
  server,
  requestHandler,
  {
    middleware: [corsMiddleware],
  }
);
