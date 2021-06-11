import { ApolloServer } from 'apollo-server-lambda';
import { getContext } from '../context';
import { getDataSources } from '../data-sources';
import { resolvers, typeDefs } from '../schema';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => {
    return getDataSources();
  },
  context: () => {
    return getContext();
  },
});

export const handler = server.createHandler({
  cors: {
    origin: true,
    credentials: true,
  },
});
