import { ApolloServer } from '@apollo/server';
import responseCachePlugin from '@apollo/server-plugin-response-cache';
import {
  handlers,
  startServerAndCreateLambdaHandler,
} from '@as-integrations/aws-lambda';
import { IExecutableSchemaDefinition } from '@graphql-tools/schema';
import { resolvers, typeDefs } from '../schema';

const server = new ApolloServer({
  typeDefs,
  resolvers: resolvers as IExecutableSchemaDefinition['resolvers'],
  plugins: [responseCachePlugin()],
});

export const handler = startServerAndCreateLambdaHandler(
  server,
  handlers.createAPIGatewayProxyEventRequestHandler()
);
