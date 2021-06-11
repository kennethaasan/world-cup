import { ApolloServer } from 'apollo-server';
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

server
  .listen()
  .then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  })
  .catch((err) => {
    console.log('Server error', err);
  });
