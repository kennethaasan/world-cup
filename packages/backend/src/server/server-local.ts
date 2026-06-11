import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import responseCachePlugin from '@apollo/server-plugin-response-cache';
import { IExecutableSchemaDefinition } from '@graphql-tools/schema';
import { getContext } from '../context';
import { resolvers, typeDefs } from '../schema';

const server = new ApolloServer({
  typeDefs,
  resolvers: resolvers as IExecutableSchemaDefinition['resolvers'],
  plugins: [responseCachePlugin()],
});

startStandaloneServer(server, {
  context: () => Promise.resolve(getContext()),
})
  .then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  })
  .catch((err) => {
    console.log('Server error', err);
  });
